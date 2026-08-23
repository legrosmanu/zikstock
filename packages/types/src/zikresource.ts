export const ZIKRESOURCE_TYPES = ['tablature', 'video', 'backing-track', 'lyrics', 'other'] as const;

export type ZikresourceType = (typeof ZIKRESOURCE_TYPES)[number];

export interface ZikresourceTag {
  label: string;
  value: string;
}

export interface Zikresource {
  id: string;
  createdBy: string;
  url: string;
  artist: string;
  title: string;
  type: ZikresourceType;
  tags?: ZikresourceTag[];
  clonedFrom?: string;
}

export interface ZikresourceResponse {
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
