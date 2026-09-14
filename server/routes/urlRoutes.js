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

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
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

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

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

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
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
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
