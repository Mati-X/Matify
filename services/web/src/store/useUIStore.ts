import { create } from 'zustand';

export type TabType = 'home' | 'album' | 'playlist' | 'artist' | 'user' | 'favorites' | 'settings';

interface Tab {
    id: string;
    title: string;
    type: TabType;
    entityId? : string;
}

interface UIStore {
    isSearching: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    isLyricsOpen: boolean;
    toggleLyrics: () => void;
    closeLyrics: () => void;
    tabs: Tab[];
    activeTabId: string;
    openTab: (tab: Tab) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isSearching: false,
    openSearch: () => set({isSearching: true}),
    closeSearch: () => set({isSearching: false}),
    isLyricsOpen: false,
    toggleLyrics: () => set((s) => ({isLyricsOpen: !s.isLyricsOpen})),
    closeLyrics: () => set({isLyricsOpen: false}),
    tabs: [{id: 'home', title: 'Home', type: 'home'}],
    activeTabId: 'home',
    openTab: (tab: Tab) => set((s) => ({tabs: [...s.tabs, tab]})),
    closeTab: (tabId: string) => set((s) => ({tabs: s.tabs.filter((tab) => tab.id !== tabId)})),
    setActiveTab: (tabId: string) => set({activeTabId: tabId}),
}));