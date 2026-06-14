import { Song } from '../domain/song.domain';

const songs: Map<string, Song> = new Map();

export const saveSong = async (song: Song): Promise<Song> => {
    songs.set(song.id, song);
    return song;
};

export const findSongById = async (id: string): Promise<Song | null> => {
    return songs.get(id) || null;
};

export const findAllSongs = async (userId?: string): Promise<Song[]> => {
    const all = Array.from(songs.values());
    if (userId) {
        return all.filter(s => s.createdBy === userId);
    }
    return all;
};

export const updateSongInDb = async (song: Song): Promise<Song> => {
    songs.set(song.id, song);
    return song;
};

export const deleteSongFromDb = async (id: string): Promise<void> => {
    songs.delete(id);
};

export const clearData = (): void => {
    songs.clear();
};
