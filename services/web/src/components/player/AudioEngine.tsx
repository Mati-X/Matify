import { useEffect, useRef } from "react";
import { usePlayerStore } from "../../store/usePlayerStore";
import Hls from "hls.js";

export const AudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const setProgress = usePlayerStore((state) => state.setProgress);

  // Inicjalizacja strumienia HLS / natywnego Safari po zmianie utworu
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(currentTrack.hlsManifestUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audio.play().catch((err) => console.warn("Autoplay zablokowany:", err));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = currentTrack.hlsManifestUrl;
      const handleLoadedMetadata = () => {
        if (isPlaying) {
          audio.play().catch((err) => console.warn("Autoplay zablokowany:", err));
        }
      };
      audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentTrack]);

  // Synchronizacja stanu odtwarzania (Play / Pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch((err) => console.warn("Błąd odtwarzania:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Synchronizacja głośności oraz wyciszenia (Volume & Mute)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  return (
    <audio
      ref={audioRef}
      className="hidden"
      onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => {
        if (e.currentTarget.duration) {
          usePlayerStore.setState({ duration: e.currentTarget.duration });
        }
      }}
      onDurationChange={(e) => {
        if (e.currentTarget.duration) {
          usePlayerStore.setState({ duration: e.currentTarget.duration });
        }
      }}
      onEnded={nextTrack}
    />
  );
};
