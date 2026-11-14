export function formatDuration(durationMs?: number | null): string {
    if (!durationMs) return "0:00";
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function parseArtists(artist?: string | null): string[] {
    if (!artist) return [];
    return artist
        .split(/\s*(?:,|feat\.?|ft\.?|&)\s*/i)
        .map((name) => name.trim())
        .filter(Boolean);
}
