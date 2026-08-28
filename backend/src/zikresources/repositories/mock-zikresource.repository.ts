import { Zikresource } from '../domain/zikresource.domain';

const resources: Map<string, Zikresource> = new Map();

export const saveZikresource = async (zikresource: Zikresource): Promise<Zikresource> => {
    resources.set(zikresource.id, zikresource);
    return zikresource;
};

export const findZikresourceById = async (id: string): Promise<Zikresource | null> => {
    return resources.get(id) || null;
};

export const findAllZikresources = async (userId?: string): Promise<Zikresource[]> => {
    const all = Array.from(resources.values());
    if (userId) {
        return all.filter(r => r.createdBy === userId);
    }
    return all;
};

export const findZikresourceByClonedFromAndUser = async (clonedFrom: string, userId: string): Promise<Zikresource | null> => {
    const all = Array.from(resources.values());
    return all.find(r => r.clonedFrom === clonedFrom && r.createdBy === userId) || null;
};

export const updateZikresourceInDb = async (zikresource: Zikresource): Promise<Zikresource> => {
    resources.set(zikresource.id, zikresource);
    return zikresource;
};

export const deleteZikresourceFromDb = async (id: string): Promise<void> => {
    resources.delete(id);
};

export const clearData = (): void => {
    resources.clear();
};

