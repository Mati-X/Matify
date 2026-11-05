export interface LyricLine {
    time: number;
    text: string;
}
export function parseLrc(lrcText: string): LyricLine[] {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const lyrics: LyricLine[] = [];
    for (const line of lines) {
        const match = /^\[(\d{2}):(\d{2}(?:\.\d+)?)\]\s*(.*)$/.exec(line);
        if (!match) continue;
        const [, minutes, seconds, text] = match;
        const time = Number(minutes) * 60 + Number(seconds);
        const cleanText = text.trim();
        const lyricLine: LyricLine = {
            time,
            text: cleanText || "···"
        };
         lyrics.push(lyricLine);
    }
    return lyrics;
}