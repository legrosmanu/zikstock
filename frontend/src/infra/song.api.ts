import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';

export interface Song {
  _id: string;
  title: string;
  artist: string;
  zikresourceIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchSongs = (): Promise<Song[]> => {
  return authenticatedGet<Song[]>('/songs');
};

export const fetchSongById = (id: string): Promise<Song> => {
  return authenticatedGet<Song>(`/songs/${id}`);
};

export const createSong = (song: Omit<Song, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  return authenticatedPost<Song>('/songs', song);
};

export const updateSong = (id: string, song: Omit<Song, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  return authenticatedPut<Song>(`/songs/${id}`, song);
};

export const deleteSong = (id: string): Promise<void> => {
  return authenticatedDelete<void>(`/songs/${id}`);
};
