import {api} from "./client.ts";
import type {Track} from "../store/usePlayerStore.ts";

export interface LyricLine {
    time: number; // czas w sekundach
    text: string;
}

export const getTracks = async () => {
    const { data } = await api.get<{ tracks: Track[] }>('/tracks');
    return data.tracks;
};

export const getLyrics = async (trackId: string): Promise<LyricLine[]> => {
    const { data } = await api.get<{ parsed: LyricLine[] }>(`/tracks/${trackId}/lyrics`);
    return data.parsed || [];
};