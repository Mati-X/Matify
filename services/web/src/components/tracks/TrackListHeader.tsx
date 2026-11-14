import React from "react";
import { Clock } from "lucide-react";
import { type ResizableCol } from "../../hooks/useResizableColumns.ts";
import { type VariantConfig } from "./trackListConfig.ts";

interface ResizableHeaderCellProps {
    label: string;
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onDoubleClick: () => void;
}

function ResizableHeaderCell({ label, onPointerDown, onDoubleClick }: ResizableHeaderCellProps) {
    return (
        <div className="relative flex items-center min-w-0">
            <div
                onPointerDown={onPointerDown}
                onDoubleClick={onDoubleClick}
                className="absolute -left-2.5 top-0 bottom-0 w-3 cursor-col-resize group flex justify-center"
            >
                <span className="w-px h-full bg-transparent group-hover:bg-emerald-400/70 transition-colors" />
            </div>
            <span className="truncate">{label}</span>
        </div>
    );
}

interface TrackListHeaderProps {
    config: VariantConfig;
    hasActions: boolean;
    startResize: (col: ResizableCol) => (e: React.PointerEvent<HTMLDivElement>) => void;
    resetResize: (col: ResizableCol) => () => void;
}

export function TrackListHeader({ config, hasActions, startResize, resetResize }: TrackListHeaderProps) {
    return (
        <div
            style={{ gridTemplateColumns: "var(--track-cols)" }}
            className="sticky top-0 z-10 grid items-center gap-4 px-3 py-2 text-xs font-medium text-neutral-400 bg-neutral-950/90 backdrop-blur-md border-b border-white/10"
        >
            {config.showIndex && <span className="text-center">#</span>}
            <span>Title</span>
            {config.showAlbum && (
                <ResizableHeaderCell
                    label="Album"
                    onPointerDown={startResize("album")}
                    onDoubleClick={resetResize("album")}
                />
            )}
            {config.showAddedBy && (
                <ResizableHeaderCell
                    label="Added by"
                    onPointerDown={startResize("addedBy")}
                    onDoubleClick={resetResize("addedBy")}
                />
            )}
            {config.showDateAdded && (
                <ResizableHeaderCell
                    label="Date added"
                    onPointerDown={startResize("dateAdded")}
                    onDoubleClick={resetResize("dateAdded")}
                />
            )}
            {hasActions && <span />}
            <span className="flex justify-end">
                <Clock className="w-4 h-4" />
            </span>
        </div>
    );
}
