/**
 * Application & API Configuration
 *
 * Frontend Application URL:
 * - Production: 'https://kisaltici.com' (or VITE_APP_URL if overridden)
 * - Local Development: 'http://localhost:5173'
 *
 * API Base URL:
 * - Production: '' (same-origin relative /api/... requests on Vercel)
 * - Local Development: 'http://localhost:5000' (or VITE_API_BASE_URL if overridden)
 */
export const APP_URL =
  import.meta.env.VITE_APP_URL ||
  (import.meta.env.DEV ? 'http://localhost:5173' : 'https://kisaltici.com');

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.DEV
      ? 'http://localhost:5000'
      : '';
