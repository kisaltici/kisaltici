import rateLimit from 'express-rate-limit';

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 20;

/**
 * Rate limiter middleware for URL creation API endpoints.
 * Limits each IP address to a configurable number of requests per window.
 */
export const shortenLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: `Too many URL shortening requests from this IP. Please try again after ${windowMinutes} minutes.`,
  },
});
