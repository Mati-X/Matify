import type {Track} from "../store/usePlayerStore.ts";
import {api} from "./client.ts";

export interface SearchResults {
    query: string;
    tracks: Track[];
    playlists: any[];
    artists: { name: string }[];
    albums: { name: string; artist: string; coverUrl?: string }[];
}

export const searchAll = async (query: string): Promise<SearchResults> => {
    const { data } = await api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
    return data;
};