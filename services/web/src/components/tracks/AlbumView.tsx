import TrackList from "./TrackList.tsx";
import {useEffect, useMemo, useState} from "react";
import {getTracks} from "../../api/tracks.ts";
import {type Track, usePlayerStore} from "../../store/usePlayerStore.ts";
import {ArtistLinks} from "./ArtistLinks.tsx";
import {Dot, Play, Shuffle} from "lucide-react";
import {formatDuration} from "../../utils/trackFormatters.ts";


const ALBUM_LOGOS: Record<string, string> = {
    "After Hours": "/logos/after-hours.png",
};

export default function AlbumView({albumName } : {albumName: string} ) {

    const [tracks, setTracks] = useState<Track[]>( [] )

    useEffect(() => {
        getTracks().then(tracks => setTracks(tracks))
    }, [albumName])

    const albumTracks = useMemo(() => tracks.filter((t) => t.album === albumName), [tracks,albumName]);

    const firstTrack : Track | undefined = albumTracks[0]
    const logoUrl = ALBUM_LOGOS[albumName]

    const setTrack = usePlayerStore((state) => state.setTrack)
    const playShuffled = usePlayerStore((state) => state.playShuffled)

    const totalDurationMs = albumTracks.reduce((acc, track) => acc + (track.durationMs ?? 0), 0)
    const accentColor = firstTrack?.colorPalette?.vibrant ?? "#10b981"


    return (<div>
        <div className={'relative overflow-hidden h-[420px] p-8'}>
            <div className={'absolute w-full h-full left-0 top-0 blur-3xl inset-0 pointer-events-none'}>
                {firstTrack?.motion_cover_url  ? <video src={firstTrack.motion_cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover blur-2xl scale-125 opacity-50" />:
                    <img src={firstTrack?.coverUrl ?? undefined}  alt={firstTrack?.title} className="w-full h-full object-cover blur-2xl scale-125 opacity-45" ></img>}
            </div>

            <div className={'absolute w-full h-full left-0 top-0 bg-gradient-to-b from-black/10 via-neutral-950/55 to-neutral-950 inset-0 pointer-events-none'}></div>
            <div className={'flex items-stretch gap-10 h-full'}>
                {firstTrack?.motion_cover_url  ? <video src={firstTrack.motion_cover_url} autoPlay loop muted className={'h-full aspect-square shrink-0 z-10 rounded-xl shadow-2xl object-cover'}></video> :
                    <img src={firstTrack?.coverUrl ?? undefined}  alt={firstTrack?.title} className={'h-full aspect-square shrink-0 z-10 rounded-xl shadow-2xl object-cover'}></img>}

                <div className={'flex flex-col  justify-between gap-4 z-10'}>
                    <div></div>
                    <div className={'gap-4 flex flex-col'}>
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={albumName}
                                className="max-h-20 w-auto object-contain self-start drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
                            />
                        ) : (
                            <span className={'text-5xl font-black'}>{firstTrack?.album ?? albumName}</span>
                        )}
                        <div className={'px-4 flex items-center gap-4 text-lg text-neutral-400'}><ArtistLinks artist={firstTrack?.artist} className={'font-bold text-neutral-300'}></ArtistLinks>

                            <span className={'flex'}>{albumTracks.length} tracks <Dot/> {formatDuration(totalDurationMs,true)}</span>
                        </div>
                    </div>
                    <div className={'flex  gap-4'}>
                        <button
                            className={`text-black items-center justify-center flex gap-3 font-bold w-48 h-12 rounded-full`}
                            style={{
                                 backgroundColor: accentColor
                            }}
                            onClick={() => {
                                if(firstTrack)
                                    setTrack(firstTrack, albumTracks)
                            }}
                        >
                            <Play fill={'currentColor'}/>Play
                        </button>
                        <button
                            className={'text-white items-center justify-center flex gap-3  font-bold w-48 h-12 rounded-full bg-neutral-900'}
                            onClick={() => {
                                 playShuffled(albumTracks)
                            }}
                        >
                            <Shuffle/>Shuffle
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <TrackList tracks={albumTracks} variant={'album'}/>
    </div>)
}