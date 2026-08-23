import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete } from './httpClient';
import type { Zikresource } from './zikresource.api';

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
  clonedFrom?: string;
}

export interface CloneSongResponse {
  song: Song;
  clonedResources: Zikresource[];
}

export interface FetchParams {
  scope?: 'all' | 'mine';
  createdBy?: string;
}

export const fetchSongs = (params?: FetchParams): Promise<Song[]> => {
  if (params?.createdBy) {
    return authenticatedGet<Song[]>(`/songs?createdBy=${encodeURIComponent(params.createdBy)}`);
  }
  if (params?.scope === 'all') {
    return authenticatedGet<Song[]>('/songs');
  }
  return authenticatedGet<Song[]>('/me/songs');
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

export const cloneSong = (id: string): Promise<CloneSongResponse> => {
  return authenticatedPost<CloneSongResponse>(`/songs/${id}/clone`);
};

