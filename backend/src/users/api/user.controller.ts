import { Request, Response, NextFunction } from 'express';
import { syncUser, searchMusicians } from '../domain/user.service';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';

export const syncMeHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const payload = req.user;
        if (!payload || !payload.sub) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const synced = await syncUser({
            id: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
            picture: (payload.picture as string) || undefined,
        });

        res.status(StatusCodes.OK).json(synced);
    } catch (error) {
        next(error);
    }
};

export const searchUsersHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUserId = req.user?.sub;
        if (!currentUserId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const query = req.query.q as string || '';
        const results = await searchMusicians(query, currentUserId);

        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};
