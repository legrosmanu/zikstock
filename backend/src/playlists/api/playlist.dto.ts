import { z } from 'zod';

export const PlaylistSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    songIds: z.array(z.string().min(1)),
    zikresourceIds: z.array(z.string().min(1)).optional(),
});

export const PlaylistIdParamSchema = z.object({
    id: z.string().min(1, 'Playlist ID is required'),
});

export const UserPayloadSchema = z.object({
    sub: z.string().min(1, 'User identity is missing from token'),
});

export type CreatePlaylistRequest = z.infer<typeof PlaylistSchema>;

export interface PlaylistResponse {
    _id: string;
    name: string;
    description?: string;
    createdBy: string;
    creatorName?: string;
    creatorPicture?: string;
    songIds: string[];
    zikresourceIds: string[];
    createdAt: string;
    updatedAt: string;
}

