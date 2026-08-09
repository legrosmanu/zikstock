import { Query } from 'firebase-admin/firestore';
import { Playlist } from '../domain/playlist.domain';
import { getDb } from '../../application/firestore';

const collection = 'playlists';

export const savePlaylist = async (playlist: Playlist): Promise<Playlist> => {
    await getDb().collection(collection).doc(playlist.id).set(playlist);
    return playlist;
};

export const findPlaylistById = async (id: string): Promise<Playlist | null> => {
    const doc = await getDb().collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Playlist;
};

export const findAllPlaylists = async (userId?: string): Promise<Playlist[]> => {
    let query: Query = getDb().collection(collection);
    if (userId) {
        query = query.where('createdBy', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Playlist);
};

export const updatePlaylistInDb = async (playlist: Playlist): Promise<Playlist> => {
    await getDb().collection(collection).doc(playlist.id).update({ ...playlist });
    return playlist;
};

export const deletePlaylistFromDb = async (id: string): Promise<void> => {
    await getDb().collection(collection).doc(id).delete();
};
