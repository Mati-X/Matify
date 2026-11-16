import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import type { RepeatMode } from "../../store/usePlayerStore";

interface ControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
}

export function Controls({
  isPlaying,
  isShuffled,
  repeatMode,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleShuffle,
  onCycleRepeat,
}: ControlsProps) {
  return (
    <div className="flex items-center gap-5">
      <button
        onClick={onToggleShuffle}
        className={`p-2 transition-colors cursor-pointer ${
          isShuffled ? "text-emerald-400" : "text-neutral-400 hover:text-white"
        }`}
        title="Shuffle"
      >
        <Shuffle className="w-5 h-5" />
      </button>

      <button
        onClick={onPrev}
        className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        title="Previous"
      >
        <SkipBack className="w-6 h-6 fill-current" />
      </button>

      <button
        onClick={onTogglePlay}
        className="p-3.5 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current translate-x-0.5" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        title="Next"
      >
        <SkipForward className="w-6 h-6 fill-current" />
      </button>

      <button
        onClick={onCycleRepeat}
        className={`p-2 transition-colors cursor-pointer ${
          repeatMode !== "off" ? "text-emerald-400" : "text-neutral-400 hover:text-white"
        }`}
        title={
          repeatMode === "one"
            ? "Repeat One"
            : repeatMode === "all"
            ? "Repeat All"
            : "Repeat Off"
        }
      >
        {repeatMode === "one" ? (
          <Repeat1 className="w-5 h-5" />
        ) : (
          <Repeat className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
