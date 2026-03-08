import { v4 as uuidv4 } from 'uuid';
import { Zikresource } from '../models/zikresource.domain';
import {
    saveZikresource,
    findZikresourceById,
    findAllZikresources,
    updateZikresourceInDb,
    deleteZikresourceFromDb
} from '../repositories/firestore-zikresource.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export const createZikresource = async (partial: Omit<Zikresource, 'id'>): Promise<Zikresource> => {
    const zikresource: Zikresource = {
        id: uuidv4(),
        ...partial,
    };
    return saveZikresource(zikresource);
};

export const getZikresourceById = async (id: string): Promise<Zikresource> => {
    const zikresource = await findZikresourceById(id);
    if (!zikresource) {
        throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
    }
    return zikresource;
};

export const getAllZikresources = async (): Promise<Zikresource[]> => {
    return findAllZikresources();
};

export const updateZikresource = async (id: string, partial: Omit<Zikresource, 'id'>): Promise<Zikresource> => {
    const existing = await findZikresourceById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
    }
    const updated: Zikresource = {
        ...existing,
        ...partial,
        id,
    };
    return updateZikresourceInDb(updated);
};

export const deleteZikresource = async (id: string): Promise<void> => {
    const existing = await findZikresourceById(id);
    if (!existing) {
        return;
    }
    await deleteZikresourceFromDb(id);
};
