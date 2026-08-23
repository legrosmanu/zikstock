import { z } from 'zod';
import { ZIKRESOURCE_TYPES, type ZikresourceType, type ZikresourceResponse } from '@zikstock/types';

export { ZIKRESOURCE_TYPES };
export type { ZikresourceType, ZikresourceResponse };

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



