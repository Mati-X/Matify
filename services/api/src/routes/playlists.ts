import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index";
import { playlistEntries, playlists, tracks } from "../db/schema";

export async function playlistsRoutes(app: FastifyInstance) {
    app.post("/", async (req, res) => {
        await req.jwtVerify();
        const userId = (req.user as { id: string }).id;
        const { title, description, isPublic } = req.body as {
            title: string;
            description?: string;
            isPublic?: boolean;
        };

        if (!title) {
            return res.status(400).send({ error: "No title provided" });
        }

        const [newPlaylist] = await db
            .insert(playlists)
            .values({
                title,
                description,
                userId,
                isPublic: isPublic ?? true,
            })
            .returning();

        return res.status(201).send({ playlist: newPlaylist });
    });

    app.get("/", async () => {
        const publicPlaylists = await db
            .select()
            .from(playlists)
            .where(eq(playlists.isPublic, true));

        return { playlists: publicPlaylists };
    });

    app.get("/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));

        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found" });
        }

        if (!playlist.isPublic) {
            try {
                await req.jwtVerify();
                const userId = (req.user as { id: string })?.id;
                if (playlist.userId && playlist.userId !== userId) {
                    return res.status(403).send({ error: "This playlist is private" });
                }
            } catch {
                return res.status(403).send({ error: "This playlist is private" });
            }
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

    app.post("/:id/tracks", async (req, res) => {
        await req.jwtVerify();
        const userId = (req.user as { id: string }).id;
        const { id: playlistId } = req.params as { id: string };

        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, playlistId));
        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found" });
        }

        if (playlist.userId && playlist.userId !== userId) {
            return res.status(403).send({ error: "You are not the owner of this playlist" });
        }

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

        return res.status(201).send({ entry });
    });

    app.get("/:id/shuffle", async (req, res) => {
        const { id } = req.params as { id: string };
        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));

        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found" });
        }

        if (!playlist.isPublic) {
            try {
                await req.jwtVerify();
                const userId = (req.user as { id: string })?.id;
                if (playlist.userId && playlist.userId !== userId) {
                    return res.status(403).send({ error: "This playlist is private" });
                }
            } catch {
                return res.status(403).send({ error: "This playlist is private" });
            }
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

        if (entries.length === 0) {
            return { queue: [] };
        }

        const clusters: (typeof entries)[] = [];
        const groupMap = new Map<string, typeof entries>();

        for (const item of entries) {
            if (item.sequenceGroupId && item.atomic) {
                if (!groupMap.has(item.sequenceGroupId)) {
                    const newGroup: typeof entries = [];
                    groupMap.set(item.sequenceGroupId, newGroup);
                    clusters.push(newGroup);
                }
                groupMap.get(item.sequenceGroupId)!.push(item);
            } else {
                clusters.push([item]);
            }
        }

        for (let i = clusters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clusters[i], clusters[j]] = [clusters[j], clusters[i]];
        }

        const shuffledQueue = clusters.flat();
        return { queue: shuffledQueue };
    });

    app.delete("/:id", async (req, res) => {
        await req.jwtVerify();
        const userId = (req.user as { id: string }).id;
        const { id } = req.params as { id: string };

        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found" });
        }

        if (playlist.userId && playlist.userId !== userId) {
            return res.status(403).send({ error: "You are not the owner of this playlist" });
        }

        await db.delete(playlists).where(eq(playlists.id, id));
        return res.status(200).send({ message: "Playlist deleted successfully", id });
    });
}
