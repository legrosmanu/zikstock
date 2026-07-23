import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import {
    createZikresourceHandler,
    getAllZikresourcesHandler,
    getZikresourceByIdHandler,
    updateZikresourceHandler,
    deleteZikresourceHandler
} from './zikresources/api/zikresource.controller';
import {
    createSongHandler,
    getAllSongsHandler,
    getSongByIdHandler,
    updateSongHandler,
    deleteSongHandler
} from './songs/api/song.controller';
import {
    createPlaylistHandler,
    getAllPlaylistsHandler,
    getPlaylistByIdHandler,
    updatePlaylistHandler,
    deletePlaylistHandler
} from './playlists/api/playlist.controller';
import { healthCheck } from './application/health.controller';
import { errorMiddleware } from './application/middleware/error.middleware';
import { loggingMiddleware } from './application/middleware/logging.middleware';
import { logger } from './application/logger';
import {
    initializeGoogleAuthStrategy,
    authMiddleware
} from './application/middleware/google-auth.middleware';
import {
    syncMeHandler,
    searchUsersHandler
} from './users/api/user.controller';
import {
    requestConnectionHandler,
    acceptConnectionHandler,
    deleteConnectionHandler,
    listNetworkHandler
} from './connections/api/connection.controller';
import {
    loginHandler,
    refreshHandler,
    logoutHandler
} from './auth/api/auth.controller';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);

// CORS Middleware to support development and production frontend API requests with credentials
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin) {
        const allowedOrigins = [
            'http://localhost',
            'http://127.0.0.1',
            process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : ''
        ].filter(Boolean);

        let isAllowed = false;
        for (const allowed of allowedOrigins) {
            if (origin === allowed || origin.startsWith(`${allowed}:`) || origin.startsWith(allowed)) {
                isAllowed = true;
                break;
            }
        }

        // When requests carry credentials (cookies), Access-Control-Allow-Origin MUST match exact origin
        // and cannot use wildcard '*'. Reflect the origin if allowed or if FRONTEND_URL is unconfigured.
        if (isAllowed || !process.env.FRONTEND_URL) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

// Initialize authentication strategy
initializeGoogleAuthStrategy();

app.get('/health', healthCheck);

// Auth Routes (public)
app.post('/auth/login', loginHandler);
app.post('/auth/refresh', refreshHandler);
app.post('/auth/logout', logoutHandler);

// Zikresource Routes (protected)
app.post('/zikresources', authMiddleware, createZikresourceHandler);
app.get('/zikresources', authMiddleware, getAllZikresourcesHandler);
app.get('/zikresources/:id', authMiddleware, getZikresourceByIdHandler);
app.put('/zikresources/:id', authMiddleware, updateZikresourceHandler);
app.delete('/zikresources/:id', authMiddleware, deleteZikresourceHandler);

// Song Routes (protected)
app.post('/songs', authMiddleware, createSongHandler);
app.get('/songs', authMiddleware, getAllSongsHandler);
app.get('/songs/:id', authMiddleware, getSongByIdHandler);
app.put('/songs/:id', authMiddleware, updateSongHandler);
app.delete('/songs/:id', authMiddleware, deleteSongHandler);

// Playlist Routes (protected)
app.post('/playlists', authMiddleware, createPlaylistHandler);
app.get('/playlists', authMiddleware, getAllPlaylistsHandler);
app.get('/playlists/:id', authMiddleware, getPlaylistByIdHandler);
app.put('/playlists/:id', authMiddleware, updatePlaylistHandler);
app.delete('/playlists/:id', authMiddleware, deletePlaylistHandler);

// User Routes (protected)
app.post('/users/me', authMiddleware, syncMeHandler);
app.get('/users', authMiddleware, searchUsersHandler);

// Connection Routes (protected)
app.post('/connections', authMiddleware, requestConnectionHandler);
app.get('/connections', authMiddleware, listNetworkHandler);
app.put('/connections/:id', authMiddleware, acceptConnectionHandler);
app.delete('/connections/:id', authMiddleware, deleteConnectionHandler);

// Global Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
