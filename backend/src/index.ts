import express from 'express';
import {
    createZikresourceHandler,
    getAllZikresourcesHandler,
    getZikresourceByIdHandler,
    updateZikresourceHandler,
    deleteZikresourceHandler
} from './zikresources/api/zikresource.controller';
import { healthCheck } from './application/health.controller';
import { errorMiddleware } from './application/middleware/error.middleware';
import {
    initializeGoogleAuthStrategy,
    authMiddleware
} from './application/middleware/google-auth.middleware';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize authentication strategy
initializeGoogleAuthStrategy();

app.get('/health', healthCheck);

// Zikresource Routes (protected — requires a valid Google ID token)
app.post('/zikresources', authMiddleware, createZikresourceHandler);
app.get('/zikresources', authMiddleware, getAllZikresourcesHandler);
app.get('/zikresources/:id', authMiddleware, getZikresourceByIdHandler);
app.put('/zikresources/:id', authMiddleware, updateZikresourceHandler);
app.delete('/zikresources/:id', authMiddleware, deleteZikresourceHandler);

// Global Error Handler
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
