import TrackList from "./TrackList.tsx";
import {useEffect, useState} from "react";
import {getTracks} from "../../api/tracks.ts";
import type {Track} from "../../store/usePlayerStore.ts";

function HomeView() {
    const [tracks, setTracks] = useState<Track[]>([]);

    useEffect(() => {
        getTracks().then(tracks => setTracks(tracks)).then();
        console.log(tracks)
    }, []);


    return (
            <TrackList tracks={tracks} variant={'default'}/>
    );
}

export default HomeView;