import { v4 as uuidv4 } from 'uuid';
import { Zikresource } from './zikresource.domain';
import * as firestoreZikresourceRepo from '../repositories/firestore-zikresource.repository';
import { checkHttpFrameEmbeddability as checkHttpFrameEmbeddabilityRepo } from '../repositories/http-embeddability.repository';
import { AppError } from '../../application/middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';

export interface ZikresourceDependencies {
    saveZikresource: (res: Zikresource) => Promise<Zikresource>;
    findZikresourceById: (id: string) => Promise<Zikresource | null>;
    findZikresourceByClonedFromAndUser: (clonedFrom: string, userId: string) => Promise<Zikresource | null>;
    findAllZikresources: (userId?: string) => Promise<Zikresource[]>;
    updateZikresourceInDb: (res: Zikresource) => Promise<Zikresource>;
    deleteZikresourceFromDb: (id: string) => Promise<void>;
    checkHttpFrameEmbeddability: (urlStr: string) => Promise<boolean>;
}

export const defaultZikresourceDeps: ZikresourceDependencies = {
    saveZikresource: firestoreZikresourceRepo.saveZikresource,
    findZikresourceById: firestoreZikresourceRepo.findZikresourceById,
    findZikresourceByClonedFromAndUser: firestoreZikresourceRepo.findZikresourceByClonedFromAndUser,
    findAllZikresources: firestoreZikresourceRepo.findAllZikresources,
    updateZikresourceInDb: firestoreZikresourceRepo.updateZikresourceInDb,
    deleteZikresourceFromDb: firestoreZikresourceRepo.deleteZikresourceFromDb,
    checkHttpFrameEmbeddability: checkHttpFrameEmbeddabilityRepo,
};

export const createZikresource = async (
    partial: Omit<Zikresource, 'id'>,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource> => {
    const zikresource: Zikresource = {
        id: uuidv4(),
        ...partial,
    };
    return deps.saveZikresource(zikresource);
};

export const findZikresourceById = async (
    id: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource | null> => {
    return deps.findZikresourceById(id);
};

export const findZikresourceByClonedFromAndUser = async (
    clonedFrom: string,
    userId: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource | null> => {
    return deps.findZikresourceByClonedFromAndUser(clonedFrom, userId);
};

export const getZikresourceById = async (
    id: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource> => {
    const zikresource = await deps.findZikresourceById(id);
    if (!zikresource) {
        throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
    }
    return zikresource;
};

export const getAllZikresources = async (
    userId?: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource[]> => {
    return deps.findAllZikresources(userId);
};

export const updateZikresource = async (
    id: string,
    partial: Omit<Zikresource, 'id'>,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource> => {
    const existing = await deps.findZikresourceById(id);
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
    return deps.updateZikresourceInDb(updated);
};

export const deleteZikresource = async (
    id: string,
    userId: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<void> => {
    const existing = await deps.findZikresourceById(id);
    if (!existing) {
        return;
    }
    if (existing.createdBy !== userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You do not have permission to delete this zikresource.`);
    }
    await deps.deleteZikresourceFromDb(id);
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

export const checkEmbeddability = async (
    urlStr: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<{ embeddable: boolean }> => {
    try {
        const url = new URL(urlStr);
        if (isKnownEmbeddablePlatform(url.hostname, url.pathname)) {
            return { embeddable: true };
        }

        const canFrame = await deps.checkHttpFrameEmbeddability(urlStr);
        return { embeddable: canFrame };
    } catch {
        return { embeddable: false };
    }
};

export const cloneZikresource = async (
    id: string,
    userId: string,
    deps: ZikresourceDependencies = defaultZikresourceDeps
): Promise<Zikresource> => {
    const existing = await deps.findZikresourceById(id);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, `Zikresource with id ${id} not found`);
    }
    if (existing.createdBy === userId) {
        throw new AppError(StatusCodes.FORBIDDEN, `You already own this zikresource.`);
    }
    const alreadyCloned = await deps.findZikresourceByClonedFromAndUser(id, userId);
    if (alreadyCloned) {
        throw new AppError(StatusCodes.CONFLICT, `You have already added this resource to your Songbook.`);
    }
    const cloned: Zikresource = {
        id: uuidv4(),
        createdBy: userId,
        url: existing.url,
        artist: existing.artist,
        title: existing.title,
        type: existing.type,
        clonedFrom: existing.id,
    };
    if (existing.tags && existing.tags.length > 0) {
        cloned.tags = [...existing.tags];
    }
    return deps.saveZikresource(cloned);
};




