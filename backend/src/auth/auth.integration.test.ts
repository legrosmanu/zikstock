import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { loginHandler, refreshHandler, logoutHandler } from './api/auth.controller';
import { errorMiddleware, AppError } from '../application/middleware/error.middleware';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import * as firestoreUserRepo from '../users/repositories/firestore-user.repository';
import * as mockUserRepo from '../users/repositories/mock-user.repository';
import * as authService from './domain/auth.service';

jest.mock('../users/repositories/firestore-user.repository');

describe('Auth API Integration', () => {
    let app: express.Express;

    beforeEach(() => {
        mockUserRepo.clearData();
        jest.clearAllMocks();

        jest.mocked(firestoreUserRepo.saveUser).mockImplementation(mockUserRepo.saveUser);
        jest.mocked(firestoreUserRepo.findUserById).mockImplementation(mockUserRepo.findUserById);

        // Mock verifyGoogleToken for integration test execution
        jest.spyOn(authService, 'verifyGoogleToken').mockImplementation(async (googleToken: string) => {
            if (googleToken === 'valid-test-google-token') {
                return {
                    sub: 'user-123',
                    email: 'test@example.com',
                    name: 'Test User',
                };
            }
            throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid Google token');
        });

        app = express();
        app.use(express.json());
        app.use(cookieParser());

        app.post('/auth/login', loginHandler);
        app.post('/auth/refresh', refreshHandler);
        app.post('/auth/logout', logoutHandler);

        app.use(errorMiddleware);
    });

    it('POST /auth/login should return access & refresh tokens when given a valid Google token', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ googleToken: 'valid-test-google-token' });

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.id).toBe('user-123');

        // Check refresh token cookie
        const cookies = response.get('Set-Cookie');
        expect(cookies).toBeDefined();
        expect(cookies?.[0]).toContain('zikstock_refresh_token=');
    });

    it('POST /auth/login should return 400 when token is missing', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
    });

    it('POST /auth/refresh should issue a new access token when a valid refresh token cookie is provided', async () => {
        // First login to get cookie and user in DB
        const loginRes = await request(app)
            .post('/auth/login')
            .send({ googleToken: 'valid-test-google-token' });

        const cookieHeader = loginRes.get('Set-Cookie') || [];

        const refreshRes = await request(app)
            .post('/auth/refresh')
            .set('Cookie', cookieHeader);

        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body.accessToken).toBeDefined();
        expect(refreshRes.body.user.id).toBe('user-123');
    });

    it('POST /auth/refresh should return 401 when no refresh token cookie is provided', async () => {
        const response = await request(app).post('/auth/refresh');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('POST /auth/logout should clear the refresh cookie', async () => {
        const response = await request(app).post('/auth/logout');

        expect(response.status).toBe(200);
        const cookies = response.get('Set-Cookie');
        expect(cookies).toBeDefined();
        expect(cookies?.[0]).toContain('zikstock_refresh_token=;');
    });
});
