import {
    requestConnection,
    acceptConnectionRequest,
    removeConnection,
    listNetwork
} from './connection.service';
import { User } from '../../users/domain/user.domain';
import { ConnectionStatus } from './connection.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import * as mockConnRepo from '../repositories/mock-connection.repository';
import * as connRepo from '../repositories/firestore-connection.repository';
import * as mockUserRepo from '../../users/repositories/mock-user.repository';
import * as userRepo from '../../users/repositories/firestore-user.repository';

jest.mock('../repositories/firestore-connection.repository');
jest.mock('../../users/repositories/firestore-user.repository');

describe('ConnectionService', () => {
    const userA: User = { id: 'user-A', email: 'a@ex.com', name: 'Alice', createdAt: '', updatedAt: '' };
    const userB: User = { id: 'user-B', email: 'b@ex.com', name: 'Bob', createdAt: '', updatedAt: '' };

    beforeEach(() => {
        mockConnRepo.clearData();
        mockUserRepo.clearData();
        jest.clearAllMocks();

        // Setup mock implementations
        jest.mocked(connRepo.saveConnection).mockImplementation(mockConnRepo.saveConnection);
        jest.mocked(connRepo.findConnectionById).mockImplementation(mockConnRepo.findConnectionById);
        jest.mocked(connRepo.findConnectionBetweenUsers).mockImplementation(mockConnRepo.findConnectionBetweenUsers);
        jest.mocked(connRepo.deleteConnectionFromDb).mockImplementation(mockConnRepo.deleteConnectionFromDb);
        jest.mocked(connRepo.findConnectionsForUser).mockImplementation(mockConnRepo.findConnectionsForUser);

        jest.mocked(userRepo.findUserById).mockImplementation(mockUserRepo.findUserById);
        jest.mocked(userRepo.findUsersByIds).mockImplementation(mockUserRepo.findUsersByIds);
    });

    it('should fail if attempting to connect with oneself', async () => {
        await expect(requestConnection('user-A', 'user-A'))
            .rejects.toThrow('You cannot connect with yourself');
    });

    it('should fail if the target user does not exist', async () => {
        jest.mocked(userRepo.findUserById).mockResolvedValue(null);
        await expect(requestConnection('user-A', 'user-B'))
            .rejects.toThrow('User with id user-B not found');
    });

    it('should create a pending connection request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const conn = await requestConnection('user-A', 'user-B');
        expect(conn.id).toBeDefined();
        expect(conn.requesterId).toBe('user-A');
        expect(conn.receiverId).toBe('user-B');
        expect(conn.status).toBe(ConnectionStatus.PENDING);
    });

    it('should automatically accept if target user already sent a pending request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        // B sends to A
        await requestConnection('user-B', 'user-A');

        // A sends to B -> should auto-accept
        const conn = await requestConnection('user-A', 'user-B');
        expect(conn.status).toBe(ConnectionStatus.ACCEPTED);
    });

    it('should accept a pending request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const pending = await requestConnection('user-A', 'user-B');
        const accepted = await acceptConnectionRequest(pending.id, 'user-B');
        expect(accepted.status).toBe(ConnectionStatus.ACCEPTED);
    });

    it('should throw FORBIDDEN if accepting a request not belonging to the user', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const pending = await requestConnection('user-A', 'user-B');
        await expect(acceptConnectionRequest(pending.id, 'user-A'))
            .rejects.toThrow('You are not authorized to accept this connection request');
    });

    it('should delete a connection/request', async () => {
        await mockUserRepo.saveUser(userA);
        await mockUserRepo.saveUser(userB);

        const conn = await requestConnection('user-A', 'user-B');
        await removeConnection(conn.id, 'user-A');

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
        const c1 = await requestConnection('user-A', 'user-B');
        await acceptConnectionRequest(c1.id, 'user-B');

        // C -> A pending (incoming to A)
        await requestConnection('user-C', 'user-A');

        // A -> D pending (outgoing from A)
        await requestConnection('user-A', 'user-D');

        const network = await listNetwork('user-A');
        
        expect(network.accepted).toHaveLength(1);
        expect(network.accepted[0].user.id).toBe('user-B');

        expect(network.incoming).toHaveLength(1);
        expect(network.incoming[0].user.id).toBe('user-C');

        expect(network.outgoing).toHaveLength(1);
        expect(network.outgoing[0].user.id).toBe('user-D');
    });
});
