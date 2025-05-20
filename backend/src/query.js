// backend/src/query.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';
import { Climate } from './models/Climate.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

/**
 * Turn an array of texts into embeddings using Vertex AI’s PredictionServiceClient.
 */
async function getTextEmbeddings(texts) {
    const project = process.env.GOOGLE_PROJECT_ID;
    const location = 'us-central1';
    const model = 'text-embedding-004'; // Updated to a more recent, accessible model

    // Build the full endpoint resource name
    const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
    // Use the regional API host
    const client = new PredictionServiceClient({
        apiEndpoint: `${location}-aiplatform.googleapis.com`,
        keyFilename: path.resolve(__dirname, '../../keys/vertex-sa.json'),
    });

    // Convert each string into a protobuf Value
    const instances = texts.map(text =>
        helpers.toValue({ content: text, task_type: 'RETRIEVAL_DOCUMENT' })
    );
    const parameters = helpers.toValue({});

    try {
        const [response] = await client.predict({ endpoint, instances, parameters });
        console.log('Vertex AI response received for embeddings');
        return response.predictions.map(pred => {
            const embStruct = pred.structValue.fields.embeddings.structValue.fields.values;
            return embStruct.listValue.values.map(v => v.numberValue);
        });
    } catch (error) {
        console.error('Error in getTextEmbeddings:', error.message);
        throw error;
    }
}

export async function handleQuery(req, res, next) {
    try {
        const { query, topK = 5 } = req.body;
        if (!query) return res.status(400).json({ error: 'Missing `query`' });

        // 1️⃣ Embed the incoming text
        console.log('Generating embedding for query:', query);
        const [queryVector] = await getTextEmbeddings([query]);
        console.log('Query vector length:', queryVector.length);

        // 2️⃣ Run vector search in MongoDB Atlas
        const results = await Climate.aggregate([
            {
                $vectorSearch: {
                    index: 'climate_index',
                    path: 'embedding',
                    queryVector: queryVector,
                    limit: topK,
                    numCandidates: 100 // Adjust based on your dataset size
                }
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    temperature: 1,
                    precipitation: 1,
                    humidity: 1,
                    solar: 1,
                    coordinates: '$location.coordinates'
                }
            }
        ]);
        console.log('Search results count:', results.length);

        // If no results, log additional debug info
        if (results.length === 0) {
            const totalDocs = await Climate.countDocuments();
            const docsWithEmbedding = await Climate.countDocuments({ embedding: { $exists: true } });
            console.log(`Total documents: ${totalDocs}, Documents with embeddings: ${docsWithEmbedding}`);
        }

        return res.json({ results });
    } catch (err) {
        console.error('Search error:', err);
        next(err);
    }
}
