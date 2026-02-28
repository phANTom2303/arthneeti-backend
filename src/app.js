import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Standard security headers

// Import separated route files
import clientRoutes from './routes/clientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); // Parse incoming JSON payloads

// Mount the routes with explicit base paths
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (Good practice for a security platform)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // You will initialize your Mongo and Redis connections here later
});