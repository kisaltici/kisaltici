import express from 'express';
import Url from '../models/Url.js';
import User from '../models/User.js';
import { generateShortCode } from '../utils/generateShortCode.js';
import { shortenLimiter } from '../middleware/rateLimiter.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Maximum allowed URL length (standard browser URL length limit)
const MAX_URL_LENGTH = 2048;

/**
 * Validates whether a string is a valid HTTP or HTTPS URL.
 * Strictly rejects javascript:, data:, file:, and non-HTTP protocols.
 *
 * @param {string} urlToTest
 * @returns {{ isValid: boolean, error: string }}
 */
const validateBackendUrl = (urlToTest) => {
  if (!urlToTest || typeof urlToTest !== 'string') {
    return { isValid: false, error: 'Please enter a URL.' };
  }

  const trimmedUrl = urlToTest.trim();

  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'Please enter a URL.' };
  }

  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: `URL exceeds maximum allowed length of ${MAX_URL_LENGTH} characters.`,
    };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    // Strictly enforce http and https protocols only
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Invalid URL protocol. Only http:// and https:// URLs are allowed.',
      };
    }

    if (!parsedUrl.hostname) {
      return {
        isValid: false,
        error: 'Invalid URL domain structure.',
      };
    }

    return { isValid: true, error: '' };
  } catch (err) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com).',
    };
  }
};

/**
 * Resolves the base URL for short link generation.
 * Uses BASE_URL environment variable if provided, or falls back to the incoming request host.
 * Trailing slashes are stripped to avoid malformed links (e.g. https://lnk1.tr/aB3xYz).
 *
 * @param {import('express').Request} req
 * @returns {string} Clean base URL without trailing slash
 */
const getBaseUrl = (req) => {
  const url = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return url.replace(/\/+$/, '');
};

/**
 * POST /api/shorten
 * Rate-limited endpoint for shortening URLs.
 * Supports optional authentication (attaches userId if Bearer token is valid).
 */
router.post('/shorten', shortenLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { originalUrl } = req.body || {};

    const validation = validateBackendUrl(originalUrl);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const trimmedUrl = originalUrl.trim();

    // Generate a unique 6-character short code with collision handling
    let shortCode = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortCode = generateShortCode(6);
      attempts++;

      const existingUrl = await Url.findOne({ shortCode });
      if (!existingUrl) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate a unique short code. Please try again.',
      });
    }

    const authenticatedUserId = req.user ? req.user.uid : null;

    // Save document into MongoDB using Mongoose model
    const newUrlRecord = await Url.create({
      originalUrl: trimmedUrl,
      shortCode: shortCode,
      userId: authenticatedUserId,
    });

    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/${newUrlRecord.shortCode}`;

    return res.status(201).json({
      success: true,
      shortCode: newUrlRecord.shortCode,
      shortUrl: shortUrl,
      originalUrl: newUrlRecord.originalUrl,
      clickCount: newUrlRecord.clickCount,
      createdAt: newUrlRecord.createdAt,
      lastClick: null,
      clicks: [],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/urls/mine
 * Authenticated endpoint returning all URLs belonging to the current user (by verified Firebase UID).
 */
router.get('/urls/mine', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const userUrls = await Url.find({ userId }).sort({ createdAt: -1 }).select('-__v');

    const baseUrl = getBaseUrl(req);

    const formattedList = userUrls.map((item) => {
      const clicks = item.clicks || [];
      const lastClick = clicks.length > 0 ? clicks[clicks.length - 1].timestamp : null;
      return {
        shortCode: item.shortCode,
        shortUrl: `${baseUrl}/${item.shortCode}`,
        originalUrl: item.originalUrl,
        clickCount: item.clickCount,
        createdAt: item.createdAt,
        lastClick: lastClick,
        qrSettings: item.qrSettings || null,
        originalShortCode: item.originalShortCode || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedList,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/urls/:shortCode
 * Returns public statistics & click history for a shortened URL without incrementing clickCount.
 */
router.get('/urls/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode || typeof shortCode !== 'string' || !shortCode.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid short code.',
      });
    }

    const trimmedCode = shortCode.trim();

    // Query database for URL record
    const urlRecord = await Url.findOne({ shortCode: trimmedCode }).select('-__v');

    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        error: 'Short URL statistics not found.',
      });
    }

    const baseUrl = getBaseUrl(req);
    const shortUrl = `${baseUrl}/${urlRecord.shortCode}`;

    const clicks = urlRecord.clicks || [];
    const lastClick = clicks.length > 0 ? clicks[clicks.length - 1].timestamp : null;

    return res.status(200).json({
      success: true,
      data: {
        originalUrl: urlRecord.originalUrl,
        shortCode: urlRecord.shortCode,
        shortUrl: shortUrl,
        clickCount: urlRecord.clickCount,
        createdAt: urlRecord.createdAt,
        lastClick: lastClick,
        clicks: clicks,
        qrSettings: urlRecord.qrSettings || null,
        originalShortCode: urlRecord.originalShortCode || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/urls/:shortCode/qr
 * Persists customized QR code settings for a specific shortened link.
 * Allows link owner or guest link without owner to persist settings cleanly.
 */
router.patch('/urls/:shortCode/qr', optionalAuth, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode || typeof shortCode !== 'string' || !shortCode.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid short code.',
      });
    }

    const trimmedCode = shortCode.trim();
    const urlRecord = await Url.findOne({ shortCode: trimmedCode });

    if (!urlRecord) {
      return res.status(404).json({
        success: false,
        error: 'Short URL not found.',
      });
    }

    // If link has an authenticated owner, verify requester is the owner
    if (urlRecord.userId) {
      if (!req.user || req.user.uid !== urlRecord.userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to modify QR settings for this link.',
        });
      }
    }

    const {
      complexity,
      preset,
      level,
      fgColor,
      bgColor,
      moduleShape,
      finderStyle,
      quietZone,
      centerImage,
    } = req.body || {};

    const validComplexities = ['ultra-minimal', 'minimal', 'balanced', 'high'];
    const validLevels = ['L', 'M', 'Q', 'H'];
    const validShapes = ['square', 'rounded', 'extra-rounded', 'dots', 'diamond'];
    const validFinderStyles = ['classic', 'square', 'rounded', 'soft', 'compact', 'dot', 'circle'];
    const validQuietZones = ['compact', 'standard', 'generous'];

    const newQrSettings = urlRecord.qrSettings ? urlRecord.qrSettings.toObject() : {};

    if (complexity && validComplexities.includes(complexity)) {
      newQrSettings.complexity = complexity;
    }
    if (preset && typeof preset === 'string') {
      newQrSettings.preset = preset.trim();
    }
    if (level && validLevels.includes(level)) {
      newQrSettings.level = level;
    }
    if (typeof fgColor === 'string' && fgColor.trim()) {
      newQrSettings.fgColor = fgColor.trim();
    }
    if (typeof bgColor === 'string' && bgColor.trim()) {
      newQrSettings.bgColor = bgColor.trim();
    }
    if (moduleShape && validShapes.includes(moduleShape)) {
      newQrSettings.moduleShape = moduleShape;
    }
    if (finderStyle && validFinderStyles.includes(finderStyle)) {
      newQrSettings.finderStyle = finderStyle;
    }
    if (quietZone && validQuietZones.includes(quietZone)) {
      newQrSettings.quietZone = quietZone;
    }
    if (centerImage && typeof centerImage === 'object') {
      newQrSettings.centerImage = {
        src: typeof centerImage.src === 'string' ? centerImage.src : null,
        sizePercent: typeof centerImage.sizePercent === 'number' ? Math.min(Math.max(centerImage.sizePercent, 10), 30) : 22,
        radius: typeof centerImage.radius === 'number' ? Math.min(Math.max(centerImage.radius, 0), 50) : 20,
        padding: typeof centerImage.padding === 'number' ? Math.min(Math.max(centerImage.padding, 0), 12) : 4,
        bgColor: typeof centerImage.bgColor === 'string' ? centerImage.bgColor.trim() : '#ffffff',
      };
    }
    newQrSettings.updatedAt = new Date();

    urlRecord.qrSettings = newQrSettings;
    await urlRecord.save();

    return res.status(200).json({
      success: true,
      data: urlRecord.qrSettings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/urls/:shortCode
 * Permanently removes a URL document from MongoDB.
 * Requires authentication and ownership: only the user who created the link
 * can delete it. Returns 403 if the authenticated user is not the owner.
 */
router.delete('/urls/:shortCode', requireAuth, async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode || typeof shortCode !== 'string' || !shortCode.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid short code.',
      });
    }

    const trimmedCode = shortCode.trim();
    const userId = req.user.uid;

    // Find the document first so we can verify ownership before deleting
    const urlRecord = await Url.findOne({ shortCode: trimmedCode });

    if (!urlRecord) {
      // Already gone — treat as success so frontend stays consistent
      return res.status(200).json({ success: true });
    }

    // Ownership check: reject if this URL belongs to a different user
    if (urlRecord.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this link.',
      });
    }

    await Url.deleteOne({ _id: urlRecord._id });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/urls/:shortCode/rename
 * Pro-only: assigns a custom URL of the form /@userIdentifier/customText.
 * Requires authentication, Pro membership, and ownership.
 *
 * The user supplies only the `customText` portion.
 * The `userIdentifier` is derived server-side from the authenticated user's profile:
 *   - username (if set), otherwise the local part of their email address.
 * The composite shortCode stored in MongoDB becomes "@userIdentifier/customText".
 */
router.patch('/urls/:shortCode/rename', requireAuth, async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { customText } = req.body || {};
    const userId = req.user.uid;

    // --- Basic param validation ---
    if (!shortCode || typeof shortCode !== 'string' || !shortCode.trim()) {
      return res.status(400).json({ success: false, error: 'Geçersiz kısa kod.' });
    }

    if (!customText || typeof customText !== 'string') {
      return res.status(400).json({ success: false, error: 'Özel bağlantı metni gerekli.' });
    }

    const trimmedText = customText.trim();

    // Allowed characters: A-Z a-z 0-9 - _   Length: 3-30
    const TEXT_REGEX = /^[A-Za-z0-9_-]{3,30}$/;
    if (!TEXT_REGEX.test(trimmedText)) {
      return res.status(400).json({
        success: false,
        error: 'Özel metin 3-30 karakter olmalı; harf, rakam, tire veya alt çizgi içerebilir.',
      });
    }

    // Reserved words — customText must not collide with system routes
    const RESERVED = new Set([
      'api', 'link', 'user', 'health', 'favicon', 'robots',
      'login', 'logout', 'register', 'signup', 'settings', 'stats',
      'admin', 'dashboard', 'profile', 'pricing', 'help', 'search',
      'qr', 'static', 'assets', 'public', 'undefined', 'null',
    ]);
    if (RESERVED.has(trimmedText.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Bu özel metin sistem tarafından ayrılmıştır.',
      });
    }

    // --- Pro membership check (server-side, from User collection) ---
    const userDoc = await User.findOne({ userId });
    if (!userDoc || userDoc.membershipPlan !== 'pro') {
      return res.status(403).json({
        success: false,
        error: 'Bağlantıyı özelleştirmek için Pro üyelik gereklidir.',
      });
    }

    // --- Derive user identifier: username > email prefix ---
    let userIdent = '';
    if (userDoc.username && userDoc.username.trim()) {
      userIdent = userDoc.username.trim().toLowerCase();
    } else if (req.user.email) {
      // Take only the local part before @ and sanitize it
      userIdent = req.user.email.split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-') // replace unsafe chars with dash
        .replace(/-{2,}/g, '-')        // collapse consecutive dashes
        .replace(/^-|-$/g, '')         // strip leading/trailing dashes
        .slice(0, 30);
    }

    if (!userIdent) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı tanımlayıcı belirlenemedi. Lütfen profil sayfasından bir kullanıcı adı belirleyin.',
      });
    }

    // Build composite shortCode:
    // - For the special "admin" user: just use customText directly (no @admin/ prefix)
    //   so the URL becomes: domain/custom-text
    // - For all other users: "@userIdent/customText"
    const isAdminUser = userIdent === 'admin';
    const compositeCode = isAdminUser ? trimmedText : `@${userIdent}/${trimmedText}`;

    // --- Ownership + existence check for the current record ---
    const urlRecord = await Url.findOne({ shortCode: shortCode.trim() });
    if (!urlRecord) {
      return res.status(404).json({ success: false, error: 'Bağlantı bulunamadı.' });
    }
    if (urlRecord.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Bu bağlantıyı değiştirme yetkiniz yok.',
      });
    }

    // No-op if composite is identical to current shortCode
    if (urlRecord.shortCode === compositeCode) {
      const baseUrl = getBaseUrl(req);
      return res.status(200).json({
        success: true,
        data: {
          shortCode: compositeCode,
          shortUrl: `${baseUrl}/${compositeCode}`,
          userIdent,
          customText: trimmedText,
        },
      });
    }

    // --- Uniqueness check on the composite code ---
    const conflict = await Url.findOne({ shortCode: compositeCode });
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'Bu özel bağlantı zaten kullanılıyor.',
      });
    }

    // --- Update the same document's shortCode ---
    // Set originalShortCode once on the first customization (set-once semantics)
    if (!urlRecord.originalShortCode) {
      urlRecord.originalShortCode = urlRecord.shortCode;
    }
    urlRecord.shortCode = compositeCode;
    await urlRecord.save();

    const baseUrl = getBaseUrl(req);
    return res.status(200).json({
      success: true,
      data: {
        shortCode: compositeCode,
        shortUrl: `${baseUrl}/${compositeCode}`,
        userIdent,
        customText: trimmedText,
        originalShortCode: urlRecord.originalShortCode || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/urls/:shortCode/restore
 * Pro-only: restores the URL's short code to the original auto-generated code.
 * Requires authentication, Pro membership, and ownership.
 * The original code is taken from originalShortCode field (set on first customization).
 */
router.patch('/urls/:shortCode/restore', requireAuth, async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user.uid;

    if (!shortCode || typeof shortCode !== 'string' || !shortCode.trim()) {
      return res.status(400).json({ success: false, error: 'Geçersiz kısa kod.' });
    }

    // --- Pro membership check ---
    const userDoc = await User.findOne({ userId });
    if (!userDoc || userDoc.membershipPlan !== 'pro') {
      return res.status(403).json({
        success: false,
        error: 'Bağlantıyı özelleştirmek için Pro üyelik gereklidir.',
      });
    }

    // --- Ownership + existence check ---
    const urlRecord = await Url.findOne({ shortCode: shortCode.trim() });
    if (!urlRecord) {
      return res.status(404).json({ success: false, error: 'Bağlantı bulunamadı.' });
    }
    if (urlRecord.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Bu bağlantıyı değiştirme yetkiniz yok.',
      });
    }

    // Nothing to restore
    if (!urlRecord.originalShortCode) {
      return res.status(400).json({
        success: false,
        error: 'Bu bağlantı hiç özelleştirilmemiş; geri alınacak bir şey yok.',
      });
    }

    // Already on original — no-op
    if (urlRecord.shortCode === urlRecord.originalShortCode) {
      const baseUrl = getBaseUrl(req);
      return res.status(200).json({
        success: true,
        data: {
          shortCode: urlRecord.originalShortCode,
          shortUrl: `${baseUrl}/${urlRecord.originalShortCode}`,
          originalShortCode: urlRecord.originalShortCode,
        },
      });
    }

    // Ensure the original code is still free (edge case: someone else took it)
    const conflict = await Url.findOne({ shortCode: urlRecord.originalShortCode });
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'Orijinal bağlantı kodu başka bir bağlantı tarafından alınmış.',
      });
    }

    // Restore: set shortCode back to originalShortCode
    urlRecord.shortCode = urlRecord.originalShortCode;
    await urlRecord.save();

    const baseUrl = getBaseUrl(req);
    return res.status(200).json({
      success: true,
      data: {
        shortCode: urlRecord.shortCode,
        shortUrl: `${baseUrl}/${urlRecord.shortCode}`,
        originalShortCode: urlRecord.originalShortCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
