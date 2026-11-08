import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Controls({ isPlaying, onTogglePlay, onPrev, onNext }: ControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        title="Previous"
      >
        <SkipBack className="w-5 h-5 fill-current" />
      </button>

      <button
        onClick={onTogglePlay}
        className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current translate-x-0.5" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        title="Next"
      >
        <SkipForward className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
}
