import { v4 as uuidv4 } from 'uuid';
import { Zikresource } from '../models/zikresource.domain';
import { ZikresourceRepository } from '../repositories/zikresource.repository';
import { AppError } from '../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export class ZikresourceService {
    constructor(private zikresourceRepository: ZikresourceRepository) { }

    async create(partial: Omit<Zikresource, 'id'>): Promise<Zikresource> {
        const zikresource: Zikresource = {
            id: uuidv4(),
            ...partial,
        };
        return this.zikresourceRepository.save(zikresource);
    }

    async getById(id: string): Promise<Zikresource> {
        const zikresource = await this.zikresourceRepository.findById(id);
        if (!zikresource) {
            throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
        }
        return zikresource;
    }

    async getAll(): Promise<Zikresource[]> {
        return this.zikresourceRepository.findAll();
    }

    async update(id: string, partial: Omit<Zikresource, 'id'>): Promise<Zikresource> {
        const existing = await this.zikresourceRepository.findById(id);
        if (!existing) {
            throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
        }
        const updated: Zikresource = {
            ...existing,
            ...partial,
            id,
        };
        return this.zikresourceRepository.save(updated);
    }

    async delete(id: string): Promise<void> {
        const existing = await this.zikresourceRepository.findById(id);
        if (!existing) {
            return;
        }
        await this.zikresourceRepository.delete(id);
    }
}
