import { useEffect, useRef } from "react";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useAuthStore } from "../../store/useAuthStore";
import { EQ_BANDS, useEqualizerStore } from "../../store/useEqualizerStore";
import { recordPlay } from "../../api/tracks";
import Hls from "hls.js";

export const AudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const preampRef = useRef<GainNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);

  const enabled = useEqualizerStore((state) => state.enabled);
  const preamp = useEqualizerStore((state) => state.preamp);
  const gains = useEqualizerStore((state) => state.gains);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const handleTrackEnded = usePlayerStore((state) => state.handleTrackEnded);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const seekRequest = usePlayerStore((state) => state.seekRequest);

  useEffect(() => {
    if (!currentTrack?.id || !useAuthStore.getState().token) return;
    recordPlay(currentTrack.id).catch(() => {});
  }, [currentTrack?.id]);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioCtxRef.current) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const preampNode = ctx.createGain();
    const filters = EQ_BANDS.map((band) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = Number(band);
      filter.Q.value = 1.4;
      return filter;
    });

    source.connect(preampNode);
    let prevNode: AudioNode = preampNode;
    for (const filter of filters) {
      prevNode.connect(filter);
      prevNode = filter;
    }
    prevNode.connect(ctx.destination);

    audioCtxRef.current = ctx;
    sourceRef.current = source;
    preampRef.current = preampNode;
    filtersRef.current = filters;
  }, []);

  useEffect(() => {
    if (preampRef.current) {
      preampRef.current.gain.value = enabled ? Math.pow(10, preamp / 20) : 1;
    }
    filtersRef.current.forEach((filter, index) => {
      const band = EQ_BANDS[index];
      filter.gain.value = enabled ? (gains[band] ?? 0) : 0;
    });
  }, [enabled, preamp, gains]);

  // Play & Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      audio.play().catch((err) => console.warn("Błąd odtwarzania:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Seek
  useEffect(() => {
    if (audioRef.current && seekRequest) {
      audioRef.current.currentTime = seekRequest.time;
    }
  }, [seekRequest]);

  // Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  return (
    <audio
      crossOrigin={"anonymous"}
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
      onEnded={(e) => {
        if (repeatMode === "one") {
          e.currentTarget.currentTime = 0;
          setProgress(0);
          e.currentTarget.play().catch(() => {});
          return;
        }
        handleTrackEnded();
      }}
    />
  );
};
