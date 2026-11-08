import type { Track } from "../../store/usePlayerStore";
import { Music } from "lucide-react";

interface TrackInfoProps {
  track: Track | null;
}

export function TrackInfo({ track }: TrackInfoProps) {
  if (!track) {
    return (<div className="flex flex-col gap-2">
        {tracks.map((track) => (
            <div key={track.id} onClick={() => setTrack(track, tracks)}>
                {track.title}
            </div>
        ))}
    </div>
      <div className="flex items-center gap-3 w-64 min-w-[200px]">
        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
          NULL
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-neutral-400">No track selected</p>
          <p className="text-xs text-neutral-600">No track selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
        <div className="relative size-20 rounded-2xl overflow-hidden shadow-2xl">
            {/* WARSTWA 1: Zwykła statyczna okładka (Zawsze gotowy Fallback) */}
            {track.coverUrl ? (
                <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-neutral-800" />
            )}

            {/* WARSTWA 2: Płynne wideo w pętli (Apple Motion Cover) */}
            {track.motion_cover_url && (
                <video
                    src={track.motion_cover_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 size-20   transition-opacity duration-700"
                    onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
                    style={{ opacity: 0 }}
                />
            )}
        </div>
      <div className="flex flex-col overflow-hidden">
        <p className="font-semibold text-sm text-neutral-100 truncate">{track.title}</p>
        <p className="text-xs text-neutral-400 truncate">{track.artist || "Unknown artist"}</p>
      </div>
    </div>
  );
}
