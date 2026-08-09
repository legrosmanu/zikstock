import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

export const getDb = (): Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: process.env.GCLOUD_PROJECT ?? 'zikstock-local',
        });
    }
    const db = admin.firestore();
    try {
        db.settings({ ignoreUndefinedProperties: true });
    } catch {
        // Ignore if settings have already been initialized
    }
    return db;
};
