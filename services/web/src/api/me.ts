import {api} from "./client.ts";

export const getFavorites = async () => {
  const { data } = await api.get("/me/favorites");
  return data.favoriteTracks.map((item: { track: any, likedAt: any }) => ({ ...item.track, createdAt: item.likedAt }));
};

export const toggleFavorite = async (trackId: string) => {
  const { data } = await api.post(`/tracks/${trackId}/favorite`);
  return data;
};

export const getHistory = async () => {
  const { data } = await api.get("/me/history");
  return data.history.map((item: { track: any; playedAt: string }) => ({
    ...item.track,
    createdAt: item.playedAt,
  }));
};