import { X } from "lucide-react";
import { usePlayerStore } from "../../store/usePlayerStore.ts";
import { useUIStore } from "../../store/useUIStore.ts";
import TrackList from "../tracks/TrackList.tsx";

export default function QueueView() {
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const userQueue = usePlayerStore((state) => state.userQueue);
    const queue = usePlayerStore((state) => state.queue);
    const queueIndex = usePlayerStore((state) => state.queueIndex);
    const removeFromUserQueue = usePlayerStore((state) => state.removeFromUserQueue);
    const clearUserQueue = usePlayerStore((state) => state.clearUserQueue);
    const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
    const closeQueue = useUIStore((state) => state.closeQueue);

    const nextFromContext = queue.slice(queueIndex + 1);

    return (
        <aside className="flex flex-col w-96 shrink-0 h-full border-l border-neutral-800 bg-neutral-950 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 sticky top-0 z-20 bg-neutral-950/95 backdrop-blur-md">
                <h2 className="text-base font-bold text-white">Queue</h2>
                <button
                    type="button"
                    onClick={closeQueue}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Close queue"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {currentTrack && (
                <div className="pt-4">
                    <h3 className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Now playing
                    </h3>
                    <TrackList variant="queue" tracks={[currentTrack]} />
                </div>
            )}

            {userQueue.length > 0 && (
                <div className="pt-4">
                    <div className="flex items-center justify-between px-4 pb-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                            Next in queue
                        </h3>
                        <button
                            type="button"
                            onClick={clearUserQueue}
                            className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <TrackList
                        variant="queue"
                        tracks={userQueue}
                        renderActions={(_track, index) => (
                            <button
                                type="button"
                                onClick={() => removeFromUserQueue(index)}
                                className="p-1 text-neutral-400 hover:text-white transition-colors"
                                title="Remove from queue"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    />
                </div>
            )}

            {nextFromContext.length > 0 && (
                <div className="pt-4 pb-6">
                    <h3 className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {currentTrack?.album ? `Next from: ${currentTrack.album}` : "Next up"}
                    </h3>
                    <TrackList
                        variant="queue"
                        tracks={nextFromContext}
                        renderActions={(_track, index) => (
                            <button
                                type="button"
                                onClick={() => removeFromQueue(queueIndex + 1 + index)}
                                className="p-1 text-neutral-400 hover:text-white transition-colors"
                                title="Remove from queue"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    />
                </div>
            )}

            {!currentTrack && userQueue.length === 0 && nextFromContext.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-6 text-sm text-neutral-500">
                    Queue is empty
                </div>
            )}
        </aside>
    );
}
