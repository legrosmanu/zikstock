import request from 'supertest';
import express from 'express';
import { syncMeHandler, searchUsersHandler } from './api/user.controller';
import { errorMiddleware } from '../application/middleware/error.middleware';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as googleAuthMiddleware from '../application/middleware/google-auth.middleware';
import * as firestoreUserRepo from './repositories/firestore-user.repository';
import * as mockUserRepo from './repositories/mock-user.repository';

// Mock the modules
jest.mock('../application/middleware/google-auth.middleware');
jest.mock('./repositories/firestore-user.repository');

describe('UserController Integration', () => {
    let app: express.Express;
    let mockUserPayload: Express.User | null = null;

    beforeEach(() => {
        mockUserRepo.clearData();
        jest.clearAllMocks();

        mockUserPayload = null;

        // Mock auth middleware dynamically using mockUserPayload
        jest.mocked(googleAuthMiddleware.authMiddleware).mockImplementation((req, res, next) => {
            if (mockUserPayload) {
                req.user = mockUserPayload;
                return next();
            }
            res.status(401).json({ error: 'Unauthorized', message: 'Unauthorized' });
        });

        // Mock Firestore repository
        jest.mocked(firestoreUserRepo.saveUser).mockImplementation(mockUserRepo.saveUser);
        jest.mocked(firestoreUserRepo.findUserById).mockImplementation(mockUserRepo.findUserById);
        jest.mocked(firestoreUserRepo.searchUsers).mockImplementation(mockUserRepo.searchUsers);

        app = express();
        app.use(express.json());
        app.post('/users/me', googleAuthMiddleware.authMiddleware, syncMeHandler);
        app.get('/users', googleAuthMiddleware.authMiddleware, searchUsersHandler);
        app.use(errorMiddleware);
    });

    it('POST /users/me should return 401 when no token/user is present', async () => {
        const response = await request(app).post('/users/me');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('POST /users/me should succeed with 200 when token payload is valid', async () => {
        mockUserPayload = {
            sub: 'user-123',
            email: 'test@example.com',
            name: 'John Doe',
            picture: 'https://example.com/pic.jpg',
        };

        const response = await request(app)
            .post('/users/me')
            .send();

        expect(response.status).toBe(200);
        expect(response.body.id).toBe('user-123');
        expect(response.body.email).toBe('test@example.com');
        expect(response.body.name).toBe('John Doe');
        expect(response.body.picture).toBe('https://example.com/pic.jpg');

        const saved = await mockUserRepo.findUserById('user-123');
        expect(saved).not.toBeNull();
        expect(saved?.email).toBe('test@example.com');
    });

    it('POST /users/me should return 400 Bad Request when email is invalid', async () => {
        mockUserPayload = {
            sub: 'user-123',
            email: 'not-an-email',
            name: 'John Doe',
        };

        const response = await request(app)
            .post('/users/me')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('User token validation failed');
        expect(response.body.message).toContain('A valid email is required');

        const saved = await mockUserRepo.findUserById('user-123');
        expect(saved).toBeNull();
    });

    it('POST /users/me should return 401 Unauthorized when sub is missing', async () => {
        // sub is empty
        mockUserPayload = {
            sub: '',
            email: 'test@example.com',
        };

        const response = await request(app)
            .post('/users/me')
            .send();

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');

        const saved = await mockUserRepo.findUserById('');
        expect(saved).toBeNull();
    });
});
