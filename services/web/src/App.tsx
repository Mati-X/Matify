import {useEffect} from "react";
import { AudioEngine } from "./components/player/AudioEngine";
import PlayerBar from "./components/player/PlayerBar";
import SideBar from "./components/layout/SideBar.tsx";
import TabBar from "./components/layout/TabBar.tsx";
import SearchView from "./components/tracks/SearchView.tsx";
import {type Tab, useUIStore} from "./store/useUIStore.ts";
import LyricsView from "./components/player/LyricsView.tsx";
import AlbumView from "./components/tracks/AlbumView.tsx";
import HomeView from "./components/tracks/HomeView.tsx";
import ArtistView from "./components/tracks/ArtistView.tsx";
import QueueView from "./components/player/QueueView.tsx";
import AuthModal from "./components/auth/AuthModal.tsx";
import {useAuthStore} from "./store/useAuthStore.ts";
import {useLibraryStore} from "./store/useLibraryStore.ts";
import FavoritesView from "./components/tracks/FavoritesView.tsx";
import PlaylistView from "./components/tracks/PlaylistView.tsx";
import UserView from "./components/tracks/UserView.tsx";


function renderTabContent(tab: Tab | undefined) {
     if (!tab) return null;
    switch (tab.type) {
        case "home":
            return <HomeView/>;
        case "album":
            return <AlbumView albumName={tab.entityId ?? ''}/>
        case "artist":
             return <ArtistView artistName={tab.entityId ?? ''}/>
        case "favorites":
            return <FavoritesView/>
        case "playlist":
            return <PlaylistView playlistId={tab.entityId ?? ''}/>
        case "user":
            return <UserView userId={tab.entityId ?? ''} username={tab.title}/>
        default :
            return null
    }
}

function App() {
    const isSearching = useUIStore((s) => s.isSearching);
    const isLyricsOpen = useUIStore((s) => s.isLyricsOpen);
    const isQueueOpen = useUIStore((s) => s.isQueueOpen);
    const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
    const token = useAuthStore((s) => s.token);
    const fetchFavorites = useLibraryStore((s) => s.fetchFavorites);
    const fetchPlaylists = useLibraryStore((s) => s.fetchPlaylists);

    const tabs = useUIStore((s) => s.tabs);
    const activeTabId = useUIStore((s) => s.activeTabId);

    const activeTab: Tab | undefined = tabs.find((tab) => tab.id === activeTabId);

    useEffect(() => {
        if (token) {
            fetchFavorites();
        }
    }, [token, fetchFavorites]);

    useEffect( () => {
         if (token) {
            fetchPlaylists();
        }
    }, [token, fetchPlaylists]);

    return (
        <div className="h-screen bg-neutral-950 flex flex-col text-white overflow-hidden">
            <AudioEngine/>
            <div className="flex flex-1 overflow-hidden">
                <SideBar/>
                <div className="flex flex-col flex-1 min-w-0 relative">
                    <TabBar/>
                    <main className="flex-1 flex overflow-y-auto">
                        {renderTabContent(activeTab)}

                    </main>

                    {isSearching && <SearchView/>}
                </div>
                {isQueueOpen && <QueueView/>}
            </div>
            <PlayerBar/>
            {isLyricsOpen && <LyricsView/>}
            {isAuthModalOpen && <AuthModal/>}
        </div>
    );
}

export default App;
