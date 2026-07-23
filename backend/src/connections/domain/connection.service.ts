import { v4 as uuidv4 } from 'uuid';
import { Connection, ConnectionStatus } from './connection.domain';
import { User } from '../../users/domain/user.domain';
import {
    saveConnection,
    findConnectionById,
    findConnectionBetweenUsers,
    deleteConnectionFromDb,
    findConnectionsForUser
} from '../repositories/firestore-connection.repository';
import { findUserById, findUsersByIds } from '../../users/repositories/firestore-user.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export const requestConnection = async (requesterId: string, receiverId: string): Promise<Connection> => {
    if (requesterId === receiverId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot connect with yourself');
    }

    // Verify receiver exists
    const receiver = await findUserById(receiverId);
    if (!receiver) {
        throw new AppError(StatusCodes.NOT_FOUND, `User with id ${receiverId} not found`);
    }

    // Check existing connection
    const existing = await findConnectionBetweenUsers(requesterId, receiverId);

    const now = new Date().toISOString();

    if (!existing) {
        const newConnection: Connection = {
            id: uuidv4(),
            requesterId,
            receiverId,
            status: ConnectionStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        };

        return saveConnection(newConnection);
    }

    if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You are already connected with this user');
    }

    // If pending, check who sent it
    if (existing.requesterId === requesterId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Connection request already sent');
    }

    // Receiver has a pending request from this requester; accept it automatically!
    const updated: Connection = {
        ...existing,
        status: ConnectionStatus.ACCEPTED,
        updatedAt: now,
    };
    return saveConnection(updated);

};

export const acceptConnectionRequest = async (connectionId: string, userId: string): Promise<Connection> => {
    const connection = await findConnectionById(connectionId);
    if (!connection) {
        throw new AppError(StatusCodes.NOT_FOUND, `Connection request with id ${connectionId} not found`);
    }

    if (connection.receiverId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to accept this connection request');
    }

    if (connection.status === ConnectionStatus.ACCEPTED) {
        return connection;
    }

    const updated: Connection = {
        ...connection,
        status: ConnectionStatus.ACCEPTED,
        updatedAt: new Date().toISOString(),
    };

    return saveConnection(updated);
};

export const removeConnection = async (connectionId: string, userId: string): Promise<void> => {
    const connection = await findConnectionById(connectionId);
    if (!connection) {
        return;
    }

    if (connection.requesterId !== userId && connection.receiverId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to modify this connection');
    }

    await deleteConnectionFromDb(connectionId);
};

export interface ConnectionWithUser extends Connection {
    user: User;
}

export interface NetworkResponse {
    accepted: ConnectionWithUser[];
    incoming: ConnectionWithUser[];
    outgoing: ConnectionWithUser[];
}

export const listNetwork = async (userId: string): Promise<NetworkResponse> => {
    const connections = await findConnectionsForUser(userId);

    const acceptedConnections = connections.filter(c => c.status === ConnectionStatus.ACCEPTED);
    const activeOtherUserIds = acceptedConnections.map(c => c.requesterId === userId ? c.receiverId : c.requesterId);

    const incomingConnections = connections.filter(c => c.status === ConnectionStatus.PENDING && c.receiverId === userId);
    const outgoingConnections = connections.filter(c => c.status === ConnectionStatus.PENDING && c.requesterId === userId);

    const allFetchIds = [
        ...activeOtherUserIds,
        ...incomingConnections.map(c => c.requesterId),
        ...outgoingConnections.map(c => c.receiverId)
    ];

    const users = await findUsersByIds(allFetchIds);
    const userMap = new Map<string, User>(users.map(u => [u.id, u]));

    const accepted: ConnectionWithUser[] = [];
    for (const connection of acceptedConnections) {
        const otherId = connection.requesterId === userId ? connection.receiverId : connection.requesterId;
        const user = userMap.get(otherId);
        if (user) {
            accepted.push({ ...connection, user: user });
        }
    }

    const incoming: ConnectionWithUser[] = [];
    for (const connection of incomingConnections) {
        const requester = userMap.get(connection.requesterId);
        if (requester) {
            incoming.push({ ...connection, user: requester });
        }
    }

    const outgoing: ConnectionWithUser[] = [];
    for (const connection of outgoingConnections) {
        const receiver = userMap.get(connection.receiverId);
        if (receiver) {
            outgoing.push({ ...connection, user: receiver });
        }
    }

    return {
        accepted,
        incoming,
        outgoing
    };
};
