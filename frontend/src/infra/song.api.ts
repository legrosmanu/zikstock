import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';

export interface Song {
  _id: string;
  title: string;
  artist: string;
  zikresourceIds: string[];
  createdBy: string;
  creatorName?: string;
  creatorPicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchParams {
  scope?: 'all' | 'mine';
  createdBy?: string;
}

export const fetchSongs = (params?: FetchParams): Promise<Song[]> => {
  const query = new URLSearchParams();
  if (params?.scope) query.append('scope', params.scope);
  if (params?.createdBy) query.append('createdBy', params.createdBy);
  const queryString = query.toString();
  const url = queryString ? `/songs?${queryString}` : '/songs';
  return authenticatedGet<Song[]>(url);
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
