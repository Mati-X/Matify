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

        await pool.query(
            `INSERT INTO tracks (title, artist, album, duration_ms, hls_manifest_url, raw_s3_key)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [title, artist, album, durationMs, `/storage/tracks/hls/${job.s3Key}/playlist.m3u8`, job.s3Key]
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