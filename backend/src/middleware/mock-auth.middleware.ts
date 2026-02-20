import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from './auth.middleware';
import { AppError } from './error.middleware';
import { StatusCodes } from 'http-status-codes';

export const VALID_TOKEN = 'valid-test-token';
export const FAKE_USER = { sub: 'user-123', email: 'test@example.com' };

export class MockAuthMiddleware implements AuthMiddleware {
    public authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (token === VALID_TOKEN) {
            req.user = FAKE_USER;
            return next();
        }
        return next(new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
    };
}
