import Fastify from "fastify";

const app = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 3000;

app.get("/health", async () => {
    return { status: "ok", app: "Matify API" };
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