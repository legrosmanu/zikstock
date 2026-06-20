import { UUID } from '../../zikresources/domain/zikresource.domain';

export interface Playlist {
    id: UUID;
    name: string;
    description?: string;
    createdBy: string;
    songIds: string[];
    zikresourceIds?: UUID[];
    createdAt: string;
    updatedAt: string;
}
