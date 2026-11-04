import Fastify from "fastify";
import pg from "pg";

const { Pool } = pg;

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 3000;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});
app.get("/health", async () => {
    return { status: "ok", app: "Matify API" };
});

app.get("/db-test", async () => {
    const result = await db.query("SELECT NOW() as current_time, version()");
    return {
        status: "connected",
        db_time: result.rows[0].current_time,
        version: result.rows[0].version,
    };
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