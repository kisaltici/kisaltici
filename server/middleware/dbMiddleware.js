import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

/**
 * Checks if MongoDB connection is active and ready (readyState === 1).
 *
 * @returns {boolean}
 */
export const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Middleware that guards database-dependent routes.
 * Asynchronously ensures MongoDB connection is established (or reused from serverless cache)
 * before allowing requests to proceed.
 * If MongoDB is unavailable or connection fails, responds with HTTP 503 Service Unavailable.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireDbReady = async (req, res, next) => {
  try {
    const isConnected = await connectDB();

    if (!isConnected || !isDbConnected()) {
      return res.status(503).json({
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        error: 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.',
      });
    }

    next();
  } catch (_error) {
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      error: 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.',
    });
  }
};
