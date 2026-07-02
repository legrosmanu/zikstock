import { Connection } from '../domain/connection.domain';

const connections: Map<string, Connection> = new Map();

export const saveConnection = async (connection: Connection): Promise<Connection> => {
    connections.set(connection.id, connection);
    return connection;
};

export const findConnectionById = async (id: string): Promise<Connection | null> => {
    return connections.get(id) || null;
};

export const findConnectionBetweenUsers = async (user1Id: string, user2Id: string): Promise<Connection | null> => {
    for (const conn of connections.values()) {
        if ((conn.requesterId === user1Id && conn.receiverId === user2Id) ||
            (conn.requesterId === user2Id && conn.receiverId === user1Id)) {
            return conn;
        }
    }
    return null;
};

export const deleteConnectionFromDb = async (id: string): Promise<void> => {
    connections.delete(id);
};

export const findConnectionsForUser = async (userId: string): Promise<Connection[]> => {
    return Array.from(connections.values()).filter(conn => 
        conn.requesterId === userId || conn.receiverId === userId
    );
};

export const clearData = (): void => {
    connections.clear();
};
