import {useEffect, useState} from "react";
import {Play, Shuffle} from "lucide-react";
import {getPlaylist, type Playlist} from "../../api/playlists.ts";
import {usePlayerStore} from "../../store/usePlayerStore.ts";
import TrackList, {type TrackListItem} from "./TrackList.tsx";

function PlaylistView({playlistId}: {playlistId: string}) {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [tracks, setTracks] = useState<TrackListItem[]>([]);
    const setTrack = usePlayerStore((s) => s.setTrack);
    const playShuffled = usePlayerStore((s) => s.playShuffled);

    useEffect(() => {
        if (!playlistId) return;
        getPlaylist(playlistId).then((res) => {
            setPlaylist(res.playlist);
            setTracks(res.tracks);
        });
    }, [playlistId]);

    const firstTrack = tracks[0];

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="relative overflow-hidden h-[320px] p-8 flex flex-col justify-between bg-gradient-to-b from-emerald-950/60 to-neutral-950">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
                    Playlist
                </span>
                <div className="flex flex-col gap-2">
                    <h1 className="text-5xl font-black text-white">
                        {playlist?.title ?? "Loading..."}
                    </h1>
                    {playlist?.description && (
                        <p className="text-sm text-neutral-300">{playlist.description}</p>
                    )}
                    <span className="text-sm text-neutral-400">
                        {tracks.length} tracks
                    </span>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        disabled={!firstTrack}
                        onClick={() => firstTrack && setTrack(firstTrack, tracks)}
                        className="text-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 items-center justify-center flex gap-3 font-bold w-40 h-12 rounded-full transition-colors cursor-pointer"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Play
                    </button>
                    <button
                        type="button"
                        disabled={!firstTrack}
                        onClick={() => playShuffled(tracks)}
                        className="text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 items-center justify-center flex gap-3 font-bold w-40 h-12 rounded-full transition-colors cursor-pointer"
                    >
                        <Shuffle className="w-5 h-5" />
                        Shuffle
                    </button>
                </div>
            </div>
            <TrackList variant="playlist" tracks={tracks} />
        </div>
    );
}

export default PlaylistView;
