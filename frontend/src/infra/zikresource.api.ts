import { authenticatedGet, authenticatedDelete } from './httpClient';

export type ZikresourceStats = {
  songs: number;
  tabs: number;
  videos: number;
};

export type ZikresourceType = 'tablature' | 'video' | 'backing-track' | 'other';

export interface ZikresourceTag {
  label: string;
  value: string;
}

export interface Zikresource {
  _id: string;
  createdBy: string;
  url: string;
  artist: string;
  title: string;
  type: ZikresourceType;
  tags?: ZikresourceTag[];
}

export const fetchZikresourceStats = (): Promise<ZikresourceStats> => {
  return authenticatedGet('/zikresources/stats');
};

export const fetchZikresources = (): Promise<Zikresource[]> => {
  return authenticatedGet('/zikresources');
};

export const deleteZikresource = (id: string): Promise<void> => {
  return authenticatedDelete(`/zikresources/${id}`);
};
