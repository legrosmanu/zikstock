import express from 'express';
import { ZikresourceController } from './controllers/zikresource.controller';
import { HealthController } from './controllers/health.controller';
import { ZikresourceService } from './services/zikresource.service';
import { FirestoreZikresourceRepository } from './repositories/firestore-zikresource.repository';
import { errorMiddleware } from './middleware/error.middleware';
import { GoogleAuthMiddleware } from './middleware/google-auth.middleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const zikresourceRepository = new FirestoreZikresourceRepository();
const zikresourceService = new ZikresourceService(zikresourceRepository);
const zikresourceController = new ZikresourceController(zikresourceService);
const healthController = new HealthController();
const googleAuthMiddleware = new GoogleAuthMiddleware();

app.get('/health', healthController.up);

// Zikresource Routes (protected — requires a valid Google ID token)
app.post('/zikresources', googleAuthMiddleware.authMiddleware, zikresourceController.create);
app.get('/zikresources', googleAuthMiddleware.authMiddleware, zikresourceController.getAll);
app.get('/zikresources/:id', googleAuthMiddleware.authMiddleware, zikresourceController.getById);
app.put('/zikresources/:id', googleAuthMiddleware.authMiddleware, zikresourceController.update);
app.delete('/zikresources/:id', googleAuthMiddleware.authMiddleware, zikresourceController.delete);

// Global Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
