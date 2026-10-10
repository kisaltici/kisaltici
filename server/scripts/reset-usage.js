// Resets all daily usage counters (links / QR codes) so every account and guest gets its full
// plan allowance again. Links, users and plans are not touched. Usage (from /server): npm run db:reset-usage
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Usage from '../models/Usage.js';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (server/.env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const before = await Usage.find({}).select({ subject: 1, createdAt: 1, links: 1, qrCodes: 1 }).lean();
for (const doc of before) {
  console.log(`  ${doc.subject.slice(0, 10)}  created ${new Date(doc.createdAt).toISOString()}  links=${doc.links} qr=${(doc.qrCodes || []).length}`);
}
const { deletedCount } = await Usage.deleteMany({});
console.log(`Reset ${deletedCount} usage counter(s).`);
await mongoose.disconnect();
