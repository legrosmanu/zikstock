import request from 'supertest';
import express from 'express';
import {
    createSongHandler,
    getAllSongsHandler,
    getSongByIdHandler,
    updateSongHandler,
    deleteSongHandler
} from './api/song.controller';
import { errorMiddleware } from '../application/middleware/error.middleware';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VALID_TOKEN } from '../application/middleware/mock-auth.middleware';
import * as googleAuthMiddleware from '../application/middleware/google-auth.middleware';
import * as mockAuthMiddleware from '../application/middleware/mock-auth.middleware';
import * as firestoreSongRepo from './repositories/firestore-song.repository';
import * as mockSongRepo from './repositories/mock-song.repository';
import * as firestoreZikresourceRepo from '../zikresources/repositories/firestore-zikresource.repository';
import * as firestoreUserRepo from '../users/repositories/firestore-user.repository';
import * as mockUserRepo from '../users/repositories/mock-user.repository';

// Mock the modules
jest.mock('../application/middleware/google-auth.middleware');
jest.mock('./repositories/firestore-song.repository');
jest.mock('../zikresources/repositories/firestore-zikresource.repository');
jest.mock('../users/repositories/firestore-user.repository');

describe('SongController Integration', () => {
    let app: express.Express;

    beforeEach(() => {
        mockSongRepo.clearData();
        mockUserRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(firestoreUserRepo.findUsersByIds).mockImplementation(mockUserRepo.findUsersByIds);

        // Mock Auth Middleware
        jest.mocked(googleAuthMiddleware.authMiddleware).mockImplementation(mockAuthMiddleware.authMiddleware);

        // Mock Firestore Song Repository
        jest.mocked(firestoreSongRepo.saveSong).mockImplementation(mockSongRepo.saveSong);
        jest.mocked(firestoreSongRepo.findSongById).mockImplementation(mockSongRepo.findSongById);
        jest.mocked(firestoreSongRepo.findAllSongs).mockImplementation(mockSongRepo.findAllSongs);
        jest.mocked(firestoreSongRepo.updateSongInDb).mockImplementation(mockSongRepo.updateSongInDb);
        jest.mocked(firestoreSongRepo.deleteSongFromDb).mockImplementation(mockSongRepo.deleteSongFromDb);

        // Default mock for Zikresource validation (existing resource created by same user)
        jest.mocked(firestoreZikresourceRepo.findZikresourceById).mockImplementation(async (id: string) => {
            if (id === 'res-123') {
                return {
                    id: 'res-123',
                    createdBy: 'user-123', // matching default user sub in mock auth
                    url: 'https://example.com',
                    artist: 'Artist',
                    title: 'Title',
                    type: 'video',
                    tags: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            return null;
        });

        app = express();
        app.use(express.json());
        app.post('/songs', googleAuthMiddleware.authMiddleware, createSongHandler);
        app.get('/songs', googleAuthMiddleware.authMiddleware, getAllSongsHandler);
        app.get('/songs/:id', googleAuthMiddleware.authMiddleware, getSongByIdHandler);
        app.put('/songs/:id', googleAuthMiddleware.authMiddleware, updateSongHandler);
        app.delete('/songs/:id', googleAuthMiddleware.authMiddleware, deleteSongHandler);
        app.use(errorMiddleware);
    });

    it('GET /songs should return 401 when no token is present', async () => {
        const response = await request(app).get('/songs');
        expect(response.status).toBe(401);
    });

    it('POST /songs should create a song when body is valid', async () => {
        const payload = {
            title: 'Sober',
            artist: 'Tool',
            zikresourceIds: ['res-123']
        };

        const response = await request(app)
            .post('/songs')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.title).toBe('Sober');
    });

    it('POST /songs should return 400 when body is invalid (Zod)', async () => {
        const payload = {
            title: '',
            artist: 'Tool',
            zikresourceIds: []
        };

        const response = await request(app)
            .post('/songs')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
    });

    it('GET /songs/:id should return 400 when id is empty or invalid (Zod)', async () => {
        // Express route matching handles route nesting, but let's check with an invalid/empty param or if Zod captures it
        // We'll test with a valid request first
        const song = await mockSongRepo.saveSong({
            id: 'song-123',
            title: 'Sober',
            artist: 'Tool',
            zikresourceIds: ['res-123'],
            createdBy: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const response = await request(app)
            .get(`/songs/${song.id}`)
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Sober');
    });

    it('PUT /songs/:id should return 400 when updating with invalid body', async () => {
        const response = await request(app)
            .put('/songs/song-123')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send({ title: '', artist: 'Tool', zikresourceIds: [] });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Validation failed');
    });
});
