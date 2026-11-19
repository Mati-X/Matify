import React, { useEffect, useRef } from "react";
import { Disc3, ListPlus, Play, User } from "lucide-react";
import { usePlayerStore } from "../../store/usePlayerStore.ts";
import { useUIStore } from "../../store/useUIStore.ts";
import { parseArtists } from "../../utils/trackFormatters.ts";
import { type TrackListItem } from "./trackListConfig.ts";

interface TrackContextMenuProps {
    menu: { track: TrackListItem; x: number; y: number } | null;
    tracks: TrackListItem[];
    onClose: () => void;
}

export function TrackContextMenu({ menu, tracks, onClose }: TrackContextMenuProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const setTrack = usePlayerStore((state) => state.setTrack);
    const addToQueue = usePlayerStore((state) => state.addToQueue);
    const openTab = useUIStore((state) => state.openTab);

    useEffect(() => {
        const el = popoverRef.current;
        if (!el) return;

        if (menu) {
            if (!el.matches(":popover-open")) {
                el.showPopover();
            }
            const firstBtn = el.querySelector<HTMLButtonElement>("button:not(:disabled)");
            firstBtn?.focus({ preventScroll: true });
        } else if (el.matches(":popover-open")) {
            el.hidePopover();
        }
    }, [menu]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
        const el = popoverRef.current;
        if (!el) return;
        const items = Array.from(el.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        if (items.length === 0) return;
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        let nextIndex = 0;
        if (e.key === "Home") nextIndex = 0;
        else if (e.key === "End") nextIndex = items.length - 1;
        else nextIndex = (current + (e.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
        e.preventDefault();
        items[nextIndex]?.focus({ preventScroll: true });
    };

    const left = menu ? Math.max(8, Math.min(menu.x, window.innerWidth - 228)) : 0;
    const top = menu ? Math.max(8, Math.min(menu.y, window.innerHeight - 220)) : 0;
    const firstArtist = menu ? parseArtists(menu.track.artist)[0] : undefined;

    const runAction = (fn: () => void) => {
        fn();
        onClose();
    };

    return (
        <div
            ref={popoverRef}
            popover="auto"
            aria-label={menu ? `Track actions for ${menu.track.title}` : "Track actions"}
            onToggle={(e) => {
                if (e.newState === "closed" && menu) {
                    onClose();
                }
            }}
            onKeyDown={handleKeyDown}
            style={{ position: "fixed", left: `${left}px`, top: `${top}px`, inset: "unset", margin: 0 }}
            className="w-56 rounded-xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-sm text-neutral-200"
        >
            {menu && (
                <div role="menu" className="flex flex-col gap-0.5">
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runAction(() => setTrack(menu.track, tracks))}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none text-left transition-colors"
                    >
                        <Play className="w-4 h-4 text-neutral-400" />
                        <span>Play now</span>
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runAction(() => addToQueue(menu.track))}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none text-left transition-colors"
                    >
                        <ListPlus className="w-4 h-4 text-neutral-400" />
                        <span>Add to queue</span>
                    </button>
                    {(menu.track.album || firstArtist) && <hr className="my-1 border-white/10" />}
                    {menu.track.album && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() =>
                                runAction(() =>
                                    openTab({
                                        id: `album:${menu.track.album}`,
                                        title: menu.track.album!,
                                        type: "album",
                                        entityId: menu.track.album!,
                                    })
                                )
                            }
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none text-left transition-colors"
                        >
                            <Disc3 className="w-4 h-4 text-neutral-400" />
                            <span className="truncate">Go to album</span>
                        </button>
                    )}
                    {firstArtist && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() =>
                                runAction(() =>
                                    openTab({
                                        id: `artist:${firstArtist}`,
                                        title: firstArtist,
                                        type: "artist",
                                        entityId: firstArtist,
                                    })
                                )
                            }
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none text-left transition-colors"
                        >
                            <User className="w-4 h-4 text-neutral-400" />
                            <span className="truncate">Go to artist</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
