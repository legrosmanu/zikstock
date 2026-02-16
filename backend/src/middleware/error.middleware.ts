import { Request, Response, NextFunction } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
}

export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'AppError';
    }
}

export const errorMiddleware = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const status = error instanceof AppError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || 'An unexpected error occurred';
    const errorPhrase = getReasonPhrase(status);

    const errorResponse: ApiError = {
        timestamp: new Date().toISOString(),
        status,
        error: errorPhrase,
        message,
    };

    res.status(status).json(errorResponse);
};
