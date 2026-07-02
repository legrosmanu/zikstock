import { Request, Response, NextFunction } from 'express';
import {
    createPlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist
} from '../domain/playlist.service';
import { PlaylistSchema, PlaylistResponse, PlaylistIdParamSchema, UserPayloadSchema } from './playlist.dto';
import { Playlist } from '../domain/playlist.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';

const toResponse = (domain: Playlist): PlaylistResponse => ({
    _id: domain.id,
    name: domain.name,
    description: domain.description,
    songIds: domain.songIds,
    zikresourceIds: domain.zikresourceIds || [],
    createdBy: domain.createdBy,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
});

export const createPlaylistHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = PlaylistSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const domainModel = await createPlaylist({ ...validation.data, createdBy });
        res.status(StatusCodes.CREATED).json(toResponse(domainModel));
    } catch (error) {
        next(error);
    }
};

export const getAllPlaylistsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await getAllPlaylists(createdBy);
        res.json(result.map(toResponse));
    } catch (error) {
        next(error);
    }
};

export const getPlaylistByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = PlaylistIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await getPlaylistById(paramValidation.data.id, createdBy);
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const updatePlaylistHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = PlaylistIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const validation = PlaylistSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await updatePlaylist(paramValidation.data.id, { ...validation.data, createdBy });
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const deletePlaylistHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = PlaylistIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        await deletePlaylist(paramValidation.data.id, createdBy);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

