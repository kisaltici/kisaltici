import { verifyFirebaseToken } from '../config/firebaseAdmin.js';

/**
 * Extracts Bearer token from HTTP Authorization header.
 *
 * @param {import('express').Request} req
 * @returns {string | null}
 */
const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
};

/**
 * Strict authentication middleware for protected routes (e.g. GET /api/urls/mine).
 * Requires a valid Firebase ID token in Authorization: Bearer <token>.
 */
export const requireAuth = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    });
  }

  const decodedToken = await verifyFirebaseToken(token);

  if (!decodedToken || !decodedToken.uid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }

  req.user = decodedToken;
  next();
};

/**
 * Optional authentication middleware for public endpoints (e.g. POST /api/shorten).
 * Attaches req.user if a valid Bearer token is provided, or proceeds as guest (req.user = null) if absent.
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (token) {
    const decodedToken = await verifyFirebaseToken(token);
    if (decodedToken && decodedToken.uid) {
      req.user = decodedToken;
    } else {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};
