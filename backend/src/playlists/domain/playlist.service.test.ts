import {
    createPlaylist,
    getPlaylistById,
    getAllPlaylists,
    updatePlaylist,
    deletePlaylist
} from './playlist.service';
import { Playlist } from './playlist.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import * as mockPlaylistRepo from '../repositories/mock-playlist.repository';
import * as playlistRepo from '../repositories/firestore-playlist.repository';
import * as songRepo from '../../songs/repositories/firestore-song.repository';

jest.mock('../repositories/firestore-playlist.repository');
jest.mock('../../songs/repositories/firestore-song.repository');

describe('PlaylistService', () => {
    beforeEach(() => {
        mockPlaylistRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(playlistRepo.savePlaylist).mockImplementation(mockPlaylistRepo.savePlaylist);
        jest.mocked(playlistRepo.findPlaylistById).mockImplementation(mockPlaylistRepo.findPlaylistById);
        jest.mocked(playlistRepo.findAllPlaylists).mockImplementation(mockPlaylistRepo.findAllPlaylists);
        jest.mocked(playlistRepo.updatePlaylistInDb).mockImplementation(mockPlaylistRepo.updatePlaylistInDb);
        jest.mocked(playlistRepo.deletePlaylistFromDb).mockImplementation(mockPlaylistRepo.deletePlaylistFromDb);
    });

    it('should create a playlist if songs belong to the user', async () => {
        const userId = 'user-123';
        const songId = 'song-999';

        jest.mocked(songRepo.findSongById).mockResolvedValue({
            id: songId,
            createdBy: userId,
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['zik-1'],
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        });

        const partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'My Grunge List',
            description: 'Nirvana and more',
            songIds: [songId],
            createdBy: userId,
        };

        const result = await createPlaylist(partial);
        expect(result.id).toBeDefined();
        expect(result.name).toBe(partial.name);
        expect(result.songIds).toEqual([songId]);
        expect(playlistRepo.savePlaylist).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Grunge List' }));
    });

    it('should throw BAD_REQUEST if a song does not exist', async () => {
        jest.mocked(songRepo.findSongById).mockResolvedValue(null);

        const partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Invalid List',
            songIds: ['non-existent'],
            createdBy: 'user-123',
        };

        await expect(createPlaylist(partial)).rejects.toThrow('Song with id non-existent not found');
    });

    it('should throw FORBIDDEN if a song does not belong to the user', async () => {
        jest.mocked(songRepo.findSongById).mockResolvedValue({
            id: 'song-999',
            createdBy: 'different-user',
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['zik-1'],
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        });

        const partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Invalid List',
            songIds: ['song-999'],
            createdBy: 'user-123',
        };

        await expect(createPlaylist(partial)).rejects.toThrow('Song with id song-999 does not belong to you');
    });

    it('should get a playlist by id', async () => {
        const playlist: Playlist = {
            id: 'playlist-1',
            name: 'Test List',
            description: 'Desc',
            songIds: ['song-1'],
            createdBy: 'user-123',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await playlistRepo.savePlaylist(playlist);

        const result = await getPlaylistById('playlist-1', 'user-123');
        expect(result.id).toBe('playlist-1');
        expect(result.name).toBe('Test List');
    });
});
