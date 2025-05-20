// nasa-config.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Replicate __dirname in ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Pick dev or prod
const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

// Build path relative to this file
const cfgPath = resolve(__dirname, '../config', `${env}.json`);

// Load and parse
if (!readFileSync(cfgPath, 'utf8')) {
  throw new Error(`Config file not found: ${cfgPath}`);
}
export const NASA_CONFIG = JSON.parse(readFileSync(cfgPath, 'utf8'));
