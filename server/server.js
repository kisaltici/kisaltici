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

// Load environment variables from .env file
dotenv.config();

const app = express();

// Behind Vercel's proxy: required so req.ip (rate limiting) and req.protocol (short URLs) are the real client values
app.set('trust proxy', 1);
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

// 6. Short URL redirection (GET /@:userIdent/:customText and GET /:shortCode)
const SHORT_CODE_REGEX = /^[A-Za-z0-9_-]{1,30}$/;
const CUSTOM_TEXT_REGEX = /^@[A-Za-z0-9_-]{1,30}\/[A-Za-z0-9_-]{1,30}$/;

const renderErrorPage = (title, message, linkLabel, lang = 'en', code = '') => `<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex"><title>${title}</title>
<style>*{box-sizing:border-box;margin:0}body{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:#000;color:#f3f4f6;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center}
.wrap{position:relative;width:min(100%,440px);display:flex;flex-direction:column;align-items:center;gap:.9rem}
.wrap:before{content:"";position:absolute;top:-120px;left:50%;width:520px;height:260px;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 50%,rgba(222,255,54,.11),transparent 68%);pointer-events:none}
.logo{height:24px;margin-bottom:1.25rem;position:relative}.code{position:relative;font:700 5.5rem/1 ui-monospace,Menlo,monospace;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.5px rgba(156,163,175,.55)}
h1{position:relative;font-size:1.75rem;font-weight:650;letter-spacing:-.03em;line-height:1.1}p{position:relative;color:#9ca3af;line-height:1.6;font-size:1rem;max-width:40ch}
a.btn{position:relative;margin-top:.75rem;text-decoration:none;background:#DEFF36;color:#080a11;padding:.85rem 1.4rem;border-radius:12px;font-weight:600;font-size:.9375rem}a.btn:hover{background:#cbe82e}</style>
</head><body><main class="wrap"><img class="logo" src="${FRONTEND_URL}/KSLT_LOGO_DARK.svg" alt="Kısaltıcı">${code ? `<div class="code" aria-hidden="true">${code}</div>` : ''}<h1>${title}</h1><p>${message}</p><a class="btn" href="${FRONTEND_URL}">${linkLabel}</a></main></body></html>`;

const notFoundPage = () =>
  renderErrorPage('Link not found', 'This short link does not exist or may have been removed.', 'Go to homepage', 'en', '404');

const registerClick = (shortCode) =>
  Url.findOneAndUpdate(
    { shortCode },
    {
      $inc: { clickCount: 1 },
      $push: { clicks: { timestamp: new Date() } },
    },
    { returnDocument: 'after', projection: { originalUrl: 1 } }
  ).lean();

const handleRedirect = (resolveCode) => async (req, res, next) => {
  try {
    const shortCode = resolveCode(req);

    if (!shortCode) {
      return res.status(404).send(notFoundPage());
    }

    // Ensure DB connection is established (critical for Vercel cold starts)
    const isConnected = await connectDB();
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .send(renderErrorPage('Geçici bir sorun var', 'Sunucu şu anda veritabanına bağlanamıyor. Lütfen biraz sonra tekrar deneyin.', 'Ana sayfaya dön', 'tr', '503'));
    }

    // Atomically count the click, retrying once after a transient reconnect
    let urlRecord;
    try {
      urlRecord = await registerClick(shortCode);
    } catch (dbErr) {
      console.warn('Redirect DB query failed, attempting reconnect and retry:', dbErr.message);
      await connectDB();
      urlRecord = await registerClick(shortCode);
    }

    if (!urlRecord) {
      return res.status(404).send(notFoundPage());
    }

    return res.redirect(302, urlRecord.originalUrl);
  } catch (error) {
    next(error);
  }
};

// Composite Pro format: https://domain/@emrecan/portfolio -> stored as "@emrecan/portfolio"
app.get(
  '/@:userIdent/:customText',
  handleRedirect((req) => {
    const code = `@${req.params.userIdent}/${req.params.customText}`;
    return CUSTOM_TEXT_REGEX.test(code) ? code : null;
  })
);

// Auto-generated 6-char codes & admin custom slugs
app.get(
  '/:shortCode',
  handleRedirect((req) => (SHORT_CODE_REGEX.test(req.params.shortCode) ? req.params.shortCode : null))
);

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

  // Client errors (e.g. malformed JSON body, payload too large) should not surface as 500
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ success: false, error: 'Invalid request.' });
  }

  res.status(500).json({
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

