import { v4 as uuidv4 } from 'uuid';
import { Connection, ConnectionStatus } from './connection.domain';
import { User } from '../../users/domain/user.domain';
import * as firestoreConnRepo from '../repositories/firestore-connection.repository';
import * as firestoreUserRepo from '../../users/repositories/firestore-user.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export interface ConnectionDependencies {
    saveConnection: (connection: Connection) => Promise<Connection>;
    findConnectionById: (id: string) => Promise<Connection | null>;
    findConnectionBetweenUsers: (u1: string, u2: string) => Promise<Connection | null>;
    deleteConnectionFromDb: (id: string) => Promise<void>;
    findConnectionsForUser: (userId: string) => Promise<Connection[]>;
    findUserById: (id: string) => Promise<User | null>;
    findUsersByIds: (ids: string[]) => Promise<User[]>;
}

export const defaultConnectionDeps: ConnectionDependencies = {
    saveConnection: firestoreConnRepo.saveConnection,
    findConnectionById: firestoreConnRepo.findConnectionById,
    findConnectionBetweenUsers: firestoreConnRepo.findConnectionBetweenUsers,
    deleteConnectionFromDb: firestoreConnRepo.deleteConnectionFromDb,
    findConnectionsForUser: firestoreConnRepo.findConnectionsForUser,
    findUserById: firestoreUserRepo.findUserById,
    findUsersByIds: firestoreUserRepo.findUsersByIds,
};

export const requestConnection = async (
    requesterId: string,
    receiverId: string,
    deps: ConnectionDependencies = defaultConnectionDeps
): Promise<Connection> => {
    if (requesterId === receiverId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot connect with yourself');
    }

    // Verify receiver exists
    const receiver = await deps.findUserById(receiverId);
    if (!receiver) {
        throw new AppError(StatusCodes.NOT_FOUND, `User with id ${receiverId} not found`);
    }

    // Check existing connection
    const existing = await deps.findConnectionBetweenUsers(requesterId, receiverId);

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

        return deps.saveConnection(newConnection);
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
    return deps.saveConnection(updated);
};

export const acceptConnectionRequest = async (
    connectionId: string,
    userId: string,
    deps: ConnectionDependencies = defaultConnectionDeps
): Promise<Connection> => {
    const connection = await deps.findConnectionById(connectionId);
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

    return deps.saveConnection(updated);
};

export const removeConnection = async (
    connectionId: string,
    userId: string,
    deps: ConnectionDependencies = defaultConnectionDeps
): Promise<void> => {
    const connection = await deps.findConnectionById(connectionId);
    if (!connection) {
        return;
    }

    if (connection.requesterId !== userId && connection.receiverId !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to modify this connection');
    }

    await deps.deleteConnectionFromDb(connectionId);
};

export interface ConnectionWithUser extends Connection {
    user: User;
}

export interface NetworkResponse {
    accepted: ConnectionWithUser[];
    incoming: ConnectionWithUser[];
    outgoing: ConnectionWithUser[];
}

export const listNetwork = async (
    userId: string,
    deps: ConnectionDependencies = defaultConnectionDeps
): Promise<NetworkResponse> => {
    const connections = await deps.findConnectionsForUser(userId);

    const acceptedConnections = connections.filter(c => c.status === ConnectionStatus.ACCEPTED);
    const activeOtherUserIds = acceptedConnections.map(c => c.requesterId === userId ? c.receiverId : c.requesterId);

    const incomingConnections = connections.filter(c => c.status === ConnectionStatus.PENDING && c.receiverId === userId);
    const outgoingConnections = connections.filter(c => c.status === ConnectionStatus.PENDING && c.requesterId === userId);

    const allFetchIds = [
        ...activeOtherUserIds,
        ...incomingConnections.map(c => c.requesterId),
        ...outgoingConnections.map(c => c.receiverId)
    ];

    const users = await deps.findUsersByIds(allFetchIds);
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

