import {
    createZikresource,
    getZikresourceById,
    getAllZikresources,
    updateZikresource,
    deleteZikresource
} from './zikresource.service';
import { Zikresource } from '../models/zikresource.domain';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../repositories/firestore-zikresource.repository', () => {
    let resources: Map<string, Zikresource> = new Map();
    return {
        saveZikresource: jest.fn(async (zikresource: Zikresource) => {
            resources.set(zikresource.id, zikresource);
            return zikresource;
        }),
        findZikresourceById: jest.fn(async (id: string) => {
            return resources.get(id) || null;
        }),
        findAllZikresources: jest.fn(async () => {
            return Array.from(resources.values());
        }),
        updateZikresourceInDb: jest.fn(async (zikresource: Zikresource) => {
            resources.set(zikresource.id, zikresource);
            return zikresource;
        }),
        deleteZikresourceFromDb: jest.fn(async (id: string) => {
            resources.delete(id);
        }),
        _clearMock: () => {
            resources.clear();
        }
    };
});

import * as repo from '../repositories/firestore-zikresource.repository';

describe('ZikresourceService', () => {

    beforeEach(() => {
        (repo as any)._clearMock();
        jest.clearAllMocks();
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
});
