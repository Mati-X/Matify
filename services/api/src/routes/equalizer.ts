import { FastifyInstance } from "fastify";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "../db/index";
import { equalizerPresets } from "../db/schema";

export async function equalizerRoutes(app: FastifyInstance) {
    app.get("/presets", async (req) => {
        const { type, search } = req.query as { type?: string; search?: string };
        const conditions = [];

        if (type) conditions.push(eq(equalizerPresets.type, type));
        if (search) conditions.push(ilike(equalizerPresets.name, `%${search}%`));

        const presets = conditions.length > 0
            ? await db.select().from(equalizerPresets).where(and(...conditions))
            : await db.select().from(equalizerPresets);

        return { presets };
    });

    app.get("/presets/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        const [preset] = await db.select().from(equalizerPresets).where(eq(equalizerPresets.id, id));

        if (!preset) {
            return res.status(404).send({ error: "Preset not found" });
        }

        return res.status(200).send({ preset });
    });

    app.post("/presets", async (req, res) => {
        const { name, type, preamp, gains } = req.body as {
            name: string;
            type?: string;
            preamp?: number;
            gains: Record<string, number>;
        };

        if (!name || !gains) {
            return res.status(400).send({ error: "Name and gains are required" });
        }

        const [preset] = await db
            .insert(equalizerPresets)
            .values({
                name,
                gains,
                preamp: preamp ? String(preamp) : "0.00",
                type: type || "custom",
            })
            .returning();

        return res.status(201).send({ preset });
    });

    app.delete("/presets/:id", async (req, res) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(404).send({ error: "Preset not found" });
        }

        const [preset] = await db.select().from(equalizerPresets).where(eq(equalizerPresets.id, id));
        if (!preset) {
            return res.status(404).send({ error: "Preset not found" });
        }

        if (preset.isDefault) {
            return res.status(400).send({ error: "Default preset cannot be deleted" });
        }

        await db.delete(equalizerPresets).where(eq(equalizerPresets.id, id));
        return res.status(200).send({ message: "Preset deleted" });
    });

    app.post("/presets/reset", async (req, res) => {
        await db.delete(equalizerPresets).where(eq(equalizerPresets.isDefault, false));
        return res.status(200).send({ message: "Default preset reset" });
    });
}
