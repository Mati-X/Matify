import { execSync } from "node:child_process";
import Redis from "ioredis";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import * as mm from "music-metadata";
import fs from "node:fs/promises";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const s3client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: "local",
    forcePathStyle: true,
});

try {
    const ffmpegVersion = execSync("ffmpeg -version").toString().split("\n")[0];
    console.log(`[Worker] Znaleziono systemowy FFmpeg: ${ffmpegVersion}`);
} catch (err) {
    console.error("[Worker] BŁĄD: FFmpeg nie jest zainstalowany w kontenerze!");
    process.exit(1);
}

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const redis = new Redis({
    host: REDIS_HOST,
    port: 6379,
});

redis.on("connect", () => {
    console.log(`[Worker] Połączono pomyślnie z Redisem (${REDIS_HOST}:6379)! Czekam na zadania audio...`);
});

redis.on("error", (err) => {
    console.error("[Worker] Błąd połączenia z Redisem:", err.message);
});

function measureLufs(filePath: string): string | null {
    try {
        const output = execSync(`ffmpeg -i "${filePath}" -vn -af ebur128 -f null - 2>&1`).toString();
        const match = output.match(/Integrated loudness:\s+I:\s+(-?\d+(\.\d+)?)/)
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

async function fetchLyrics(artist: string, title: string, durationSec: number) {
    try {
        const url = new URL("https://lrclib.net/api/get");
        url.searchParams.set("artist_name", artist);
        url.searchParams.set("track_name", title);
        if (durationSec > 0) {
            url.searchParams.set("duration", Math.round(durationSec).toString());
        }

        const res = await fetch(url.toString(), {
            headers: { "User-Agent": "Matify Music Platform v1.0" },
        });

        if (!res.ok) return null;
        const data = await res.json();
        return {
            syncedLyrics: data.syncedLyrics || null,
            plainLyrics: data.plainLyrics || null,
        };
    } catch {
        return null;
    }
}

async function startWorker() {
    while (true) {
        const result = await redis.blpop("audio:jobs", 0);
        if (!result) continue;
        try {
            const job = JSON.parse(result[1]);

        const command = new GetObjectCommand({
            Bucket: "tracks",
            Key: job.s3Key,
        })
        const response = await s3client.send(command);

        const bytes = await response.Body?.transformToByteArray();
        const inputPath = `/tmp/${job.s3Key}`;
        await fs.writeFile(inputPath, Buffer.from(bytes!));

        const outputDir = `/tmp/hls/${Date.now()}`;
        await fs.mkdir(outputDir, { recursive: true });

        const lufs = measureLufs(inputPath);
        console.log(`[Worker] Zmierzona głośność: ${lufs} LUFS`);

        console.log(`[Worker] Rozpoczynam transkodowanie do HLS...`);
        execSync(
            `ffmpeg -i "${inputPath}" -vn -c:a aac -b:a 192k -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" "${outputDir}/playlist.m3u8"`
        );
        console.log(`[Worker] Transkodowanie ukończone! Pocięto na segmenty w ${outputDir}`);
        const files = await fs.readdir(outputDir);
        for (const file of files) {
            const fileBuffer = await fs.readFile(`${outputDir}/${file}`);

            const contentType = file.endsWith(".m3u8")
                ? "application/vnd.apple.mpegurl"
                : "video/mp2t";

            await s3client.send(
                new PutObjectCommand({
                    Bucket: "tracks",
                    Key: `hls/${job.s3Key}/${file}`,
                    Body: fileBuffer,
                    ContentType: contentType,
                })
            );
        }

        const meta = await mm.parseFile(inputPath);

        const cleanName = job.filename.replace(/\.mp3$/i, "").replace(/^\d+\.\s*/, "");
        const parts = cleanName.split(" - ");
        const title = meta.common.title || (parts.length > 1 ? parts.slice(1).join(" - ").trim() : cleanName.trim());
        const artist = meta.common.artist || (parts.length > 1 ? parts[0].trim() : "Unknown Artist");
        const album = meta.common.album || "Unknown Album";
        const durationMs = Math.round((meta.format.duration || 0) * 1000);

        const lyrics = await fetchLyrics(artist, title, durationMs / 1000);
        if (lyrics?.syncedLyrics) {
            console.log(`[Worker] Znaleziono zsynchronizowany tekst dla: "${title}"!`);
        }

        await pool.query(
            `INSERT INTO tracks (title, artist, album, duration_ms, lufs_integrated, hls_manifest_url, raw_s3_key, synced_lyrics, plain_lyrics)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [title, artist, album, durationMs, lufs, `/storage/tracks/hls/${job.s3Key}/playlist.m3u8`, job.s3Key, lyrics?.syncedLyrics || null, lyrics?.plainLyrics || null]
        );
        console.log(`[Worker] Zapisano: "${title}" | "${artist}" | "${album}" | ${durationMs}ms`);

        await fs.rm(inputPath);
        await fs.rm(outputDir, { recursive: true, force: true });

        } catch (err: any) {
            console.error(`[Worker] Błąd przetwarzania zadania:`, err.message || err);
        }
    }
}

startWorker();