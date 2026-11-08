import {JSX, useEffect, useState} from "react";
import {type Track, usePlayerStore} from "../../store/usePlayerStore.ts";
import {getTracks} from "../../api/tracks.ts";
import {Dot, Play} from "lucide-react";

function TrackList() {

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getTracks().then(r =>
            setTracks(r))
            .finally(() => setLoading(false));
    }, []);

    const setTrack = usePlayerStore((state) => state.setTrack);
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const isPlaying = usePlayerStore((state) => state.isPlaying);

    if (loading) {
        return <div className="text-neutral-400 py-8">Ładowanie utworów...</div>;
    }

    return (
        <div className="flex flex-col gap-2">
            {tracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                    <div
                        key={track.id}
                        onClick={() => setTrack(track, tracks)}
                        className={`p-3  cursor-pointer flex items-center justify-between transition-colors ${
                            isCurrent ? "bg-neutral-800 text-emerald-400 font-bold" : "hover:bg-neutral-900 text-neutral-300"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span>{isCurrent && isPlaying ? <Play/> : <Dot/>}</span>
                            <span>{track.title}</span>
                        </div>
                        <span className="text-xs text-neutral-500">{track.artist}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default TrackList;