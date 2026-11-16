import type { Track } from "../../store/usePlayerStore";

interface TrackInfoProps {
  track: Track | null;
}

export function TrackInfo({ track }: TrackInfoProps) {
  if (!track) {
    return (
        <div className="flex items-center gap-4 w-72 min-w-0">
          <div className="size-20 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
            NULL
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-medium text-neutral-400">No track selected</p>
            <p className="text-sm text-neutral-600">No track selected</p>
          </div>
        </div>
    );
  }

  return (
    <div className="flex items-center gap-4 min-w-0">
        <div className="relative size-20 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
            {track.coverUrl ? (
                <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-neutral-800" />
            )}

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
      <div className="flex flex-col gap-0.5 overflow-hidden min-w-0 flex-1">
        <p className="font-semibold text-base text-neutral-100 truncate">{track.title}</p>
        <p className="text-sm text-neutral-400 truncate">{track.artist || "Unknown artist"}</p>
      </div>
    </div>
  );
}
