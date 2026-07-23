import {
    createSong,
    getSongById,
    updateSong,
    deleteSong
} from './song.service';
import { Song } from './song.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import * as mockSongRepo from '../repositories/mock-song.repository';
import * as songRepo from '../repositories/firestore-song.repository';
import * as zikresourceRepo from '../../zikresources/repositories/firestore-zikresource.repository';

jest.mock('../repositories/firestore-song.repository');
jest.mock('../../zikresources/repositories/firestore-zikresource.repository');

describe('SongService', () => {
    beforeEach(() => {
        mockSongRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(songRepo.saveSong).mockImplementation(mockSongRepo.saveSong);
        jest.mocked(songRepo.findSongById).mockImplementation(mockSongRepo.findSongById);
        jest.mocked(songRepo.findAllSongs).mockImplementation(mockSongRepo.findAllSongs);
        jest.mocked(songRepo.updateSongInDb).mockImplementation(mockSongRepo.updateSongInDb);
        jest.mocked(songRepo.deleteSongFromDb).mockImplementation(mockSongRepo.deleteSongFromDb);
    });

    it('should create a song if Zikresources belong to the same user', async () => {
        const userId = 'user-123';
        const zikId = 'zik-999';

        jest.mocked(zikresourceRepo.findZikresourceById).mockResolvedValue({
            id: zikId,
            createdBy: userId,
            url: 'https://youtube.com/something',
            artist: 'Nirvana',
            title: 'Come As You Are',
            type: 'video',
        });

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: [zikId],
            createdBy: userId,
        };

        const result = await createSong(partial);
        expect(result.id).toBeDefined();
        expect(result.title).toBe(partial.title);
        expect(result.zikresourceIds).toEqual([zikId]);
        expect(songRepo.saveSong).toHaveBeenCalledWith(expect.objectContaining({ title: 'Come As You Are' }));
    });

    it('should throw BAD_REQUEST if a Zikresource does not exist', async () => {
        jest.mocked(zikresourceRepo.findZikresourceById).mockResolvedValue(null);

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['non-existent'],
            createdBy: 'user-123',
        };

        await expect(createSong(partial)).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should throw FORBIDDEN if a Zikresource does not belong to the user', async () => {
        jest.mocked(zikresourceRepo.findZikresourceById).mockResolvedValue({
            id: 'zik-999',
            createdBy: 'different-user',
            url: 'https://youtube.com/something',
            artist: 'Nirvana',
            title: 'Come As You Are',
            type: 'video',
        });

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['zik-999'],
            createdBy: 'user-123',
        };

        await expect(createSong(partial)).rejects.toThrow('Zikresource with id zik-999 does not belong to you');
    });

    it('should get a song by id', async () => {
        const song: Song = {
            id: 'song-1',
            title: 'Test Song',
            artist: 'Test Artist',
            zikresourceIds: ['zik-1'],
            createdBy: 'user-123',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await songRepo.saveSong(song);

        const result = await getSongById('song-1');
        expect(result.id).toBe('song-1');
        expect(result.title).toBe('Test Song');
    });

    it('should allow getting a song by id even if it belongs to another user', async () => {
        const song: Song = {
            id: 'song-1',
            title: 'Test Song',
            artist: 'Test Artist',
            zikresourceIds: ['zik-1'],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await songRepo.saveSong(song);

        const result = await getSongById('song-1');
        expect(result.id).toBe('song-1');
        expect(result.createdBy).toBe('other-user');
    });

    it('should throw FORBIDDEN when updating a song that belongs to another user', async () => {
        const existing: Song = {
            id: 'song-owned-by-other',
            title: 'Original',
            artist: 'Original Artist',
            zikresourceIds: [],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await songRepo.saveSong(existing);

        const updates: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Hacked',
            artist: 'Hacker',
            zikresourceIds: [],
            createdBy: 'user-123',
        };

        await expect(updateSong('song-owned-by-other', updates)).rejects.toThrow(
            'You do not have permission to modify this song.'
        );
    });

    it('should throw FORBIDDEN when deleting a song that belongs to another user', async () => {
        const existing: Song = {
            id: 'song-owned-by-other',
            title: 'Original',
            artist: 'Original Artist',
            zikresourceIds: [],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await songRepo.saveSong(existing);

        await expect(deleteSong('song-owned-by-other', 'user-123')).rejects.toThrow(
            'You do not have permission to delete this song.'
        );
    });
});
