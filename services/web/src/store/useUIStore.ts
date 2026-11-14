import { create } from 'zustand';

interface UIStore {
    isSearching: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    isLyricsOpen: boolean;
    toggleLyrics: () => void;
    closeLyrics: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isSearching: false,
    openSearch: () => set({ isSearching: true }),
    closeSearch: () => set({ isSearching: false }),
    isLyricsOpen: false,
    toggleLyrics: () => set((s) => ({ isLyricsOpen: !s.isLyricsOpen })),
    closeLyrics: () => set({ isLyricsOpen: false }),
}));