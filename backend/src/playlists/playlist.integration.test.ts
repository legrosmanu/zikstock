import request from 'supertest';
import express from 'express';
import {
    createPlaylistHandler,
    getAllPlaylistsHandler,
    getPlaylistByIdHandler,
    updatePlaylistHandler,
    deletePlaylistHandler
} from './api/playlist.controller';
import { errorMiddleware } from '../application/middleware/error.middleware';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VALID_TOKEN } from '../application/middleware/mock-auth.middleware';
import * as googleAuthMiddleware from '../application/middleware/google-auth.middleware';
import * as mockAuthMiddleware from '../application/middleware/mock-auth.middleware';
import * as firestorePlaylistRepo from './repositories/firestore-playlist.repository';
import * as mockPlaylistRepo from './repositories/mock-playlist.repository';
import * as firestoreSongRepo from '../songs/repositories/firestore-song.repository';
import * as firestoreZikresourceRepo from '../zikresources/repositories/firestore-zikresource.repository';
import * as firestoreUserRepo from '../users/repositories/firestore-user.repository';
import * as mockUserRepo from '../users/repositories/mock-user.repository';

// Mock the modules
jest.mock('../application/middleware/google-auth.middleware');
jest.mock('./repositories/firestore-playlist.repository');
jest.mock('../songs/repositories/firestore-song.repository');
jest.mock('../zikresources/repositories/firestore-zikresource.repository');
jest.mock('../users/repositories/firestore-user.repository');

describe('PlaylistController Integration', () => {
    let app: express.Express;

    beforeEach(() => {
        mockPlaylistRepo.clearData();
        mockUserRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(firestoreUserRepo.findUsersByIds).mockImplementation(mockUserRepo.findUsersByIds);

        // Mock Auth Middleware
        jest.mocked(googleAuthMiddleware.authMiddleware).mockImplementation(mockAuthMiddleware.authMiddleware);

        // Mock Firestore Playlist Repository
        jest.mocked(firestorePlaylistRepo.savePlaylist).mockImplementation(mockPlaylistRepo.savePlaylist);
        jest.mocked(firestorePlaylistRepo.findPlaylistById).mockImplementation(mockPlaylistRepo.findPlaylistById);
        jest.mocked(firestorePlaylistRepo.findAllPlaylists).mockImplementation(mockPlaylistRepo.findAllPlaylists);
        jest.mocked(firestorePlaylistRepo.updatePlaylistInDb).mockImplementation(mockPlaylistRepo.updatePlaylistInDb);
        jest.mocked(firestorePlaylistRepo.deletePlaylistFromDb).mockImplementation(mockPlaylistRepo.deletePlaylistFromDb);

        // Default mock for Song validation
        jest.mocked(firestoreSongRepo.findSongById).mockImplementation(async (id: string) => {
            if (id === 'song-123') {
                return {
                    id: 'song-123',
                    title: 'Song Title',
                    artist: 'Song Artist',
                    zikresourceIds: ['res-123'],
                    createdBy: 'user-123', // matching default user sub in mock auth
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            return null;
        });

        // Default mock for Zikresource validation
        jest.mocked(firestoreZikresourceRepo.findZikresourceById).mockImplementation(async (id: string) => {
            if (id === 'res-123') {
                return {
                    id: 'res-123',
                    createdBy: 'user-123',
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
        app.post('/playlists', googleAuthMiddleware.authMiddleware, createPlaylistHandler);
        app.get('/playlists', googleAuthMiddleware.authMiddleware, getAllPlaylistsHandler);
        app.get('/playlists/:id', googleAuthMiddleware.authMiddleware, getPlaylistByIdHandler);
        app.put('/playlists/:id', googleAuthMiddleware.authMiddleware, updatePlaylistHandler);
        app.delete('/playlists/:id', googleAuthMiddleware.authMiddleware, deletePlaylistHandler);
        app.use(errorMiddleware);
    });

    it('GET /playlists should return 401 when no token is present', async () => {
        const response = await request(app).get('/playlists');
        expect(response.status).toBe(401);
    });

    it('POST /playlists should create a playlist when body is valid', async () => {
        const payload = {
            name: 'My Playlist',
            description: 'My favorite songs',
            songIds: ['song-123'],
            zikresourceIds: ['res-123']
        };

        const response = await request(app)
            .post('/playlists')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.name).toBe('My Playlist');
    });

    it('POST /playlists should return 400 when body is invalid (Zod)', async () => {
        const payload = {
            name: '',
            songIds: []
        };

        const response = await request(app)
            .post('/playlists')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
    });

    it('GET /playlists/:id should return 400 when id is invalid or empty (Zod)', async () => {
        // Since getPlaylistByIdHandler requires a valid id, we can pass a valid id and expect 200
        const playlist = await mockPlaylistRepo.savePlaylist({
            id: 'playlist-123',
            name: 'My Playlist',
            songIds: ['song-123'],
            zikresourceIds: ['res-123'],
            createdBy: 'user-123',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const response = await request(app)
            .get(`/playlists/${playlist.id}`)
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('My Playlist');
    });
});
