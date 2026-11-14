import { type Track } from "../../store/usePlayerStore.ts";

export type TrackListVariant = "default" | "album" | "playlist" | "artist" | "favorites";

export type TrackListItem = Track & {
    createdAt?: string | null;
    addedBy?: { id: string; username: string } | null;
};

export interface VariantConfig {
    showIndex: boolean;
    showCover: boolean;
    showAlbum: boolean;
    showAddedBy: boolean;
    showDateAdded: boolean;
    showLegend: boolean;
}

export const VARIANT_CONFIG: Record<TrackListVariant, VariantConfig> = {
    default: { showIndex: false, showCover: true, showAlbum: true, showAddedBy: false, showDateAdded: false, showLegend: false },
    album: { showIndex: true, showCover: false, showAlbum: false, showAddedBy: false, showDateAdded: false, showLegend: true },
    playlist: { showIndex: true, showCover: true, showAlbum: true, showAddedBy: true, showDateAdded: true, showLegend: true },
    artist: { showIndex: true, showCover: true, showAlbum: true, showAddedBy: false, showDateAdded: false, showLegend: false },
    favorites: { showIndex: true, showCover: true, showAlbum: true, showAddedBy: false, showDateAdded: true, showLegend: true },
};
