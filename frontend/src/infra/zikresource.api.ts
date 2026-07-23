import { authenticatedGet, authenticatedDelete, authenticatedPut } from './httpClient';

export type ZikresourceType = 'tablature' | 'video' | 'backing-track' | 'lyrics' | 'other';

export interface ZikresourceTag {
  label: string;
  value: string;
}

export interface Zikresource {
  _id: string;
  createdBy: string;
  creatorName?: string;
  creatorPicture?: string;
  url: string;
  artist: string;
  title: string;
  type: ZikresourceType;
  tags?: ZikresourceTag[];
}

export interface FetchParams {
  scope?: 'all' | 'mine';
  createdBy?: string;
}

export const fetchZikresources = (params?: FetchParams): Promise<Zikresource[]> => {
  const query = new URLSearchParams();
  if (params?.scope) query.append('scope', params.scope);
  if (params?.createdBy) query.append('createdBy', params.createdBy);
  const queryString = query.toString();
  const url = queryString ? `/zikresources?${queryString}` : '/zikresources';
  return authenticatedGet<Zikresource[]>(url);
};

export const fetchZikresourceById = (id: string): Promise<Zikresource> => {
  return authenticatedGet<Zikresource>(`/zikresources/${id}`);
};

export const updateZikresource = (id: string, resource: Omit<Zikresource, '_id' | 'createdBy'>): Promise<Zikresource> => {
  return authenticatedPut<Zikresource>(`/zikresources/${id}`, resource);
};

export const deleteZikresource = (id: string): Promise<void> => {
  return authenticatedDelete<void>(`/zikresources/${id}`);
};
