import { z } from 'zod';

export const ConnectionRequestSchema = z.object({
    receiverId: z.string().min(1, 'Receiver ID must be a non-empty string'),
});

export type CreateConnectionRequest = z.infer<typeof ConnectionRequestSchema>;
export type ConnectionStatus = 'pending' | 'accepted';

export interface ConnectionResponse {
    id: string;
    requesterId: string;
    receiverId: string;
    status: ConnectionStatus;
    createdAt: string;
    updatedAt: string;
}
