import { v4 as uuidv4 } from 'uuid';
import { Song } from './song.domain';
import { Zikresource } from '../../zikresources/domain/zikresource.domain';
import * as firestoreSongRepo from '../repositories/firestore-song.repository';
import {
    cloneZikresource,
    findZikresourceById,
    findZikresourceByClonedFromAndUser
} from '../../zikresources/domain/zikresource.service';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export interface SongDependencies {
    saveSong: (song: Song) => Promise<Song>;
    findSongById: (id: string) => Promise<Song | null>;
    findSongByClonedFromAndUser: (clonedFrom: string, userId: string) => Promise<Song | null>;
    findAllSongs: (userId?: string) => Promise<Song[]>;
    updateSongInDb: (song: Song) => Promise<Song>;
    deleteSongFromDb: (id: string) => Promise<void>;
    findZikresourceById: (id: string) => Promise<Zikresource | null>;
    findZikresourceByClonedFromAndUser: (clonedFrom: string, userId: string) => Promise<Zikresource | null>;
    cloneZikresource: (id: string, userId: string) => Promise<Zikresource>;
}

export const defaultSongDeps: SongDependencies = {
    saveSong: firestoreSongRepo.saveSong,
    findSongById: firestoreSongRepo.findSongById,
    findSongByClonedFromAndUser: firestoreSongRepo.findSongByClonedFromAndUser,
    findAllSongs: firestoreSongRepo.findAllSongs,
    updateSongInDb: firestoreSongRepo.updateSongInDb,
    deleteSongFromDb: firestoreSongRepo.deleteSongFromDb,
    findZikresourceById,
    findZikresourceByClonedFromAndUser,
    cloneZikresource,
};

export const findSongById = async (
    id: string,
    deps: SongDependencies = defaultSongDeps
): Promise<Song | null> => {
    return deps.findSongById(id);
};

const validateZikresources = async (
    zikresourceIds: string[],
    userId: string,
    findZikresourceById: (id: string) => Promise<Zikresource | null>
) => {
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

export const createSong = async (
    partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>,
    deps: SongDependencies = defaultSongDeps
): Promise<Song> => {
    await validateZikresources(partial.zikresourceIds, partial.createdBy, deps.findZikresourceById);
    const now = new Date().toISOString();
    const song: Song = {
        id: uuidv4(),
        ...partial,
        createdAt: now,
        updatedAt: now,
    };
    return deps.saveSong(song);
};

export const getSongById = async (
    id: string,
    deps: SongDependencies = defaultSongDeps
): Promise<Song> => {
    const song = await deps.findSongById(id);
    if (!song) {
        throw new AppError(StatusCodes.NOT_FOUND, `Song with id ${id} not found`);
    }
    return song;
};

export const getAllSongs = async (
    userId?: string,
    deps: SongDependencies = defaultSongDeps
): Promise<Song[]> => {
    return deps.findAllSongs(userId);
};

export const updateSong = async (
    id: string,
    partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>,
    deps: SongDependencies = defaultSongDeps
): Promise<Song> => {
    const existing = await deps.findSongById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Song with id ${id} not found`);
    }
    if (partial.createdBy !== existing.createdBy) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to modify this song.`);
    }
    await validateZikresources(partial.zikresourceIds, partial.createdBy, deps.findZikresourceById);
    const updated: Song = {
        ...existing,
        ...partial,
        id,
        updatedAt: new Date().toISOString(),
    };
    return deps.updateSongInDb(updated);
};

export const deleteSong = async (
    id: string,
    userId: string,
    deps: SongDependencies = defaultSongDeps
): Promise<void> => {
    const existing = await deps.findSongById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this song.`);
    }
    await deps.deleteSongFromDb(id);
};

export const cloneSong = async (
    id: string,
    userId: string,
    deps: SongDependencies = defaultSongDeps
) => {
    const existing = await deps.findSongById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Song with id ${id} not found`);
    }
    if (existing.createdBy === userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You already own this song.`);
    }

    const alreadyClonedSong = await deps.findSongByClonedFromAndUser(id, userId);
    if (alreadyClonedSong) {
        throw new AppError(StatusCodes.CONFLICT, `You have already added this song to your Songbook.`);
    }

    const clonedZikresourceIds: string[] = [];
    const clonedResources = [];

    for (const zikresourceId of existing.zikresourceIds) {
        const res = await deps.findZikresourceById(zikresourceId);
        if (!res) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Zikresource with id ${zikresourceId} not found`);
        }
        if (res.createdBy === userId) {
            clonedZikresourceIds.push(res.id);
        } else {
            const existingClonedRes = deps.findZikresourceByClonedFromAndUser
                ? await deps.findZikresourceByClonedFromAndUser(res.id, userId)
                : null;
            if (existingClonedRes) {
                clonedZikresourceIds.push(existingClonedRes.id);
            } else {
                const clonedRes = await deps.cloneZikresource(res.id, userId);
                clonedZikresourceIds.push(clonedRes.id);
                clonedResources.push(clonedRes);
            }
        }
    }

    const now = new Date().toISOString();
    const song: Song = {
        id: uuidv4(),
        title: existing.title,
        artist: existing.artist,
        zikresourceIds: clonedZikresourceIds,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        clonedFrom: existing.id,
    };

    const savedSong = await deps.saveSong(song);
    return { song: savedSong, clonedResources };
};


