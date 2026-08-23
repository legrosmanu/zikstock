import { authenticatedGet, authenticatedDelete, authenticatedPut, authenticatedPost } from './httpClient';

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
  clonedFrom?: string;
}

export interface FetchParams {
  scope?: 'all' | 'mine';
  createdBy?: string;
}

export const fetchZikresources = (params?: FetchParams): Promise<Zikresource[]> => {
  if (params?.createdBy) {
    return authenticatedGet<Zikresource[]>(`/zikresources?createdBy=${encodeURIComponent(params.createdBy)}`);
  }
  if (params?.scope === 'all') {
    return authenticatedGet<Zikresource[]>('/zikresources');
  }
  return authenticatedGet<Zikresource[]>('/me/zikresources');
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

export const cloneZikresource = (id: string): Promise<Zikresource> => {
  return authenticatedPost<Zikresource>(`/zikresources/${id}/clone`);
};

export const checkZikresourceEmbeddability = (url: string): Promise<{ embeddable: boolean }> => {
  return authenticatedGet<{ embeddable: boolean }>(`/zikresources/check-embed?url=${encodeURIComponent(url)}`);
};

