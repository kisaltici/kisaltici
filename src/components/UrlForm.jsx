import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import './UrlForm.css';

function UrlForm({ onUrlShortened }) {
  const { t } = useTranslation();
  const { getIdToken } = useAuth();
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate URL string locally using native JavaScript URL constructor
  const validateUrl = (urlToTest) => {
    const trimmedUrl = urlToTest.trim();

    if (!trimmedUrl) {
      return { isValid: false, message: t('errorEmptyUrl') };
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return {
          isValid: false,
          message: t('errorInvalidProtocol'),
        };
      }

      return { isValid: true, message: '' };
    } catch (error) {
      return {
        isValid: false,
        message: t('errorInvalidUrl'),
      };
    }
  };

  const handleInputChange = (event) => {
    setInputUrl(event.target.value);

    // Clear error messages when user modifies input
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    const validationResult = validateUrl(inputUrl);

    if (!validationResult.isValid) {
      setErrorMessage(validationResult.message);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = await getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send URL to backend API endpoint
      const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ originalUrl: inputUrl.trim() }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (response.status === 503 || data?.code === 'DATABASE_UNAVAILABLE') {
          setErrorMessage(t('errorDatabaseUnavailable'));
        } else {
          setErrorMessage(data?.error || t('errorGeneric'));
        }
        return;
      }

      // Pass backend-generated short URL data up to parent component
      if (onUrlShortened) {
        onUrlShortened({
          originalUrl: data.originalUrl,
          shortCode: data.shortCode,
          shortUrl: data.shortUrl,
        });
      }
    } catch (error) {
      console.error('API shorten request error:', error);
      setErrorMessage(t('errorBackendOffline'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="urlForm" onSubmit={handleSubmit} noValidate>
      <label htmlFor="urlInput" className="visuallyHidden">
        {t('pasteLinkShortenPlaceholder')}
      </label>

      <div className={`inputGroup ${errorMessage ? 'hasError' : ''}`}>
        <input
          id="urlInput"
          type="url"
          className="urlInput"
          value={inputUrl}
          onChange={handleInputChange}
          placeholder={t('pasteLinkShortenPlaceholder')}
          aria-label={t('pasteLinkShortenPlaceholder')}
          aria-invalid={Boolean(errorMessage)}
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
          {isLoading ? (
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

      {errorMessage && (
        <div className="errorMessage" role="alert">
          <span className="errorIcon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  );
}

export default UrlForm;
