import express from 'express';
import Url from '../models/Url.js';
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

export default router;
