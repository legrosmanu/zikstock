import { ZikresourceService } from '../src/services/zikresource.service';
import { MockZikresourceRepository } from '../src/repositories/mock-zikresource.repository';
import { Zikresource } from '../src/models/zikresource.domain';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ZikresourceService', () => {
    const repository = new MockZikresourceRepository();
    const service = new ZikresourceService(repository);

    beforeEach(() => {
        repository.clear();
    });

    it('should create a zikresource', async () => {
        const partial: Omit<Zikresource, 'id'> = {
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
        };

        const result = await service.create(partial);

        expect(result.id).toBeDefined();
        expect(result.url).toBe(partial.url);
        expect(result.artist).toBe(partial.artist);
        expect(result.title).toBe(partial.title);
    });

    it('should get a zikresource by id', async () => {
        const saved = await repository.save({
            id: '123',
            url: 'https://example.com',
            artist: 'Test Artist',
            title: 'Test Title',
        });

        const result = await service.getById('123');

        expect(result.id).toBe('123');
        expect(result.url).toBe(saved.url);
    });

    it('should throw error if zikresource not found on getById', async () => {
        await expect(service.getById('non-existent')).rejects.toThrow('Zikresource with id non-existent not found');
    });

    it('should not throw error if zikresource not found on delete', async () => {
        await expect(service.delete('non-existent')).resolves.not.toThrow();
    });

    it('should get all zikresources', async () => {
        await repository.save({ id: '1', url: 'u1', artist: 'a1', title: 't1' });
        await repository.save({ id: '2', url: 'u2', artist: 'a2', title: 't2' });

        const result = await service.getAll();

        expect(result).toHaveLength(2);
    });
});
