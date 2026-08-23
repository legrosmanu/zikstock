import {
    authenticatedGet,
    authenticatedPost,
    authenticatedPut,
    authenticatedDelete
} from './httpClient';
import type {
    NetworkUser,
    ConnectionWithUser,
    NetworkResponse
} from '@zikstock/types';

export type { NetworkUser, ConnectionWithUser, NetworkResponse };


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
