import { Request, Response, NextFunction } from 'express';
import {
    createSong,
    getAllSongs,
    getSongById,
    updateSong,
    deleteSong,
    cloneSong
} from '../domain/song.service';
import { SongSchema, SongResponse, SongIdParamSchema, UserPayloadSchema } from './song.dto';
import { Song } from '../domain/song.domain';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';
import { getFilterUserId } from '../../application/query.utils';
import { withCreators } from '../../application/enrichment.utils';

const toResponse = (domain: Song): SongResponse => ({
    _id: domain.id,
    title: domain.title,
    artist: domain.artist,
    zikresourceIds: domain.zikresourceIds,
    createdBy: domain.createdBy,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
    clonedFrom: domain.clonedFrom,
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

export const getMySongsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userValidation = UserPayloadSchema.safeParse(req.user);
        if (!userValidation.success) {
            throw new AppError(StatusCodes.UNAUTHORIZED, `User identity validation failed: ${userValidation.error.message}`);
        }
        const createdBy = userValidation.data.sub;
        const songs = await getAllSongs(createdBy);
        res.json(await withCreators(songs.map(toResponse)));
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
        
        const filterUserId = getFilterUserId({
            scope: req.query.scope as string,
            createdBy: req.query.createdBy as string,
            currentUserId: createdBy,
        });

        const songs = await getAllSongs(filterUserId);
        res.json(await withCreators(songs.map(toResponse)));
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
        const result = await getSongById(paramValidation.data.id);
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

export const cloneSongHandler = async (req: Request, res: Response, next: NextFunction) => {
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
        const result = await cloneSong(paramValidation.data.id, createdBy);
        res.status(StatusCodes.CREATED).json({
            song: toResponse(result.song),
            clonedResources: result.clonedResources.map(r => ({
                _id: r.id,
                createdBy: r.createdBy,
                url: r.url,
                artist: r.artist,
                title: r.title,
                type: r.type,
                tags: r.tags,
                clonedFrom: r.clonedFrom,
            }))
        });
    } catch (error) {
        next(error);
    }
};


