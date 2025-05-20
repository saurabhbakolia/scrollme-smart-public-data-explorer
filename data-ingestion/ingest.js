// ingest.js
import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import { NASA_CONFIG } from './nasa-config.js';

// Load environment variables
dotenv.config();
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
  }
});
ClimateSchema.index({ location: '2dsphere' });
const Climate = mongoose.model('Climate', ClimateSchema);

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
  } else {
    console.log('No records to ingest.');
  }

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
