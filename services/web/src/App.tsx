import { AudioEngine } from "./components/player/AudioEngine";
import PlayerBar from "./components/player/PlayerBar";

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AudioEngine />
      <PlayerBar />
    </div>
  );
}

export default App;
