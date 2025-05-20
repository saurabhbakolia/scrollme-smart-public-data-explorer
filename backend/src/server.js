import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../config/.env.example' });

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { dbName: 'climate_db' });

import { handleQuery } from './query.js';

app.post('/search', handleQuery);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
