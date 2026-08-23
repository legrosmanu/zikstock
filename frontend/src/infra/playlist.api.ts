import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';
import type { PlaylistResponse as Playlist } from '@zikstock/types';

export type { Playlist };


export interface FetchParams {
  scope?: 'all' | 'mine';
  createdBy?: string;
}

export const fetchPlaylists = (params?: FetchParams): Promise<Playlist[]> => {
  if (params?.createdBy) {
    return authenticatedGet<Playlist[]>(`/playlists?createdBy=${encodeURIComponent(params.createdBy)}`);
  }
  if (params?.scope === 'all') {
    return authenticatedGet<Playlist[]>('/playlists');
  }
  return authenticatedGet<Playlist[]>('/me/playlists');
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

