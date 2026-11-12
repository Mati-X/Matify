import {Search, X} from "lucide-react";
import {useUIStore} from "../../store/useUIStore.ts";
import {useEffect, useState} from "react";
import {searchAll, type SearchResults} from "../../api/search.ts";
import { usePlayerStore } from "../../store/usePlayerStore.ts";

function SearchView() {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults | null>(null);
    const setTrack = usePlayerStore((s) => s.setTrack);
    const closeSearch = useUIStore((s) => s.closeSearch);

    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }
        const timer = setTimeout(() => {
            searchAll(query).then(setResults);
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="absolute inset-0 z-50 flex flex-col bg-neutral-950/40  backdrop-blur-md">
            <div className="h-10 border-b border-neutral-800/80 flex items-center px-4 gap-3 shrink-0">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="flex-1 h-full bg-transparent outline-none text-sm text-white placeholder-neutral-500"
                    placeholder="Search for tracks, playlists, artists, albums and more"
                />
                <button onClick={closeSearch} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white shrink-0 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                    <span>Close / ESC</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                {!query.trim() && (
                    <p className="text-neutral-500 text-sm">Wpisz tytuł piosenki, album lub wykonawcę...</p>
                )}

                {results?.tracks.map((track) => (
                    <div
                        key={track.id}
                        onClick={() => {
                            setTrack(track, results.tracks);
                            closeSearch();
                        }}
                        className="p-3 rounded-lg hover:bg-neutral-800/70 cursor-pointer flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <img src={track.coverUrl || ''} className="w-10 h-10 rounded object-cover" />
                            <div>
                                <p className="text-sm font-medium text-white">{track.title}</p>
                                <p className="text-xs text-neutral-400">{track.artist}</p>
                            </div>
                        </div>
                        <span className="text-xs text-neutral-500">{track.album}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SearchView;