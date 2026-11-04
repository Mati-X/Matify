import { execSync } from "node:child_process";
import Redis from "ioredis";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import fs from "node:fs/promises";

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

    while(true) {
        const result = await redis.blpop("audio:jobs", 0);
        if (!result) continue;
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
            `ffmpeg -i ${inputPath} -c:a aac -b:a 192k -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`
        );
        console.log(`[Worker] Transkodowanie ukończone! Pocięto na segmenty w ${outputDir}`);
    }
}

startWorker();