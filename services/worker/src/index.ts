import { execSync } from "node:child_process";
import Redis from "ioredis";

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