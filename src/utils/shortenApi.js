import { API_BASE_URL } from '../config/api';

const TURKEY_OFFSET_MS = 3 * 60 * 60 * 1000; // Quotas reset at 00:00 Turkey time (UTC+3, no DST)
const GUEST_FLAG_KEY = 'kslt_guest_link_day';

export const todayKey = () => new Date(Date.now() + TURKEY_OFFSET_MS).toISOString().slice(0, 10);

/**
 * Guests get a single link per day. This client flag only saves a round trip and gives instant
 * feedback; the server enforces the real limit (by hashed IP), so clearing storage does not bypass it.
 */
export const hasUsedGuestLinkToday = () => {
  try {
    return localStorage.getItem(GUEST_FLAG_KEY) === todayKey();
  } catch {
    return false;
  }
};

export const markGuestLinkUsed = () => {
  try {
    localStorage.setItem(GUEST_FLAG_KEY, todayKey());
  } catch {
    /* storage unavailable: the server limit still applies */
  }
};

/**
 * Shared shorten API call.
 * Returns { success, data } or { success: false, errorCode?, errorMessage?, limit? }.
 * errorCode: 'db' | 'guest_limit' | 'daily_limit'
 */
export async function shortenUrl(inputUrl, getIdToken) {
  const headers = { 'Content-Type': 'application/json' };
  const token = await getIdToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/shorten`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ originalUrl: inputUrl.trim() }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    if (response.status === 503 || data?.code === 'DATABASE_UNAVAILABLE') {
      return { success: false, errorCode: 'db' };
    }
    if (response.status === 429 && data?.code === 'GUEST_LIMIT') {
      markGuestLinkUsed();
      return { success: false, errorCode: 'guest_limit', limit: data.limit };
    }
    if (response.status === 429 && data?.code === 'DAILY_LINK_LIMIT') {
      return { success: false, errorCode: 'daily_limit', limit: data.limit };
    }
    return { success: false, errorMessage: data?.error || null };
  }

  if (!token) markGuestLinkUsed();

  return {
    success: true,
    data: {
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      shortUrl: data.shortUrl,
    },
  };
}

/**
 * Asks the server for permission to open a QR screen for a short code (counts against the daily QR quota).
 * mode: 'standard' | 'custom'. Returns { allowed: true } or
 * { allowed: false, errorCode: 'guest_limit' | 'daily_limit' | 'plan_required', limit }.
 * Network or server failures fail open so a QR download is never blocked by an outage.
 */
export async function consumeQr(shortCode, getIdToken, mode = 'standard') {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = await getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/qr/consume`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ shortCode, mode }),
    });

    if (response.status === 403) {
      const data = await response.json().catch(() => null);
      if (data?.code === 'PLAN_REQUIRED') return { allowed: false, errorCode: 'plan_required' };
    }

    if (response.status === 429) {
      const data = await response.json().catch(() => null);
      return {
        allowed: false,
        errorCode: data?.code === 'GUEST_LIMIT' ? 'guest_limit' : 'daily_limit',
        limit: data?.limit,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
