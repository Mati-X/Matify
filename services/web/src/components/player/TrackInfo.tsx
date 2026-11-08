import type { Track } from "../../store/usePlayerStore";
import { Music } from "lucide-react";

interface TrackInfoProps {
  track: Track | null;
}

export function TrackInfo({ track }: TrackInfoProps) {
  if (!track) {
    return (
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
    <div className="flex items-center gap-3 w-64 min-w-[200px]">
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-12 h-12 object-cover rounded-lg shadow-md"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 text-xs font-bold">
          <Music />
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <p className="font-semibold text-sm text-neutral-100 truncate">{track.title}</p>
        <p className="text-xs text-neutral-400 truncate">{track.artist || "Unknown artist"}</p>
      </div>
    </div>
  );
}
