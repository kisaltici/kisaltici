// Creates the indexes declared on the Usage model. Safe to run repeatedly.
// Usage (from /server): npm run db:indexes
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Usage from '../models/Usage.js';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (server/.env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await Usage.createIndexes();
console.log('Usage indexes ensured:', (await Usage.collection.indexes()).map((i) => i.name).join(', '));
await mongoose.disconnect();
