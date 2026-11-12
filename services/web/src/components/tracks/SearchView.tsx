import {Search, X} from "lucide-react";
import {useUIStore} from "../../store/useUIStore.ts";

function SearchView() {
    const closeSearch = useUIStore((s) => s.closeSearch);

    return (
        <div className="w-full h-full flex items-center px-4 gap-3">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />

            <input
                className="flex-1 h-full bg-transparent outline-none text-sm text-white placeholder-neutral-500"
                placeholder="Search for tracks, playlists, artists, albums and more"
            />

            <button onClick={closeSearch} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white shrink-0 whitespace-nowrap cursor-pointer">
                <X className="w-3.5 h-3.5" />
                <span>Close / ESC</span>
            </button>
        </div>
    );
}

export default SearchView;