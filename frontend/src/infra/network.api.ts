import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPut,
    authenticatedDelete
} from './httpClient';

export interface NetworkUser {
    id: string;
    email: string;
    name?: string;
    picture?: string;
}

export interface ConnectionWithUser {
    id: string;
    requesterId: string;
    receiverId: string;
    status: 'pending' | 'accepted';
    createdAt: string;
    updatedAt: string;
    user: NetworkUser;
}

export interface NetworkResponse {
    accepted: ConnectionWithUser[];
    incoming: ConnectionWithUser[];
    outgoing: ConnectionWithUser[];
}

export const syncUserProfile = async (): Promise<NetworkUser> => {
    return authenticatedPost<NetworkUser>('/users/me');
};

export const searchMusicians = async (query: string): Promise<NetworkUser[]> => {
    return authenticatedGet<NetworkUser[]>(`/users?q=${encodeURIComponent(query)}`);
};

export const sendConnectionRequest = async (receiverId: string): Promise<unknown> => {
    return authenticatedPost('/connections', { receiverId });
};

export const acceptConnection = async (connectionId: string): Promise<unknown> => {
    return authenticatedPut(`/connections/${connectionId}`);
};

export const removeConnection = async (connectionId: string): Promise<void> => {
    return authenticatedDelete<void>(`/connections/${connectionId}`);
};

export const getNetwork = async (): Promise<NetworkResponse> => {
    return authenticatedGet<NetworkResponse>('/connections');
};
