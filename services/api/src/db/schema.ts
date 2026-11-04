import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const tracks = pgTable("tracks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    artist: varchar("artist", { length: 255 }),
    album: varchar("album", { length: 255 }),
    durationMs: integer("duration_ms").default(0),
    hlsManifestUrl: varchar("hls_manifest_url", { length: 512 }).notNull(),
    rawS3Key: varchar("raw_s3_key", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;