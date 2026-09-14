/**
 * API Configuration
 *
 * In production (unified Vercel deployment), requests use same-origin relative paths (e.g. /api/...).
 * In local development, defaults to 'http://localhost:5000' unless overridden via VITE_API_BASE_URL.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.DEV
      ? 'http://localhost:5000'
      : '';
