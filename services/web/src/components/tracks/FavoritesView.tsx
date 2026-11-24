import {useEffect} from "react";
import TrackList from "./TrackList.tsx";
import {useAuthStore} from "../../store/useAuthStore.ts";
import {useLibraryStore} from "../../store/useLibraryStore.ts";

function FavoritesView() {
    const favorites = useLibraryStore((s) => s.favorites);
    const fetchFavorites = useLibraryStore((s) => s.fetchFavorites);
    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (token) {
            fetchFavorites();
        }
    }, [token, fetchFavorites]);

    return (
        <TrackList variant={'favorites'} tracks={favorites}/>
    );
}

export default FavoritesView;
