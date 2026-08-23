import type { Zikresource } from './zikresource';



export interface Song {
  id: string;
  title: string;
  artist: string;
  zikresourceIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  clonedFrom?: string;
}

export interface SongResponse {
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
