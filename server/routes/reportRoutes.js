import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import Report from '../models/Report.js';

const router = express.Router();

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many reports. Please try again later.' },
});

const REASONS = ['phishing', 'malware', 'illegal', 'copyright', 'other'];
const OWN_HOSTS = ['kisaltici.com', 'www.kisaltici.com', 'lnk1.tr', 'www.lnk1.tr'];

const hashIp = (ip) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.IP_HASH_SALT || 'kisaltici'}:${ip || 'unknown'}`)
    .digest('hex')
    .slice(0, 32);

/** The short code of a reported address when it points at one of our own domains, otherwise null. */
const shortCodeOf = (value) => {
  try {
    const url = new URL(value);
    if (!OWN_HOSTS.includes(url.hostname.toLowerCase())) return null;
    const path = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
    return path || null;
  } catch {
    return null;
  }
};

/**
 * POST /api/report: anyone can report a short link. Public, rate limited, with a honeypot field.
 * Body: { url, reason, details?, email?, website? (honeypot, must stay empty) }
 */
router.post('/', reportLimiter, async (req, res, next) => {
  try {
    const { url, reason, details, email, website } = req.body || {};

    // Bots fill the hidden field: pretend success without storing anything
    if (typeof website === 'string' && website.trim()) return res.status(201).json({ success: true });

    const reported = typeof url === 'string' ? url.trim() : '';
    if (!reported || reported.length > 2048) {
      return res.status(400).json({ success: false, error: 'Please enter the short link you want to report.' });
    }
    try {
      const parsed = new URL(/^https?:\/\//i.test(reported) ? reported : `https://${reported}`);
      if (!parsed.hostname.includes('.')) throw new Error('bad host');
    } catch {
      return res.status(400).json({ success: false, error: 'Please enter a valid link.' });
    }
    if (!REASONS.includes(reason)) {
      return res.status(400).json({ success: false, error: 'Please choose a reason.' });
    }

    const normalized = /^https?:\/\//i.test(reported) ? reported : `https://${reported}`;
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 200) : '';
    if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address or leave it empty.' });
    }

    await Report.create({
      reportedUrl: normalized,
      shortCode: shortCodeOf(normalized),
      reason,
      details: typeof details === 'string' ? details.trim().slice(0, 2000) : '',
      reporterEmail: cleanEmail,
      reporterIpHash: hashIp(req.ip),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
