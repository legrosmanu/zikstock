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
  return authenticatedGet('/songs');
};

export const fetchSongById = (id: string): Promise<Song> => {
  return authenticatedGet(`/songs/${id}`);
};

export const createSong = (song: Omit<Song, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  return authenticatedPost('/songs', song);
};

export const updateSong = (id: string, song: Omit<Song, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
  return authenticatedPut(`/songs/${id}`, song);
};

export const deleteSong = (id: string): Promise<void> => {
  return authenticatedDelete(`/songs/${id}`);
};
