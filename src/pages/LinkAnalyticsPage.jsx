import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import AnalyticsChart from '../components/AnalyticsChart';
import { useTranslation } from '../i18n/LanguageContext';
import { API_BASE_URL } from '../config/api';
import './LinkAnalyticsPage.css';

function LinkAnalyticsPage({ onOpenNewLink }) {
  const { t } = useTranslation();
  const { shortCode } = useParams();
  const navigate = useNavigate();

  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isQrOpening, setIsQrOpening] = useState(false);
  const [isQrClosing, setIsQrClosing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorStatus(null);
    setShowQr(false);
    setIsQrOpening(false);
    setIsQrClosing(false);

    const fetchLinkStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/urls/${shortCode}`
        );
        if (!isMounted) return;

        if (response.status === 404) {
          setErrorStatus(404);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          setErrorStatus(response.status);
          setIsLoading(false);
          return;
        }

        const payload = await response.json();
        if (payload.success && payload.data) {
          setLinkData(payload.data);
        } else {
          setErrorStatus(500);
        }
      } catch (err) {
        console.error('Failed to fetch link statistics:', err);
        if (isMounted) setErrorStatus(500);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLinkStats();

    return () => {
      isMounted = false;
    };
  }, [shortCode]);

  const handleToggleQr = () => {
    if (showQr) {
      if (isQrClosing) return;
      setIsQrClosing(true);
      setTimeout(() => {
        setShowQr(false);
        setIsQrClosing(false);
        setIsQrOpening(false);
      }, 200);
    } else {
      setIsQrClosing(false);
      setShowQr(true);
      setIsQrOpening(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsQrOpening(false);
        });
      });
    }
  };

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

  const handleDownloadQr = () => {
    try {
      const canvas = document.getElementById('qrCodeCanvasAnalytics');
      if (!canvas) return;

      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageUri;
      link.download = `qr-${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('QR download error:', e);
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

  if (errorStatus === 404 || !linkData) {
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
            <a
              href={linkData.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="mainShortLink"
            >
              {linkData.shortUrl}
            </a>
          </div>

          <div className="linkHeaderActions">
            {/* QR Code Icon-Only Button */}
            <button
              type="button"
              className={`actionBtn ${showQr && !isQrClosing ? 'active' : ''}`}
              onClick={handleToggleQr}
              aria-label={t('showQrCode')}
              title={t('showQrCode')}
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

        {(showQr || isQrClosing) && (
          <div
            className={`qrDrawerAnalytics ${
              isQrClosing ? 'closing' : !isQrOpening ? 'open' : ''
            }`}
          >
            <div className="qrCanvasBox">
              <QRCodeCanvas
                id="qrCodeCanvasAnalytics"
                value={linkData.shortUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#080a11"
                level="H"
                marginSize={1}
              />
            </div>
            <button
              type="button"
              className="downloadQrBtn"
              onClick={handleDownloadQr}
            >
              {t('downloadQr')}
            </button>
          </div>
        )}
      </section>

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
