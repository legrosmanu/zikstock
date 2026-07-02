import { User } from '../domain/user.domain';

const users: Map<string, User> = new Map();

export const saveUser = async (user: User): Promise<User> => {
    users.set(user.id, user);
    return user;
};

export const findUserById = async (id: string): Promise<User | null> => {
    return users.get(id) || null;
};

export const searchUsers = async (queryText: string, excludeUserId: string): Promise<User[]> => {
    const queryLower = queryText.toLowerCase().trim();
    return Array.from(users.values()).filter(user => {
        if (user.id === excludeUserId) return false;
        const nameMatch = user.name?.toLowerCase().includes(queryLower) ?? false;
        const emailMatch = user.email.toLowerCase().includes(queryLower);
        return nameMatch || emailMatch;
    });
};

export const findUsersByIds = async (ids: string[]): Promise<User[]> => {
    const result: User[] = [];
    for (const id of ids) {
        const u = users.get(id);
        if (u) result.push(u);
    }
    return result;
};

export const clearData = (): void => {
    users.clear();
};
