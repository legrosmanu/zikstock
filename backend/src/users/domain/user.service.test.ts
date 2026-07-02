import {
    syncUser,
    searchMusicians,
    getUserProfile
} from './user.service';
import { User } from './user.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import * as mockUserRepo from '../repositories/mock-user.repository';
import * as userRepo from '../repositories/firestore-user.repository';

jest.mock('../repositories/firestore-user.repository');

describe('UserService', () => {
    beforeEach(() => {
        mockUserRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(userRepo.saveUser).mockImplementation(mockUserRepo.saveUser);
        jest.mocked(userRepo.findUserById).mockImplementation(mockUserRepo.findUserById);
        jest.mocked(userRepo.searchUsers).mockImplementation(mockUserRepo.searchUsers);
    });

    it('should create a new user profile on sync if not exists', async () => {
        const profile = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://pic.url'
        };

        const result = await syncUser(profile);
        expect(result.id).toBe(profile.id);
        expect(result.email).toBe(profile.email);
        expect(result.name).toBe(profile.name);
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(userRepo.saveUser).toHaveBeenCalled();
    });

    it('should update user profile on sync if exists with changes', async () => {
        const initialUser: User = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Old Name',
            picture: 'https://old.url',
            createdAt: '2026-06-01T00:00:00Z',
            updatedAt: '2026-06-01T00:00:00Z',
        };
        await mockUserRepo.saveUser(initialUser);

        const profile = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'New Name',
            picture: 'https://new.url'
        };

        const result = await syncUser(profile);
        expect(result.id).toBe(profile.id);
        expect(result.name).toBe(profile.name);
        expect(result.picture).toBe(profile.picture);
        expect(result.createdAt).toBe(initialUser.createdAt);
        expect(result.updatedAt).not.toBe(initialUser.updatedAt);
    });

    it('should search musicians matching query', async () => {
        await mockUserRepo.saveUser({
            id: 'user-1',
            email: 'alice@example.com',
            name: 'Alice Cooper',
            createdAt: '2026-06-01T00:00:00Z',
            updatedAt: '2026-06-01T00:00:00Z'
        });
        await mockUserRepo.saveUser({
            id: 'user-2',
            email: 'bob@example.com',
            name: 'Bob Marley',
            createdAt: '2026-06-01T00:00:00Z',
            updatedAt: '2026-06-01T00:00:00Z'
        });

        const results = await searchMusicians('bob', 'user-1');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('user-2');
    });

    it('should get user profile by id', async () => {
        const user: User = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: '2026-06-01T00:00:00Z',
            updatedAt: '2026-06-01T00:00:00Z',
        };
        await mockUserRepo.saveUser(user);

        const result = await getUserProfile('user-123');
        expect(result.id).toBe(user.id);
        expect(result.name).toBe(user.name);
    });

    it('should throw NOT_FOUND error if profile does not exist', async () => {
        await expect(getUserProfile('non-existent')).rejects.toThrow('User with id non-existent not found');
    });
});
