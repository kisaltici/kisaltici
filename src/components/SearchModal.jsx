import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import './SearchModal.css';

function SearchModal({ isOpen, onClose, historyList, onSelectLink }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredHistory = historyList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.shortCode && item.shortCode.toLowerCase().includes(q)) ||
      (item.originalUrl && item.originalUrl.toLowerCase().includes(q)) ||
      (item.shortUrl && item.shortUrl.toLowerCase().includes(q))
    );
  });

  return (
    <div className="searchModalBackdrop" onClick={onClose}>
      <div className="searchModalBox" onClick={(e) => e.stopPropagation()}>
        <div className="searchModalHeader">
          <svg
            className="searchModalIcon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="searchModalInput"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('search')}
          />
          <button
            type="button"
            className="closeSearchBtn"
            onClick={onClose}
            aria-label={t('closeSearch')}
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

        <div className="searchModalResults">
          {filteredHistory.length === 0 ? (
            <div className="noSearchResults">
              {searchQuery.trim()
                ? t('noLinksMatch', { query: searchQuery })
                : t('noSavedLinks')}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.shortCode}
                className="searchResultItem"
                onClick={() => {
                  onSelectLink(item.shortCode);
                  onClose();
                }}
              >
                <div className="resultItemMain">
                  <span className="resultItemTitle">{item.title}</span>
                  <span className="resultItemUrl">{item.originalUrl}</span>
                </div>
                <span className="resultItemCode">{item.shortCode}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
