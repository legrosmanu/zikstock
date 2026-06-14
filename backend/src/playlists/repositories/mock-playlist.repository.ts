import { Playlist } from '../domain/playlist.domain';

const playlists: Map<string, Playlist> = new Map();

export const savePlaylist = async (playlist: Playlist): Promise<Playlist> => {
    playlists.set(playlist.id, playlist);
    return playlist;
};

export const findPlaylistById = async (id: string): Promise<Playlist | null> => {
    return playlists.get(id) || null;
};

export const findAllPlaylists = async (userId?: string): Promise<Playlist[]> => {
    const all = Array.from(playlists.values());
    if (userId) {
        return all.filter(p => p.createdBy === userId);
    }
    return all;
};

export const updatePlaylistInDb = async (playlist: Playlist): Promise<Playlist> => {
    playlists.set(playlist.id, playlist);
    return playlist;
};

export const deletePlaylistFromDb = async (id: string): Promise<void> => {
    playlists.delete(id);
};

export const clearData = (): void => {
    playlists.clear();
};
