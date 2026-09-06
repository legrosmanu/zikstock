import { z } from 'zod';
import { ZIKRESOURCE_TYPES } from '../../zikresources/api/zikresource.dto';

export const SongSchema = z.object({
    title: z.string().min(1),
    artist: z.string().min(1),
    zikresourceIds: z.array(z.string().min(1)).optional().default([]),
});

export const CreateSongZikresourceSchema = z.object({
    url: z.url(),
    type: z.enum(ZIKRESOURCE_TYPES).optional().default('other'),
    tags: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1),
    })).optional(),
});

export type CreateSongZikresourceRequest = z.infer<typeof CreateSongZikresourceSchema>;

export const SongIdParamSchema = z.object({
    id: z.string().min(1, 'Song ID is required'),
});

export const UserPayloadSchema = z.object({
    sub: z.string().min(1, 'User identity is missing from token'),
});

export type CreateSongRequest = z.infer<typeof SongSchema>;

export interface SongResponse {
    _id: string;
    title: string;
    artist: string;
    zikresourceIds: string[];
    createdBy: string;
    creatorName?: string;
    creatorPicture?: string;
    createdAt: string;
    updatedAt: string;
    clonedFrom?: string;
}

