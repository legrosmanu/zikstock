import { v4 as uuidv4 } from 'uuid';
import { Playlist } from './playlist.domain';
import {
    savePlaylist,
    findPlaylistById,
    findAllPlaylists,
    updatePlaylistInDb,
    deletePlaylistFromDb
} from '../repositories/firestore-playlist.repository';
import { findSongById } from '../../songs/repositories/firestore-song.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

const validateSongs = async (songIds: string[], userId: string) => {
    for (const songId of songIds) {
        const song = await findSongById(songId);
        if (!song) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Song with id ${songId} not found`);
        }
        if (song.createdBy !== userId) {
            throw new AppError(StatusCodes.FORBIDDEN, `Song with id ${songId} does not belong to you`);
        }
    }
};

export const createPlaylist = async (partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
    await validateSongs(partial.songIds, partial.createdBy);
    const now = new Date().toISOString();
    const playlist: Playlist = {
        id: uuidv4(),
        ...partial,
        createdAt: now,
        updatedAt: now,
    };
    return savePlaylist(playlist);
};

export const getPlaylistById = async (id: string, userId?: string): Promise<Playlist> => {
    const playlist = await findPlaylistById(id);
    if (!playlist) {
        throw new AppError(StatusCodes.NOT_FOUND, `Playlist with id ${id} not found`);
    }
    if (userId && playlist.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `Access denied to playlist with id ${id}`);
    }
    return playlist;
};

export const getAllPlaylists = async (userId?: string): Promise<Playlist[]> => {
    return findAllPlaylists(userId);
};

export const updatePlaylist = async (id: string, partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> => {
    const existing = await findPlaylistById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Playlist with id ${id} not found`);
    }
    if (partial.createdBy !== existing.createdBy) {
        throw new AppError(StatusCodes.FORBIDDEN, `You cannot change the owner of the playlist.`);
    }
    await validateSongs(partial.songIds, partial.createdBy);
    const updated: Playlist = {
        ...existing,
        ...partial,
        id,
        updatedAt: new Date().toISOString(),
    };
    return updatePlaylistInDb(updated);
};

export const deletePlaylist = async (id: string, userId: string): Promise<void> => {
    const existing = await findPlaylistById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this playlist.`);
    }
    await deletePlaylistFromDb(id);
};
