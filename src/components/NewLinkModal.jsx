import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shortenUrl, hasUsedGuestLinkToday } from '../utils/shortenApi';
import { useShortenAllowance } from '../utils/useShortenAllowance';
import LimitBanner from './LimitBanner';
import './NewLinkModal.css';

function NewLinkModal({ isOpen, onClose, onUrlShortened, onLimitReached }) {
  const { t } = useTranslation();
  const { user, getIdToken } = useAuth();
  const allowance = useShortenAllowance();
  const blocked = allowance.blocked;
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInputUrl('');
      setErrorMessage('');
      setIsLoading(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || blocked) return;

    const validationResult = validateUrl(inputUrl);
    if (!validationResult.isValid) {
      setErrorMessage(validationResult.message);
      return;
    }

    setErrorMessage('');

    // Guests get one link per day: prompt to sign in instead of calling the API
    if (!user && hasUsedGuestLinkToday()) {
      setErrorMessage(t('guestLimitReached'));
      if (onLimitReached) onLimitReached('guest');
      return;
    }

    setIsLoading(true);

    try {
      const result = await shortenUrl(inputUrl, getIdToken);

      if (!result.success) {
        if (result.errorCode === 'guest_limit') {
          setErrorMessage(t('guestLimitReached'));
          if (onLimitReached) onLimitReached('guest');
        } else if (result.errorCode === 'daily_limit') {
          setErrorMessage(t('dailyLinkLimitReached', { limit: result.limit }));
          if (onLimitReached) onLimitReached('daily');
        } else if (result.errorCode === 'db') {
          setErrorMessage(t('errorDatabaseUnavailable'));
        } else {
          setErrorMessage(result.errorMessage || t('errorGeneric'));
        }
        setIsLoading(false);
        return;
      }

      // Close modal and notify parent of shortened URL
      onClose();
      if (onUrlShortened) {
        onUrlShortened(result.data);
      }
    } catch (error) {
      console.error('New link shorten error:', error);
      setErrorMessage(t('errorBackendOffline'));
      setIsLoading(false);
    }
  };

  return (
    <div className="searchModalBackdrop" onClick={onClose}>
      <div
        className="searchModalBox newLinkModalBox"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} noValidate className="newLinkModalForm">
          <div className="newLinkModalHeader">
            <input
              ref={inputRef}
              type="url"
              className="newLinkModalInput"
              placeholder={t('pasteLinkPlaceholder')}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              disabled={isLoading || blocked}
              aria-label={t('pasteLinkPlaceholder')}
            />

            <button
              type="submit"
              className="newLinkSubmitBtn"
              disabled={isLoading || blocked || !inputUrl.trim()}
              aria-label={t('shorten')}
              title={t('shorten')}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
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
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="closeSearchBtn"
              onClick={onClose}
              aria-label={t('closeModal')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {blocked && (
            <div className="newLinkLimit">
              <LimitBanner
                kind={allowance.kind}
                limit={allowance.limit}
                onAction={() => {
                  onClose();
                  if (onLimitReached) onLimitReached(allowance.kind);
                }}
              />
            </div>
          )}

          {errorMessage && (
            <div className="modalErrorMessage" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default NewLinkModal;
