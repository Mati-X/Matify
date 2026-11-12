import { AudioEngine } from "./components/player/AudioEngine";
import PlayerBar from "./components/player/PlayerBar";
import TrackList from "./components/tracks/TrackList.tsx";
import SideBar from "./components/layout/SideBar.tsx";
import TabBar from "./components/layout/TabBar.tsx";
import SearchView from "./components/tracks/SearchView.tsx";
import {useUIStore} from "./store/useUIStore.ts";

function App() {
    const isSearching = useUIStore((s) => s.isSearching);

    return (
        <div className="h-screen bg-neutral-950 flex flex-col text-white overflow-hidden">
            <AudioEngine/>
            <div className="flex flex-1 overflow-hidden">
                <SideBar/>
                <div className={'flex flex-col flex-1 min-w-0'}>
                    <div className={'w-full h-10 border-b border-neutral-800/80 '}>
                    {isSearching ? <SearchView/> : <TabBar/>}</div>
                    <main className="flex-1 overflow-y-auto">
                        <TrackList/>
                    </main>
                </div>
            </div>
            <PlayerBar/>
        </div>
    );
}

export default App;
