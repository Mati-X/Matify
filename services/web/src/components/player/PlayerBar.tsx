import { usePlayerStore } from "../../store/usePlayerStore";
import { TrackInfo } from "./TrackInfo";
import { Controls } from "./Controls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import LyricsButton from "./LyricsButton.tsx";
import QueueButton from "./QueueButton.tsx";

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
  const seek = usePlayerStore((state) => state.seek);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);

  return (
    <div className="w-full shrink-0 z-50 flex flex-col bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-800/80">
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 p-4">
        <TrackInfo track={currentTrack} />
        <Controls
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          onTogglePlay={togglePlay}
          onPrev={prevTrack}
          onNext={nextTrack}
          onToggleShuffle={toggleShuffle}
          onCycleRepeat={cycleRepeatMode}
        />
        <div className="flex items-center gap-4 justify-self-end">
          <VolumeControl
              volume={volume}
              onVolumeChange={setVolume}
              isMuted={volume === 0}
          />
          <LyricsButton/>
           <QueueButton/>
        </div>
      </div>
    </div>
  );
}

export default PlayerBar;
