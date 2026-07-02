import { z } from 'zod';

export const SyncUserSchema = z.object({
    id: z.string().min(1, 'User ID is required'),
    email: z.email('A valid email is required'),
    name: z.string().min(1, 'Name must not be empty').optional(),
    picture: z.string().optional(),
});

export type SyncUserRequest = z.infer<typeof SyncUserSchema>;
