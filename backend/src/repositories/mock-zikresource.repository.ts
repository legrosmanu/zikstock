import { Zikresource } from '../models/zikresource.domain';
import { ZikresourceRepository } from './zikresource.repository';

export class MockZikresourceRepository implements ZikresourceRepository {
    private resources: Map<string, Zikresource> = new Map();

    async save(zikresource: Zikresource): Promise<Zikresource> {
        this.resources.set(zikresource.id, zikresource);
        return zikresource;
    }

    async findById(id: string): Promise<Zikresource | null> {
        return this.resources.get(id) || null;
    }

    async findAll(): Promise<Zikresource[]> {
        return Array.from(this.resources.values());
    }

    async update(zikresource: Zikresource): Promise<Zikresource> {
        this.resources.set(zikresource.id, zikresource);
        return zikresource;
    }

    async delete(id: string): Promise<void> {
        this.resources.delete(id);
    }
}
