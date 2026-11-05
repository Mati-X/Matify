import { db, pool } from "./index";
import { equalizerPresets } from "./schema";

const defaultPresets = [
    {
        name: "Flat",
        type: "genre",
        preamp: "0.00",
        isDefault: true,
        gains: { "32": 0, "64": 0, "125": 0, "250": 0, "500": 0, "1000": 0, "2000": 0, "4000": 0, "8000": 0, "16000": 0 },
    },
    {
        name: "Bass Boost",
        type: "genre",
        preamp: "-4.50",
        isDefault: true,
        gains: { "32": 6.0, "64": 5.0, "125": 3.5, "250": 1.5, "500": 0.0, "1000": 0.0, "2000": 0.0, "4000": 0.0, "8000": 0.0, "16000": 0.0 },
    },
    {
        name: "Vocal Boost",
        type: "genre",
        preamp: "-2.50",
        isDefault: true,
        gains: { "32": -1.5, "64": -1.0, "125": 0.0, "250": 1.5, "500": 3.0, "1000": 3.5, "2000": 3.0, "4000": 1.5, "8000": 0.5, "16000": 0.0 },
    },
    {
        name: "Hip-Hop",
            type: "genre",
        preamp: "-4.00",
        isDefault: true,
        gains: { "32": 6.5, "64": 5.5, "125": 3.0, "250": 0.5, "500": -0.5, "1000": 1.0, "2000": 2.0, "4000": 1.5, "8000": 2.5, "16000": 2.0 },
    },
    {
        name: "R&B",
            type: "genre",
        preamp: "-3.50",
        isDefault: true,
        gains: { "32": 5.0, "64": 4.5, "125": 2.5, "250": 0.5, "500": 0.0, "1000": 1.5, "2000": 2.0, "4000": 2.0, "8000": 3.0, "16000": 3.5 },
    },
    {
        name: "Pop",
            type: "genre",
        preamp: "-3.00",
        isDefault: true,
        gains: { "32": 2.0, "64": 3.0, "125": 2.5, "250": 0.5, "500": -1.0, "1000": 1.0, "2000": 2.5, "4000": 3.0, "8000": 3.5, "16000": 3.0 },
    },
    {
        name: "Rock",
            type: "genre",
        preamp: "-3.50",
        isDefault: true,
        gains: { "32": 4.5, "64": 3.0, "125": 1.5, "250": -0.5, "500": -1.5, "1000": 0.5, "2000": 2.0, "4000": 3.5, "8000": 4.0, "16000": 4.0 },
    },
    {
        name: "Metal",
            type: "genre",
        preamp: "-4.00",
        isDefault: true,
        gains: { "32": 5.0, "64": 4.0, "125": 1.0, "250": -1.0, "500": -2.0, "1000": 0.0, "2000": 2.5, "4000": 4.0, "8000": 4.5, "16000": 4.0 },
    },
    {
        name: "Electronic",
            type: "genre",
        preamp: "-3.50",
        isDefault: true,
        gains: { "32": 5.5, "64": 4.5, "125": 1.5, "250": 0.0, "500": -1.5, "1000": 1.5, "2000": 0.5, "4000": 1.5, "8000": 4.0, "16000": 4.5 },
    },
    {
        name: "Jazz",
            type: "genre",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": 2.5, "64": 2.0, "125": 1.0, "250": 1.5, "500": 0.5, "1000": 0.0, "2000": 1.0, "4000": 2.0, "8000": 2.5, "16000": 3.0 },
    },
    {
        name: "Classical",
            type: "genre",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": 3.0, "64": 2.5, "125": 1.0, "250": 0.5, "500": 0.0, "1000": 0.0, "2000": 1.0, "4000": 2.0, "8000": 3.0, "16000": 3.5 },
    },
    {
        name: "Acoustic",
            type: "genre",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": 1.5, "64": 1.5, "125": 1.0, "250": 1.5, "500": 2.0, "1000": 1.5, "2000": 1.5, "4000": 2.5, "8000": 2.5, "16000": 2.0 },
    },
    {
        name: "Vocal Boost",
            type: "genre",
        preamp: "-2.50",
        isDefault: true,
        gains: { "32": -1.5, "64": -1.0, "125": 0.0, "250": 1.5, "500": 3.0, "1000": 3.5, "2000": 3.0, "4000": 1.5, "8000": 0.5, "16000": 0.0 },
    },
    {
        name: "Podcast / Spoken Word",
            type: "genre",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": -5.0, "64": -3.5, "125": -1.0, "250": 1.0, "500": 2.5, "1000": 3.5, "2000": 3.0, "4000": 2.0, "8000": 0.5, "16000": -2.0 },
    },
    {
        name: "Nothing Ear (2024 / 2) (Harman Target)",
        type: "autoeq",
        preamp: "-2.50",
        isDefault: true,
        gains: { "32": 1.0, "64": 0.5, "125": -1.5, "250": -1.0, "500": 0.5, "1000": 1.0, "2000": 1.5, "4000": 0.0, "8000": -3.5, "16000": -1.5 },
    },
    {
        name: "Nothing Ear (1) (Harman Target)",
        type: "autoeq",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": 0.5, "64": 0.0, "125": -1.0, "250": -0.5, "500": 0.0, "1000": 1.0, "2000": 1.5, "4000": -1.0, "8000": -3.0, "16000": -1.0 },
    },
    {
        name: "Nothing Ear (3rd Gen) (Harman Target)",
        type: "autoeq",
        preamp: "-2.50",
        isDefault: true,
        gains: { "32": -1.0, "64": -1.5, "125": -2.0, "250": -0.5, "500": 0.5, "1000": 1.0, "2000": 0.5, "4000": -1.5, "8000": -3.0, "16000": -1.0 },
    },
    {
        name: "Nothing Ear (a) (Harman Target)",
        type: "autoeq",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": -2.0, "64": -2.5, "125": -2.0, "250": -1.0, "500": 0.0, "1000": 0.5, "2000": 1.0, "4000": -0.5, "8000": -2.5, "16000": -1.0 },
    },
    {
        name: "Apple AirPods Pro 2 (Harman Target)",
        type: "autoeq",
        preamp: "-1.00",
        isDefault: true,
        gains: { "32": -0.5, "64": -0.8, "125": -0.5, "250": 0.2, "500": 0.5, "1000": -0.8, "2000": 1.2, "4000": -2.0, "8000": 1.5, "16000": -1.0 },
    },
    {
        name: "Sony WH-1000XM4 (Harman Target)",
        type: "autoeq",
        preamp: "-2.00",
        isDefault: true,
        gains: { "32": -4.5, "64": -4.0, "125": -2.5, "250": -1.0, "500": 0.5, "1000": 1.5, "2000": 2.5, "4000": 1.0, "8000": -1.5, "16000": -0.5 },
    },
    {
        name: "Sennheiser HD 600 (Harman Target)",
        type: "autoeq",
        preamp: "-5.00",
        isDefault: true,
        gains: { "32": 5.5, "64": 4.5, "125": 2.0, "250": 0.0, "500": -0.5, "1000": -0.5, "2000": 0.5, "4000": 1.0, "8000": 0.0, "16000": -1.0 },
    },
    {
        name: "Dynamic V-Shape (Punchy Bass & Air)",
        type: "genre",
        preamp: "-9.60",
        isDefault: true,
        gains: {
            "32": 5.39,
            "64": 9.55,
            "125": 4.61,
            "250": -0.24,
            "500": -2.76,
            "1000": -1.61,
            "2000": 4.29,
            "4000": 5.75,
            "8000": 5.13,
            "16000": 2.63,
        },
    },
];

async function seed() {
    console.log("[Seed] Wypełniam bazę presetami equalizera...");
    await db.insert(equalizerPresets).values(defaultPresets);
    console.log("[Seed] Zakończono pomyślnie!");
    await pool.end();
}

seed().catch((err) => {
    console.error("[Seed] Błąd seedowania:", err);
    process.exit(1);
});