import pinoHttp from 'pino-http';
import { logger } from '../logger';

export const loggingMiddleware = pinoHttp({
    logger,
    // Masquer les informations sensibles
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[REDACTED]'
    },
    // Déterminer le niveau de log : 'silent' pour les succès (pas de log), 'error' pour les erreurs
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 400 || err) return 'error';
        return 'silent';
    },
    // Personnaliser ce qui est loggué pour éviter la surcharge d'informations
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
