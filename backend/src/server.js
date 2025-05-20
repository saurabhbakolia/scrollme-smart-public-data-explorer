// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { handleQuery } from './query.js';
import path from 'path';
import { fileURLToPath } from 'url';


// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from your real .env (not the example)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


console.log('Environment Variables:', {
    MONGODB_URI: process.env.MONGODB_URI,
    DB_NAME: process.env.DB_NAME,
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    PORT: process.env.PORT,
});

const app = express();
app.use(express.json());

// Connect to MongoDB with proper logging and error handling
mongoose
    .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'climate_db' })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Health-check endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Ingestion endpoint (optional trigger)
app.post('/api/ingest', async (_req, res) => {
    try {
        const { fetchAndStore } = await import('../data-ingestion/ingest.js');
        await fetchAndStore();
        res.json({ status: 'ingestion completed' });
    } catch (err) {
        console.error('Ingestion error:', err.message);
        res.status(500).json({ error: 'Ingestion failed' });
    }
});


// Search endpoint
app.post('/api/search', handleQuery);

// Global error handler (so unhandled exceptions return JSON)
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
