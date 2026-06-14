export interface Playlist {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    songIds: string[];
    createdAt: string;
    updatedAt: string;
}
