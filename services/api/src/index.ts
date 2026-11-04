import Fastify from "fastify";
import pg, {QueryResult} from "pg";
import fastifyMultipart, {Multipart, MultipartFile} from "@fastify/multipart";
import {S3Client, PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import Redis from "ioredis";
import { db, pool } from './db/index';
import {playlistEntries, playlists, tracks} from './db/schema'
import {and, eq, ilike, or} from "drizzle-orm";


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

app.get("/tracks", async (req) => {
    const { search, artist } = req.query as { search?: string; artist?: string };

    const conditions = [];

    if (search) {
        conditions.push(
            or(
                ilike(tracks.title, `%${search}%`),
                ilike(tracks.artist, `%${search}%`),
                ilike(tracks.album, `%${search}%`)
            )
        );
    }

    if (artist) {
        conditions.push(ilike(tracks.artist, `%${artist}%`));
    }

    const query = db.select().from(tracks);
    const allTracks = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return { tracks: allTracks };
});

app.get("/tracks/:id", async (req, res) => {
    const params = req.params;
     if  (!params.id) {
         return res.status(400).send({ error : "No id provided"});
     }
    const track = await db.select().from(tracks).where(eq(tracks.id, params.id));
    if (track.length === 0) {
        return res.status(404).send({ error: "Track not found" });
    }
    return res.status(200).send({ track: track[0] });
});

app.delete("/tracks/:id", async (req, res) => {
    const params = req.params;
    if (!params.id) {
        return res.status(400).send({error: "No id provided"});
    }
    const [track] = await db.select().from(tracks).where(eq(tracks.id, params.id));
    if (!track) {
        return res.status(404).send({error: "Track not found"});
    }

    if (track.rawS3Key) {
        await s3client.send(
            new DeleteObjectCommand({
                Bucket: "tracks",
                Key: track.rawS3Key,
            })
        );
    }

    await db.delete(tracks).where(eq(tracks.id, params.id));
    return res.status(200).send({message: "Track deleted successfully", id: params.id});
});

app.post("/playlists", async (req, res) => {
     const { title, description } = req.body as { title: string; description?: string };
     if (!title) {
         return res.status(400).send({ error: "No title provided" });
     }
    const [newPlaylist] = await db
        .insert(playlists)
        .values({ title, description })
        .returning();
    await res.status(201).send({playlist: newPlaylist})
});

app.get("/playlists", async (req, res) => {
    const allPlaylists = await db.select().from(playlists);
    return { playlists: allPlaylists };
});

app.post("/playlists/:id/tracks", async (req, res) => {
    const playlistId  = req.params?.id;
    const { trackId, position, entryType, sequenceGroupId, atomic } = req.body as {
        trackId: string;
        position: number;
        entryType?: string;
        sequenceGroupId?: string;
        atomic?: boolean;
    };

    const [entry] = await db
        .insert(playlistEntries)
        .values({
            playlistId,
            trackId,
            position,
            entryType: entryType || "single",
            sequenceGroupId: sequenceGroupId || null,
            atomic: atomic ?? false,
        })
        .returning();

    await res.status(201).send({entry})
});

app.get( "/playlists/:id", async (req, res) => {
    const { id } = req.params as { id: string };
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    if (!playlist) {
        return res.status(404).send({ error: "Playlist not found" });
    }

    const entries = await db
        .select({
            entryId: playlistEntries.id,
            position: playlistEntries.position,
            entryType: playlistEntries.entryType,
            sequenceGroupId: playlistEntries.sequenceGroupId,
            atomic: playlistEntries.atomic,
            track: tracks,
        })
        .from(playlistEntries)
        .innerJoin(tracks, eq(playlistEntries.trackId, tracks.id))
        .where(eq(playlistEntries.playlistId, id))
        .orderBy(playlistEntries.position);

    return { playlist, tracks: entries };
});

const start = async () => {
    try {
        await app.listen({port: PORT, host: "0.0.0.0"});
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();