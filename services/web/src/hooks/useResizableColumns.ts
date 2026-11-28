import React, { useRef, useState } from "react";
import { type VariantConfig } from "../components/tracks/trackListConfig.ts";

export type ResizableCol = "album" | "addedBy" | "dateAdded";

const DEFAULT_WIDTHS: Record<ResizableCol, number> = {
    album: 240,
    addedBy: 180,
    dateAdded: 130,
};

function buildGridTemplate(
    config: VariantConfig,
    widths: Record<ResizableCol, number>
) {
    const cols: string[] = [];
    if (config.showIndex) cols.push("2rem");
    cols.push("minmax(200px, 1fr)");
    if (config.showAlbum) cols.push(`${widths.album}px`);
    if (config.showAddedBy) cols.push(`${widths.addedBy}px`);
    if (config.showDateAdded) cols.push(`${widths.dateAdded}px`);
    cols.push("4.5rem");
    cols.push("4rem");
    return cols.join(" ");
}

export function useResizableColumns(config: VariantConfig, _hasActions?: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [colWidths, setColWidths] = useState<Record<ResizableCol, number>>(DEFAULT_WIDTHS);

    const startResize = (col: ResizableCol) => (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = colWidths[col];
        let latestWidth = startWidth;

        const onMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            latestWidth = Math.max(110, Math.min(480, startWidth - delta));
            const nextWidths = { ...colWidths, [col]: latestWidth };
            containerRef.current?.style.setProperty(
                "--track-cols",
                buildGridTemplate(config, nextWidths)
            );
        };

        const onUp = () => {
            setColWidths((prev) => ({ ...prev, [col]: latestWidth }));
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const resetResize = (col: ResizableCol) => () => {
        setColWidths((prev) => ({ ...prev, [col]: DEFAULT_WIDTHS[col] }));
    };

    const gridTemplate = buildGridTemplate(config, colWidths);

    return {
        containerRef,
        gridTemplate,
        startResize,
        resetResize,
    };
}
