import { create } from 'zustand'

export interface Track {
    id: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationMs?: number | null;
    hlsManifestUrl: string;
    coverUrl?: string | null;
    colorPalette?: Record<string, string> | null;
    motion_cover_url?: string | null;
    addedBy? : { id: string; username: string} | null
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
    isShuffled: boolean;
    originalQueue: Track[];
    toggleShuffle: () => void;
    playShuffled: (tracks: Track[]) => void;
};

function shuffleTracks(tracks: Track[]): Track[] {
    const copy = [...tracks];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    queueIndex: 0,
    volume: 0.8,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    seekRequest: null,
    isShuffled: false,
    originalQueue: [],
    toggleShuffle: () => set((state) => {
        const newValue = !state.isShuffled;
        const currentTrack = state.currentTrack ?? state.queue[state.queueIndex];

        if (!currentTrack || state.queue.length === 0) {
            return { isShuffled: newValue };
        }

        if (newValue) {
            const rest = state.originalQueue.filter((track) => track.id !== currentTrack.id);
            const shuffled = [currentTrack, ...shuffleTracks(rest)];
            return { queue: shuffled, queueIndex: 0, isShuffled: true };
        }

        const originalIndex = state.originalQueue.findIndex((track) => track.id === currentTrack.id);
        return {
            queue: state.originalQueue,
            queueIndex: originalIndex !== -1 ? originalIndex : 0,
            isShuffled: false,
        };
    }),
    playShuffled: (tracks) => {
        if (tracks.length === 0) return;
        const shuffled = shuffleTracks(tracks);
        set({
            currentTrack: shuffled[0],
            queue: shuffled,
            originalQueue: tracks,
            queueIndex: 0,
            isShuffled: true,
            isPlaying: true,
            currentTime: 0,
        });
    },
    setTrack: (track, newQueue) => set((state) => {
        const originalQueue = newQueue || [track];
        if (state.isShuffled) {
            const rest = originalQueue.filter((t) => t.id !== track.id);
            const shuffled = [track, ...shuffleTracks(rest)];
            return {
                currentTrack: track,
                queue: shuffled,
                originalQueue,
                queueIndex: 0,
                isPlaying: true,
                currentTime: 0,
            };
        }

        const queueIndex = originalQueue.findIndex((t) => t.id === track.id);
        return {
            currentTrack: track,
            queue: originalQueue,
            originalQueue,
            queueIndex: queueIndex !== -1 ? queueIndex : 0,
            isPlaying: true,
            currentTime: 0,
        };
    }),
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