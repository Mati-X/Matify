import React, { useState } from "react";
import { useResizableColumns } from "../../hooks/useResizableColumns.ts";
import { usePlayerStore } from "../../store/usePlayerStore.ts";
import { TrackContextMenu } from "./TrackContextMenu.tsx";
import { TrackListHeader } from "./TrackListHeader.tsx";
import { TrackRow } from "./TrackRow.tsx";
import { type TrackListItem, type TrackListVariant, VARIANT_CONFIG } from "./trackListConfig.ts";

export type { TrackListItem, TrackListVariant } from "./trackListConfig.ts";

interface TrackListProps {
    tracks?: TrackListItem[];
    variant?: TrackListVariant;
    renderActions?: (track: TrackListItem, index: number) => React.ReactNode;
    color?: string;
}

function TrackList(props: TrackListProps) {
    const variant = props.variant ?? "default";
    const tracks = props.tracks ?? [];
    const config = VARIANT_CONFIG[variant];

    const setTrack = usePlayerStore((state) => state.setTrack);
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const isPlaying = usePlayerStore((state) => state.isPlaying);

    const [menu, setMenu] = useState<{ track: TrackListItem; x: number; y: number } | null>(null);
    const { containerRef, gridTemplate, startResize, resetResize } = useResizableColumns(config, true);

    return (
        <div
            ref={containerRef}
            style={{ "--track-cols": gridTemplate } as React.CSSProperties}
            className={`flex flex-col flex-1 select-none ${variant === "queue" ? "px-2" : "m-12"}`}
        >
            {config.showLegend && (
                <TrackListHeader
                    config={config}
                    hasActions={true}
                    startResize={startResize}
                    resetResize={resetResize}
                />
            )}

            <div className="flex flex-col gap-0.5 py-1">
                {tracks.map((track, index) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        config={config}
                        isCurrent={currentTrack?.id === track.id}
                        isPlaying={isPlaying}
                        onPlay={() => setTrack(track, tracks)}
                        onOpenMenu={(selectedTrack, x, y) => setMenu({ track: selectedTrack, x, y })}
                        renderActions={props.renderActions}
                        color={props.color}
                    />
                ))}
            </div>

            <TrackContextMenu menu={menu} tracks={tracks} onClose={() => setMenu(null)} />
        </div>
    );
}

export default TrackList;
