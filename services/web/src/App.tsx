import { AudioEngine } from "./components/player/AudioEngine";
import PlayerBar from "./components/player/PlayerBar";
import TrackList from "./components/tracks/TrackList.tsx";

function App() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <AudioEngine/>
            <TrackList/>
            <PlayerBar/>
        </div>
    );
}

export default App;
