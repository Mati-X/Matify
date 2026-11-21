import TrackList from "./TrackList.tsx";
import {useEffect, useMemo, useState} from "react";
import {getTracks} from "../../api/tracks.ts";
import {type Track, usePlayerStore} from "../../store/usePlayerStore.ts";
import {Play, Shuffle} from "lucide-react";
import {parseArtists} from "../../utils/trackFormatters.ts";


export default function ArtistView({artistName } : {artistName: string} ) {

    const [tracks, setTracks] = useState<Track[]>( [] )

    useEffect(() => {
        getTracks().then(tracks => setTracks(tracks))
    }, [artistName])

    const artistTracks = useMemo(() => tracks.filter((t) => parseArtists(t.artist).includes(artistName)), [tracks,artistName]);

    const firstTrack : Track | undefined = artistTracks[0]

    const setTrack = usePlayerStore((state) => state.setTrack)
    const playShuffled = usePlayerStore((state) => state.playShuffled)

    const accentColor = firstTrack?.colorPalette?.vibrant ?? "#10b981"


    return (<div className={'flex-1'}>
        <div className={'relative overflow-hidden h-[420px] p-8'}>
            <div className={'w-full h-full left-0 top-0 absolute inset-0 pointer-events-none'}>
                    <img src={firstTrack?.coverUrl ?? undefined}  alt={firstTrack?.title} className="w-full h-full object-cover scale-125 opacity-45" ></img>
            </div>

            <div className={'absolute w-full h-full left-0 top-0 bg-linear-to-b from-black/10 via-neutral-950/55 to-neutral-950 inset-0 pointer-events-none'}></div>
            <div className={'flex items-stretch gap-10 h-full'}>


                <div className={'flex flex-col relative justify-between gap-4 z-10 h-full'}>
                    <div></div>
                    <div className={'gap-4 flex flex-col'}>
                            <span className={'text-8xl font-black'}>{artistName}</span>

                    </div>
                    <div className={'flex  gap-4'}>
                        <button
                            className={`text-black items-center justify-center flex gap-3 font-bold w-48 h-12 rounded-full`}
                            style={{
                                backgroundColor: accentColor
                            }}
                            onClick={() => {
                                if(firstTrack)
                                    setTrack(firstTrack, artistTracks)
                            }}
                        >
                            <Play fill={'currentColor'}/>Play
                        </button>
                        <button
                            className={'text-white items-center justify-center flex gap-3  font-bold w-48 h-12 rounded-full bg-neutral-900'}
                            onClick={() => {
                                playShuffled(artistTracks)
                            }}
                        >
                            <Shuffle/>Shuffle
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <TrackList tracks={artistTracks} variant={'artist'}/>
    </div>)
}