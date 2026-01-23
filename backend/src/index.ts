import express, { Request, Response } from 'express';
import { ZikresourceController } from './controllers/zikresource.controller';
import { ZikresourceService } from './services/zikresource.service';
import { FirestoreZikresourceRepository } from './repositories/firestore-zikresource.repository';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const zikresourceRepository = new FirestoreZikresourceRepository();
const zikresourceService = new ZikresourceService(zikresourceRepository);
const zikresourceController = new ZikresourceController(zikresourceService);

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString()
    });
});

// Zikresource Routes
app.post('/zikresources', zikresourceController.create);
app.get('/zikresources', zikresourceController.getAll);
app.get('/zikresources/:id', zikresourceController.getById);
app.put('/zikresources/:id', zikresourceController.update);
app.delete('/zikresources/:id', zikresourceController.delete);

// Global Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
