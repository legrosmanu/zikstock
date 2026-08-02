import { v4 as uuidv4 } from 'uuid';
import { Zikresource } from './zikresource.domain';
import {
    saveZikresource,
    findZikresourceById,
    findAllZikresources,
    updateZikresourceInDb,
    deleteZikresourceFromDb
} from '../repositories/firestore-zikresource.repository';
import { checkHttpFrameEmbeddability } from '../repositories/http-embeddability.repository';
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

export const getAllZikresources = async (userId?: string): Promise<Zikresource[]> => {
    return findAllZikresources(userId);
};

export const updateZikresource = async (id: string, partial: Omit<Zikresource, 'id'>): Promise<Zikresource> => {
    const existing = await findZikresourceById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
    }
    if (partial.createdBy !== existing?.createdBy) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to modify this zikresource.`);
    }
    const updated: Zikresource = {
        ...existing,
        ...partial,
        id,
    };
    return updateZikresourceInDb(updated);
};

export const deleteZikresource = async (id: string, userId: string): Promise<void> => {
    const existing = await findZikresourceById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this zikresource.`);
    }
    await deleteZikresourceFromDb(id);
};

const isKnownEmbeddablePlatform = (hostname: string, pathname: string): boolean => {
    const h = hostname.toLowerCase().replace('www.', '');
    if (h.includes('youtube.com') || h.includes('youtu.be')) return true;
    if (h.includes('spotify.com')) return true;
    if (h.includes('vimeo.com')) return true;
    if (h.includes('drive.google.com') && pathname.includes('/file/d/')) return true;
    if (h.includes('soundcloud.com')) return true;
    return false;
};

export const checkEmbeddability = async (urlStr: string): Promise<{ embeddable: boolean }> => {
    try {
        const url = new URL(urlStr);
        if (isKnownEmbeddablePlatform(url.hostname, url.pathname)) {
            return { embeddable: true };
        }

        const canFrame = await checkHttpFrameEmbeddability(urlStr);
        return { embeddable: canFrame };
    } catch {
        return { embeddable: false };
    }
};



