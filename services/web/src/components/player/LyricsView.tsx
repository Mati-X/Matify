import {usePlayerStore} from "../../store/usePlayerStore.ts";
import {useEffect, useRef, useState} from "react";
import type {LyricLine} from "../../api/tracks.ts";
import InstrumentalDots from "./InstrumentalDots.tsx";

function LyricsView() {
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const currentTime = usePlayerStore((state) => state.currentTime);
    const seek = usePlayerStore((state) => state.seek);
    const duration  = usePlayerStore((state) => state.duration);

    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [loading, setLoading] = useState(true);

    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!currentTrack) return;
        setLoading(true);
        fetch(`/api/tracks/${currentTrack.id}/lyrics`)
            .then((res) => res.json())
            .then((lyrics) => {
                const parsed: LyricLine[] = lyrics.parsed;
                if ((parsed.length > 0) && (parsed[0].time > 3))
                {
                    parsed.unshift({ time: 0, text: "···" } as LyricLine);
                }
                if((parsed.length > 0)  && (duration > 0) &&  (duration - parsed[parsed.length - 1].time > 3))
                     parsed.push({ time: duration, text: "···" } as LyricLine);

                setLyrics(parsed);
                console.log(currentTrack)
                console.log(lyrics.parsed);
                setLoading(false);
            });
    }, [currentTrack]);



    const activeIndex = lyrics.findIndex((line, i) => {
        const nextTime = lyrics[i + 1]?.time ?? Infinity;
        return currentTime >= line.time && currentTime < nextTime;
    });

    const activeLineRef = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        const lineEl = activeLineRef.current;
        const containerEl = scrollContainerRef.current;
        if (!lineEl || !containerEl) return;

        const lineRect = lineEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();

        const isVisible =
            lineRect.top >= containerRect.top &&
            lineRect.bottom <= containerRect.bottom;

        if (isVisible) {
            setIsUserScrolling(false);
            lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [activeIndex]);

    useEffect(() => {
        activeLineRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [activeIndex]);

    return (
        <div className="absolute inset-0 z-40 flex bg-neutral-950/90 backdrop-blur-3xl  gap-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {currentTrack?.motion_cover_url ? (
                    <video
                        src={currentTrack.motion_cover_url}
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover scale-150 blur-[500px] saturate-150 brightness-60"
                    />
                ) : (
                    <img
                        src={currentTrack?.coverUrl || ''}
                        className="w-full h-full object-cover scale-150 blur-[100px] saturate-150 brightness-60"
                    />
                )}
            </div>

            {(lyrics.length !== 0) && <div className="flex-1 overflow-y-auto flex flex-col px-12 py-48 relative z-10"
               style={{
                   maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
                   WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
               }}
                                           onWheel={() => setIsUserScrolling(true)}
                                           onTouchMove={() => setIsUserScrolling(true)}
                                           ref={scrollContainerRef}
            >
            {loading ? (
                <div className="text-neutral-500">Loading...</div>
            ) : (lyrics.map((line, i) => {
                    const isActive = i === activeIndex;
                    const isInstrumental = line.text === "···" || line.text.trim() === "" ||  line.text === "♪";

                    const distance = Math.abs(i - activeIndex);

                    if (isInstrumental) {
                        const nextTime = lyrics[i + 1]?.time ?? currentTime + 5;
                        return (
                            <div
                                key={line.time}
                                className={`grid transition-all duration-700 ease-in-out ${
                                    isActive
                                        ? "grid-rows-[1fr] opacity-100 py-4"
                                        : "grid-rows-[0fr] opacity-0 py-0 pointer-events-none"
                                }`}
                            >
                                <div className={`min-h-0`}>
                                    <div
                                        className={`transition-all duration-400  origin-center ${
                                            isActive ? "scale-100 opacity-100" : "scale-50 opacity-0"
                                        }`}
                                    >
                                    <InstrumentalDots
                                        startTime={line.time}
                                        endTime={nextTime}
                                        currentTime={currentTime}
                                    />
                                    </div></div>
                            </div>
                        );
                    }
                    return (
                    <div
                        key={line.time}
                        ref={i === activeIndex ? activeLineRef : null}
                        onClick={() => seek(line.time)}
                        className={`text-3xl md:text-4xl py-4 ${
                            i === activeIndex
                                ? "font-black text-white scale-105 origin-left transition-all duration-300"
                                : "font-bold text-white/30 hover:text-white/60 blur-[0.4px] transition-all duration-300 cursor-pointer"
                        }`}
                         style={{
                             filter: `blur(${isUserScrolling ? 0 : Math.min(distance * 0.75, 10)}px)`,
                         }}
                    >
                        {line.text}
                    </div>
                );
                })
            )}
        </div>}

            <div className="flex-1 aspect-square rounded-3xl overflow-hidden relative shrink-0 z-10 hidden lg:block relative">
                {currentTrack?.coverUrl && (
                    <img src={currentTrack.coverUrl} className="aspect-square w-full h-full p-30 object-cover" />
                )}
                {currentTrack?.motion_cover_url && (
                    <video
                        src={currentTrack.motion_cover_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="aspect-square absolute inset-0 w-full h-full p-30 object-cover"
                    />
                )}
            </div>
        </div>
    );
}

export default LyricsView;