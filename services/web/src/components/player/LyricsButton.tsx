import { Mic2 } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

function LyricsButton() {
    const isLyricsOpen = useUIStore((s) => s.isLyricsOpen);
    const toggleLyrics = useUIStore((s) => s.toggleLyrics);

    return (
        <button
            onClick={toggleLyrics}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLyricsOpen ? "text-emerald-400 bg-neutral-800" : "text-neutral-400 hover:text-white"
            }`}
            title="Tekst utworu"
        >
            <Mic2 className="w-4 h-4" />
        </button>
    );
}

export default LyricsButton;