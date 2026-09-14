import { useState, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPaidPlan } from '../utils/membership';
import { API_BASE_URL } from '../config/api';
import './UrlForm.css';

/* ── Toast helpers ────────────────────────────────────────────── */

let _toastId = 0;
const nextId = () => ++_toastId;

/**
 * Shared shorten API call.
 * Returns { success, data, errorCode?, errorMessage? }.
 */
async function shortenUrl(inputUrl, getIdToken) {
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
    return { success: false, errorMessage: data?.error || null };
  }

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
 * UrlForm
 *
 * Props:
 *   onUrlShortened(record)                     — existing plain shorten callback
 *   onUrlShortenedWithIntent(record, intent)   — chip shorten callback;
 *     intent is 'qr' | 'customize'
 *   membershipPlan                             — from parent for Pro gate UI
 */
function UrlForm({ onUrlShortened, onUrlShortenedWithIntent, membershipPlan }) {
  const { t } = useTranslation();
  const { getIdToken } = useAuth();
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeIntent, setActiveIntent] = useState(null);

  // Toast queue: [{ id, message, type: 'error'|'info' }]
  const [toasts, setToasts] = useState([]);
  const dismissTimers = useRef({});
  // Track last message to avoid rapid-fire duplicates
  const lastToastMsg = useRef('');
  const lastToastTime = useRef(0);

  const isPro = isPaidPlan(membershipPlan);

  /* ── Toast management ──────────────────────────────────────── */

  const dismissToast = useCallback((id) => {
    // Mark as exiting so the CSS exit animation plays
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after animation completes (250 ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const pushToast = useCallback(
    (message, type = 'error', durationMs = 2700) => {
      const now = Date.now();
      // Debounce: if the identical message was shown within 600 ms, skip
      if (
        message === lastToastMsg.current &&
        now - lastToastTime.current < 600
      ) {
        return;
      }
      lastToastMsg.current = message;
      lastToastTime.current = now;

      const id = nextId();
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

      // Auto-dismiss
      dismissTimers.current[id] = setTimeout(() => {
        dismissToast(id);
        delete dismissTimers.current[id];
      }, durationMs);
    },
    [dismissToast]
  );

  /* ── Validation ────────────────────────────────────────────── */

  const validateUrl = (urlToTest) => {
    const trimmedUrl = urlToTest.trim();
    if (!trimmedUrl) return { isValid: false, message: t('errorEmptyUrl') };
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return { isValid: false, message: t('errorInvalidProtocol') };
      }
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: t('errorInvalidUrl') };
    }
  };

  /* ── Handlers ──────────────────────────────────────────────── */

  const handleInputChange = (event) => {
    setInputUrl(event.target.value);
  };

  // Core shorten logic shared by all actions
  const performShorten = async (intent) => {
    if (isLoading) return;

    const validationResult = validateUrl(inputUrl);
    if (!validationResult.isValid) {
      pushToast(validationResult.message, 'error', 2700);
      return;
    }

    setIsLoading(true);
    setActiveIntent(intent);

    try {
      const result = await shortenUrl(inputUrl, getIdToken);

      if (!result.success) {
        if (result.errorCode === 'db') {
          pushToast(t('errorDatabaseUnavailable'), 'error', 3200);
        } else {
          pushToast(result.errorMessage || t('errorGeneric'), 'error', 3200);
        }
        return;
      }

      const record = result.data;
      if (intent === null) {
        if (onUrlShortened) onUrlShortened(record);
      } else {
        if (onUrlShortenedWithIntent) onUrlShortenedWithIntent(record, intent);
      }
    } catch (error) {
      console.error('API shorten request error:', error);
      // Distinguish browser offline vs backend unavailable
      if (!navigator.onLine) {
        pushToast(
          'İnternet bağlantısı kesildi. Lütfen bağlantınızı kontrol edin.',
          'error',
          3800
        );
      } else {
        pushToast(t('errorBackendOffline'), 'error', 3200);
      }
    } finally {
      setIsLoading(false);
      setActiveIntent(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await performShorten(null);
  };

  const handleQrChip = async () => {
    await performShorten('qr');
  };

  const handleCustomizeChip = async () => {
    if (!isPro) {
      pushToast(
        'Bağlantıyı özelleştirmek için Pro üyelik gereklidir.',
        'info',
        3000
      );
      return;
    }
    await performShorten('customize');
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <form className="urlForm" onSubmit={handleSubmit} noValidate>
      <label htmlFor="urlInput" className="visuallyHidden">
        {t('pasteLinkShortenPlaceholder')}
      </label>

      <div className="inputGroup">
        <input
          id="urlInput"
          type="url"
          className="urlInput"
          value={inputUrl}
          onChange={handleInputChange}
          placeholder={t('pasteLinkShortenPlaceholder')}
          aria-label={t('pasteLinkShortenPlaceholder')}
          disabled={isLoading}
        />

        <button
          type="submit"
          className="actionIconButton"
          disabled={isLoading}
          aria-label={t('shortenBtn')}
          aria-busy={isLoading}
          title={t('shortenBtn')}
        >
          {isLoading && activeIntent === null ? (
            <span className="spinner" />
          ) : (
            <svg
              className="sendIcon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Action chips */}
      <div className="actionChips" role="group" aria-label="Hızlı işlemler">
        {/* QR chip */}
        <button
          type="button"
          className={`chipBtn${isLoading && activeIntent === 'qr' ? ' chipLoading' : ''}`}
          onClick={handleQrChip}
          disabled={isLoading}
          aria-label="QR kod oluştur"
          title="QR kod oluştur"
        >
          {isLoading && activeIntent === 'qr' ? (
            <span className="chipSpinner" />
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" />
            </svg>
          )}
          QR kod oluştur
        </button>

        {/* Custom link chip — Pro feature */}
        <button
          type="button"
          className={`chipBtn chipProFeature${!isPro ? ' chipProLocked' : ''}${isLoading && activeIntent === 'customize' ? ' chipLoading' : ''}`}
          onClick={handleCustomizeChip}
          disabled={isLoading}
          aria-label="Özel bağlantı oluştur"
          title={isPro ? 'Özel bağlantı oluştur' : 'Pro üyelik gereklidir'}
        >
          {isLoading && activeIntent === 'customize' ? (
            <span className="chipSpinner" />
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
              <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
              <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
            </svg>
          )}
          Özel bağlantı oluştur
          <span className="chipProBadge" aria-label="Pro özellik">Pro</span>
        </button>
      </div>

      {/* Floating toast stack */}
      {toasts.length > 0 && (
        <div className="toastStack" role="status" aria-live="polite" aria-atomic="false">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast--${toast.type}${toast.exiting ? ' toast--exit' : ''}`}
            >
              {toast.type === 'error' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

export default UrlForm;
