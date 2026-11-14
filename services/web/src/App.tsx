import { AudioEngine } from "./components/player/AudioEngine";
import PlayerBar from "./components/player/PlayerBar";
import TrackList from "./components/tracks/TrackList.tsx";
import SideBar from "./components/layout/SideBar.tsx";
import TabBar from "./components/layout/TabBar.tsx";
import SearchView from "./components/tracks/SearchView.tsx";
import {useUIStore} from "./store/useUIStore.ts";
import LyricsView from "./components/player/LyricsView.tsx";
import AlbumView from "./components/tracks/AlbumView.tsx";


function renderTabContent(tab: Tab) {
    switch (tab.type) {
        case "home":
            return <TrackList />;
        case "album":
            return <AlbumView albumName={tab.entityId ?? ''}/>
        default :
            return "es"
    }
}

function App() {
    const isSearching = useUIStore((s) => s.isSearching);
    const isLyricsOpen = useUIStore((s) => s.isLyricsOpen);

    const tabs = useUIStore((s) => s.tabs);
    const activeTabId = useUIStore((s) => s.activeTabId);

    const activeTab: Tab | undefined = tabs.find((tab) => tab.id === activeTabId);

    return (
        <div className="h-screen bg-neutral-950 flex flex-col text-white overflow-hidden">
            <AudioEngine/>
            <div className="flex flex-1 overflow-hidden">
                <SideBar/>
                <div className="flex flex-col flex-1 min-w-0 relative">
                    <TabBar />
                    <main className="flex-1 overflow-y-auto">
                        {renderTabContent(activeTab)}
                    </main>

                    {isSearching && <SearchView />}
                </div>
            </div>
            <PlayerBar/>
            {isLyricsOpen && <LyricsView />}
        </div>
    );
}

export default App;
