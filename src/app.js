import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Standard security headers
import { logger } from './config/logger.js';
import { RESPONSE_CODES } from './lib/common.js';

// Import separated route files
import clientRoutes from './routes/clientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads

// Mount the routes with explicit base paths
app.use('/client', clientRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler (Good practice for a security platform)
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR_CODE).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    // You will initialize your Mongo and Redis connections here later
});