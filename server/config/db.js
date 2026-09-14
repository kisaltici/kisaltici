import mongoose from 'mongoose';

// Crucial: Disable buffering globally so operations fail immediately instead of hanging for 10s when DB is disconnected
mongoose.set('bufferCommands', false);

// Standard serverless-safe cached Mongoose connection pattern stored on globalThis
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = {
    conn: null,
    promise: null,
  };
}

// Connection options optimized for fast failure and resilience in serverless environments
const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 5000, // 5s timeout instead of default 30s
  connectTimeoutMS: 10000,
  autoIndex: true,
};

// Wire up one-time connection logging listener without duplicate listeners across reloads
if (mongoose.connection.listenerCount('connected') === 0) {
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  });
}

/**
 * Checks whether MongoDB is fully connected (readyState === 1).
 *
 * @returns {boolean}
 */
export const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Establishes or reuses a cached connection to MongoDB Atlas database using Mongoose.
 * Serverless-safe:
 * - Reuses existing open connection if already connected (readyState === 1).
 * - Reuses in-flight connection promise across concurrent requests.
 * - Re-initiates connection if previously disconnected.
 * - Fails cleanly on error without background reconnect timers or persistent processes.
 *
 * @returns {Promise<boolean>} Resolves to true when connected, false otherwise.
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes('<username>')) {
    console.warn(
      '⚠️  MONGODB_URI is not configured with valid credentials in server/.env.\n' +
        '    Please update MONGODB_URI in server/.env with your MongoDB Atlas connection string.'
    );
    return false;
  }

  // 1. Return immediately if existing connection is active and ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  // 2. If disconnected, reset cached promise to allow fresh connection attempt
  if (mongoose.connection.readyState === 0) {
    cached.promise = null;
    cached.conn = null;
  }

  // 3. Reuse existing in-flight promise or initiate a new connection promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI, MONGOOSE_OPTIONS).then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    });
  }

  try {
    await cached.promise;
    return true;
  } catch (error) {
    // Reset cached promise and connection on failure so subsequent requests can retry cleanly
    cached.promise = null;
    cached.conn = null;
    console.error(`❌ MongoDB Connection Error: ${error.message?.split('\n')[0] || error.message}`);
    return false;
  }
};


