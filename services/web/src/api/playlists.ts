import {api} from "./client.ts";
import type {TrackListItem} from "../components/tracks/trackListConfig.ts";

export interface Playlist {
    id: string;
    title: string;
    description: string | null;
    userId: string | null;
    isPublic: boolean;
    createdAt: string;
}

interface PlaylistEntryResponse {
    entryId: string;
    position: number;
    track: TrackListItem;
    addedBy: { id: string; username: string } | null;
}

export async function getMyPlaylists(): Promise<Playlist[]> {
    const {data} = await api.get("/me/playlists");
    return data.playlists;
}

export async function createPlaylist(title: string): Promise<Playlist> {
    const {data} = await api.post("/playlists", {title});
    return data.playlist;
}

export async function getPlaylist(id: string): Promise<{ playlist: Playlist; tracks: TrackListItem[] }> {
    const {data} = await api.get(`/playlists/${id}`);
    const tracks: TrackListItem[] = (data.tracks as PlaylistEntryResponse[]).map((entry) => ({
        ...entry.track,
        addedBy: entry.addedBy,
    }));
    return {playlist: data.playlist, tracks};
}

export async function addTrackToPlaylist(playlistId: string, trackId: string, position: number): Promise<void> {
    await api.post(`/playlists/${playlistId}/tracks`, {trackId, position});
}
