import {
    createZikresource,
    getZikresourceById,
    findZikresourceById,
    findZikresourceByClonedFromAndUser,
    getAllZikresources,
    updateZikresource,
    deleteZikresource,
    checkEmbeddability,
    cloneZikresource,
    ZikresourceDependencies
} from './zikresource.service';
import { Zikresource } from './zikresource.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as mockRepo from '../repositories/mock-zikresource.repository';

describe('ZikresourceService', () => {
    let deps: ZikresourceDependencies;

    beforeEach(() => {
        mockRepo.clearData();
        deps = {
            saveZikresource: mockRepo.saveZikresource,
            findZikresourceById: mockRepo.findZikresourceById,
            findZikresourceByClonedFromAndUser: mockRepo.findZikresourceByClonedFromAndUser,
            findAllZikresources: mockRepo.findAllZikresources,
            updateZikresourceInDb: mockRepo.updateZikresourceInDb,
            deleteZikresourceFromDb: mockRepo.deleteZikresourceFromDb,
            checkHttpFrameEmbeddability: jest.fn(async () => true),
        };
    });

    it('should create a zikresource', async () => {
        const partial: Omit<Zikresource, 'id'> = {
            createdBy: 'user-123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: []
        };

        const saveSpy = jest.spyOn(deps, 'saveZikresource');
        const result = await createZikresource(partial, deps);

        expect(result.id).toBeDefined();
        expect(result.url).toBe(partial.url);
        expect(result.artist).toBe(partial.artist);
        expect(result.title).toBe(partial.title);
        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(partial));
    });

    it('should get a zikresource by id', async () => {
        const zikresource: Zikresource = {
            id: '123',
            createdBy: 'user-123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: []
        };
        await deps.saveZikresource(zikresource);

        const result = await getZikresourceById('123', deps);

        expect(result.id).toBe('123');
        expect(result.url).toBe(zikresource.url);
    });

    it('should find a zikresource by id without throwing if not found', async () => {
        const zikresource: Zikresource = {
            id: '123',
            createdBy: 'user-123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: []
        };
        await deps.saveZikresource(zikresource);

        const found = await findZikresourceById('123', deps);
        expect(found?.id).toBe('123');

        const notFound = await findZikresourceById('non-existent', deps);
        expect(notFound).toBeNull();
    });

    it('should find a zikresource by clonedFrom and userId', async () => {
        const zikresource: Zikresource = {
            id: '123',
            createdBy: 'user-123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: [],
            clonedFrom: 'orig-456'
        };
        await deps.saveZikresource(zikresource);

        const found = await findZikresourceByClonedFromAndUser('orig-456', 'user-123', deps);
        expect(found?.id).toBe('123');

        const notFound = await findZikresourceByClonedFromAndUser('orig-456', 'user-999', deps);
        expect(notFound).toBeNull();
    });

    it('should throw error if zikresource not found on getById', async () => {
        await expect(getZikresourceById('non-existent', deps)).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should not throw error if zikresource not found on delete', async () => {
        await expect(deleteZikresource('non-existent', 'user-123', deps)).resolves.not.toThrow();
    });

    it('should get all zikresources', async () => {
        await deps.saveZikresource({ id: '1', createdBy: 'ELEGROS', url: 'u1', artist: 'a1', title: 't1', type: 'video', tags: [] });
        await deps.saveZikresource({ id: '2', createdBy: 'ELEGROS', url: 'u2', artist: 'a2', title: 't2', type: 'video', tags: [] });

        const result = await getAllZikresources(undefined, deps);

        expect(result).toHaveLength(2);
    });

    it('should get all zikresources filtered by user', async () => {
        await deps.saveZikresource({ id: '1', createdBy: 'ELEGROS', url: 'u1', artist: 'a1', title: 't1', type: 'video', tags: [] });
        await deps.saveZikresource({ id: '2', createdBy: 'OTHER_USER', url: 'u2', artist: 'a2', title: 't2', type: 'video', tags: [] });

        const result = await getAllZikresources('ELEGROS', deps);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should update a zikresource', async () => {
        const id = '123';
        const original: Zikresource = {
            id,
            createdBy: 'user-123',
            url: 'https://example.com/old',
            artist: 'Old Artist',
            title: 'Old Title',
            type: 'video',
            tags: [{ label: 'TO_PLAY', value: 'old' }]
        };
        await deps.saveZikresource(original);

        const updates: Omit<Zikresource, 'id'> = {
            createdBy: 'user-123',
            url: 'https://example.com/new',
            artist: 'New Artist',
            title: 'New Title',
            type: 'tablature',
            tags: [{ label: 'TO_PLAY', value: 'new' }]
        };

        const updateSpy = jest.spyOn(deps, 'updateZikresourceInDb');
        const result = await updateZikresource(id, updates, deps);

        expect(result.id).toBe(id);
        expect(result.url).toBe(updates.url);
        expect(result.artist).toBe(updates.artist);
        expect(result.title).toBe(updates.title);
        expect(result.type).toBe(updates.type);
        expect(result.tags).toEqual(updates.tags);
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it('should throw error if zikresource not found on update', async () => {
        const updates: Omit<Zikresource, 'id'> = {
            createdBy: 'user-123',
            url: 'https://example.com/new',
            artist: 'New Artist',
            title: 'New Title',
            type: 'tablature',
            tags: [{ label: 'TO_PLAY', value: 'new' }]
        };
        await expect(updateZikresource('non-existent', updates, deps)).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should throw FORBIDDEN when updating a zikresource that belongs to another user', async () => {
        const original: Zikresource = {
            id: 'zik-owned-by-other',
            createdBy: 'other-user',
            url: 'https://example.com/original',
            artist: 'Other Artist',
            title: 'Other Title',
            type: 'video',
            tags: []
        };
        await deps.saveZikresource(original);

        const updates: Omit<Zikresource, 'id'> = {
            createdBy: 'user-123',
            url: 'https://example.com/hack',
            artist: 'Hacked Artist',
            title: 'Hacked Title',
            type: 'video',
            tags: []
        };

        await expect(updateZikresource('zik-owned-by-other', updates, deps)).rejects.toThrow(
            'You do not have permission to modify this zikresource.'
        );
    });

    it('should throw FORBIDDEN when deleting a zikresource that belongs to another user', async () => {
        const original: Zikresource = {
            id: 'zik-owned-by-other',
            createdBy: 'other-user',
            url: 'https://example.com/original',
            artist: 'Other Artist',
            title: 'Other Title',
            type: 'video',
            tags: []
        };
        await deps.saveZikresource(original);

        await expect(deleteZikresource('zik-owned-by-other', 'user-123', deps)).rejects.toThrow(
            'You do not have permission to delete this zikresource.'
        );
    });

    it('should delete a zikresource when the user is the owner', async () => {
        const original: Zikresource = {
            id: 'zik-mine',
            createdBy: 'user-123',
            url: 'https://example.com/mine',
            artist: 'My Artist',
            title: 'My Title',
            type: 'video',
            tags: []
        };
        await deps.saveZikresource(original);

        await expect(deleteZikresource('zik-mine', 'user-123', deps)).resolves.not.toThrow();
    });

    describe('cloneZikresource', () => {
        it('should clone a zikresource created by another user', async () => {
            const original: Zikresource = {
                id: 'res-other',
                createdBy: 'other-user',
                url: 'https://youtube.com/watch?v=123',
                artist: 'Artist',
                title: 'Title',
                type: 'video',
                tags: [{ label: 'Rock', value: 'rock' }]
            };
            await deps.saveZikresource(original);

            const cloned = await cloneZikresource('res-other', 'user-123', deps);

            expect(cloned.id).toBeDefined();
            expect(cloned.id).not.toBe('res-other');
            expect(cloned.createdBy).toBe('user-123');
            expect(cloned.clonedFrom).toBe('res-other');
            expect(cloned.tags).toEqual([{ label: 'Rock', value: 'rock' }]);
        });

        it('should throw FORBIDDEN when cloning own zikresource', async () => {
            const original: Zikresource = {
                id: 'res-own',
                createdBy: 'user-123',
                url: 'https://youtube.com/watch?v=123',
                artist: 'Artist',
                title: 'Title',
                type: 'video'
            };
            await deps.saveZikresource(original);

            await expect(cloneZikresource('res-own', 'user-123', deps)).rejects.toThrow(
                'You already own this zikresource.'
            );
        });

        it('should throw CONFLICT when cloning a zikresource already cloned by the same user', async () => {
            const original: Zikresource = {
                id: 'res-other',
                createdBy: 'other-user',
                url: 'https://youtube.com/watch?v=123',
                artist: 'Artist',
                title: 'Title',
                type: 'video'
            };
            await deps.saveZikresource(original);

            // First clone succeeds
            await cloneZikresource('res-other', 'user-123', deps);

            // Second clone should throw 409 Conflict
            await expect(cloneZikresource('res-other', 'user-123', deps)).rejects.toThrow(
                'You have already added this resource to your Songbook.'
            );
        });

        it('should throw NOT_FOUND if the zikresource does not exist', async () => {
            await expect(cloneZikresource('non-existent', 'user-123', deps)).rejects.toThrow(
                'Zikresource with id non-existent not found'
            );
        });
    });

    describe('checkEmbeddability', () => {
        it('should return embeddable: true for YouTube URLs', async () => {
            const result = await checkEmbeddability('https://www.youtube.com/watch?v=dQw4w9WgXcQ', deps);
            expect(result).toEqual({ embeddable: true });
        });

        it('should return embeddable: true for Spotify URLs', async () => {
            const result = await checkEmbeddability('https://open.spotify.com/track/12345', deps);
            expect(result).toEqual({ embeddable: true });
        });

        it('should return embeddable: false for invalid URLs', async () => {
            const result = await checkEmbeddability('not-a-valid-url', deps);
            expect(result).toEqual({ embeddable: false });
        });
    });
});

