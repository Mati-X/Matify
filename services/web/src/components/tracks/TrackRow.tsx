import React from "react";
import { MoreHorizontal, Play, Volume2 } from "lucide-react";
import { useUIStore } from "../../store/useUIStore.ts";
import { formatDate, formatDuration } from "../../utils/trackFormatters.ts";
import { ArtistLinks } from "./ArtistLinks.tsx";
import { type TrackListItem, type VariantConfig } from "./trackListConfig.ts";

interface TrackRowProps {
    track: TrackListItem;
    index: number;
    config: VariantConfig;
    isCurrent: boolean;
    isPlaying: boolean;
    onPlay: () => void;
    onOpenMenu: (track: TrackListItem, x: number, y: number) => void;
    renderActions?: (track: TrackListItem) => React.ReactNode;
    color?: string;
}

export function TrackRow({
    track,
    index,
    config,
    isCurrent,
    isPlaying,
    onPlay,
    onOpenMenu,
    renderActions,
    color
}: TrackRowProps) {
    const openTab = useUIStore((state) => state.openTab);

    return (
        <div
            onClick={onPlay}
            onContextMenu={(e) => {
                e.preventDefault();
                onOpenMenu(track, e.clientX, e.clientY);
            }}
            style={{
                gridTemplateColumns: "var(--track-cols, repeat(5, minmax(0, 1fr)))",
                ...(isCurrent && color ? { color } : {}),
            }}
            className={`group grid items-center gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors ${
                isCurrent
                    ? `bg-white/10 ${color ? "" : "text-emerald-400"}`
                    : "hover:bg-white/5 text-neutral-300"
            }`}
        >
            {config.showIndex && (
                <span className="text-center text-base tabular-nums text-neutral-400 flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                        <Volume2 className={`w-4 h-4 ${color ? "text-[${color}]" : "text-emerald-400"}`} />
                    ) : (
                        <>
                            <span className="group-hover:hidden">{index + 1}</span>
                            <Play className="w-4 h-4 hidden group-hover:block fill-current text-white" />
                        </>
                    )}
                </span>
            )}

            <div className="flex items-center gap-3.5 min-w-0">
                {config.showCover && (
                    track.coverUrl ? (
                        <img
                            src={track.coverUrl}
                            alt={track.title}
                            loading="lazy"
                            className="w-12 h-12 shrink-0 rounded object-cover bg-neutral-800"
                        />
                    ) : (
                        <div className="w-12 h-12 shrink-0 rounded bg-neutral-800" />
                    )
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`truncate text-base font-medium ${isCurrent ? color ? "text-[${color}]" : "text-emerald-400" : "text-white"}`}>
                        {track.title}
                    </span>
                    <ArtistLinks artist={track.artist} />
                </div>
            </div>

            {config.showAlbum && (
                <div className="min-w-0">
                    {track.album ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                openTab({
                                    id: `album:${track.album}`,
                                    title: track.album!,
                                    type: "album",
                                    entityId: track.album!,
                                });
                            }}
                            className="max-w-full truncate text-left text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
                        >
                            {track.album}
                        </button>
                    ) : (
                        <span className="text-sm text-neutral-600">—</span>
                    )}
                </div>
            )}

            {config.showAddedBy && (
                <div className="min-w-0 flex items-center gap-2">
                    {track.addedBy ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                openTab({
                                    id: `user:${track.addedBy!.id}`,
                                    title: track.addedBy!.username,
                                    type: "user",
                                    entityId: track.addedBy!.id,
                                });
                            }}
                            className="flex items-center gap-2 min-w-0 text-sm text-neutral-300 hover:text-white hover:underline"
                        >
                            <span className="w-5 h-5 shrink-0 rounded-full bg-neutral-700 text-[10px] font-semibold flex items-center justify-center uppercase">
                                {track.addedBy.username.slice(0, 1)}
                            </span>
                            <span className="truncate">{track.addedBy.username}</span>
                        </button>
                    ) : (
                        <span className="text-sm text-neutral-600">—</span>
                    )}
                </div>
            )}

            {config.showDateAdded && (
                <span className="truncate text-sm text-neutral-400">
                    {formatDate(track.createdAt)}
                </span>
            )}

            <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-end gap-2">
                {renderActions?.(track)}
                <button
                    type="button"
                    aria-label={`More actions for ${track.title}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenMenu(track, e.clientX, e.clientY);
                    }}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <span className="text-right tabular-nums text-sm text-neutral-400">
                {formatDuration(track.durationMs)}
            </span>
        </div>
    );
}
