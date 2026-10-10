import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  PLAN_ORDER,
  FEATURED_PLAN,
  PAYMENTS_ENABLED,
  buildPlanRows,
  formatPrice,
  getClientLimits,
  getPlanCopy,
} from '../config/plans';
import './PricingModal.css';

function PricingModal({ isOpen, onClose, userPlan = 'free', onOpenAuthModal }) {
  const { t, lang } = useTranslation();
  const { user, userProfile } = useAuth();
  const copy = getPlanCopy(lang);

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

  const isAdmin = userPlan === 'admin';
  const usage = userProfile?.usage;
  const currentLimits = getClientLimits(userPlan);

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
          {isAdmin && <p className="pricingNotice">{copy.adminNote}</p>}

          <div className="pricingGrid">
            {PLAN_ORDER.map((planId) => {
              // Guests are not on any plan yet
              const isCurrent = Boolean(user) && userPlan === planId;
              const isFeatured = planId === FEATURED_PLAN;
              const rows = buildPlanRows(planId, lang);
              const showUsage =
                isCurrent &&
                usage &&
                currentLimits.dailyLinks !== null &&
                currentLimits.dailyQr !== null;

              return (
                <div
                  key={planId}
                  className={`planCard ${isFeatured ? 'proCard' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="planCardHeader">
                    <div className="planTitleRow">
                      <h3 className="planName">{copy.names[planId]}</h3>
                      {isFeatured && <span className="recommendedBadge">{copy.recommended}</span>}
                    </div>
                    <p className="planDesc">{copy.descs[planId]}</p>
                    <div className="planPriceRow">
                      <span className="priceAmount">{formatPrice(planId)}</span>
                      <span className="pricePeriod">{copy.period}</span>
                    </div>
                  </div>

                  <div className="planDivider" />

                  <ul className="planFeatures">
                    {rows.map((row) => (
                      <li key={row.key} className={row.included ? '' : 'planFeatureOff'}>
                        <svg
                          className={`checkIcon ${isFeatured ? 'proCheck' : ''}`}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          {row.included ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <line x1="6" y1="12" x2="18" y2="12" />
                          )}
                        </svg>
                        <span>{row.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="planActionArea">
                    {showUsage && (
                      <p className="planUsage">
                        {copy.usageToday(usage.links, usage.qr, currentLimits)}
                      </p>
                    )}
                    {isCurrent ? (
                      <button type="button" className="planBtn current" disabled>
                        {copy.currentPlan}
                      </button>
                    ) : planId === 'free' ? (
                      !user && onOpenAuthModal ? (
                        <button
                          type="button"
                          className="planBtn upgrade"
                          onClick={() => {
                            onClose();
                            onOpenAuthModal('register');
                          }}
                        >
                          {copy.startFree}
                        </button>
                      ) : null
                    ) : (
                      <button
                        type="button"
                        className={`planBtn upgrade ${isFeatured ? 'primary' : ''}`}
                        disabled={!PAYMENTS_ENABLED}
                      >
                        {PAYMENTS_ENABLED ? copy.selectPlan(copy.names[planId]) : copy.soon}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
