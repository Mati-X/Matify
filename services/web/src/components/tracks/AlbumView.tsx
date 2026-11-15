import TrackList from "./TrackList.tsx";
import {useEffect, useMemo, useState} from "react";
import {getTracks} from "../../api/tracks.ts";
import {type Track, usePlayerStore} from "../../store/usePlayerStore.ts";
import {ArtistLinks} from "./ArtistLinks.tsx";
import {Dot} from "lucide-react";
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

    const totalDurationMs = albumTracks.reduce((acc, track) => acc + (track.durationMs ?? 0), 0)
    const accentColor = firstTrack?.colorPalette?.vibrant ?? "#10b981"


    return (<div>
        <div className={'relative overflow-hidden '}>
            <div className={'absolute w-full h-full left-0 top-0 blur-3xl absolute inset-0 pointer-events-none'}>
                {firstTrack?.motion_cover_url  ? <video src={firstTrack.motion_cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover blur-2xl scale-125 opacity-50" />:
                    <img src={firstTrack?.coverUrl ?? undefined}  alt={firstTrack?.title} className="w-full h-full object-cover blur-2xl scale-125 opacity-45" ></img>}
            </div>

            <div className={'absolute w-full h-full left-0 top-0 bg-gradient-to-b from-black/10 via-neutral-950/55 to-neutral-950 to-neutral-950 absolute inset-0 pointer-events-none'}></div>
            <div className={'flex items-center gap-12 p-6'}>
                {firstTrack?.motion_cover_url  ? <video src={firstTrack.motion_cover_url} autoPlay loop muted className={'size-96 z-10 rounded-xl shadow-2xl object-cover'}></video> :
                    <img src={firstTrack?.coverUrl ?? undefined}  alt={firstTrack?.title} className={'size-96 z-10 rounded-xl shadow-2xl object-cover'}></img>}

                <div className={'flex flex-col justify-between gap-4 z-10'}>
                    <div></div>
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
                    <div>

                    </div>
                </div>
            </div>
        </div>
        <TrackList tracks={albumTracks} variant={'album'}/>
    </div>)
}