import request from 'supertest';
import express from 'express';
import * as admin from 'firebase-admin';
import { ZikresourceController } from '../src/controllers/zikresource.controller';
import { ZikresourceService } from '../src/services/zikresource.service';
import { FirestoreZikresourceRepository } from '../src/repositories/firestore-zikresource.repository';
import { errorMiddleware } from '../src/middleware/error.middleware';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

/**
 * Firestore Integration Tests
 * 
 * These tests use the actual FirestoreZikresourceRepository to test against Firestore.
 * 
 * Prerequisites:
 * 1. Firebase Emulator Suite must be running:
 *    firebase emulators:start --only firestore
 * 
 * 2. Set environment variables:
 *    export FIRESTORE_EMULATOR_HOST="localhost:8080"
 * 
 * Or use a test Firebase project with proper credentials.
 */

describe('ZikresourceController Firestore Integration', () => {
    let app: express.Express;
    let service: ZikresourceService;
    let repository: FirestoreZikresourceRepository;
    let db: admin.firestore.Firestore;

    beforeAll(() => {
        // Initialize Firebase Admin for testing
        if (!admin.apps.length) {
            // Check if using emulator
            if (process.env.FIRESTORE_EMULATOR_HOST) {
                admin.initializeApp({
                    projectId: 'test-project',
                });
            } else {
                // For real Firebase project, ensure credentials are set
                admin.initializeApp();
            }
        }
        db = admin.firestore();
    });

    beforeEach(async () => {
        // Clear all documents from the zikresources collection before each test
        const snapshot = await db.collection('zikresources').get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Set up the Express app with Firestore repository
        repository = new FirestoreZikresourceRepository();
        service = new ZikresourceService(repository);
        const controller = new ZikresourceController(service);

        app = express();
        app.use(express.json());
        app.post('/zikresources', controller.create);
        app.get('/zikresources', controller.getAll);
        app.get('/zikresources/:id', controller.getById);
        app.put('/zikresources/:id', controller.update);
        app.delete('/zikresources/:id', controller.delete);
        app.use(errorMiddleware);
    });

    afterAll(async () => {
        // Clean up: delete all test data
        const snapshot = await db.collection('zikresources').get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Delete the Firebase app
        await admin.app().delete();
    });

    describe('POST /zikresources', () => {
        it('should create a zikresource in Firestore', async () => {
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
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body._id).toBeDefined();
            expect(response.body.url).toBe(payload.url);
            expect(response.body.artist).toBe(payload.artist);
            expect(response.body.title).toBe(payload.title);
            expect(response.body.tags).toHaveLength(2);

            // Verify it was actually saved to Firestore
            const doc = await db.collection('zikresources').doc(response.body._id).get();
            expect(doc.exists).toBe(true);
            const data = doc.data();
            expect(data?.url).toBe(payload.url);
            expect(data?.artist).toBe(payload.artist);
        });

        it('should return 400 for invalid data', async () => {
            const payload = {
                url: 'not-a-url',
                artist: 'Tool',
                title: '',
            };

            const response = await request(app)
                .post('/zikresources')
                .send(payload);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('Validation failed');

            // Verify nothing was saved to Firestore
            const snapshot = await db.collection('zikresources').get();
            expect(snapshot.empty).toBe(true);
        });

        it('should handle multiple creates independently', async () => {
            const payload1 = {
                url: 'https://example.com/song1',
                artist: 'Artist 1',
                title: 'Song 1',
            };

            const payload2 = {
                url: 'https://example.com/song2',
                artist: 'Artist 2',
                title: 'Song 2',
            };

            const response1 = await request(app)
                .post('/zikresources')
                .send(payload1);

            const response2 = await request(app)
                .post('/zikresources')
                .send(payload2);

            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);
            expect(response1.body._id).not.toBe(response2.body._id);

            // Verify both exist in Firestore
            const snapshot = await db.collection('zikresources').get();
            expect(snapshot.size).toBe(2);
        });
    });

    describe('GET /zikresources', () => {
        it('should return all zikresources from Firestore', async () => {
            // Directly insert test data into Firestore
            await db.collection('zikresources').doc('test-id-1').set({
                id: 'test-id-1',
                url: 'https://example.com/1',
                artist: 'Artist 1',
                title: 'Title 1'
            });

            await db.collection('zikresources').doc('test-id-2').set({
                id: 'test-id-2',
                url: 'https://example.com/2',
                artist: 'Artist 2',
                title: 'Title 2'
            });

            const response = await request(app)
                .get('/zikresources');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body.some((r: any) => r._id === 'test-id-1')).toBe(true);
            expect(response.body.some((r: any) => r._id === 'test-id-2')).toBe(true);
        });

        it('should return empty array when no zikresources exist', async () => {
            const response = await request(app)
                .get('/zikresources');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /zikresources/:id', () => {
        it('should return a specific zikresource from Firestore', async () => {
            const testId = 'test-specific-id';
            await db.collection('zikresources').doc(testId).set({
                id: testId,
                url: 'https://example.com/specific',
                artist: 'Specific Artist',
                title: 'Specific Title'
            });

            const response = await request(app)
                .get(`/zikresources/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testId);
            expect(response.body.artist).toBe('Specific Artist');
        });

        it('should return 404 if zikresource not found in Firestore', async () => {
            const response = await request(app)
                .get('/zikresources/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.message).toBe('Zikresource with id non-existent-id not found');
        });
    });

    describe('PUT /zikresources/:id', () => {
        it('should update a zikresource in Firestore', async () => {
            const testId = 'test-update-id';
            await db.collection('zikresources').doc(testId).set({
                id: testId,
                url: 'https://example.com/old',
                artist: 'Old Artist',
                title: 'Old Title'
            });

            const updatePayload = {
                url: 'https://example.com/new',
                artist: 'New Artist',
                title: 'New Title',
                type: 'video'
            };

            const response = await request(app)
                .put(`/zikresources/${testId}`)
                .send(updatePayload);

            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testId);
            expect(response.body.url).toBe(updatePayload.url);
            expect(response.body.artist).toBe(updatePayload.artist);
            expect(response.body.title).toBe(updatePayload.title);

            // Verify the update in Firestore
            const doc = await db.collection('zikresources').doc(testId).get();
            const data = doc.data();
            expect(data?.url).toBe(updatePayload.url);
            expect(data?.artist).toBe(updatePayload.artist);
            expect(data?.title).toBe(updatePayload.title);
        });

        it('should return 404 when updating non-existent zikresource', async () => {
            const updatePayload = {
                url: 'https://example.com/new',
                artist: 'New Artist',
                title: 'New Title'
            };

            const response = await request(app)
                .put('/zikresources/non-existent-id')
                .send(updatePayload);

            expect(response.status).toBe(404);
        });

        it('should return 400 for invalid update data', async () => {
            const testId = 'test-invalid-update';
            await db.collection('zikresources').doc(testId).set({
                id: testId,
                url: 'https://example.com/valid',
                artist: 'Artist',
                title: 'Title'
            });

            const invalidPayload = {
                url: 'not-a-url',
                artist: 'Artist',
                title: ''
            };

            const response = await request(app)
                .put(`/zikresources/${testId}`)
                .send(invalidPayload);

            expect(response.status).toBe(400);

            // Verify the original data is unchanged in Firestore
            const doc = await db.collection('zikresources').doc(testId).get();
            const data = doc.data();
            expect(data?.url).toBe('https://example.com/valid');
        });
    });

    describe('DELETE /zikresources/:id', () => {
        it('should delete a zikresource from Firestore', async () => {
            const testId = 'test-delete-id';
            await db.collection('zikresources').doc(testId).set({
                id: testId,
                url: 'https://example.com/delete',
                artist: 'Delete Artist',
                title: 'Delete Title'
            });

            // Verify it exists before deletion
            let doc = await db.collection('zikresources').doc(testId).get();
            expect(doc.exists).toBe(true);

            const response = await request(app)
                .delete(`/zikresources/${testId}`);

            expect(response.status).toBe(204);

            // Verify it was deleted from Firestore
            doc = await db.collection('zikresources').doc(testId).get();
            expect(doc.exists).toBe(false);
        });

        it('should be idempotent (deleting non-existent resource)', async () => {
            const response = await request(app)
                .delete('/zikresources/non-existent-id');

            expect(response.status).toBe(204);
        });

        it('should handle multiple deletes', async () => {
            await db.collection('zikresources').doc('delete-1').set({
                id: 'delete-1',
                url: 'https://example.com/1',
                artist: 'Artist 1',
                title: 'Title 1'
            });

            await db.collection('zikresources').doc('delete-2').set({
                id: 'delete-2',
                url: 'https://example.com/2',
                artist: 'Artist 2',
                title: 'Title 2'
            });

            await request(app).delete('/zikresources/delete-1');
            await request(app).delete('/zikresources/delete-2');

            const snapshot = await db.collection('zikresources').get();
            expect(snapshot.empty).toBe(true);
        });
    });

    describe('Firestore-specific scenarios', () => {
        it('should handle concurrent writes correctly', async () => {
            const payload1 = {
                url: 'https://example.com/concurrent1',
                artist: 'Artist 1',
                title: 'Title 1'
            };

            const payload2 = {
                url: 'https://example.com/concurrent2',
                artist: 'Artist 2',
                title: 'Title 2'
            };

            // Create two resources concurrently
            const [response1, response2] = await Promise.all([
                request(app).post('/zikresources').send(payload1),
                request(app).post('/zikresources').send(payload2)
            ]);

            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);

            // Verify both exist in Firestore
            const snapshot = await db.collection('zikresources').get();
            expect(snapshot.size).toBe(2);
        });

        it('should persist data across service restarts', async () => {
            // Create a resource
            const payload = {
                url: 'https://example.com/persist',
                artist: 'Persist Artist',
                title: 'Persist Title'
            };

            const createResponse = await request(app)
                .post('/zikresources')
                .send(payload);

            const createdId = createResponse.body._id;

            // Simulate service restart by creating new instances
            const newRepository = new FirestoreZikresourceRepository();
            const newService = new ZikresourceService(newRepository);
            const newController = new ZikresourceController(newService);

            const newApp = express();
            newApp.use(express.json());
            newApp.get('/zikresources/:id', newController.getById);

            // Verify the resource still exists
            const getResponse = await request(newApp)
                .get(`/zikresources/${createdId}`);

            expect(getResponse.status).toBe(200);
            expect(getResponse.body._id).toBe(createdId);
            expect(getResponse.body.url).toBe(payload.url);
        });
    });
});
