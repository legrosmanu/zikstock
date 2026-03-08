import { Zikresource } from '../models/zikresource.domain';

const resources: Map<string, Zikresource> = new Map();

export const saveZikresource = async (zikresource: Zikresource): Promise<Zikresource> => {
    resources.set(zikresource.id, zikresource);
    return zikresource;
};

export const findZikresourceById = async (id: string): Promise<Zikresource | null> => {
    return resources.get(id) || null;
};

export const findAllZikresources = async (): Promise<Zikresource[]> => {
    return Array.from(resources.values());
};

export const updateZikresourceInDb = async (zikresource: Zikresource): Promise<Zikresource> => {
    resources.set(zikresource.id, zikresource);
    return zikresource;
};

export const deleteZikresourceFromDb = async (id: string): Promise<void> => {
    resources.delete(id);
};

export const clearMockZikresources = (): void => {
    resources.clear();
};
