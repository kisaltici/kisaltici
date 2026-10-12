import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import './LimitBanner.css';

/** Shown in place of a usable input when the daily link allowance is used up. */
function LimitBanner({ kind, limit, onAction }) {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const isGuest = kind === 'guest';
  const isNoPlan = kind === 'no_plan';
  const hadPlan = userProfile?.subscription?.status === 'expired';
  return (
    <div className="limitBanner" role="status">
      <span className="limitBannerIcon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </span>
      <span className="limitBannerText">
        {isGuest
          ? t('guestLimitReached')
          : isNoPlan
          ? t(hadPlan ? 'expiredBanner' : 'noPlanBanner')
          : t('dailyLinkLimitReached', { limit })}
      </span>
      {onAction && (
        <button type="button" className="limitBannerBtn" onClick={onAction}>
          {isGuest ? t('signIn') : isNoPlan ? t(hadPlan ? 'expiredBtn' : 'noPlanBtn') : t('upgradePlan')}
        </button>
      )}
    </div>
  );
}

export default LimitBanner;
