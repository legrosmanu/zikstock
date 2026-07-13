import { z } from 'zod';

export const ZIKRESOURCE_TYPES = ['tablature', 'video', 'backing-track', 'other'] as const;
export type ZikresourceType = typeof ZIKRESOURCE_TYPES[number];

export const ZikresourceSchema = z.object({
    url: z.url(),
    artist: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(ZIKRESOURCE_TYPES),
    tags: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1),
    })).optional(),
});


export type CreateZikresourceRequest = z.infer<typeof ZikresourceSchema>;

export interface ZikresourceResponse {
    _id: string;
    createdBy: string;
    creatorName?: string;
    creatorPicture?: string;
    url: string;
    artist: string;
    title: string;
    type: ZikresourceType;
    tags?: { label: string; value: string }[];
}


