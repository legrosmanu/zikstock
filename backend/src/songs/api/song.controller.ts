import { Request, Response, NextFunction } from 'express';
import {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong
} from '../domain/song.service';
import { SongSchema, SongResponse } from './song.dto';
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
        const createdBy = req.user?.sub;
        if (!createdBy) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        const domainModel = await createSong({ ...validation.data, createdBy });
        res.status(StatusCodes.CREATED).json(toResponse(domainModel));
    } catch (error) {
        next(error);
    }
};

export const getAllSongsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdBy = req.user?.sub;
        const result = await getAllSongs(createdBy);
        res.json(result.map(toResponse));
    } catch (error) {
        next(error);
    }
};

export const getSongByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdBy = req.user?.sub;
        const result = await getSongById(req.params.id as string, createdBy);
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const updateSongHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = SongSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }
        const createdBy = req.user?.sub;
        if (!createdBy) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        const result = await updateSong(req.params.id as string, { ...validation.data, createdBy });
        res.json(toResponse(result));
    } catch (error) {
        next(error);
    }
};

export const deleteSongHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdBy = req.user?.sub;
        if (!createdBy) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }
        await deleteSong(req.params.id as string, createdBy);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};
