import { Request, Response, NextFunction } from 'express';
import {
    requestConnection,
    acceptConnectionRequest,
    removeConnection,
    listNetwork
} from '../domain/connection.service';
import { ConnectionRequestSchema } from './connection.dto';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../application/middleware/error.middleware';

export const requestConnectionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const requesterId = req.user?.sub;
        if (!requesterId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const validation = ConnectionRequestSchema.safeParse(req.body);
        if (!validation.success) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Validation failed: ${validation.error.message}`);
        }

        const conn = await requestConnection(requesterId, validation.data.receiverId);
        res.status(StatusCodes.CREATED).json(conn);
    } catch (error) {
        next(error);
    }
};

export const acceptConnectionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const { id } = req.params;
        if (!id) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Connection ID is required');
        }

        const conn = await acceptConnectionRequest(id as string, userId);
        res.status(StatusCodes.OK).json(conn);
    } catch (error) {
        next(error);
    }
};

export const deleteConnectionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const { id } = req.params;
        if (!id) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Connection ID is required');
        }

        await removeConnection(id as string, userId);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        next(error);
    }
};

export const listNetworkHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            throw new AppError(StatusCodes.UNAUTHORIZED, 'User identity is missing from token');
        }

        const network = await listNetwork(userId);
        res.status(StatusCodes.OK).json(network);
    } catch (error) {
        next(error);
    }
};
