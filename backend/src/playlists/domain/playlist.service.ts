import { v4 as uuidv4 } from 'uuid';
import { Playlist } from './playlist.domain';
import { Song } from '../../songs/domain/song.domain';
import { Zikresource } from '../../zikresources/domain/zikresource.domain';
import * as firestorePlaylistRepo from '../repositories/firestore-playlist.repository';
import * as firestoreSongRepo from '../../songs/repositories/firestore-song.repository';
import * as firestoreZikresourceRepo from '../../zikresources/repositories/firestore-zikresource.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export interface PlaylistDependencies {
    savePlaylist: (playlist: Playlist) => Promise<Playlist>;
    findPlaylistById: (id: string) => Promise<Playlist | null>;
    findAllPlaylists: (userId?: string) => Promise<Playlist[]>;
    updatePlaylistInDb: (playlist: Playlist) => Promise<Playlist>;
    deletePlaylistFromDb: (id: string) => Promise<void>;
    findSongById: (id: string) => Promise<Song | null>;
    findZikresourceById: (id: string) => Promise<Zikresource | null>;
}

export const defaultPlaylistDeps: PlaylistDependencies = {
    savePlaylist: firestorePlaylistRepo.savePlaylist,
    findPlaylistById: firestorePlaylistRepo.findPlaylistById,
    findAllPlaylists: firestorePlaylistRepo.findAllPlaylists,
    updatePlaylistInDb: firestorePlaylistRepo.updatePlaylistInDb,
    deletePlaylistFromDb: firestorePlaylistRepo.deletePlaylistFromDb,
    findSongById: firestoreSongRepo.findSongById,
    findZikresourceById: firestoreZikresourceRepo.findZikresourceById,
};

const validateSongs = async (
    songIds: string[],
    userId: string,
    findSongById: (id: string) => Promise<Song | null>
) => {
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

export const createPlaylist = async (
    partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>,
    deps: PlaylistDependencies = defaultPlaylistDeps
): Promise<Playlist> => {
    await validateSongs(partial.songIds, partial.createdBy, deps.findSongById);
    await validateZikresources(partial.zikresourceIds || [], partial.createdBy, deps.findZikresourceById);
    const now = new Date().toISOString();
    const playlist: Playlist = {
        id: uuidv4(),
        ...partial,
        zikresourceIds: partial.zikresourceIds || [],
        createdAt: now,
        updatedAt: now,
    };
    return deps.savePlaylist(playlist);
};

export const getPlaylistById = async (
    id: string,
    deps: PlaylistDependencies = defaultPlaylistDeps
): Promise<Playlist> => {
    const playlist = await deps.findPlaylistById(id);
    if (!playlist) {
        throw new AppError(StatusCodes.NOT_FOUND, `Playlist with id ${id} not found`);
    }
    return playlist;
};

export const getAllPlaylists = async (
    userId?: string,
    deps: PlaylistDependencies = defaultPlaylistDeps
): Promise<Playlist[]> => {
    return deps.findAllPlaylists(userId);
};

export const updatePlaylist = async (
    id: string,
    partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>,
    deps: PlaylistDependencies = defaultPlaylistDeps
): Promise<Playlist> => {
    const existing = await deps.findPlaylistById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Playlist with id ${id} not found`);
    }
    if (partial.createdBy !== existing.createdBy) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to modify this playlist.`);
    }
    await validateSongs(partial.songIds, partial.createdBy, deps.findSongById);
    await validateZikresources(partial.zikresourceIds || [], partial.createdBy, deps.findZikresourceById);
    const updated: Playlist = {
        ...existing,
        ...partial,
        id,
        zikresourceIds: partial.zikresourceIds || [],
        updatedAt: new Date().toISOString(),
    };
    return deps.updatePlaylistInDb(updated);
};

export const deletePlaylist = async (
    id: string,
    userId: string,
    deps: PlaylistDependencies = defaultPlaylistDeps
): Promise<void> => {
    const existing = await deps.findPlaylistById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this playlist.`);
    }
    await deps.deletePlaylistFromDb(id);
};

