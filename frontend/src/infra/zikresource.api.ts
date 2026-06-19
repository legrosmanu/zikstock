import { authenticatedGet, authenticatedDelete, authenticatedPut } from './httpClient';

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

export const fetchZikresources = (): Promise<Zikresource[]> => {
  return authenticatedGet('/zikresources');
};

export const fetchZikresourceById = (id: string): Promise<Zikresource> => {
  return authenticatedGet(`/zikresources/${id}`);
};

export const updateZikresource = (id: string, resource: Omit<Zikresource, '_id' | 'createdBy'>): Promise<Zikresource> => {
  return authenticatedPut(`/zikresources/${id}`, resource);
};

export const deleteZikresource = (id: string): Promise<void> => {
  return authenticatedDelete(`/zikresources/${id}`);
};
