import { z } from 'zod';
import type { PlaylistResponse } from '@zikstock/types';

export type { PlaylistResponse };

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


