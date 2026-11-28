import { useEffect, useState } from "react";
import { ListMusic } from "lucide-react";
import { getHistory } from "../../api/me.ts";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { useLibraryStore } from "../../store/useLibraryStore.ts";
import { useUIStore } from "../../store/useUIStore.ts";
import TrackList, { type TrackListItem } from "./TrackList.tsx";

interface UserViewProps {
    userId: string;
    username: string;
}

export default function UserView({ userId, username }: UserViewProps) {
    const currentUser = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const playlists = useLibraryStore((s) => s.playlists);
    const favorites = useLibraryStore((s) => s.favorites);
    const openTab = useUIStore((s) => s.openTab);

    const [history, setHistory] = useState<TrackListItem[]>([]);
    const isOwnProfile = Boolean(currentUser && currentUser.id === userId);
    const displayName = isOwnProfile ? currentUser!.username : username;

    useEffect(() => {
        if (!isOwnProfile || !token) return;
        getHistory().then(setHistory).catch(() => {});
    }, [isOwnProfile, token]);

    return (
        <div className="flex flex-col flex-1 min-w-0 pb-12">
            <div className="relative overflow-hidden h-[320px] p-8 flex items-end gap-8 bg-gradient-to-b from-emerald-950/60 to-neutral-950">
                <div className="w-40 h-40 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-6xl font-black text-emerald-300 uppercase shadow-2xl">
                    {displayName.slice(0, 1)}
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
                        Profile
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-white truncate">
                        {displayName}
                    </h1>
                    {isOwnProfile && (
                        <span className="text-sm text-neutral-400">
                            {playlists.length} Playlists • {favorites.length} Liked songs
                        </span>
                    )}
                </div>
            </div>

            {isOwnProfile && playlists.length > 0 && (
                <section className="px-8 pt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Your Playlists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {playlists.map((playlist) => (
                            <button
                                key={playlist.id}
                                type="button"
                                onClick={() =>
                                    openTab({
                                        id: `playlist:${playlist.id}`,
                                        title: playlist.title,
                                        type: "playlist",
                                        entityId: playlist.id,
                                    })
                                }
                                className="flex flex-col gap-3 p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/80 border border-white/5 text-left transition-colors cursor-pointer"
                            >
                                <div className="w-full aspect-square rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                                    <ListMusic className="w-10 h-10" />
                                </div>
                                <span className="font-semibold text-white truncate w-full">
                                    {playlist.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {isOwnProfile && (
                <section className="pt-8">
                    <h2 className="px-8 text-xl font-bold text-white mb-2">Recently Played</h2>
                    {history.length > 0 ? (
                        <TrackList variant="favorites" tracks={history} />
                    ) : (
                        <p className="px-8 py-4 text-sm text-neutral-500">
                            No playback history yet.
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}
