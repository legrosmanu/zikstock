import { z } from 'zod';

export const ZikresourceSchema = z.object({
    url: z.string().url(),
    artist: z.string().min(1),
    title: z.string().min(1),
    type: z.string().optional(),
    tags: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1),
    })).optional(),
});

export type CreateZikresourceRequest = z.infer<typeof ZikresourceSchema>;

export interface ZikresourceResponse {
    _id: string;
    url: string;
    artist: string;
    title: string;
    type?: string;
    tags?: { label: string; value: string }[];
}
