// ingest.js
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';
import { NASA_CONFIG } from './nasa-config.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '../.env' });
console.log('Starting ingestion service...');

// Destructure NASA configuration
const {
  region: { lat, lon },
  start,
  end,
  parameters,
  community,
  format
} = NASA_CONFIG;

// Define Mongoose schema and model
const ClimateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  temperature: { type: Number },
  precipitation: { type: Number },
  humidity: { type: Number },
  solar: { type: Number },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  embedding: { type: [Number] } // Field for storing vector embeddings
});
ClimateSchema.index({ location: '2dsphere' });
const Climate = mongoose.model('Climate', ClimateSchema);

// Vertex AI setup for embeddings
const project = process.env.GOOGLE_PROJECT_ID;
const location = 'us-central1';
const model = 'text-embedding-004'; // Updated to a more recent, accessible model

async function getTextEmbeddings(texts) {
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
    keyFilename: path.resolve(__dirname, '../keys/vertex-sa.json'),
  });

  const instances = texts.map(text =>
    helpers.toValue({ content: text, task_type: 'RETRIEVAL_DOCUMENT' })
  );
  const parameters = helpers.toValue({});

  try {
    const [response] = await client.predict({ endpoint, instances, parameters });
    return response.predictions.map(pred => {
      const embStruct = pred.structValue.fields.embeddings.structValue.fields.values;
      return embStruct.listValue.values.map(v => v.numberValue);
    });
  } catch (error) {
    console.error('Error in getTextEmbeddings:', error.message);
    throw error;
  }
}

// Main data ingestion function
async function fetchAndStore() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'climate_db'
  });

  console.log(`Fetching data for ${start} to ${end} at (${lat}, ${lon})...`);
  const response = await axios.get(process.env.NASA_API_BASE, {
    params: {
      community,
      latitude: lat,
      longitude: lon,
      start,
      end,
      parameters: parameters.join(','),
      format
    }
  });

  const rawData = response.data.properties.parameter;
  const dates = Object.keys(rawData[parameters[0]]);

  console.log(`Preparing ${dates.length} operations...`);
  const bulkOps = dates.map(dateKey => {
    const dateObj = new Date(
      `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6)}`
    );
    return {
      updateOne: {
        filter: { date: dateObj },
        update: {
          $set: {
            temperature: rawData.T2M[dateKey],
            precipitation: rawData.PRECTOTCORR[dateKey],
            humidity: rawData.RH2M[dateKey],
            solar: rawData.ALLSKY_SFC_SW_DWN[dateKey],
            location: { type: 'Point', coordinates: [lon, lat] }
          }
        },
        upsert: true
      }
    };
  });

  if (bulkOps.length > 0) {
    const result = await Climate.bulkWrite(bulkOps);
    console.log(`Successfully ingested ${result.upsertedCount + result.modifiedCount} records.`);
    const totalDocs = await Climate.countDocuments();
    console.log(`Total documents in collection after ingestion: ${totalDocs}`);
  } else {
    console.log('No records to ingest.');
  }

  // Generate embeddings for documents without embeddings
  console.log('Generating embeddings for documents...');
  const docs = await Climate.find({ embedding: { $exists: false } });
  console.log(`Found ${docs.length} documents without embeddings.`);
  for (const doc of docs) {
    const text = `Climate data for ${doc.date}: Temp: ${doc.temperature}°C, Rain: ${doc.precipitation}mm, Humidity: ${doc.humidity}%, Solar: ${doc.solar}W/m²`;
    try {
      const [embedding] = await getTextEmbeddings([text]);
      doc.embedding = embedding;
      await doc.save();
      console.log(`Updated embedding for ${doc.date}`);
    } catch (err) {
      console.error(`Error generating embedding for ${doc.date}:`, err.message);
    }
  }
  console.log('Embedding generation complete.');

  console.log('Disconnecting from MongoDB...');
  await mongoose.disconnect();
  console.log('Ingestion complete.');
}

// Execute ingestion immediately
fetchAndStore().catch(err => {
  console.error('Ingestion error:', err);
  process.exit(1);
});

export { fetchAndStore };
