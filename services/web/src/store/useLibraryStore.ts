import {create} from "zustand";
import {toggleFavorite, getFavorites} from "../api/me.ts";
import {type TrackListItem} from "../components/tracks/trackListConfig.ts";
import {createPlaylist as createPlaylistApi, getMyPlaylists, type Playlist} from "../api/playlists.ts";

export interface LibraryStore {
    favorites: TrackListItem[];
    favoriteIds: string[];
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (trackId: string) => Promise<void>;
    playlists: Playlist[];
    fetchPlaylists: () => Promise<void>;
    createPlaylist: (title: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
    favorites: [],
    favoriteIds: [],
    fetchFavorites: async () => {
        const tracks = await getFavorites();
        set({
            favorites: tracks,
            favoriteIds: tracks.map((t: TrackListItem) => t.id),
        });
    },
    toggleFavorite: async (trackId: string) => {
        const prevIds = get().favoriteIds;
        const prevFavorites = get().favorites;
        const wasLiked = prevIds.includes(trackId);

        set({
            favoriteIds: wasLiked
                ? prevIds.filter((id) => id !== trackId)
                : [...prevIds, trackId],
            favorites: wasLiked
                ? prevFavorites.filter((t) => t.id !== trackId)
                : prevFavorites,
        });

        try {
            await toggleFavorite(trackId);
            await get().fetchFavorites();
        } catch {
            set({ favoriteIds: prevIds, favorites: prevFavorites });
        }
    },
     playlists: [],
     fetchPlaylists: async () => {
         const playlists = await getMyPlaylists();
         set({ playlists });
     },
     createPlaylist: async (title: string) => {
         await createPlaylistApi(title);
         await get().fetchPlaylists();
     },
}));
