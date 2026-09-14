import { useState, useEffect } from 'react';
import QrCustomizationModal from './QrCustomizationModal';
import { API_BASE_URL } from '../config/api';
import './ResultSection.css';

function ResultSection({ result }) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [clickCount, setClickCount] = useState(result?.clickCount || 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrSettings, setQrSettings] = useState(result?.qrSettings || null);

  // Sync state and hide QR code whenever a new short URL result is generated
  useEffect(() => {
    setIsCopied(false);
    setCopyError('');
    setClickCount(result?.clickCount || 0);
    setIsQrModalOpen(false);
    setQrSettings(result?.qrSettings || null);
  }, [result]);

  if (!result) {
    return null;
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.shortUrl);
        setIsCopied(true);
        setCopyError('');

        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyError('Unable to copy automatically. Please copy the link manually.');
      setTimeout(() => {
        setCopyError('');
      }, 3000);
    }
  };

  const handleRefreshStats = async () => {
    if (isRefreshing || !result.shortCode) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/urls/${result.shortCode}`
      );
      if (response.ok) {
        const payload = await response.json();
        if (payload.success && payload.data) {
          setClickCount(payload.data.clickCount);
        }
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenQr = () => {
    setIsQrModalOpen(true);
  };

  const handleCloseQr = () => {
    setIsQrModalOpen(false);
  };

  const handleQrSaved = (code, savedSettings) => {
    setQrSettings(savedSettings);
  };

  return (
    <section className="resultCardContainer" aria-label="Shortened URL result">
      <div className="resultCardHeader">
        <span className="successBadge">✓ Link Shortened</span>
      </div>

      <div className="resultCard">
        <div className="urlDetails">
          <div className="originalUrlText" title={result.originalUrl}>
            <span className="labelPrefix">Original:</span> {result.originalUrl}
          </div>
          <div className="shortUrlText">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="shortUrlLink"
              aria-label={`Open shortened URL ${result.shortUrl} in a new tab`}
            >
              {result.shortUrl}
            </a>
          </div>
        </div>

        <div className="resultCardActions">
          <button
            type="button"
            className={`actionBtn qrToggleBtn ${isQrModalOpen ? 'active' : ''}`}
            onClick={handleOpenQr}
            aria-label="Customize QR Code"
          >
            <span className="btnIcon">📷</span>
            <span>QR Code</span>
          </button>

          <button
            type="button"
            className={`actionBtn copyButton ${isCopied ? 'copied' : ''}`}
            onClick={handleCopy}
            aria-label={isCopied ? 'Short URL copied' : 'Copy short URL to clipboard'}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <QrCustomizationModal
        isOpen={isQrModalOpen}
        onClose={handleCloseQr}
        shortCode={result.shortCode}
        shortUrl={result.shortUrl}
        initialSettings={qrSettings}
        onSettingsSaved={handleQrSaved}
      />

      <div className="statsFooter">
        <div className="clickStats">
          <span className="statsIcon">📊</span>
          <span className="clickCountText">
            <strong>{clickCount}</strong> {clickCount === 1 ? 'click' : 'clicks'}
          </span>
        </div>

        <button
          type="button"
          className="refreshButton"
          onClick={handleRefreshStats}
          disabled={isRefreshing}
          title="Refresh click count"
          aria-label="Refresh click count"
        >
          <span className={`refreshIcon ${isRefreshing ? 'spinning' : ''}`}>
            ↻
          </span>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {copyError && (
        <div className="copyErrorMessage" role="status">
          {copyError}
        </div>
      )}
    </section>
  );
}

export default ResultSection;
