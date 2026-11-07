import { FastifyInstance } from "fastify";
import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/index";
import { playlists, tracks } from "../db/schema";

export async function searchRoutes(app: FastifyInstance) {
    app.get("/", async (req, res) => {
        const { q } = req.query as { q?: string };
        if (!q || !q.trim()) {
            return res.status(200).send({
                query: "",
                tracks: [],
                playlists: [],
                artists: [],
                albums: [],
            });
        }

        const term = `%${q.trim()}%`;

        let currentUserId: string | null = null;
        try {
            await req.jwtVerify();
            currentUserId = (req.user as { id: string })?.id || null;
        } catch {
            // Unauthenticated guest
        }

        const playlistVisibility = currentUserId
            ? or(eq(playlists.isPublic, true), eq(playlists.userId, currentUserId))
            : eq(playlists.isPublic, true);

        const [matchingTracks, matchingPlaylists, matchingArtists, matchingAlbums] = await Promise.all([
            db
                .select()
                .from(tracks)
                .where(
                    or(
                        ilike(tracks.title, term),
                        ilike(tracks.artist, term),
                        ilike(tracks.album, term)
                    )
                )
                .limit(10),

            db
                .select()
                .from(playlists)
                .where(
                    and(
                        or(
                            ilike(playlists.title, term),
                            ilike(playlists.description, term)
                        ),
                        playlistVisibility
                    )
                )
                .limit(5),

            db
                .selectDistinct({
                    name: tracks.artist,
                })
                .from(tracks)
                .where(ilike(tracks.artist, term))
                .limit(5),

            db
                .selectDistinct({
                    name: tracks.album,
                    artist: tracks.artist,
                    coverUrl: tracks.coverUrl,
                })
                .from(tracks)
                .where(ilike(tracks.album, term))
                .limit(5),
        ]);

        return res.status(200).send({
            query: q.trim(),
            tracks: matchingTracks,
            playlists: matchingPlaylists,
            artists: matchingArtists,
            albums: matchingAlbums,
        });
    });
}
