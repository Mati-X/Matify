import Fastify from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";
import { pool } from "./db/index";
import { authRoutes } from "./routes/auth";
import { tracksRoutes } from "./routes/tracks";
import { playlistsRoutes } from "./routes/playlists";
import { equalizerRoutes } from "./routes/equalizer";
import { meRoutes } from "./routes/me";
import { searchRoutes } from "./routes/search";

const app = Fastify({ logger: true });

app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "matify-super-secret-jwt-key-change-me",
});

app.register(fastifyMultipart, {
    limits: { fileSize: 1024 * 1024 * 50 },
});

// System endpoints
app.get("/health", async () => {
    return { status: "ok", app: "Matify API" };
});

app.get("/db-test", async () => {
    const result = await pool.query("SELECT NOW() as current_time, version()");
    return {
        status: "connected",
        db_time: result.rows[0].current_time,
        version: result.rows[0].version,
    };
});

// Moduły tras (Domain routes)
app.register(authRoutes, { prefix: "/auth" });
app.register(tracksRoutes, { prefix: "/tracks" });
app.register(playlistsRoutes, { prefix: "/playlists" });
app.register(equalizerRoutes, { prefix: "/equalizer" });
app.register(meRoutes, { prefix: "/me" });
app.register(searchRoutes, { prefix: "/search" });

// Alias dla kompatybilności wstecznej (/api/track/upload -> /api/tracks/upload)
app.post("/track/upload", async (req, res) => {
    return res.redirect(307, "/tracks/upload");
});

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
    try {
        await app.listen({ port: PORT, host: "0.0.0.0" });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
