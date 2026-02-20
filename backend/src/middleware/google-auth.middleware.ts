import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithoutRequest } from 'passport-jwt';
import jwksRsa from 'jwks-rsa';
import { AppError } from './error.middleware';
import { StatusCodes } from 'http-status-codes';
import { AuthMiddleware } from './auth.middleware';

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
        interface User extends JwtPayload { }
    }
}

export class GoogleAuthMiddleware implements AuthMiddleware {
    constructor() {
        this.initializeStrategy();
    }

    private initializeStrategy(): void {
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
    }

    /**
     * Middleware that verifies the Google ID token sent in the Authorization header.
     * Returns 401 if the token is missing or invalid.
     */
    public authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
        passport.authenticate('google-jwt', { session: false }, (err: unknown, user: Express.User | false) => {
            if (err || !user) {
                return next(new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
            }
            req.user = user;
            next();
        })(req, res, next);
    };
}
