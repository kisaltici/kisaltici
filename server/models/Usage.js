import mongoose from 'mongoose';

/**
 * Daily usage counters per subject ("u:<firebaseUid>" or "g:<hashed ip>" for guests).
 * One document per subject per day (Europe/Istanbul day key, e.g. "2026-10-10").
 *
 * Indexes (create once with `npm run db:indexes` in /server, autoIndex is off):
 *  - unique { subject, day }
 *  - TTL on createdAt so old counters clean themselves up
 */
const usageSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    day: { type: String, required: true },
    links: { type: Number, default: 0 },
    qrCodes: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

usageSchema.index({ subject: 1, day: 1 }, { unique: true });
usageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 35 });

const Usage = mongoose.models.Usage || mongoose.model('Usage', usageSchema);

export default Usage;
