import { create } from 'zustand';

interface UIStore {
    isSearching: boolean;
    openSearch: () => void;
    closeSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isSearching: false,
    openSearch: () => set({ isSearching: true }),
    closeSearch: () => set({ isSearching: false }),
}));