import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Zikresource } from '../models/zikresource.domain';

const collection = 'zikresources';

const getDb = (): Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
};

export const saveZikresource = async (zikresource: Zikresource): Promise<Zikresource> => {
    await getDb().collection(collection).doc(zikresource.id).set(zikresource);
    return zikresource;
};

export const findZikresourceById = async (id: string): Promise<Zikresource | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Zikresource;
};

export const findAllZikresources = async (): Promise<Zikresource[]> => {
    const snapshot = await getDb().collection(collection).get();
    return snapshot.docs.map(doc => doc.data() as Zikresource);
};

export const updateZikresourceInDb = async (zikresource: Zikresource): Promise<Zikresource> => {
    await getDb().collection(collection).doc(zikresource.id).update({ ...zikresource });
    return zikresource;
};

export const deleteZikresourceFromDb = async (id: string): Promise<void> => {
    await getDb().collection(collection).doc(id).delete();
};
