import 'dotenv/config';
import express from 'express';
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



const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(loggingMiddleware);

// CORS Middleware to support development frontend API requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

// Initialize authentication strategy
initializeGoogleAuthStrategy();

app.get('/health', healthCheck);

// Zikresource Routes (protected — requires a valid Google ID token)
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



// Global Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
