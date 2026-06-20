import { ZikresourceType } from '../api/zikresource.dto';

export type UUID = string;

export interface Tag {
    label: string;
    value: string;
}

export interface Zikresource {
    id: UUID;
    createdBy: string;
    url: string;
    artist: string;
    title: string;
    type: ZikresourceType;
    tags?: Tag[];
}


