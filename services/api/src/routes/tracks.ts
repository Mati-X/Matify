import { FastifyInstance } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index";
import { favorites, playbackHistory, tracks } from "../db/schema";
import { s3client } from "../lib/s3";
import { redis } from "../lib/redis";
import { LyricLine, parseLrc } from "../utils/lyricsParser";

export async function tracksRoutes(app: FastifyInstance) {
    app.post("/upload", async (req, res) => {
        const data: MultipartFile | undefined = await req.file();
        if (!data) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        const key = `raw-${Date.now()}-${data.filename}`;

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
    });

    app.get("/", async (req) => {
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

    app.get("/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).send({ error: "No id provided" });
        }
        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }
        return res.status(200).send({ track });
    });

    app.delete("/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).send({ error: "No id provided" });
        }
        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }

        if (track.rawS3Key) {
            await s3client.send(
                new DeleteObjectCommand({
                    Bucket: "tracks",
                    Key: track.rawS3Key,
                })
            );
        }

        await db.delete(tracks).where(eq(tracks.id, id));
        return res.status(200).send({ message: "Track deleted successfully", id });
    });

    app.get("/:id/lyrics", async (req, res) => {
        const { id } = req.params as { id: string };
        const [track] = await db
            .select({
                id: tracks.id,
                title: tracks.title,
                artist: tracks.artist,
                syncedLyrics: tracks.syncedLyrics,
                plainLyrics: tracks.plainLyrics,
            })
            .from(tracks)
            .where(eq(tracks.id, id));

        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }

        let parsed: LyricLine[] = [];
        if (track.syncedLyrics) {
            parsed = parseLrc(track.syncedLyrics);
        }

        return { lyrics: track, parsed };
    });

    app.put("/:id/lyrics", async (req, res) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).send({ error: "Invalid track id" });
        }

        const { syncedLyrics, plainLyrics } = req.body as {
            syncedLyrics?: string;
            plainLyrics?: string;
        };

        if (syncedLyrics === undefined && plainLyrics === undefined) {
            return res.status(400).send({ error: "Provide syncedLyrics or plainLyrics" });
        }

        const [updatedTrack] = await db
            .update(tracks)
            .set({
                ...(syncedLyrics !== undefined && { syncedLyrics }),
                ...(plainLyrics !== undefined && { plainLyrics }),
            })
            .where(eq(tracks.id, id))
            .returning();

        if (!updatedTrack) {
            return res.status(404).send({ error: "Track not found" });
        }

        const parsed = updatedTrack.syncedLyrics ? parseLrc(updatedTrack.syncedLyrics) : [];
        return res.status(200).send({
            message: "Lyrics updated",
            track: updatedTrack,
            parsed,
        });
    });

    app.post("/:id/motion", async (req, res) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).send({ error: "Invalid track id" });
        }

        const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }

        const data = await req.file();
        if (!data) {
            return res.status(400).send({ error: "No file provided" });
        }

        const key = `raw-motion-${id}-${Date.now()}-${data.filename}`;

        await s3client.send(
            new PutObjectCommand({
                Bucket: "tracks",
                Key: key,
                Body: await data.toBuffer(),
                ContentType: data.mimetype,
            })
        );

        const motionJobPayload = {
            trackId: id,
            s3Key: key,
            filename: data.filename,
        };

        await redis.rpush("motion:jobs", JSON.stringify(motionJobPayload));

        return res.status(202).send({ message: "Motion cover uploaded and queued for processing" });
    });

    app.post("/:id/favorite", async (req, res) => {
        await req.jwtVerify();
        const { id: trackId } = req.params as { id: string };
        const userId = (req.user as { id: string }).id;

        const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }

        const [existing] = await db
            .select()
            .from(favorites)
            .where(and(eq(favorites.trackId, trackId), eq(favorites.userId, userId)))
            .limit(1);

        if (existing) {
            await db.delete(favorites).where(and(eq(favorites.trackId, trackId), eq(favorites.userId, userId)));
            return res.status(200).send({ favorited: false });
        } else {
            await db.insert(favorites).values({ trackId, userId });
            return res.status(200).send({ favorited: true });
        }
    });

    app.post("/:id/play", async (req, res) => {
        await req.jwtVerify();
        const userId = (req.user as { id: string }).id;
        const { id: trackId } = req.params as { id: string };

        const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
        if (!track) {
            return res.status(404).send({ error: "Track not found" });
        }

        await db
            .update(tracks)
            .set({ playCount: sql`${tracks.playCount} + 1` })
            .where(eq(tracks.id, trackId));

        await db.insert(playbackHistory).values({ trackId, userId });

        return res.status(200).send({ trackId, userId });
    });
}
