import { v4 as uuidv4 } from 'uuid';
import { Song } from './song.domain';
import {
    saveSong,
    findSongById,
    findAllSongs,
    updateSongInDb,
    deleteSongFromDb
} from '../repositories/firestore-song.repository';
import { findZikresourceById } from '../../zikresources/repositories/firestore-zikresource.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

const validateZikresources = async (zikresourceIds: string[], userId: string) => {
    for (const zikresourceId of zikresourceIds) {
        const res = await findZikresourceById(zikresourceId);
        if (!res) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Zikresource with id ${zikresourceId} not found`);
        }
        if (res.createdBy !== userId) {
            throw new AppError(StatusCodes.FORBIDDEN, `Zikresource with id ${zikresourceId} does not belong to you`);
        }
    }
};

export const createSong = async (partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
    await validateZikresources(partial.zikresourceIds, partial.createdBy);
    const now = new Date().toISOString();
    const song: Song = {
        id: uuidv4(),
        ...partial,
        createdAt: now,
        updatedAt: now,
    };
    return saveSong(song);
};

export const getSongById = async (id: string): Promise<Song> => {
    const song = await findSongById(id);
    if (!song) {
        throw new AppError(StatusCodes.NOT_FOUND, `Song with id ${id} not found`);
    }
    return song;
};

export const getAllSongs = async (userId?: string): Promise<Song[]> => {
    return findAllSongs(userId);
};

export const updateSong = async (id: string, partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
    const existing = await findSongById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Song with id ${id} not found`);
    }
    if (partial.createdBy !== existing.createdBy) {
        throw new AppError(StatusCodes.FORBIDDEN, `You cannot change the owner of the song.`);
    }
    await validateZikresources(partial.zikresourceIds, partial.createdBy);
    const updated: Song = {
        ...existing,
        ...partial,
        id,
        updatedAt: new Date().toISOString(),
    };
    return updateSongInDb(updated);
};

export const deleteSong = async (id: string, userId: string): Promise<void> => {
    const existing = await findSongById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this song.`);
    }
    await deleteSongFromDb(id);
};
