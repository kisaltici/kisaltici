import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import './HelpModal.css';

function HelpModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  const [openIndex, setOpenIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  const faqItems = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
    { q: t('faqQ6'), a: t('faqA6') },
    { q: t('faqQ7'), a: t('faqA7') },
    { q: t('faqQ8'), a: t('faqA8') },
  ];

  // Handle two-stage entrance and exit animation
  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsMounted(true);
      setOpenIndex(null);
      timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 20);
    } else {
      setIsAnimatingIn(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleToggleFaq = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      className={`helpModalBackdrop ${isAnimatingIn ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`helpModalBox ${isAnimatingIn ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Modal Header */}
        <div className="helpModalHeader">
          <div className="helpHeaderTitleGroup">
            <h2 id="help-modal-title" className="helpModalTitle">
              {t('help')}
            </h2>
            <p className="helpModalSubtitle">{t('helpSubtitle')}</p>
          </div>

          <button
            type="button"
            className="helpCloseBtn"
            onClick={onClose}
            aria-label={t('closeModal')}
            title={t('closeModal')}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body / FAQ Accordion */}
        <div className="helpModalBody">
          <div className="faqSectionTitle">{t('faqTitle')}</div>

          <div className="faqList">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`faqItem ${isOpen ? 'expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="faqQuestionHeader"
                    onClick={() => handleToggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faqQuestionText">{item.q}</span>
                    <svg
                      className={`faqChevronIcon ${isOpen ? 'rotated' : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div className={`faqAnswerWrapper ${isOpen ? 'open' : ''}`}>
                    <div className="faqAnswerContent">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Informational Card */}
          <div className="helpFooterCard">
            <div className="helpFooterInfo">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="helpFooterIcon"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <h4 className="helpFooterTitle">{t('needMoreHelpTitle')}</h4>
                <p className="helpFooterSub">{t('needMoreHelpSub')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
