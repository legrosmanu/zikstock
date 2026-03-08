import { Request, Response, NextFunction } from 'express';
import {
    createZikresource,
    getAllZikresources,
    getZikresourceById,
    updateZikresource,
    deleteZikresource
} from '../services/zikresource.service';
import { ZikresourceSchema, ZikresourceResponse } from './zikresource.dto';
import { Zikresource } from '../models/zikresource.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';

const toResponse = (domain: Zikresource): ZikresourceResponse => ({
    _id: domain.id,
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
        const domainModel = await createZikresource(validation.data);
        res.status(StatusCodes.CREATED).json(toResponse(domainModel));
    } catch (error) {
        next(error);
    }
};

export const getAllZikresourcesHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAllZikresources();
        res.json(result.map(toResponse));
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
        const result = await updateZikresource(req.params.id as string, validation.data);
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const deleteZikresourceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteZikresource(req.params.id as string);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};
