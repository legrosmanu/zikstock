import { Request, Response, NextFunction } from 'express';
import {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong
} from '../domain/song.service';
import { SongSchema, SongResponse, SongIdParamSchema, UserPayloadSchema } from './song.dto';
import { Song } from '../domain/song.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';

const toResponse = (domain: Song): SongResponse => ({
    _id: domain.id,
    title: domain.title,
    artist: domain.artist,
    zikresourceIds: domain.zikresourceIds,
    createdBy: domain.createdBy,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
});

export const createSongHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = SongSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const domainModel = await createSong({ ...validation.data, createdBy });
        res.status(StatusCodes.CREATED).json(toResponse(domainModel));
    } catch (error) {
        next(error);
    }
};

export const getAllSongsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await getAllSongs(createdBy);
        res.json(result.map(toResponse));
    } catch (error) {
        next(error);
    }
};

export const getSongByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = SongIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await getSongById(paramValidation.data.id, createdBy);
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const updateSongHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = SongIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const validation = SongSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const result = await updateSong(paramValidation.data.id, { ...validation.data, createdBy });
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const deleteSongHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramValidation = SongIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${paramValidation.error.message}`);
        }
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        await deleteSong(paramValidation.data.id, createdBy);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

