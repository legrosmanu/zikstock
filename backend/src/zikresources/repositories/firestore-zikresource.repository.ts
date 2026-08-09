import { Query } from 'firebase-admin/firestore';
import { Zikresource } from '../domain/zikresource.domain';
import { getDb } from '../../application/firestore';

const collection = 'zikresources';

export const saveZikresource = async (zikresource: Zikresource): Promise<Zikresource> => {
    await getDb().collection(collection).doc(zikresource.id).set(zikresource);
    return zikresource;
};

export const findZikresourceById = async (id: string): Promise<Zikresource | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Zikresource;
};

export const findAllZikresources = async (userId?: string): Promise<Zikresource[]> => {
    let query: Query = getDb().collection(collection);
    if (userId) {
        query = query.where('createdBy', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Zikresource);
};

export const updateZikresourceInDb = async (zikresource: Zikresource): Promise<Zikresource> => {
    await getDb().collection(collection).doc(zikresource.id).update({ ...zikresource });
    return zikresource;
};

export const deleteZikresourceFromDb = async (id: string): Promise<void> => {
    await getDb().collection(collection).doc(id).delete();
};
