import { User } from './user.domain';
import * as firestoreUserRepo from '../repositories/firestore-user.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export interface UserDependencies {
    saveUser: (user: User) => Promise<User>;
    findUserById: (id: string) => Promise<User | null>;
    searchUsers: (queryText: string, currentUserId: string) => Promise<User[]>;
}

export const defaultUserDeps: UserDependencies = {
    saveUser: firestoreUserRepo.saveUser,
    findUserById: firestoreUserRepo.findUserById,
    searchUsers: firestoreUserRepo.searchUsers,
};

export const syncUser = async (
    profile: Omit<User, 'createdAt' | 'updatedAt'>,
    deps: UserDependencies = defaultUserDeps
): Promise<User> => {
    const existing = await deps.findUserById(profile.id);
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
            return deps.saveUser(updated);
        }
        return existing;
    }

    const newUser: User = {
        ...profile,
        createdAt: now,
        updatedAt: now,
    };
    return deps.saveUser(newUser);
};

export const searchMusicians = async (
    queryText: string,
    currentUserId: string,
    deps: UserDependencies = defaultUserDeps
): Promise<User[]> => {
    if (!queryText.trim()) {
        return [];
    }
    return deps.searchUsers(queryText, currentUserId);
};

export const getUserProfile = async (
    id: string,
    deps: UserDependencies = defaultUserDeps
): Promise<User> => {
    const user = await deps.findUserById(id);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, `User with id ${id} not found`);
    }
    return user;
};

