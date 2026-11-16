import React from "react";
import { useResizableColumns } from "../../hooks/useResizableColumns.ts";
import { usePlayerStore } from "../../store/usePlayerStore.ts";
import { TrackListHeader } from "./TrackListHeader.tsx";
import { TrackRow } from "./TrackRow.tsx";
import { type TrackListItem, type TrackListVariant, VARIANT_CONFIG } from "./trackListConfig.ts";

export type { TrackListItem, TrackListVariant } from "./trackListConfig.ts";

interface TrackListProps {
    tracks?: TrackListItem[];
    variant?: TrackListVariant;
    renderActions?: (track: TrackListItem) => React.ReactNode;
     color?: string;
}

function TrackList(props: TrackListProps) {
    const variant = props.variant ?? "default";
    const tracks = props.tracks ?? [];
    const config = VARIANT_CONFIG[variant];
    const hasActions = Boolean(props.renderActions);

    const setTrack = usePlayerStore((state) => state.setTrack);
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const isPlaying = usePlayerStore((state) => state.isPlaying);

    const { containerRef, gridTemplate, startResize, resetResize } = useResizableColumns(config, hasActions);

    return (
        <div
            ref={containerRef}
            style={{ "--track-cols": gridTemplate } as React.CSSProperties}
            className="flex flex-col flex-1 select-none m-12 "
        >
            {config.showLegend && (
                <TrackListHeader
                    config={config}
                    hasActions={hasActions}
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
                        renderActions={props.renderActions}
                        color={props.color}
                    />
                ))}
            </div>
        </div>
    );
}

export default TrackList;
