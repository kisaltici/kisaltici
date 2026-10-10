import crypto from 'crypto';
import Usage from '../models/Usage.js';

const TURKEY_OFFSET_MS = 3 * 60 * 60 * 1000; // Turkey has no DST (UTC+3)

/** Day key in Turkey time, e.g. "2026-10-10". Quotas reset at 00:00 Turkey time. */
export const getDayKey = (date = new Date()) =>
  new Date(date.getTime() + TURKEY_OFFSET_MS).toISOString().slice(0, 10);

const hashIp = (ip) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.IP_HASH_SALT || 'kisaltici'}:${ip || 'unknown'}`)
    .digest('hex')
    .slice(0, 32);

/** Quota subject: the signed-in user, or a hashed IP for guests (raw IPs are never stored). */
export const subjectFor = (req) =>
  req.user?.uid ? `u:${req.user.uid}` : `g:${hashIp(req.ip)}`;

const ensureDoc = (subject, day) =>
  Usage.findOneAndUpdate(
    { subject, day },
    { $setOnInsert: { links: 0, qrCodes: [], createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  );

/** Atomically reserve one new-link slot. Returns { ok: boolean }. */
export const reserveLink = async (subject, limit) => {
  const day = getDayKey();
  await ensureDoc(subject, day);
  const doc = await Usage.findOneAndUpdate(
    { subject, day, links: { $lt: limit } },
    { $inc: { links: 1 } },
    { returnDocument: 'after' }
  );
  return { ok: Boolean(doc) };
};

/** Give a reserved slot back (used when link creation fails after reserving). */
export const releaseLink = (subject) =>
  Usage.updateOne({ subject, day: getDayKey(), links: { $gt: 0 } }, { $inc: { links: -1 } });

/**
 * Reserve a QR slot for a short code. Re-downloading the same QR on the same day is free.
 * Returns { ok: boolean }.
 */
export const reserveQr = async (subject, shortCode, limit) => {
  const day = getDayKey();
  await ensureDoc(subject, day);

  const existing = await Usage.exists({ subject, day, qrCodes: shortCode });
  if (existing) return { ok: true };
  if (limit < 1) return { ok: false };

  const doc = await Usage.findOneAndUpdate(
    { subject, day, qrCodes: { $ne: shortCode }, [`qrCodes.${limit - 1}`]: { $exists: false } },
    { $addToSet: { qrCodes: shortCode } },
    { returnDocument: 'after' }
  );
  return { ok: Boolean(doc) };
};

/** Today's usage for a subject. */
export const getUsage = async (subject) => {
  const doc = await Usage.findOne({ subject, day: getDayKey() }).lean();
  return { links: doc?.links || 0, qr: doc?.qrCodes?.length || 0, day: getDayKey() };
};
