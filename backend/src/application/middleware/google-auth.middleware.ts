import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import jwksRsa from 'jwks-rsa';
import { AppError } from './error.middleware';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../../auth/domain/auth.service';

export interface JwtPayload {
    sub: string;
    email?: string;
    name?: string;
    [key: string]: unknown;
}

// Augment Express Request to expose the decoded JWT payload
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface User extends JwtPayload { }
    }
}

export const initializeGoogleAuthStrategy = (): void => {
    const jwtOptions: StrategyOptionsWithoutRequest = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKeyProvider: jwksRsa.passportJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
        }),
        audience: process.env.GOOGLE_CLIENT_ID,
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
        algorithms: ['RS256'],
    };

    passport.use('google-jwt', new JwtStrategy(jwtOptions, (payload: JwtPayload, done) => {
        return done(null, payload);
    }));
};

/**
 * Middleware that verifies the Zikstock Access Token sent in Authorization header.
 * Falls back to Google ID Token validation if needed.
 * Returns 401 if missing or invalid.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
    }

    const token = authHeader.slice(7);

    // 1. Try verifying as Zikstock Access Token
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        return next();
    } catch {
        // Not a valid Zikstock Access Token, fallback to Google ID token verification
    }

    // 2. Fallback to Google ID Token verification
    passport.authenticate('google-jwt', { session: false }, (err: unknown, user: Express.User | false) => {
        if (err || !user) {
            return next(new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
        }
        req.user = user;
        next();
    })(req, res, next);
};
