import {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    PlaylistDependencies
} from './playlist.service';
import { Playlist } from './playlist.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as mockPlaylistRepo from '../repositories/mock-playlist.repository';
import * as mockSongRepo from '../../songs/repositories/mock-song.repository';
import * as mockZikresourceRepo from '../../zikresources/repositories/mock-zikresource.repository';

describe('PlaylistService', () => {
    let deps: PlaylistDependencies;

    beforeEach(() => {
        mockPlaylistRepo.clearData();
        mockSongRepo.clearData();
        mockZikresourceRepo.clearData();

        deps = {
            savePlaylist: mockPlaylistRepo.savePlaylist,
            findPlaylistById: mockPlaylistRepo.findPlaylistById,
            findAllPlaylists: mockPlaylistRepo.findAllPlaylists,
            updatePlaylistInDb: mockPlaylistRepo.updatePlaylistInDb,
            deletePlaylistFromDb: mockPlaylistRepo.deletePlaylistFromDb,
            findSongById: mockSongRepo.findSongById,
            findZikresourceById: mockZikresourceRepo.findZikresourceById,
        };
    });

    it('should create a playlist if songs and zikresources belong to the user', async () => {
        const userId = 'user-123';
        const songId = 'song-999';
        const zikId = 'zik-1';

        await mockSongRepo.saveSong({
            id: songId,
            createdBy: userId,
            title: 'Come As You Are',
            artist: 'Nirvana',
            zikresourceIds: [zikId],
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        });

        await mockZikresourceRepo.saveZikresource({
            id: zikId,
            createdBy: userId,
            url: 'https://example.com',
            artist: 'Nirvana',
            title: 'Come As You Are',
            type: 'tablature',
            tags: []
        });

        const partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'My Grunge List',
            description: 'Nirvana and more',
            songIds: [songId],
            zikresourceIds: [zikId],
            createdBy: userId,
        };

        const saveSpy = jest.spyOn(deps, 'savePlaylist');
        const result = await createPlaylist(partial, deps);
        expect(result.id).toBeDefined();
        expect(result.name).toBe(partial.name);
        expect(result.songIds).toEqual([songId]);
        expect(result.zikresourceIds).toEqual([zikId]);
        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Grunge List' }));
    });

    it('should throw BAD_REQUEST if a song does not exist', async () => {
        const partial: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Invalid List',
            songIds: ['non-existent'],
            createdBy: 'user-123',
        };

        await expect(createPlaylist(partial, deps)).rejects.toThrow('Song with id non-existent not found');
    });

    it('should throw FORBIDDEN if a song does not belong to the user', async () => {
        await mockSongRepo.saveSong({
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

        await expect(createPlaylist(partial, deps)).rejects.toThrow('Song with id song-999 does not belong to you');
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
        await deps.savePlaylist(playlist);

        const result = await getPlaylistById('playlist-1', deps);
        expect(result.id).toBe('playlist-1');
        expect(result.name).toBe('Test List');
    });

    it('should allow getting a playlist by id even if it belongs to another user', async () => {
        const playlist: Playlist = {
            id: 'playlist-1',
            name: 'Test List',
            description: 'Desc',
            songIds: ['song-1'],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await deps.savePlaylist(playlist);

        const result = await getPlaylistById('playlist-1', deps);
        expect(result.id).toBe('playlist-1');
        expect(result.createdBy).toBe('other-user');
    });

    it('should throw FORBIDDEN when updating a playlist that belongs to another user', async () => {
        const existing: Playlist = {
            id: 'playlist-owned-by-other',
            name: 'Original',
            songIds: [],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await deps.savePlaylist(existing);

        const updates: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Hacked',
            songIds: [],
            createdBy: 'user-123',
        };

        await expect(updatePlaylist('playlist-owned-by-other', updates, deps)).rejects.toThrow(
            'You do not have permission to modify this playlist.'
        );
    });

    it('should throw FORBIDDEN when deleting a playlist that belongs to another user', async () => {
        const existing: Playlist = {
            id: 'playlist-owned-by-other',
            name: 'Original',
            songIds: [],
            createdBy: 'other-user',
            createdAt: '2026-06-14T00:00:00Z',
            updatedAt: '2026-06-14T00:00:00Z',
        };
        await deps.savePlaylist(existing);

        await expect(deletePlaylist('playlist-owned-by-other', 'user-123', deps)).rejects.toThrow(
            'You do not have permission to delete this playlist.'
        );
    });
});

