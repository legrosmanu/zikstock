import {
    createZikresource,
    getZikresourceById,
    getAllZikresources,
    updateZikresource,
    deleteZikresource
} from './zikresource.service';
import { Zikresource } from '../models/zikresource.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import * as mockRepo from '../repositories/mock-zikresource.repository';
import * as repo from '../repositories/firestore-zikresource.repository';

jest.mock('../repositories/firestore-zikresource.repository');

describe('ZikresourceService', () => {

    beforeEach(() => {
        mockRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(repo.saveZikresource).mockImplementation(mockRepo.saveZikresource);
        jest.mocked(repo.findZikresourceById).mockImplementation(mockRepo.findZikresourceById);
        jest.mocked(repo.findAllZikresources).mockImplementation(mockRepo.findAllZikresources);
        jest.mocked(repo.updateZikresourceInDb).mockImplementation(mockRepo.updateZikresourceInDb);
        jest.mocked(repo.deleteZikresourceFromDb).mockImplementation(mockRepo.deleteZikresourceFromDb);
    });

    it('should create a zikresource', async () => {
        const partial: Omit<Zikresource, 'id'> = {
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: []
        };

        const result = await createZikresource(partial);

        expect(result.id).toBeDefined();
        expect(result.url).toBe(partial.url);
        expect(result.artist).toBe(partial.artist);
        expect(result.title).toBe(partial.title);
        expect(repo.saveZikresource).toHaveBeenCalledWith(expect.objectContaining(partial));
    });

    it('should get a zikresource by id', async () => {
        const zikresource: Zikresource = {
            id: '123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
            type: 'video',
            tags: []
        };
        await repo.saveZikresource(zikresource);

        const result = await getZikresourceById('123');

        expect(result.id).toBe('123');
        expect(result.url).toBe(zikresource.url);
    });

    it('should throw error if zikresource not found on getById', async () => {
        await expect(getZikresourceById('non-existent')).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should not throw error if zikresource not found on delete', async () => {
        await expect(deleteZikresource('non-existent')).resolves.not.toThrow();
    });

    it('should get all zikresources', async () => {
        await repo.saveZikresource({ id: '1', url: 'u1', artist: 'a1', title: 't1', type: 'video', tags: [] });
        await repo.saveZikresource({ id: '2', url: 'u2', artist: 'a2', title: 't2', type: 'video', tags: [] });

        const result = await getAllZikresources();

        expect(result).toHaveLength(2);
    });

    it('should update a zikresource', async () => {
        const id = '123';
        const original: Zikresource = {
            id,
            url: 'https://example.com/old',
            artist: 'Old Artist',
            title: 'Old Title',
            type: 'video',
            tags: [{ label: 'TO_PLAY', value: 'old' }]
        };
        await repo.saveZikresource(original);

        const updates: Omit<Zikresource, 'id'> = {
            url: 'https://example.com/new',
            artist: 'New Artist',
            title: 'New Title',
            type: 'audio',
            tags: [{ label: 'TO_PLAY', value: 'new' }]
        };

        const result = await updateZikresource(id, updates);

        expect(result.id).toBe(id);
        expect(result.url).toBe(updates.url);
        expect(result.artist).toBe(updates.artist);
        expect(result.title).toBe(updates.title);
        expect(result.type).toBe(updates.type);
        expect(result.tags).toEqual(updates.tags);
        expect(repo.updateZikresourceInDb).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it('should throw error if zikresource not found on update', async () => {
        const updates: Omit<Zikresource, 'id'> = {
            url: 'https://example.com/new',
            artist: 'New Artist',
            title: 'New Title',
            type: 'audio',
            tags: [{ label: 'TO_PLAY', value: 'new' }]
        };
        await expect(updateZikresource('non-existent', updates)).rejects.toThrow('Zikresource with id non-existent not found');
    });
});
