import { execSync } from "node:child_process";
import Redis from "ioredis";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Vibrant } from "node-vibrant/node";
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
    console.log(`[Worker] Połączono z Redisem (${REDIS_HOST}:6379)! Czekam na zadania audio i motion...`);
});

redis.on("error", (err) => {
    console.error("[Worker] Błąd połączenia z Redisem:", err.message);
});

function measureLufs(filePath: string): string | null {
    try {
        const output = execSync(`ffmpeg -i "${filePath}" -vn -af ebur128 -f null - 2>&1`).toString();
        const match = output.match(/Integrated loudness:\s+I:\s+(-?\d+(\.\d+)?)/);
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

async function processAudioJob(job: { filename: string; s3Key: string; uploadedAt?: string }) {
    console.log(`[Worker:Audio] Rozpoczynam przetwarzanie: "${job.filename}"`);

    const command = new GetObjectCommand({
        Bucket: "tracks",
        Key: job.s3Key,
    });
    const response = await s3client.send(command);
    const bytes = await response.Body?.transformToByteArray();
    const inputPath = `/tmp/${job.s3Key}`;
    await fs.writeFile(inputPath, Buffer.from(bytes!));

    const outputDir = `/tmp/hls/${Date.now()}`;
    await fs.mkdir(outputDir, { recursive: true });

    const lufs = measureLufs(inputPath);
    console.log(`[Worker:Audio] Zmierzona głośność: ${lufs} LUFS`);

    console.log(`[Worker:Audio] Transkodowanie HLS...`);
    execSync(
        `ffmpeg -i "${inputPath}" -vn -c:a aac -b:a 192k -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" "${outputDir}/playlist.m3u8"`
    );

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
    const picture = meta.common.picture?.[0];

    let coverUrl: string | null = null;
    let colorPalette: Record<string, string | undefined> | null = null;

    if (picture) {
        const ext = picture.format.includes("png") ? "png" : "jpg";
        const coverKey = `covers/${job.s3Key}.${ext}`;

        await s3client.send(
            new PutObjectCommand({
                Bucket: "tracks",
                Key: coverKey,
                Body: picture.data,
                ContentType: picture.format,
            })
        );

        coverUrl = `/storage/tracks/${coverKey}`;

        try {
            const palette = await Vibrant.from(Buffer.from(picture.data)).getPalette();
            colorPalette = {
                vibrant: palette.Vibrant?.hex,
                darkVibrant: palette.DarkVibrant?.hex,
                lightVibrant: palette.LightVibrant?.hex,
                muted: palette.Muted?.hex,
                darkMuted: palette.DarkMuted?.hex,
                lightMuted: palette.LightMuted?.hex,
            };
        } catch (e) {
            console.warn("[Worker:Audio] Nie udało się wyciągnąć palety:", e);
        }
    }

    const cleanName = job.filename.replace(/\.mp3$/i, "").replace(/^\d+\.\s*/, "");
    const parts = cleanName.split(" - ");
    const title = meta.common.title || (parts.length > 1 ? parts.slice(1).join(" - ").trim() : cleanName.trim());
    const artist = meta.common.artist || (parts.length > 1 ? parts[0].trim() : "Unknown Artist");
    const album = meta.common.album || "Unknown Album";
    const durationMs = Math.round((meta.format.duration || 0) * 1000);

    const lyrics = await fetchLyrics(artist, title, durationMs / 1000);
    if (lyrics?.syncedLyrics) {
        console.log(`[Worker:Audio] Znaleziono tekst zsynchronizowany dla: "${title}"`);
    }

    await pool.query(
        `INSERT INTO tracks (title, artist, album, duration_ms, lufs_integrated, hls_manifest_url, raw_s3_key, synced_lyrics, plain_lyrics, cover_url, color_palette)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
            title,
            artist,
            album,
            durationMs,
            lufs,
            `/storage/tracks/hls/${job.s3Key}/playlist.m3u8`,
            job.s3Key,
            lyrics?.syncedLyrics || null,
            lyrics?.plainLyrics || null,
            coverUrl,
            colorPalette ? JSON.stringify(colorPalette) : null,
        ]
    );

    console.log(`[Worker:Audio] Pomyślnie zapisano: "${title}" | "${artist}"`);

    await fs.rm(inputPath, { force: true });
    await fs.rm(outputDir, { recursive: true, force: true });
}

async function processMotionJob(job: { trackId: string; s3Key: string; filename: string }) {
    console.log(`[Worker:Motion] Przetwarzanie Apple Motion Art dla utworu ${job.trackId}...`);

    const command = new GetObjectCommand({
        Bucket: "tracks",
        Key: job.s3Key,
    });
    const response = await s3client.send(command);
    const bytes = await response.Body?.transformToByteArray();
    const inputPath = `/tmp/${job.s3Key}`;
    await fs.writeFile(inputPath, Buffer.from(bytes!));

    const outputPath = `/tmp/motion-${job.trackId}.mp4`;

    console.log(`[Worker:Motion] Konwersja FFmpeg do pętli kwadratu 1:1 (bez dźwięku)...`);
    execSync(
        `ffmpeg -y -i "${inputPath}" -an -vf "scale=800:800:force_original_aspect_ratio=increase,crop=800:800" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`
    );

    const motionKey = `motion/${job.trackId}.mp4`;
    const videoBuffer = await fs.readFile(outputPath);

    await s3client.send(
        new PutObjectCommand({
            Bucket: "tracks",
            Key: motionKey,
            Body: videoBuffer,
            ContentType: "video/mp4",
        })
    );

    const motionUrl = `/storage/tracks/${motionKey}`;
    await pool.query(
        `UPDATE tracks SET motion_cover_url = $1 WHERE id = $2`,
        [motionUrl, job.trackId]
    );

    console.log(`[Worker:Motion] Motion Art zapisany pomyślnie pod ${motionUrl}`);

    await fs.rm(inputPath, { force: true });
    await fs.rm(outputPath, { force: true });
}

async function startWorker() {
    while (true) {
        const result = await redis.blpop("audio:jobs", "motion:jobs", 0);
        if (!result) continue;

        const [queue, rawPayload] = result;
        try {
            const job = JSON.parse(rawPayload);

            if (queue === "audio:jobs") {
                await processAudioJob(job);
            } else if (queue === "motion:jobs") {
                await processMotionJob(job);
            }
        } catch (err: any) {
            console.error(`[Worker] Błąd przetwarzania zadania z kolejki "${queue}":`, err.message || err);
        }
    }
}

startWorker();
