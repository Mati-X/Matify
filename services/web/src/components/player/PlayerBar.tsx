import { usePlayerStore } from "../../store/usePlayerStore";
import { TrackInfo } from "./TrackInfo";
import { Controls } from "./Controls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

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
    <div className="w-full shrink-0 z-50 flex flex-col bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-800/80">
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
        <VolumeControl
          volume={volume}
          onVolumeChange={setVolume}
          isMuted={volume === 0}
        />
      </div>
    </div>
  );
}

export default PlayerBar;
