import 'dotenv/config';
import mongoose from 'mongoose';
import Report from '../models/Report.js';

// Lists abuse reports (newest first). Usage: npm run reports            -> new reports
//                                           npm run reports -- all      -> everything
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const all = process.argv.includes('all');
const reports = await Report.find(all ? {} : { status: 'new' }).sort({ createdAt: -1 }).limit(100).lean();
if (!reports.length) console.log('No reports.');
for (const r of reports) {
  console.log(`${r.createdAt.toISOString()}  [${r.status}]  ${r.reason}  code=${r.shortCode || '-'}`);
  console.log(`  ${r.reportedUrl}`);
  if (r.details) console.log(`  "${r.details.replace(/\s+/g, ' ').slice(0, 200)}"`);
  if (r.reporterEmail) console.log(`  reporter: ${r.reporterEmail}`);
}
await mongoose.disconnect();
