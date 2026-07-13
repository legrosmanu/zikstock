import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  songIds: string[];
  zikresourceIds?: string[];
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

export const fetchPlaylists = (params?: FetchParams): Promise<Playlist[]> => {
  const query = new URLSearchParams();
  if (params?.scope) query.append('scope', params.scope);
  if (params?.createdBy) query.append('createdBy', params.createdBy);
  const queryString = query.toString();
  const url = queryString ? `/playlists?${queryString}` : '/playlists';
  return authenticatedGet<Playlist[]>(url);
};

export const fetchPlaylistById = (id: string): Promise<Playlist> => {
  return authenticatedGet<Playlist>(`/playlists/${id}`);
};

export const createPlaylist = (playlist: Omit<Playlist, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
  return authenticatedPost<Playlist>('/playlists', playlist);
};

export const updatePlaylist = (id: string, playlist: Omit<Playlist, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
  return authenticatedPut<Playlist>(`/playlists/${id}`, playlist);
};

export const deletePlaylist = (id: string): Promise<void> => {
  return authenticatedDelete<void>(`/playlists/${id}`);
};

