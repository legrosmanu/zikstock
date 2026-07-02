import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Connection } from '../domain/connection.domain';

const collection = 'connections';

const getDb = (): Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: process.env.GCLOUD_PROJECT ?? 'zikstock-local',
        });
    }
    return admin.firestore();
};

export const saveConnection = async (connection: Connection): Promise<Connection> => {
    await getDb().collection(collection).doc(connection.id).set(connection);
    return connection;
};

export const findConnectionById = async (id: string): Promise<Connection | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Connection;
};

export const findConnectionBetweenUsers = async (user1Id: string, user2Id: string): Promise<Connection | null> => {
    const db = getDb();
    
    // Check requester = user1, receiver = user2
    const snap1 = await db.collection(collection)
        .where('requesterId', '==', user1Id)
        .where('receiverId', '==', user2Id)
        .limit(1)
        .get();
        
    if (!snap1.empty) {
        return snap1.docs[0].data() as Connection;
    }

    // Check requester = user2, receiver = user1
    const snap2 = await db.collection(collection)
        .where('requesterId', '==', user2Id)
        .where('receiverId', '==', user1Id)
        .limit(1)
        .get();
        
    if (!snap2.empty) {
        return snap2.docs[0].data() as Connection;
    }

    return null;
};

export const deleteConnectionFromDb = async (id: string): Promise<void> => {
    await getDb().collection(collection).doc(id).delete();
};

export const findConnectionsForUser = async (userId: string): Promise<Connection[]> => {
    const db = getDb();

    // Parallel queries for requester and receiver roles
    const [snapRequester, snapReceiver] = await Promise.all([
        db.collection(collection).where('requesterId', '==', userId).get(),
        db.collection(collection).where('receiverId', '==', userId).get()
    ]);

    const requesterConns = snapRequester.docs.map(doc => doc.data() as Connection);
    const receiverConns = snapReceiver.docs.map(doc => doc.data() as Connection);

    // Merge results, filtering out potential duplicates (shouldn't happen with our schema, but safe)
    const all = [...requesterConns, ...receiverConns];
    const seen = new Set<string>();
    const unique: Connection[] = [];
    
    for (const c of all) {
        if (!seen.has(c.id)) {
            seen.add(c.id);
            unique.push(c);
        }
    }
    
    return unique;
};
