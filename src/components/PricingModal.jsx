import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  SALE_PLANS,
  TRIAL_DAYS,
  formatListPrice,
  FEATURED_PLAN,
  DEFAULT_PERIOD,
  buildPlanRows,
  formatPrice,
  getClientLimits,
  getPlanCopy,
} from '../config/plans';
import { useBillingConfig } from '../utils/useBillingConfig';
import BillingToggle from './BillingToggle';
import './PricingModal.css';

function PricingModal({ isOpen, onClose, userPlan = 'free', onOpenAuthModal, onSelectPlan }) {
  const { t, lang } = useTranslation();
  const { user, userProfile } = useAuth();
  const copy = getPlanCopy(lang);
  const billing = useBillingConfig();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

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
  const subscription = userProfile?.subscription;
  const subDate = (value) =>
    new Date(value).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const daysLeft = (value) => Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
  const isExpired = subscription?.status === 'expired';

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
          {isExpired && (
            <p className="pricingNotice">
              {copy.subExpired}: {copy.names[subscription.plan]} · {subDate(subscription.expiresAt)}
            </p>
          )}

          <div className="pricingToggleRow">
            <BillingToggle period={period} onChange={setPeriod} />
          </div>

          <div className="pricingGrid">
            {SALE_PLANS.map((planId) => {
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
                      {formatListPrice(planId, period) && (
                        <span className="priceWas">{formatListPrice(planId, period)}</span>
                      )}
                      <span className="priceAmount">{formatPrice(planId, period)}</span>
                      <span className="pricePeriod">{period === 'yearly' ? copy.periodYear : copy.period}</span>
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
                      <>
                        {planId !== 'free' && subscription?.status === 'active' && subscription.expiresAt && (
                          <p className="planUsage">
                            {copy.subActive(subDate(subscription.expiresAt))} · {copy.subDaysLeft(daysLeft(subscription.expiresAt))}
                          </p>
                        )}
                        {planId !== 'free' && subscription?.status === 'manual' && (
                          <p className="planUsage">{copy.subManual}</p>
                        )}
                        {planId !== 'free' && billing.enabled && subscription?.status === 'active' && onSelectPlan ? (
                          <button
                            type="button"
                            className="planBtn upgrade"
                            onClick={() => onSelectPlan(planId, subscription.period || period)}
                          >
                            {copy.subRenew}
                          </button>
                        ) : (
                          <button type="button" className="planBtn current" disabled>
                            {copy.currentPlan}
                          </button>
                        )}
                      </>
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
                        disabled={!billing.enabled}
                        onClick={() => onSelectPlan && onSelectPlan(planId, period)}
                      >
                        {billing.enabled ? (billing.trial ? copy.trialCta(TRIAL_DAYS) : copy.selectPlan(copy.names[planId])) : copy.soon}
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
