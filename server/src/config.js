import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  bosonApiKey: process.env.BOSON_API_KEY || '',
  bosonEndpoint: process.env.BOSON_ENDPOINT || 'https://api.boson.ai/v1/realtime',
  isProduction: process.env.NODE_ENV === 'production'
};
