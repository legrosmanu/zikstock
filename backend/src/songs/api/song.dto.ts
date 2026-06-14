import { z } from 'zod';

export const SongSchema = z.object({
    title: z.string().min(1),
    artist: z.string().min(1),
    zikresourceIds: z.array(z.string().min(1)).min(1, 'A song must have at least one Zikresource'),
});

export type CreateSongRequest = z.infer<typeof SongSchema>;

export interface SongResponse {
    _id: string;
    title: string;
    artist: string;
    zikresourceIds: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
