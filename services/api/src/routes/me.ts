import { FastifyInstance } from "fastify";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index";
import { favorites, playbackHistory, playlists, tracks } from "../db/schema";

export async function meRoutes(app: FastifyInstance) {
    app.addHook("preHandler", async (req) => {
        await req.jwtVerify();
    });

    app.get("/favorites", async (req) => {
        const userId = (req.user as { id: string }).id;

        const favoriteTracks = await db
            .select({
                favoriteId: favorites.id,
                likedAt: favorites.createdAt,
                track: tracks,
            })
            .from(favorites)
            .innerJoin(tracks, eq(favorites.trackId, tracks.id))
            .where(eq(favorites.userId, userId))
            .orderBy(desc(favorites.createdAt));

        return { favoriteTracks };
    });

    app.get("/history", async (req) => {
        const userId = (req.user as { id: string }).id;

        const history = await db
            .select({
                playedAt: playbackHistory.createdAt,
                track: tracks,
            })
            .from(playbackHistory)
            .innerJoin(tracks, eq(playbackHistory.trackId, tracks.id))
            .where(eq(playbackHistory.userId, userId))
            .orderBy(desc(playbackHistory.createdAt))
            .limit(50);

        return { history };
    });

    app.get("/playlists", async (req) => {
        const userId = (req.user as { id: string }).id;

        const myPlaylists = await db
            .select()
            .from(playlists)
            .where(eq(playlists.userId, userId))
            .orderBy(desc(playlists.createdAt));

        return { playlists: myPlaylists };
    });
}
