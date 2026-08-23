export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  zikresourceIds?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistResponse {
  _id: string;
  name: string;
  description?: string;
  songIds: string[];
  zikresourceIds: string[];
  createdBy: string;
  creatorName?: string;
  creatorPicture?: string;
  createdAt: string;
  updatedAt: string;
}
