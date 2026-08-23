export enum ConnectionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted'
}

export interface Connection {
    id: string;
    requesterId: string;
    receiverId: string;
    status: ConnectionStatus;
    createdAt: string;
    updatedAt: string;
}
