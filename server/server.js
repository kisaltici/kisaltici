import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { requireDbReady } from './middleware/dbMiddleware.js';
import urlRoutes from './routes/urlRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Url from './models/Url.js';
import { getDeepLinkInfo, isMobileDevice, renderDeepLinkBridge } from './utils/deepLinkHelper.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

// 1. Security HTTP Headers (Helmet)
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// 2. Configure CORS for allowed origins
const configuredOrigins = FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''));
const PRODUCTION_ORIGIN = 'https://kisaltici.com';

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like mobile apps, curl, postman)
  if (!origin) return true;

  // Allow configured FRONTEND_URL(s)
  if (configuredOrigins.includes(origin)) return true;

  // Allow production domain
  if (origin === PRODUCTION_ORIGIN) return true;

  // Allow HTTPS Vercel deployment/preview origins
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) {
    return true;
  }

  // Allow local development origins (localhost, 127.0.0.1 on any port)
  if (
    origin.startsWith('http://localhost:') ||
    origin === 'http://localhost' ||
    origin.startsWith('http://127.0.0.1:') ||
    origin === 'http://127.0.0.1'
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Parse incoming JSON request bodies
app.use(express.json({ limit: '10kb' }));

// 4. API Health Check Route (always accessible, reports live database state)
app.get('/api/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.json({
    status: 'ok',
    message: 'Backend server is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 5. API Routers protected by database readiness check (fail fast with 503 instead of hanging)
app.use('/api/user', requireDbReady, userRoutes);
app.use('/api', requireDbReady, urlRoutes);

// Helper to perform smart redirection (deep linking on mobile, standard 302 on desktop)
const performRedirect = (req, res, originalUrl) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = isMobileDevice(userAgent);
  const bypassDeepLink = req.query.noredirect === '1' || req.query.web === '1';

  if (isMobile && !bypassDeepLink) {
    const deepLinkInfo = getDeepLinkInfo(originalUrl);
    if (deepLinkInfo) {
      return res.status(200).send(renderDeepLinkBridge(deepLinkInfo));
    }
  }

  return res.redirect(302, originalUrl);
};

// 6a. Custom short URL redirect: GET /@:userIdent/:customText
// Handles the new Pro custom format: https://lnk1.tr/@emrecan/portfolio
// The composite shortCode stored in MongoDB is "@userIdent/customText"
app.get('/@:userIdent/:customText', async (req, res, next) => {
  try {
    const { userIdent, customText } = req.params;
    const compositeCode = `@${userIdent}/${customText}`;

    // Ensure DB connection is established (critical for Vercel cold starts)
    const isConnected = await connectDB();
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return res.status(503).send('<h1>Service Unavailable</h1><p>Database is warming up. Please try again in a moment.</p>');
    }

    let urlRecord;
    try {
      urlRecord = await Url.findOneAndUpdate(
        { shortCode: compositeCode },
        {
          $inc: { clickCount: 1 },
          $push: { clicks: { timestamp: new Date() } },
        },
        { new: true }
      );
    } catch (dbErr) {
      console.warn('Redirect DB query failed, attempting reconnect and retry:', dbErr.message);
      await connectDB();
      urlRecord = await Url.findOneAndUpdate(
        { shortCode: compositeCode },
        {
          $inc: { clickCount: 1 },
          $push: { clicks: { timestamp: new Date() } },
        },
        { new: true }
      );
    }

    if (!urlRecord) {
      return res.status(404).send(`
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>404</title>
        <style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;text-align:center}
        .card{background:white;padding:2.5rem;border-radius:12px;border:1px solid #e2e8f0;max-width:420px}
        h1{color:#ef4444}p{color:#64748b;margin-bottom:1.5rem}
        a{text-decoration:none;background:#2563eb;color:white;padding:.625rem 1.25rem;border-radius:8px;font-weight:600}</style>
        </head><body><div class="card"><h1>Link Not Found</h1>
        <p>This custom link does not exist or may have been removed.</p>
        <a href="${FRONTEND_URL}">Go to Homepage</a></div></body></html>
      `);
    }

    return performRedirect(req, res, urlRecord.originalUrl);
  } catch (error) {
    next(error);
  }
});

// 6b. Short URL Redirection Route (GET /:shortCode) — auto-generated 6-char & admin custom slugs
app.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Ignore browser asset requests
    if (shortCode === 'favicon.ico' || shortCode === 'robots.txt') {
      return res.status(404).end();
    }

    // Ensure DB connection is established (critical for Vercel cold starts)
    const isConnected = await connectDB();
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return res.status(503).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>503 - Hizmet Kullanılamıyor</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; text-align: center; }
            .card { background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 440px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #eab308; }
            p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
            a { text-decoration: none; background: #2563eb; color: white; padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Veritabanı Kullanılamıyor</h1>
            <p>Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.</p>
            <a href="${FRONTEND_URL}">Ana Sayfaya Dön</a>
          </div>
        </body>
        </html>
      `);
    }

    // Atomically increment clickCount and push click timestamp into clicks array with transient reconnect retry
    let urlRecord;
    try {
      urlRecord = await Url.findOneAndUpdate(
        { shortCode: shortCode },
        {
          $inc: { clickCount: 1 },
          $push: { clicks: { timestamp: new Date() } },
        },
        { new: true }
      );
    } catch (dbErr) {
      console.warn('Redirect DB query failed, attempting reconnect and retry:', dbErr.message);
      await connectDB();
      urlRecord = await Url.findOneAndUpdate(
        { shortCode: shortCode },
        {
          $inc: { clickCount: 1 },
          $push: { clicks: { timestamp: new Date() } },
        },
        { new: true }
      );
    }

    // If shortCode does not exist in MongoDB, return 404
    if (!urlRecord) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - Short Link Not Found</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; text-align: center; }
            .card { background: white; padding: 2.5rem; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 420px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #ef4444; }
            p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
            a { text-decoration: none; background: #2563eb; color: white; padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Not Found</h1>
            <p>The shortened URL you are looking for does not exist or may have been removed.</p>
            <a href="${FRONTEND_URL}">Go to Homepage</a>
          </div>
        </body>
        </html>
      `);
    }

    // Perform smart redirection (mobile deep link or HTTP 302 Found)
    return performRedirect(req, res, urlRecord.originalUrl);
  } catch (error) {
    next(error);
  }
});

// 7. Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled Error:', err.message);

  const isDbError =
    err.name?.startsWith('Mongo') ||
    err.name?.startsWith('Mongoose') ||
    err.message?.includes('buffering timed out') ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('ECONNRESET') ||
    err.message?.includes('ETIMEDOUT') ||
    err.message?.includes('connection') ||
    err.message?.includes('whitelist');

  if (isDbError) {
    return res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      error: 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: 'An unexpected server error occurred.',
  });
});

// 8. Deterministic server startup: connect DB first, then start accepting traffic
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.warn(
        '⚠️  Server started in degraded mode (MongoDB unavailable).\n' +
        '    Database-dependent requests will return 503 until MongoDB Atlas connection is established.'
      );
    }

    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (fatalError) {
    console.error('Fatal server startup error:', fatalError);
    process.exit(1);
  }
};

// Only start the HTTP listener when executed directly (e.g. `node server.js` / `npm run dev`)
// When imported by a serverless function entrypoint, do not call app.listen()
const isDirectExecution =
  Boolean(process.argv[1]) &&
  !process.env.VERCEL &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isDirectExecution) {
  startServer();
}

export default app;

