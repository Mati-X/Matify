import Fastify from "fastify";
import pg, {QueryResult} from "pg";
import fastifyMultipart, {Multipart, MultipartFile} from "@fastify/multipart";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import Redis from "ioredis";
import { db, pool } from './db/index';
import { tracks } from './db/schema'


const app = Fastify({ logger: true });

app.register(fastifyMultipart, {
    limits: { fileSize: 1024 * 1024 * 50 }
});

const s3client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region:  process.env.S3_REGION || "local",
    forcePathStyle: true
});

const redis =  new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
});

const PORT = Number(process.env.PORT) || 3000;

app.get("/health", async () => {
    return { status: "ok", app: "Matify API" };
});

app.get("/db-test", async () => {
    const result: QueryResult<any> = await pool.query("SELECT NOW() as current_time, version()");
    return {
        status: "connected",
        db_time: result.rows[0].current_time,
        version: result.rows[0].version,
    };
});

app.post("/track/upload", async (req, res) => {

    const data: MultipartFile | undefined = await req.file();
    if(!data) {
        return res.status(400).send({ error : "No file uploaded"});
    }

    const key: string = `raw-${Date.now()}-${data?.filename}`;

    await s3client.send(
         new PutObjectCommand({
             Bucket: "tracks",
             Key: key,
             Body: await data.toBuffer(),
             ContentType: data.mimetype,
         })
    );

    const jobPayload = {
        filename: data.filename,
        s3Key: key,
        uploadedAt: new Date().toISOString(),
    };

    await redis.rpush("audio:jobs", JSON.stringify(jobPayload));

    return res.status(201).send({
        message: "Track uploaded and queued for processing",
        job: jobPayload,
    });
})

app.get("/tracks", async () => {
    const allTracks = await db.select().from(tracks);
    return { tracks: allTracks };
});

const start = async () => {
    try {
        await app.listen({ port: PORT, host: "0.0.0.0" });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();