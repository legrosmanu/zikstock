import { Firestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import { Song } from '../domain/song.domain';

const collection = 'songs';

const getDb = (): Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: process.env.GCLOUD_PROJECT ?? 'zikstock-local',
        });
    }
    return admin.firestore();
};

export const saveSong = async (song: Song): Promise<Song> => {
    await getDb().collection(collection).doc(song.id).set(song);
    return song;
};

export const findSongById = async (id: string): Promise<Song | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Song;
};

export const findAllSongs = async (userId?: string): Promise<Song[]> => {
    let query: admin.firestore.Query = getDb().collection(collection);
    if (userId) {
        query = query.where('createdBy', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Song);
};

export const updateSongInDb = async (song: Song): Promise<Song> => {
    await getDb().collection(collection).doc(song.id).update({ ...song });
    return song;
};

export const deleteSongFromDb = async (id: string): Promise<void> => {
    await getDb().collection(collection).doc(id).delete();
};
