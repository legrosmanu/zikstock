import request from 'supertest';
import express from 'express';
import {
    createZikresourceHandler,
    getAllZikresourcesHandler,
    getZikresourceByIdHandler,
    updateZikresourceHandler,
    deleteZikresourceHandler
} from './api/zikresource.controller';
import { errorMiddleware } from '../application/middleware/error.middleware';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VALID_TOKEN } from '../application/middleware/mock-auth.middleware';

// Mock the auth middleware module so tests don't need a real Google token or network call.
jest.mock('../application/middleware/google-auth.middleware', () => require('../application/middleware/mock-auth.middleware'));

// Mock the firestore repository to use the in-memory mock repository instead.
jest.mock('./repositories/firestore-zikresource.repository', () => require('./repositories/mock-zikresource.repository'));

import { authMiddleware } from '../application/middleware/google-auth.middleware';
import * as mockRepo from './repositories/mock-zikresource.repository';

describe('ZikresourceController Integration', () => {
    let app: express.Express;

    beforeEach(() => {
        mockRepo.clearMockZikresources();

        app = express();
        app.use(express.json());
        app.post('/zikresources', authMiddleware, createZikresourceHandler);
        app.get('/zikresources', authMiddleware, getAllZikresourcesHandler);
        app.get('/zikresources/:id', authMiddleware, getZikresourceByIdHandler);
        app.put('/zikresources/:id', authMiddleware, updateZikresourceHandler);
        app.delete('/zikresources/:id', authMiddleware, deleteZikresourceHandler);
        app.use(errorMiddleware);
    });

    // ─── Auth tests ────────────────────────────────────────────────────────────

    it('GET /zikresources should return 401 when no Authorization token is provided', async () => {
        const response = await request(app).get('/zikresources');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('GET /zikresources should return 200 when a valid token is provided', async () => {
        const response = await request(app)
            .get('/zikresources')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
    });

    // ─── Resource tests (all require a valid token) ─────────────────────────────

    it('POST /zikresources should create a zikresource', async () => {
        const payload = {
            url: 'https://www.songsterr.com/a/wsa/tool-sober-tab-s19923t2',
            artist: 'Tool',
            title: 'Sober',
            type: 'tablature',
            tags: [
                { label: 'difficulty', value: 'intermediate' },
                { label: 'to learn', value: 'My personal tag' }
            ]
        };

        const response = await request(app)
            .post('/zikresources')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body._id).toBeDefined();
        expect(response.body.url).toBe(payload.url);
        expect(response.body.tags).toHaveLength(2);
    });

    it('POST /zikresources should return 400 for invalid data', async () => {
        const payload = {
            url: 'not-a-url',
            artist: 'Tool',
            title: '',
        };

        const response = await request(app)
            .post('/zikresources')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
        expect(response.body.timestamp).toBeDefined();
    });

    it('GET /zikresources should return all zikresources', async () => {
        await mockRepo.saveZikresource({ id: '1', url: 'https://u1.com', artist: 'a1', title: 't1', type: 'video', tags: [] });
        await mockRepo.saveZikresource({ id: '2', url: 'https://u2.com', artist: 'a2', title: 't2', type: 'video', tags: [] });

        const response = await request(app)
            .get('/zikresources')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]._id).toBe('1');
    });

    it('PUT /zikresources/:id should update a zikresource', async () => {
        await mockRepo.saveZikresource({ id: '123', url: 'https://old.com', artist: 'old', title: 'old', type: 'video', tags: [] });
        const payload = {
            url: 'https://new.com',
            artist: 'new',
            title: 'new',
            type: 'video',
            tags: []
        };

        const response = await request(app)
            .put('/zikresources/123')
            .set('Authorization', `Bearer ${VALID_TOKEN}`)
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.url).toBe(payload.url);
        expect(response.body.artist).toBe(payload.artist);
        expect(response.body._id).toBe('123');
    });

    it('DELETE /zikresources/:id should delete a zikresource', async () => {
        await mockRepo.saveZikresource({ id: '123', url: 'https://ext.com', artist: 'ext', title: 'ext', type: 'video', tags: [] });

        const response = await request(app)
            .delete('/zikresources/123')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(204);
        const found = await mockRepo.findZikresourceById('123');
        expect(found).toBeNull();
    });

    it('DELETE /zikresources/:id should be idempotent', async () => {
        const response = await request(app)
            .delete('/zikresources/non-existent')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(204);
    });

    it('GET /zikresources/:id should return 404 if not found', async () => {
        const response = await request(app)
            .get('/zikresources/123')
            .set('Authorization', `Bearer ${VALID_TOKEN}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Zikresource with id 123 not found');
    });
});
