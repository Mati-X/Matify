import {pgTable, uuid, varchar, integer, timestamp, boolean} from "drizzle-orm/pg-core";

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

export const playlists = pgTable("playlists", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const playlistEntries = pgTable("playlist_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    playlistId: uuid("playlist_id")
        .references(() => playlists.id, { onDelete: "cascade" })
        .notNull(),
    trackId: uuid("track_id")
        .references(() => tracks.id, { onDelete: "cascade" })
        .notNull(),
    position: integer("position").notNull(),

    entryType: varchar("entry_type", { length: 20 }).default("single").notNull(),
    sequenceGroupId: uuid("sequence_group_id"),
    atomic: boolean("atomic").default(false).notNull(),
    allowMidEntry: boolean("allow_mid_entry").default(true).notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;