import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import './PricingModal.css';

function PricingModal({ isOpen, onClose, userPlan = 'free' }) {
  const { t } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  // Handle two-stage entrance and exit animation
  useEffect(() => {
    let timer;
    if (isOpen) {
      setIsMounted(true);
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

  const isFreeCurrent = userPlan === 'free';
  const isProCurrent = userPlan === 'pro';

  return (
    <div
      className={`pricingModalBackdrop ${isAnimatingIn ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`pricingModalBox ${isAnimatingIn ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
      >
        {/* Modal Header */}
        <div className="pricingModalHeader">
          <div className="pricingHeaderTitleGroup">
            <h2 id="pricing-modal-title" className="pricingModalTitle">
              {t('pricingModalTitle')}
            </h2>
            <p className="pricingModalSubtitle">{t('pricingModalSubtitle')}</p>
          </div>

          <button
            type="button"
            className="pricingCloseBtn"
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

        {/* Modal Body / Pricing Cards */}
        <div className="pricingModalBody">
          <div className="pricingGrid">
            {/* 1. FREE PLAN */}
            <div className={`planCard ${isFreeCurrent ? 'current' : ''}`}>
              <div className="planCardHeader">
                <div className="planTitleRow">
                  <h3 className="planName">{t('planFreeName')}</h3>
                </div>
                <p className="planDesc">{t('planFreeDesc')}</p>
                <div className="planPriceRow">
                  <span className="priceAmount">{t('planFreePrice')}</span>
                  <span className="pricePeriod">{t('planPeriodMo')}</span>
                </div>
              </div>

              <div className="planDivider" />

              <ul className="planFeatures">
                <li>
                  <svg className="checkIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planFreeF1')}</span>
                </li>
                <li>
                  <svg className="checkIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planFreeF2')}</span>
                </li>
                <li>
                  <svg className="checkIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planFreeF3')}</span>
                </li>
                <li>
                  <svg className="checkIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planFreeF4')}</span>
                </li>
                <li>
                  <svg className="checkIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planFreeF5')}</span>
                </li>
              </ul>

              <div className="planActionArea">
                {isFreeCurrent ? (
                  <button type="button" className="planBtn current" disabled>
                    {t('currentPlanBtn')}
                  </button>
                ) : (
                  <button type="button" className="planBtn upgrade">
                    {t('upgradeToPlanBtn', { plan: t('planFreeName') })}
                  </button>
                )}
              </div>
            </div>

            {/* 2. PRO PLAN */}
            <div className={`planCard proCard ${isProCurrent ? 'current' : ''}`}>
              <div className="planCardHeader">
                <div className="planTitleRow">
                  <h3 className="planName">{t('planProName')}</h3>
                  <span className="recommendedBadge">{t('recommendedBadge')}</span>
                </div>
                <p className="planDesc">{t('planProDesc')}</p>
                <div className="planPriceRow">
                  <span className="priceAmount">{t('planProPrice')}</span>
                  <span className="pricePeriod">{t('planPeriodMo')}</span>
                </div>
              </div>

              <div className="planDivider" />

              <ul className="planFeatures">
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF1')}</span>
                </li>
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF2')}</span>
                </li>
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF3')}</span>
                </li>
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF4')}</span>
                </li>
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF5')}</span>
                </li>
                <li>
                  <svg className="checkIcon proCheck" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{t('planProF6')}</span>
                </li>
              </ul>

              <div className="planActionArea">
                {isProCurrent ? (
                  <button type="button" className="planBtn current" disabled>
                    {t('currentPlanBtn')}
                  </button>
                ) : (
                  <button type="button" className="planBtn upgrade primary">
                    {t('upgradeToPlanBtn', { plan: t('planProName') })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
