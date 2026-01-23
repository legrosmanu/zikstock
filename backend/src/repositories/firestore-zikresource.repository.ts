import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Zikresource } from '../models/zikresource.domain';
import { ZikresourceRepository } from './zikresource.repository';

export class FirestoreZikresourceRepository implements ZikresourceRepository {
    private collection = 'zikresources';
    private db: Firestore;

    constructor() {
        if (!admin.apps.length) {
            admin.initializeApp();
        }
        this.db = admin.firestore();
    }

    async save(zikresource: Zikresource): Promise<Zikresource> {
        await this.db.collection(this.collection).doc(zikresource.id).set(zikresource);
        return zikresource;
    }

    async findById(id: string): Promise<Zikresource | null> {
        const doc = await this.db.collection(this.collection).doc(id).get();
        if (!doc.exists) return null;
        return doc.data() as Zikresource;
    }

    async findAll(): Promise<Zikresource[]> {
        const snapshot = await this.db.collection(this.collection).get();
        return snapshot.docs.map(doc => doc.data() as Zikresource);
    }

    async update(zikresource: Zikresource): Promise<Zikresource> {
        await this.db.collection(this.collection).doc(zikresource.id).update({ ...zikresource });
        return zikresource;
    }

    async delete(id: string): Promise<void> {
        await this.db.collection(this.collection).doc(id).delete();
    }
}
