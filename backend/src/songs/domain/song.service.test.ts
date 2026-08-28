import {
    createSong,
    getSongById,
    findSongById,
    updateSong,
    deleteSong,
    cloneSong,
    SongDependencies
} from './song.service';
import { Song } from './song.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as mockSongRepo from '../repositories/mock-song.repository';

describe('SongService', () => {
    let deps: SongDependencies;

    beforeEach(() => {
        mockSongRepo.clearData();

        deps = {
            saveSong: mockSongRepo.saveSong,
            findSongById: mockSongRepo.findSongById,
            findSongByClonedFromAndUser: mockSongRepo.findSongByClonedFromAndUser,
            findAllSongs: mockSongRepo.findAllSongs,
            updateSongInDb: mockSongRepo.updateSongInDb,
            deleteSongFromDb: mockSongRepo.deleteSongFromDb,
            findZikresourceById: jest.fn(async () => null),
            findZikresourceByClonedFromAndUser: jest.fn(async () => null),
            cloneZikresource: jest.fn(async () => {
                throw new Error('cloneZikresource mock not configured');
            }),
        };
    });

    it('should create a song if Zikresources belong to the same user', async () => {
        const userId = 'user-123';
        const zikId = 'zik-999';

        jest.mocked(deps.findZikresourceById).mockResolvedValue({
            id: zikId,
            createdBy: userId,
            url: 'https://youtube.com/something',
            artist: 'Nirvana',
            title: 'Come As You Are',
            type: 'video',
            tags: []
        });

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: [zikId],
            createdBy: userId,
        };

        const saveSpy = jest.spyOn(deps, 'saveSong');
        const result = await createSong(partial, deps);
        expect(result.id).toBeDefined();
        expect(result.title).toBe(partial.title);
        expect(result.zikresourceIds).toEqual([zikId]);
        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Come As You Are' }));
    });

    it('should throw BAD_REQUEST if a Zikresource does not exist', async () => {
        jest.mocked(deps.findZikresourceById).mockResolvedValue(null);

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['non-existent'],
            createdBy: 'user-123',
        };

        await expect(createSong(partial, deps)).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should throw FORBIDDEN if a Zikresource does not belong to the user', async () => {
        jest.mocked(deps.findZikresourceById).mockResolvedValue({
            id: 'zik-999',
            createdBy: 'different-user',
            url: 'https://youtube.com/something',
            artist: 'Nirvana',
            title: 'Come As You Are',
            type: 'video',
            tags: []
        });

        const partial: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: ['zik-999'],
            createdBy: 'user-123',
        };

        await expect(createSong(partial, deps)).rejects.toThrow('Zikresource with id zik-999 does not belong to you');
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
        await deps.saveSong(song);

        const result = await getSongById('song-1', deps);
        expect(result.id).toBe('song-1');
        expect(result.title).toBe('Test Song');
    });

    it('should find a song by id without throwing', async () => {
        const song: Song = {
            id: 'song-1',
            title: 'Test Song',
            artist: 'Test Artist',
            zikresourceIds: ['zik-1'],
            createdBy: 'user-123',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await deps.saveSong(song);

        const found = await findSongById('song-1', deps);
        expect(found?.id).toBe('song-1');

        const notFound = await findSongById('non-existent', deps);
        expect(notFound).toBeNull();
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
        await deps.saveSong(song);

        const result = await getSongById('song-1', deps);
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
        await deps.saveSong(existing);

        const updates: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
            title: 'Hacked',
            artist: 'Hacker',
            zikresourceIds: [],
            createdBy: 'user-123',
        };

        await expect(updateSong('song-owned-by-other', updates, deps)).rejects.toThrow(
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
        await deps.saveSong(existing);

        await expect(deleteSong('song-owned-by-other', 'user-123', deps)).rejects.toThrow(
            'You do not have permission to delete this song.'
        );
    });

    describe('cloneSong', () => {
        it('should clone a song and its resources from another user', async () => {
            jest.mocked(deps.findZikresourceById).mockResolvedValue({
                id: 'res-1',
                createdBy: 'other-user',
                url: 'https://youtube.com/watch?v=1',
                artist: 'Artist',
                title: 'Title',
                type: 'video',
                tags: []
            });

            jest.mocked(deps.cloneZikresource).mockResolvedValue({
                id: 'cloned-res-1',
                createdBy: 'user-123',
                url: 'https://youtube.com/watch?v=1',
                artist: 'Artist',
                title: 'Title',
                type: 'video',
                tags: [],
                clonedFrom: 'res-1'
            });

            const song: Song = {
                id: 'song-other',
                title: 'Song Title',
                artist: 'Song Artist',
                zikresourceIds: ['res-1'],
                createdBy: 'other-user',
                createdAt: '2026-06-14T00:00:00Z',
                updatedAt: '2026-06-14T00:00:00Z',
            };
            await deps.saveSong(song);

            const result = await cloneSong('song-other', 'user-123', deps);
            expect(result.song.id).toBeDefined();
            expect(result.song.id).not.toBe('song-other');
            expect(result.song.createdBy).toBe('user-123');
            expect(result.song.clonedFrom).toBe('song-other');
            expect(result.clonedResources).toHaveLength(1);
            expect(result.clonedResources[0].clonedFrom).toBe('res-1');
        });

        it('should throw FORBIDDEN when cloning own song', async () => {
            const song: Song = {
                id: 'song-own',
                title: 'Song Title',
                artist: 'Song Artist',
                zikresourceIds: [],
                createdBy: 'user-123',
                createdAt: '2026-06-14T00:00:00Z',
                updatedAt: '2026-06-14T00:00:00Z',
            };
            await deps.saveSong(song);

            await expect(cloneSong('song-own', 'user-123', deps)).rejects.toThrow(
                'You already own this song.'
            );
        });

        it('should throw CONFLICT when cloning a song already cloned by the user', async () => {
            const song: Song = {
                id: 'song-other',
                title: 'Song Title',
                artist: 'Song Artist',
                zikresourceIds: [],
                createdBy: 'other-user',
                createdAt: '2026-06-14T00:00:00Z',
                updatedAt: '2026-06-14T00:00:00Z',
            };
            await deps.saveSong(song);

            // First clone succeeds
            await cloneSong('song-other', 'user-123', deps);

            // Second clone throws 409
            await expect(cloneSong('song-other', 'user-123', deps)).rejects.toThrow(
                'You have already added this song to your Songbook.'
            );
        });

        it('should reuse existing cloned resource if user already cloned one of the song resources', async () => {
            jest.mocked(deps.findZikresourceById).mockResolvedValue({
                id: 'res-1',
                createdBy: 'other-user',
                url: 'https://youtube.com/watch?v=1',
                artist: 'Artist',
                title: 'Title',
                type: 'video',
                tags: []
            });

            jest.mocked(deps.findZikresourceByClonedFromAndUser).mockResolvedValue({
                id: 'res-1-cloned-earlier',
                createdBy: 'user-123',
                url: 'https://youtube.com/watch?v=1',
                artist: 'Artist',
                title: 'Title',
                type: 'video',
                clonedFrom: 'res-1'
            });

            const song: Song = {
                id: 'song-other',
                title: 'Song Title',
                artist: 'Song Artist',
                zikresourceIds: ['res-1'],
                createdBy: 'other-user',
                createdAt: '2026-06-14T00:00:00Z',
                updatedAt: '2026-06-14T00:00:00Z',
            };
            await deps.saveSong(song);

            const result = await cloneSong('song-other', 'user-123', deps);
            expect(result.song.zikresourceIds).toEqual(['res-1-cloned-earlier']);
            expect(result.clonedResources).toHaveLength(0); // No new resource was cloned
        });
    });
});

