import {api} from "./client.ts";
import type {Track} from "../store/usePlayerStore.ts";

export const getTracks = async () => {
    const { data } = await api.get<{ tracks: Track[] }>('/tracks');
    return data.tracks;
};