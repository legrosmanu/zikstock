import { User } from './user.domain';
import {
    saveUser,
    findUserById,
    searchUsers
} from '../repositories/firestore-user.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export const syncUser = async (profile: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> => {
    const existing = await findUserById(profile.id);
    const now = new Date().toISOString();

    if (existing) {
        // Only update if there are changes
        const hasChanges = 
            existing.email !== profile.email ||
            existing.name !== profile.name ||
            existing.picture !== profile.picture;

        if (hasChanges) {
            const updated: User = {
                ...existing,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                updatedAt: now,
            };
            return saveUser(updated);
        }
        return existing;
    }

    const newUser: User = {
        ...profile,
        createdAt: now,
        updatedAt: now,
    };
    return saveUser(newUser);
};

export const searchMusicians = async (queryText: string, currentUserId: string): Promise<User[]> => {
    if (!queryText.trim()) {
        return [];
    }
    return searchUsers(queryText, currentUserId);
};

export const getUserProfile = async (id: string): Promise<User> => {
    const user = await findUserById(id);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, `User with id ${id} not found`);
    }
    return user;
};
