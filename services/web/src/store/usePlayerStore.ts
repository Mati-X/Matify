import { create } from 'zustand'

export interface Track {
    id: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    durationMs?: number | null;
    hlsManifestUrl: string;
    coverUrl?: string | null;
    colorPalette?: Record<string, string> | null;
    motion_cover_url?: string | null;
}

interface PlayerStore {
    currentTrack: Track | null;
    isPlaying: boolean;
    queue: Track[];
    queueIndex: number;
    volume: number;
    currentTime: number;
    duration: number;
    isMuted: boolean;
    setTrack: (track: Track, newQueue?: Track[]) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    seekRequest: { time: number; id: number } | null;
    seek: (time: number) => void;
};

export const  usePlayerStore = create<PlayerStore>((set) => ({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    queueIndex: 0,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    seekRequest: null,

    setTrack: (track, newQueue) => {
        const queue = newQueue || [track];
        const queueIndex = queue.findIndex((t) => t.id === track.id);

        set({
            currentTrack: track,
            queue,
            queueIndex: queueIndex !== -1 ? queueIndex : 0,
            isPlaying: true,
            currentTime: 0,
        });
    },
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setVolume: (volume) => set({ volume }),
    setProgress: (progress) => set({ currentTime: progress }),
    nextTrack: () => set((state) => {
        if (state.queue.length === 0) return state;
        const nextIndex = (state.queueIndex + 1) % state.queue.length; // zapętla do 0 na końcu
        return {
            queueIndex: nextIndex,
            currentTrack: state.queue[nextIndex],
            currentTime: 0,
            isPlaying: true,
        };
    }),
    prevTrack: () => set((state) => {
        if (state.queue.length === 0) return state;
        const prevIndex = state.queueIndex > 0 ? state.queueIndex - 1 : state.queue.length - 1;
        return {
            queueIndex: prevIndex,
            currentTrack: state.queue[prevIndex],
            currentTime: 0,
            isPlaying: true,
        }}),
    seek: (time: number) => set({ currentTime: time, seekRequest: { time, id: Date.now() } })
    }));