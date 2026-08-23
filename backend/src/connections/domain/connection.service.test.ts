import {
    requestConnection,
    acceptConnectionRequest,
    removeConnection,
    listNetwork,
    ConnectionDependencies
} from './connection.service';
import { User } from '../../users/domain/user.domain';
import { ConnectionStatus } from './connection.domain';
import { describe, it, expect, beforeEach } from '@jest/globals';
import * as mockConnRepo from '../repositories/mock-connection.repository';
import * as mockUserRepo from '../../users/repositories/mock-user.repository';

describe('ConnectionService', () => {
    const userA: User = { id: 'user-A', email: 'a@ex.com', name: 'Alice', createdAt: '', updatedAt: '' };
    const userB: User = { id: 'user-B', email: 'b@ex.com', name: 'Bob', createdAt: '', updatedAt: '' };
    let deps: ConnectionDependencies;

    beforeEach(() => {
        mockConnRepo.clearData();
        mockUserRepo.clearData();

        deps = {
            saveConnection: mockConnRepo.saveConnection,
            findConnectionById: mockConnRepo.findConnectionById,
            findConnectionBetweenUsers: mockConnRepo.findConnectionBetweenUsers,
            deleteConnectionFromDb: mockConnRepo.deleteConnectionFromDb,
            findConnectionsForUser: mockConnRepo.findConnectionsForUser,
            findUserById: mockUserRepo.findUserById,
            findUsersByIds: mockUserRepo.findUsersByIds,
        };
    });

    it('should fail if attempting to connect with oneself', async () => {
        await expect(requestConnection('user-A', 'user-A', deps))
            .rejects.toThrow('You cannot connect with yourself');
    });

    it('should fail if the target user does not exist', async () => {
        await expect(requestConnection('user-A', 'user-B', deps))
            .rejects.toThrow('User with id user-B not found');
    });

    it('should create a pending connection request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const conn = await requestConnection('user-A', 'user-B', deps);
        expect(conn.id).toBeDefined();
        expect(conn.requesterId).toBe('user-A');
        expect(conn.receiverId).toBe('user-B');
        expect(conn.status).toBe(ConnectionStatus.PENDING);
    });

    it('should automatically accept if target user already sent a pending request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        // B sends to A
        await requestConnection('user-B', 'user-A', deps);

        // A sends to B -> should auto-accept
        const conn = await requestConnection('user-A', 'user-B', deps);
        expect(conn.status).toBe(ConnectionStatus.ACCEPTED);
    });

    it('should accept a pending request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const pending = await requestConnection('user-A', 'user-B', deps);
        const accepted = await acceptConnectionRequest(pending.id, 'user-B', deps);
        expect(accepted.status).toBe(ConnectionStatus.ACCEPTED);
    });

    it('should throw FORBIDDEN if accepting a request not belonging to the user', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const pending = await requestConnection('user-A', 'user-B', deps);
        await expect(acceptConnectionRequest(pending.id, 'user-A', deps))
            .rejects.toThrow('You are not authorized to accept this connection request');
    });

    it('should delete a connection/request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const conn = await requestConnection('user-A', 'user-B', deps);
        await removeConnection(conn.id, 'user-A', deps);

        const found = await mockConnRepo.findConnectionById(conn.id);
        expect(found).toBeNull();
    });

    it('should load network properly grouped', async () => {
        const userC: User = { id: 'user-C', email: 'c@ex.com', name: 'Charlie', createdAt: '', updatedAt: '' };
        const userD: User = { id: 'user-D', email: 'd@ex.com', name: 'David', createdAt: '', updatedAt: '' };

        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);
        await mockUserRepo.saveUser(userC);
        await mockUserRepo.saveUser(userD);

        // A <-> B accepted
        const c1 = await requestConnection('user-A', 'user-B', deps);
        await acceptConnectionRequest(c1.id, 'user-B', deps);

        // C -> A pending (incoming to A)
        await requestConnection('user-C', 'user-A', deps);

        // A -> D pending (outgoing from A)
        await requestConnection('user-A', 'user-D', deps);

        const network = await listNetwork('user-A', deps);
        
        expect(network.accepted).toHaveLength(1);
        expect(network.accepted[0].user.id).toBe('user-B');

        expect(network.incoming).toHaveLength(1);
        expect(network.incoming[0].user.id).toBe('user-C');

        expect(network.outgoing).toHaveLength(1);
        expect(network.outgoing[0].user.id).toBe('user-D');
    });
});

