import request from 'supertest';
import express from 'express';
import { ZikresourceController } from '../src/controllers/zikresource.controller';
import { ZikresourceService } from '../src/services/zikresource.service';
import { MockZikresourceRepository } from '../src/repositories/mock-zikresource.repository';
import { errorMiddleware } from '../src/middleware/error.middleware';

describe('ZikresourceController Integration', () => {
    let app: express.Express;
    let service: ZikresourceService;
    let repository: MockZikresourceRepository;

    beforeEach(() => {
        repository = new MockZikresourceRepository();
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
            .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Bad Request');
        expect(response.body.message).toContain('Validation failed');
        expect(response.body.timestamp).toBeDefined();
    });

    it('GET /zikresources should return all zikresources', async () => {
        await repository.save({ id: '1', url: 'https://u1.com', artist: 'a1', title: 't1' });
        await repository.save({ id: '2', url: 'https://u2.com', artist: 'a2', title: 't2' });

        const response = await request(app)
            .get('/zikresources');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]._id).toBe('1');
    });

    it('PUT /zikresources/:id should update a zikresource', async () => {
        await repository.save({ id: '123', url: 'https://old.com', artist: 'old', title: 'old' });
        const payload = {
            url: 'https://new.com',
            artist: 'new',
            title: 'new',
        };

        const response = await request(app)
            .put('/zikresources/123')
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.url).toBe(payload.url);
        expect(response.body.artist).toBe(payload.artist);
        expect(response.body._id).toBe('123');
    });

    it('DELETE /zikresources/:id should delete a zikresource', async () => {
        await repository.save({ id: '123', url: 'https://ext.com', artist: 'ext', title: 'ext' });

        const response = await request(app)
            .delete('/zikresources/123');

        expect(response.status).toBe(204);
        const found = await repository.findById('123');
        expect(found).toBeNull();
    });

    it('DELETE /zikresources/:id should be idempotent', async () => {
        const response = await request(app)
            .delete('/zikresources/non-existent');

        expect(response.status).toBe(204);
    });

    it('GET /zikresources/:id should return 404 if not found', async () => {
        const response = await request(app)
            .get('/zikresources/123');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Not Found');
        expect(response.body.message).toBe('Zikresource with id 123 not found');
    });
});
