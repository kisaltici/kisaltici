import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AnalyticsChart from '../components/AnalyticsChart';
import QrCustomizationModal from '../components/QrCustomizationModal';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPaidPlan } from '../utils/membership';
import { API_BASE_URL } from '../config/api';
import './LinkAnalyticsPage.css';

function LinkAnalyticsPage({ onOpenNewLink, onShortCodeChanged }) {
  const { t } = useTranslation();
  const params = useParams();
  // shortCode from /link/:shortCode, or splat (*) from /link/* for composite @user/text
  const rawCode = params.shortCode ?? params['*'] ?? '';
  const shortCode = decodeURIComponent(rawCode);
  const navigate = useNavigate();
  const location = useLocation();
  const { membershipPlan, getIdToken, profileUsername, user } = useAuth();

  // Derive the user identifier for the fixed prefix (username > email local-part)
  const userIdent = profileUsername
    ? profileUsername.toLowerCase()
    : (user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '').slice(0, 30) : '');

  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Inline short-code editor state
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customError, setCustomError] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [gateMsg, setGateMsg] = useState(false);
  const gateMsgTimerRef = useRef(null);
  const inputRef = useRef(null);

  const isPro = isPaidPlan(membershipPlan);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorStatus(null);
    setIsQrModalOpen(false);
    setIsCustomizing(false);

    const fetchLinkStats = async (attempt = 1) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/urls/${encodeURIComponent(shortCode)}`
        );
        if (!isMounted) return;

        if (response.status === 404) {
          setErrorStatus(404);
          setIsLoading(false);
          return;
        }

        // If server returned 500/503 (e.g. serverless cold start), retry up to 2 times
        if ((response.status >= 500 || !response.ok) && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
          if (!isMounted) return;
          return fetchLinkStats(attempt + 1);
        }

        if (!response.ok) {
          setErrorStatus(response.status);
          setIsLoading(false);
          return;
        }

        const payload = await response.json();
        if (payload.success && payload.data) {
          setLinkData(payload.data);
          setErrorStatus(null);
        } else {
          setErrorStatus(500);
        }
      } catch (err) {
        console.error('Failed to fetch link statistics:', err);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
          if (!isMounted) return;
          return fetchLinkStats(attempt + 1);
        }
        if (isMounted) setErrorStatus(500);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLinkStats();

    return () => {
      isMounted = false;
    };
  }, [shortCode, refreshKey]);

  // Focus input when editor opens
  useEffect(() => {
    if (isCustomizing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCustomizing]);

  // Cleanup gate message timer
  useEffect(() => {
    return () => {
      if (gateMsgTimerRef.current) clearTimeout(gateMsgTimerRef.current);
    };
  }, []);

  // Auto-open QR modal or custom editor when arriving from a homepage chip action.
  // Fires once linkData is available so all state is ready.
  const intentHandledRef = useRef(false);
  useEffect(() => {
    if (!linkData || intentHandledRef.current) return;
    const intent = location.state?.intent;
    if (!intent) return;

    intentHandledRef.current = true;
    // Clear the router state so a manual refresh doesn't re-trigger
    navigate(location.pathname, { replace: true, state: {} });

    if (intent === 'qr') {
      setIsQrModalOpen(true);
    } else if (intent === 'customize') {
      // Reuse the existing sparkles-click logic inline
      if (!isPro) {
        setGateMsg(true);
        if (gateMsgTimerRef.current) clearTimeout(gateMsgTimerRef.current);
        gateMsgTimerRef.current = setTimeout(() => setGateMsg(false), 3500);
      } else {
        const isAdmin = userIdent === 'admin';
        let prefilled = '';
        if (isAdmin) {
          // Admin: shortCode is just customText (no prefix)
          // Only prefill if it doesn't look like an auto-generated 6-char code
          const autoGenRegex = /^[A-Za-z0-9]{6}$/;
          prefilled = autoGenRegex.test(linkData.shortCode) ? '' : linkData.shortCode;
        } else {
          const customPrefix = `@${userIdent}/`;
          prefilled = linkData.shortCode.startsWith(customPrefix)
            ? linkData.shortCode.slice(customPrefix.length)
            : '';
        }
        setCustomCode(prefilled);
        setCustomError('');
        setCustomSuccess('');
        setIsCustomizing(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkData]);

  const handleOpenQrModal = () => setIsQrModalOpen(true);
  const handleCloseQrModal = () => setIsQrModalOpen(false);

  const handleQrSettingsSaved = useCallback((code, savedSettings) => {
    setLinkData((prev) => {
      if (!prev || prev.shortCode !== code) return prev;
      return { ...prev, qrSettings: savedSettings };
    });
  }, []);

  const handleCopy = async () => {
    if (!linkData?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(linkData.shortUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Copy error:', e);
    }
  };

  // Sparkles / customize icon click
  const handleCustomizeClick = () => {
    if (!isPro) {
      // Show transient gate message — no editor
      setGateMsg(true);
      if (gateMsgTimerRef.current) clearTimeout(gateMsgTimerRef.current);
      gateMsgTimerRef.current = setTimeout(() => setGateMsg(false), 3500);
      return;
    }
    // Open inline editor — pre-fill with only the customText portion
    const currentCode = linkData.shortCode;
    const isAdmin = userIdent === 'admin';
    let prefilled = '';
    if (isAdmin) {
      // Admin: shortCode is the customText itself (no @admin/ prefix)
      const autoGenRegex = /^[A-Za-z0-9]{6}$/;
      prefilled = autoGenRegex.test(currentCode) ? '' : currentCode;
    } else {
      const customPrefix = `@${userIdent}/`;
      prefilled = currentCode.startsWith(customPrefix)
        ? currentCode.slice(customPrefix.length)
        : '';
    }
    setCustomCode(prefilled);
    setCustomError('');
    setCustomSuccess('');
    setIsCustomizing(true);
  };

  const handleCustomizeCancel = () => {
    setIsCustomizing(false);
    setCustomCode('');
    setCustomError('');
    setCustomSuccess('');
  };

  const handleCustomizeSave = async () => {
    const trimmed = customCode.trim();

    // Client-side pre-validation (mirrors backend rules)
    // Admin: minimum 1 char, everyone else: minimum 3 chars
    const isAdmin = userIdent === 'admin';
    if (!trimmed) {
      setCustomError('Bağlantı adı boş bırakılamaz.');
      return;
    }
    const validRegex = isAdmin ? /^[A-Za-z0-9_-]{1,30}$/ : /^[A-Za-z0-9_-]{3,30}$/;
    const lengthHint = isAdmin ? '1-30' : '3-30';
    if (!validRegex.test(trimmed)) {
      setCustomError(`${lengthHint} karakter; harf, rakam, tire veya alt çizgi kullanın.`);
      return;
    }

    setIsSaving(true);
    setCustomError('');
    setCustomSuccess('');

    try {
      const token = await getIdToken();
      if (!token) {
        setCustomError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setIsSaving(false);
        return;
      }

      // URL-encode shortCode because it may contain @ and / (composite format)
      const encodedCode = encodeURIComponent(linkData.shortCode);
      const response = await fetch(
        `${API_BASE_URL}/api/urls/${encodedCode}/rename`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ customText: trimmed }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        const { shortCode: newCode, shortUrl: newShortUrl, originalShortCode: origCode } = payload.data;
        // Update local page state immediately
        setLinkData((prev) => ({
          ...prev,
          shortCode: newCode,
          shortUrl: newShortUrl,
          originalShortCode: origCode ?? prev.originalShortCode ?? null,
        }));
        setCustomSuccess('Bağlantı adı güncellendi.');
        setIsCustomizing(false);
        setCustomCode('');
        // Sync history list in App.jsx and navigate to new route
        // Use encodeURIComponent so the React route path is safe for composite codes
        if (onShortCodeChanged) {
          onShortCodeChanged(linkData.shortCode, newCode, newShortUrl);
        } else {
          navigate(`/link/${encodeURIComponent(newCode)}`, { replace: true });
        }
      } else {
        setCustomError(payload?.error || 'Bağlantı adı güncellenemedi.');
      }
    } catch (err) {
      console.error('Rename request error:', err);
      setCustomError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore original auto-generated code
  const handleRestoreOriginal = async () => {
    if (!isPro) return;
    setIsSaving(true);
    setCustomError('');
    setCustomSuccess('');

    try {
      const token = await getIdToken();
      if (!token) { setIsSaving(false); return; }

      const encodedCode = encodeURIComponent(linkData.shortCode);
      const response = await fetch(
        `${API_BASE_URL}/api/urls/${encodedCode}/restore`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        const { shortCode: restoredCode, shortUrl: restoredUrl } = payload.data;
        setLinkData((prev) => ({
          ...prev,
          shortCode: restoredCode,
          shortUrl: restoredUrl,
        }));
        setCustomSuccess('Otomatik bağlantıya dönüldü.');
        if (onShortCodeChanged) {
          onShortCodeChanged(linkData.shortCode, restoredCode, restoredUrl);
        } else {
          navigate(`/link/${restoredCode}`, { replace: true });
        }
      } else {
        setCustomError(payload?.error || 'Bağlantı geri alınamadı.');
      }
    } catch (err) {
      console.error('Restore request error:', err);
      setCustomError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomizeKeyDown = (e) => {
    if (e.key === 'Enter') handleCustomizeSave();
    if (e.key === 'Escape') handleCustomizeCancel();
  };

  // Build the full fixed prefix shown in the editor
  // Admin: "https://domain/" (no @admin/ segment)
  // Others: "https://domain/@user/"
  const getDomainPrefix = () => {
    if (!linkData?.shortUrl) return '';
    try {
      const url = new URL(linkData.shortUrl);
      const base = `${url.protocol}//${url.host}`;
      const isAdmin = userIdent === 'admin';
      if (isAdmin) {
        return `${base}/`;
      }
      return userIdent ? `${base}/@${userIdent}/` : `${base}/`;
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="analyticsPage">
        <div className="analyticsSkeleton">
          <div className="skeletonNav" />
          <div className="skeletonHeader" />
          <div className="skeletonCards">
            <div className="skeletonCard" />
            <div className="skeletonCard" />
            <div className="skeletonCard" />
          </div>
          <div className="skeletonChart" />
        </div>
      </div>
    );
  }

  if (errorStatus === 404) {
    return (
      <div className="analyticsPage">
        <div className="notFoundContainer">
          <div className="notFoundIcon">🔍</div>
          <h2 className="notFoundTitle">{t('linkNotFoundTitle')}</h2>
          <p className="notFoundSub">{t('linkNotFoundSub')}</p>
          <button
            type="button"
            className="primaryActionBtn"
            onClick={() => navigate('/')}
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (errorStatus || !linkData) {
    return (
      <div className="analyticsPage">
        <div className="notFoundContainer">
          <div className="notFoundIcon">⚠️</div>
          <h2 className="notFoundTitle">{t('errorDatabaseUnavailable') || 'Sunucuya Bağlanılamadı'}</h2>
          <p className="notFoundSub">
            {t('errorGeneric') || 'Sunucu şu anda yanıt veremiyor. Lütfen tekrar deneyin.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button
              type="button"
              className="primaryActionBtn"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              🔄 {t('tryAgain') || 'Tekrar Dene'}
            </button>
            <button
              type="button"
              className="primaryActionBtn"
              style={{ background: 'var(--card-bg, #1e293b)', color: 'var(--text-primary, #fff)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => navigate('/')}
            >
              {t('backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formattedCreated = new Date(linkData.createdAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  const formattedLastClick = linkData.lastClick
    ? new Date(linkData.lastClick).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('noClicksYet');

  const domainPrefix = getDomainPrefix();

  return (
    <div className="analyticsPage">
      <div className="analyticsTopNav">
        <button
          type="button"
          className="backNavBtn"
          onClick={() => navigate('/')}
        >
          {t('backToComposer')}
        </button>

        <button
          type="button"
          className="primaryActionBtn"
          onClick={onOpenNewLink}
        >
          {t('createNewLink')}
        </button>
      </div>

      {/* Link Detail Header Card */}
      <section className="linkHeaderCard">
        <div className="linkHeaderTop">
          <div className="shortUrlGroup">
            <span className="analyticsBadge">{t('shortUrl')}</span>

            {/* Inline editor (Pro) or normal link display */}
            {isCustomizing ? (
              <div className="customizeEditorWrapper">
                <div className="customizeEditorRow">
                  <span className="shortDomainPrefix" aria-hidden="true" title={domainPrefix}>
                    {domainPrefix}
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="shortCodeInput"
                    value={customCode}
                    onChange={(e) => {
                      setCustomCode(e.target.value);
                      setCustomError('');
                    }}
                    onKeyDown={handleCustomizeKeyDown}
                    maxLength={30}
                    placeholder="Özel bağlantı metni"
                    aria-label="Özel bağlantı adı"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
                {customError && (
                  <p className="customizeError" role="alert">{customError}</p>
                )}
                <div className="customizeActions">
                  <button
                    type="button"
                    className="inlineActionBtn save"
                    onClick={handleCustomizeSave}
                    disabled={isSaving}
                    aria-label="Kaydet"
                  >
                    {isSaving ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Kaydediliyor…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Kaydet
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inlineActionBtn cancel"
                    onClick={handleCustomizeCancel}
                    disabled={isSaving}
                    aria-label="İptal"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a
                  href={linkData.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mainShortLink"
                >
                  {linkData.shortUrl}
                </a>
                {customSuccess && (
                  <span className="customizeSuccess">{customSuccess}</span>
                )}
                {/* Gate message for free users */}
                {gateMsg && (
                  <span className="customizeMsg" role="status">
                    Bağlantıyı özelleştirmek için Pro üyelik gereklidir.
                  </span>
                )}
              </>
            )}
          </div>

          <div className="linkHeaderActions">
            {/* Sparkles/customize icon — visible to all, functional for Pro */}
            <button
              type="button"
              className={`actionBtn customizeBtn ${isCustomizing ? 'active' : ''}`}
              onClick={handleCustomizeClick}
              aria-label="Bağlantıyı özelleştir"
              title="Bağlantıyı özelleştir"
            >
              {/* Sparkles icon */}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
                <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5z" />
              </svg>
            </button>

            {/* Restore-to-original undo icon — visible only when link is customized */}
            {isPro && linkData.originalShortCode && linkData.shortCode !== linkData.originalShortCode && !isCustomizing && (
              <button
                type="button"
                className="actionBtn"
                onClick={handleRestoreOriginal}
                disabled={isSaving}
                aria-label="Otomatik bağlantıya dön"
                title="Otomatik bağlantıya dön"
              >
                {/* Undo / rotate-ccw icon */}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                </svg>
              </button>
            )}

            {/* QR Code Icon-Only Button */}
            <button
              type="button"
              className={`actionBtn ${isQrModalOpen ? 'active' : ''}`}
              onClick={handleOpenQrModal}
              aria-label={t('customizeQrCode')}
              title={t('customizeQrCode')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" />
              </svg>
            </button>

            {/* Copy Link Icon-Only Button */}
            <button
              type="button"
              className={`actionBtn copyBtn ${isCopied ? 'copied' : ''}`}
              onClick={handleCopy}
              aria-label={isCopied ? t('copied') : t('copyLink')}
              title={isCopied ? t('copied') : t('copyLink')}
            >
              {isCopied ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="originalUrlRow" title={linkData.originalUrl}>
          <span className="rowLabel">{t('originalUrl')}</span>
          <span className="rowValue">{linkData.originalUrl}</span>
        </div>
      </section>

      {/* Modern QR Customization Modal — always uses current linkData.shortUrl */}
      <QrCustomizationModal
        isOpen={isQrModalOpen}
        onClose={handleCloseQrModal}
        shortCode={linkData.shortCode}
        shortUrl={linkData.shortUrl}
        initialSettings={linkData.qrSettings}
        onSettingsSaved={handleQrSettingsSaved}
      />

      {/* Overview Statistics Cards */}
      <section className="statsCardsGrid">
        <div className="statCard">
          <span className="statCardLabel">{t('totalClicks')}</span>
          <span className="statCardValue highlight">{linkData.clickCount}</span>
        </div>

        <div className="statCard">
          <span className="statCardLabel">{t('createdOn')}</span>
          <span className="statCardValue">{formattedCreated}</span>
        </div>

        <div className="statCard">
          <span className="statCardLabel">{t('lastClick')}</span>
          <span className="statCardValue">{formattedLastClick}</span>
        </div>
      </section>

      {/* Click Analytics Chart */}
      <section className="chartSection">
        <AnalyticsChart clicks={linkData.clicks || []} />
      </section>

      {/* Recent Clicks Activity Table */}
      <section className="activitySection">
        <h3 className="activityTitle">{t('recentClickActivity')}</h3>

        {!linkData.clicks || linkData.clicks.length === 0 ? (
          <div className="emptyActivityMessage">
            <h4 className="emptyActivityTitle">{t('noClickActivityHeader')}</h4>
            <p className="emptyActivitySub">{t('noClickActivitySub')}</p>
          </div>
        ) : (
          <div className="activityTableWrapper">
            <table className="activityTable">
              <thead>
                <tr>
                  <th>{t('tableHeaderIndex')}</th>
                  <th>{t('tableHeaderTimestamp')}</th>
                  <th>{t('tableHeaderStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {linkData.clicks
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((c, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {new Date(c.timestamp).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className="activeStatusTag">
                          <span className="statusDotLive">●</span> {t('activeStatus')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default LinkAnalyticsPage;
