import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  songIds: string[];
  zikresourceIds?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchPlaylists = (): Promise<Playlist[]> => {
  return authenticatedGet('/playlists');
};

export const fetchPlaylistById = (id: string): Promise<Playlist> => {
  return authenticatedGet(`/playlists/${id}`);
};

export const createPlaylist = (playlist: Omit<Playlist, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
  return authenticatedPost('/playlists', playlist);
};

export const updatePlaylist = (id: string, playlist: Omit<Playlist, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
  return authenticatedPut(`/playlists/${id}`, playlist);
};

export const deletePlaylist = (id: string): Promise<void> => {
  return authenticatedDelete(`/playlists/${id}`);
};
