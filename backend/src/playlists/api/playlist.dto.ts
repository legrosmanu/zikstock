import { z } from 'zod';

export const PlaylistSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    songIds: z.array(z.string().min(1)),
});

export type CreatePlaylistRequest = z.infer<typeof PlaylistSchema>;

export interface PlaylistResponse {
    _id: string;
    name: string;
    description?: string;
    createdBy: string;
    songIds: string[];
    createdAt: string;
    updatedAt: string;
}
