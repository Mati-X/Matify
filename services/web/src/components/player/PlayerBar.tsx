import { type Track, usePlayerStore } from "../../store/usePlayerStore";
import {Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1} from "lucide-react";

interface TrackInfoProps {
  track: Track | null;
}

function TrackInfo({ track }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="flex items-center gap-3 w-64 min-w-[200px]">
        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
          NULL
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-neutral-400">No track selected</p>
          <p className="text-xs text-neutral-600">No track selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-64 min-w-[200px]">
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-12 h-12 object-cover rounded-lg shadow-md"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 text-xs font-bold">
          🎵
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <p className="font-semibold text-sm text-neutral-100 truncate">{track.title}</p>
        <p className="text-xs text-neutral-400 truncate">{track.artist || "Nieznany artysta"}</p>
      </div>
    </div>
  );
}

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Controls({ isPlaying, onTogglePlay, onPrev, onNext }: ControlsProps) {
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

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}

function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-1 bg-neutral-800 hover:h-2 transition-all cursor-pointer group"
    >
      <div
        className="h-full bg-white rounded-r transition-[width] duration-150"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

interface VolumeProps {
  volume: number;
  onVolumeChange: (val: number) => void;
  isMuted: boolean;
}



function VolumeControl({ volume, onVolumeChange, isMuted }: VolumeProps) {

    const renderVolumeIcon = () => {
        if (volume === 0 || isMuted) {
            return <VolumeX className="w-4 h-4 text-neutral-400" />;
        }
        if (volume < 0.5) {
            return <Volume1 className="w-4 h-4 text-neutral-400" />;
        }
        return <Volume2 className="w-4 h-4 text-neutral-400" />;
    };

  return (
    <div className="flex items-center justify-end gap-3 w-64 min-w-[200px]">
      {renderVolumeIcon()}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="w-24 h-1 bg-neutral-800 accent-neutral-200 cursor-pointer rounded-lg"
      />
      <span className="text-xs text-neutral-400 font-mono w-9 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}

export function PlayerBar() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const duration = usePlayerStore((state) => state.duration);

  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setProgress = usePlayerStore((state) => state.setProgress);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-800/80">
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={setProgress}
      />
      <div className="flex items-center justify-between px-6 py-3">
        <TrackInfo track={currentTrack} />
        <Controls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onPrev={prevTrack}
          onNext={nextTrack}
        />
        <VolumeControl volume={volume} onVolumeChange={setVolume} isMuted={volume === 0} />
      </div>
    </div>
  );
}

export default PlayerBar;
