import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { User } from '../domain/user.domain';

const collection = 'users';

const getDb = (): Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: process.env.GCLOUD_PROJECT ?? 'zikstock-local',
        });
    }
    return admin.firestore();
};

export const saveUser = async (user: User): Promise<User> => {
    await getDb().collection(collection).doc(user.id).set(user);
    return user;
};

export const findUserById = async (id: string): Promise<User | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as User;
};

export const searchUsers = async (queryText: string, excludeUserId: string): Promise<User[]> => {
    const snapshot = await getDb().collection(collection).get();
    const queryLower = queryText.toLowerCase().trim();
    
    const allUsers = snapshot.docs.map(doc => doc.data() as User);
    
    return allUsers.filter(user => {
        if (user.id === excludeUserId) return false;
        
        const nameMatch = user.name?.toLowerCase().includes(queryLower) ?? false;
        const emailMatch = user.email.toLowerCase().includes(queryLower);
        
        return nameMatch || emailMatch;
    });
};

export const findUsersByIds = async (ids: string[]): Promise<User[]> => {
    if (ids.length === 0) return [];
    
    // Firestore in operator supports up to 30 items
    // Since we usually have small batches, chunking or filtering is safe.
    // For simplicity, let's chunk in groups of 30.
    const results: User[] = [];
    const db = getDb();
    
    for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const snapshot = await db.collection(collection)
            .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
            .get();
            
        results.push(...snapshot.docs.map(doc => doc.data() as User));
    }
    
    return results;
};
