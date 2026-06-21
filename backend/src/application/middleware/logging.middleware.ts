import pinoHttp from 'pino-http';
import { logger } from '../logger';

export const loggingMiddleware = pinoHttp({
    logger,
    // Remove "secret" information
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[REDACTED]'
    },
    customLogLevel: (req, res, err) => {
        if (res.statusCode === 401) return 'silent';
        if (res.statusCode >= 400 || err) return 'error';
        return 'silent';
    },
    serializers: {
        req: (req: any) => ({
            method: req.method,
            url: req.url,
        }),
        res: (res: any) => ({
            statusCode: res.statusCode
        })
    }
});
