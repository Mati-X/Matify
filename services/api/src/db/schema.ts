import {pgTable, uuid, varchar, integer, timestamp, boolean, numeric, text, jsonb} from "drizzle-orm/pg-core";

export const tracks = pgTable("tracks", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", {length: 255}).notNull(),
    artist: varchar("artist", {length: 255}),
    album: varchar("album", {length: 255}),
    durationMs: integer("duration_ms").default(0),
    lufsIntegrated: numeric("lufs_integrated", {precision: 4, scale: 2}),
    hlsManifestUrl: varchar("hls_manifest_url", {length: 512}).notNull(),
    rawS3Key: varchar("raw_s3_key", {length: 512}),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    syncedLyrics: text("synced_lyrics"),
    plainLyrics: text("plain_lyrics"),
    coverUrl: text("cover_url"),
    colorPalette: jsonb("color_palette").$type<{
        vibrant?: string;
        darkVibrant?: string;
        lightVibrant?: string;
        muted?: string;
        darkMuted?: string;
        lightMuted?: string;
    }>(),
    motion_cover_url: text("motion_cover_url"),
    playCount: integer("play_count").notNull().default(0),
});

export const playlists = pgTable("playlists", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", {length: 255}).notNull(),
    description: varchar("description", {length: 512}),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
});

export const playlistEntries = pgTable("playlist_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    playlistId: uuid("playlist_id").references(() => playlists.id, {onDelete: "cascade"}).notNull(),
    trackId: uuid("track_id").references(() => tracks.id, {onDelete: "cascade"}).notNull(),
    position: integer("position").notNull(),
    entryType: varchar("entry_type", {length: 20}).default("single").notNull(),
    sequenceGroupId: uuid("sequence_group_id"),
    atomic: boolean("atomic").default(false).notNull(),
    allowMidEntry: boolean("allow_mid_entry").default(true).notNull(),
});

export const equalizerPresets = pgTable("equalizer_presets", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", {length: 100}).notNull(),
    type: varchar("type", {length: 50}).default("genre").notNull(),
    preamp: numeric("preamp", {precision: 4, scale: 2}).default("0.00").notNull(),
    gains: jsonb("gains").$type<Record<string, number>>().notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
});

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    trackId: uuid("track_id")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const playbackHistory = pgTable("playback_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    trackId: uuid("track_id")
        .notNull()
        .references(() => tracks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;