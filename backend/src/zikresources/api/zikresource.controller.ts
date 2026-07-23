import { Request, Response, NextFunction } from 'express';
import {
    createZikresource,
    getAllZikresources,
    getZikresourceById,
    updateZikresource,
    deleteZikresource
} from '../domain/zikresource.service';
import { ZikresourceSchema, ZikresourceResponse } from './zikresource.dto';
import { Zikresource } from '../domain/zikresource.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';
import { findUsersByIds } from '../../users/repositories/firestore-user.repository';
import { getFilterUserId } from '../../application/query.utils';


const toResponse = (domain: Zikresource): ZikresourceResponse => ({
    _id: domain.id,
    createdBy: domain.createdBy,
    url: domain.url,
    artist: domain.artist,
    title: domain.title,
    type: domain.type,
    tags: domain.tags,
});


export const createZikresourceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = ZikresourceSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const createdBy = req.user?.sub;
        if (!createdBy) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        const domainModel = await createZikresource({ ...validation.data, createdBy });
        res.status(StatusCodes.CREATED).json(toResponse(domainModel));
    } catch (error) {
        next(error);
    }
};

export const getAllZikresourcesHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filterUserId = getFilterUserId({
            scope: req.query.scope as string,
            createdBy: req.query.createdBy as string,
            currentUserId: req.user?.sub,
        });

        const result = await getAllZikresources(filterUserId);
        
        const creatorIds = Array.from(new Set(result.map(r => r.createdBy)));
        const creators = await findUsersByIds(creatorIds);
        const creatorMap = new Map(creators.map(u => [u.id, u]));

        const responseList = result.map(item => {
            const creator = creatorMap.get(item.createdBy);
            return {
                ...toResponse(item),
                creatorName: creator?.name,
                creatorPicture: creator?.picture
            };
        });

        res.json(responseList);
    } catch (error) {
        next(error);
    }
};

export const getZikresourceByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getZikresourceById(req.params.id as string);
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const updateZikresourceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = ZikresourceSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const createdBy = req.user?.sub;
        if (!createdBy) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        const result = await updateZikresource(req.params.id as string, { ...validation.data, createdBy });
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const deleteZikresourceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        await deleteZikresource(req.params.id as string, userId);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};
