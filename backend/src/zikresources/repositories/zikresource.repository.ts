import { Zikresource } from '../models/zikresource.domain';

export interface ZikresourceRepository {
    save(zikresource: Zikresource): Promise<Zikresource>;
    findById(id: string): Promise<Zikresource | null>;
    findAll(): Promise<Zikresource[]>;
    update(zikresource: Zikresource): Promise<Zikresource>;
    delete(id: string): Promise<void>;
}
