import React from "react";
import { useUIStore } from "../../store/useUIStore.ts";
import { parseArtists } from "../../utils/trackFormatters.ts";

interface ArtistLinksProps {
    artist?: string | null;
    className?: string;
}

export function ArtistLinks({ artist, className = "truncate text-xs text-neutral-400" }: ArtistLinksProps) {
    const openTab = useUIStore((state) => state.openTab);
    const artists = parseArtists(artist);

    if (artists.length === 0) return null;

    return (
        <div title={artist ?? undefined} className={className}>
            {artists.map((artistName, index) => (
                <React.Fragment key={`${artistName}-${index}`}>
                    {index > 0 && ", "}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            openTab({
                                id: `artist:${artistName}`,
                                title: artistName,
                                type: "artist",
                                entityId: artistName,
                            });
                        }}
                        className="hover:underline hover:text-white transition-colors"
                    >
                        {artistName}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
}
