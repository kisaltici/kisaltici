import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CHECKOUT_COPY } from '../i18n/checkoutCopy';
import { API_BASE_URL } from '../config/api';
import {
  PAID_PLANS,
  TRIAL_DAYS,
  DEFAULT_PERIOD,
  buildPlanRows,
  formatPrice,
  getPlanCopy,
  getPlanPrice,
  isBillingPeriod,
  isPaidPlanId,
} from '../config/plans';
import { checkoutPath } from '../utils/checkout';
import { useBillingConfig } from '../utils/useBillingConfig';
import BillingToggle from '../components/BillingToggle';
import LegalLinks from '../components/LegalLinks';
import { legalPath } from '../content/legalSlugs';
import './CheckoutPage.css';
import { useToast } from '../components/Toast';

const formatDate = (value, lang) =>
  new Date(value).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// gated = account without an active plan: the back button becomes "sign out" (there is no dashboard to go back to)
function TopBar({ theme, onBack, text, gated = false }) {
  const isDark = theme === 'dark';
  return (
    <header className="cxTop">
      <div className="cxTopInner">
        <button type="button" className="cxBack" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {gated ? <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /> : <path d="M19 12H5M11 18l-6-6 6-6" />}
          </svg>
          <span>{gated ? text.signOut : text.back}</span>
        </button>
        <img src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'} alt="Kısaltıcı" className="cxLogo" width="74" height="24" />
        <span className="cxSecure">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>{text.secure}</span>
        </span>
      </div>
    </header>
  );
}

/* ---------------- Result pages (/checkout/success, /checkout/failed) ---------------- */
function ResultView({ kind, theme }) {
  const { lang } = useTranslation();
  const { getIdToken, refetchProfile, membershipPlan, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const text = CHECKOUT_COPY[lang] || CHECKOUT_COPY.en;
  const planCopy = getPlanCopy(lang);
  const gated = membershipPlan === 'free';
  const orderId = new URLSearchParams(location.search).get('oid');

  const [order, setOrder] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  // The auth helpers change identity whenever the profile refreshes; keep them in a ref so a refresh
  // never restarts the polling below
  const helpersRef = useRef({ getIdToken, refetchProfile, navigate });
  helpersRef.current = { getIdToken, refetchProfile, navigate };

  // The browser redirect is not proof of payment: poll until the PayTR notification has been processed
  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;
    let attempts = 0;
    const timers = [];

    const poll = async () => {
      attempts += 1;
      try {
        const token = await helpersRef.current.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/billing/order/${encodeURIComponent(orderId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (data?.success) {
          setOrder(data);
          if (data.status !== 'pending') {
            if (data.status === 'paid') {
              // Refresh the profile so the new plan is known, then open the dashboard after a short success moment
              if (helpersRef.current.refetchProfile) await helpersRef.current.refetchProfile();
              if (active) timers.push(setTimeout(() => helpersRef.current.navigate('/dashboard', { replace: true }), 2500));
            }
            return;
          }
        }
      } catch {
        /* keep polling */
      }
      if (!active) return;
      if (attempts >= 30) {
        setTimedOut(true);
        return;
      }
      timers.push(setTimeout(poll, 2000));
    };
    poll();
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [orderId]);

  const goDashboard = async () => {
    if (refetchProfile) await refetchProfile();
    navigate('/dashboard', { replace: true });
  };

  const isPaid = order?.status === 'paid';
  const isFailedOrder = order?.status === 'failed';
  const showFailed = kind === 'failed' || isFailedOrder;

  return (
    <div className="cxPage">
      <TopBar theme={theme} onBack={gated ? signOutUser : () => navigate('/dashboard')} text={text} gated={gated} />
      <main className="cxResult">
        {showFailed ? (
          <>
            <span className="cxResultMark isBad" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </span>
            <h1 className="cxResultTitle">{text.failed.title}</h1>
            <p className="cxResultText">{order?.failedReason || text.failed.text}</p>
            <div className="cxResultActions">
              <button
                type="button"
                className="cxBtn isPrimary"
                onClick={() => navigate(order ? checkoutPath(order.plan, order.period) : '/checkout')}
              >
                {text.failed.retry}
              </button>
              {gated ? (
                <button type="button" className="cxBtn" onClick={signOutUser}>{text.signOut}</button>
              ) : (
                <button type="button" className="cxBtn" onClick={goDashboard}>{text.failed.goDashboard}</button>
              )}
            </div>
          </>
        ) : isPaid ? (
          <>
            <span className="cxResultMark isGood" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <h1 className="cxResultTitle">{order.trial ? text.success.trialTitle : text.success.title}</h1>
            <p className="cxResultText">
              {(order.trial ? text.success.trialText : text.success.text)(
                planCopy.names[order.plan] || order.plan,
                order.expiresAt ? formatDate(order.expiresAt, lang) : ''
              )}
            </p>
            <div className="cxResultActions">
              <button type="button" className="cxBtn isPrimary" onClick={goDashboard}>{text.success.goDashboard}</button>
            </div>
          </>
        ) : timedOut ? (
          <>
            <span className="cxResultMark" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <h1 className="cxResultTitle">{text.success.pendingTitle}</h1>
            <p className="cxResultText">{text.success.pendingText}</p>
            <div className="cxResultActions">
              <button type="button" className="cxBtn isPrimary" onClick={goDashboard}>{text.success.goDashboard}</button>
            </div>
          </>
        ) : (
          <>
            <span className="cxResultBar" aria-hidden="true" />
            <h1 className="cxResultTitle">{text.success.checking}</h1>
            <p className="cxResultText">{text.success.checkingText}</p>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------------- Checkout (/checkout?plan=&period=) ---------------- */
function CheckoutForm({ theme }) {
  const { lang } = useTranslation();
  const { user, profileDisplayName, getIdToken, membershipPlan, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const billing = useBillingConfig();
  const text = CHECKOUT_COPY[lang] || CHECKOUT_COPY.en;
  const planCopy = getPlanCopy(lang);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [plan, setPlan] = useState(isPaidPlanId(query.get('plan')) ? query.get('plan') : 'pro');
  const [period, setPeriod] = useState(isBillingPeriod(query.get('period')) ? query.get('period') : DEFAULT_PERIOD);

  const [fullName, setFullName] = useState(profileDisplayName && !profileDisplayName.includes('@') ? profileDisplayName : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const showError = (message) => {
    setError(message);
    if (message) toast.error(message);
  };
  const [payment, setPayment] = useState(null); // { iframeUrl, testMode }

  // Keep the address bar in sync with the selection (shareable / survives refresh)
  useEffect(() => {
    navigate(checkoutPath(plan, period), { replace: true });
  }, [plan, period, navigate]);

  // PayTR's iFrame resizer
  useEffect(() => {
    if (!payment?.iframeUrl) return undefined;
    const script = document.createElement('script');
    script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
    script.onload = () => {
      if (window.iFrameResize) window.iFrameResize({}, '#paytriframe');
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, [payment?.iframeUrl]);

  const changeSelection = useCallback((apply) => {
    // Changing plan or period discards an open PayTR session; the payment page is created again
    setPayment(null);
    showError('');
    apply();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      showError(text.errors.required);
      return;
    }
    if (!accepted) {
      showError(text.termsRequired);
      return;
    }
    showError('');
    setIsLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ plan, period, fullName, phone, address, acceptTerms: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        showError(data?.error || text.errors.generic);
        return;
      }
      setPayment({ iframeUrl: data.iframeUrl, testMode: data.testMode });
    } catch {
      showError(text.errors.generic);
    } finally {
      setIsLoading(false);
    }
  };

  const total = formatPrice(plan, period, billing.currency);
  const isTrial = Boolean(billing.trial);
  const chargeDate = formatDate(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000, lang);
  const rows = buildPlanRows(plan, lang);

  return (
    <div className="cxPage">
      <TopBar
        theme={theme}
        onBack={membershipPlan === 'free' ? signOutUser : () => navigate('/dashboard')}
        text={text}
        gated={membershipPlan === 'free'}
      />

      <main className="cxMain">
        <h1 className="cxTitle">{isTrial ? text.trialTitle(TRIAL_DAYS) : text.title}</h1>

        <div className="cxGrid">
          {/* Left: plan selection */}
          <section className="cxCard cxPlans" aria-label={text.choosePlan}>
            <BillingToggle period={period} onChange={(next) => changeSelection(() => setPeriod(next))} />

            <div className="cxPlanList" role="radiogroup" aria-label={text.choosePlan}>
              {PAID_PLANS.map((planId) => (
                <button
                  key={planId}
                  type="button"
                  role="radio"
                  aria-checked={plan === planId}
                  className={`cxPlan ${plan === planId ? 'isOn' : ''}`}
                  onClick={() => changeSelection(() => setPlan(planId))}
                >
                  <span className="cxPlanRadio" aria-hidden="true" />
                  <span className="cxPlanText">
                    <span className="cxPlanName">{planCopy.names[planId]}</span>
                    <span className="cxPlanDesc">{planCopy.descs[planId]}</span>
                  </span>
                  <span className="cxPlanPrice">
                    {formatPrice(planId, period, billing.currency)}
                    <em>{period === 'yearly' ? planCopy.periodYear : planCopy.period}</em>
                  </span>
                </button>
              ))}
            </div>

            <ul className="cxFeatures">
              {rows.map((row) => (
                <li key={row.key} className={row.included ? '' : 'isOff'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {row.included ? <polyline points="20 6 9 17 4 12" /> : <line x1="6" y1="12" x2="18" y2="12" />}
                  </svg>
                  <span>{row.label}</span>
                </li>
              ))}
            </ul>

            {isTrial ? (
              <div className="cxTrial">
                <div className="cxTrialRow">
                  <span>{text.trialToday}</span>
                  <strong>{text.trialTodayValue}</strong>
                </div>
                <div className="cxTrialRow isMuted">
                  <span>{text.trialThen(chargeDate)}</span>
                  <strong>
                    {total}
                    <em>{period === 'yearly' ? planCopy.periodYear : planCopy.period}</em>
                  </strong>
                </div>
                <p className="cxNote">{text.trialCancel}</p>
              </div>
            ) : (
              <>
                <div className="cxSummary">
                  <span>{planCopy.names[plan]} · {period === 'yearly' ? text.forPeriodYearly : text.forPeriodMonthly}</span>
                  <strong>{total}</strong>
                </div>
                <p className="cxNote">{text.renewNote}</p>
              </>
            )}
          </section>

          {/* Right: details + PayTR iframe */}
          <section className="cxCard cxPay" aria-label={text.paymentTitle}>
            {!billing.loading && !billing.enabled ? (
              <div className="cxDisabled">
                <h2>{text.disabledTitle}</h2>
                <p>{text.disabledText}</p>
              </div>
            ) : payment ? (
              <>
                <div className="cxPayHead">
                  <h2>{text.paymentTitle}</h2>
                  <button type="button" className="cxLink" onClick={() => setPayment(null)}>{text.editInfo}</button>
                </div>
                {payment.testMode && <p className="cxTest">{text.testMode}</p>}
                <iframe
                  id="paytriframe"
                  title={text.paymentTitle}
                  src={payment.iframeUrl}
                  className="cxFrame"
                  frameBorder="0"
                  scrolling="no"
                />
                <p className="cxNote">{text.cardNote}</p>
              </>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="cxForm">
                <h2>{text.billingInfo}</h2>

                <label className="cxField">
                  <span>{text.email}</span>
                  <input type="email" value={user?.email || ''} readOnly className="cxInput isReadonly" />
                </label>
                <label className="cxField">
                  <span>{text.fullName}</span>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="cxInput" autoComplete="name" maxLength={60} />
                </label>
                <label className="cxField">
                  <span>{text.phone}</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={text.phonePlaceholder} className="cxInput" autoComplete="tel" maxLength={20} />
                </label>
                <label className="cxField">
                  <span>{text.address}</span>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={text.addressPlaceholder} className="cxInput cxTextarea" rows={3} maxLength={400} autoComplete="street-address" />
                </label>

                <label className="cxConsent">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                  <span>
                    {text.termsLead}
                    <a href={legalPath(lang, 'on-bilgilendirme-formu')} target="_blank" rel="noopener noreferrer">{text.termsForm}</a>
                    {text.termsAnd}
                    <a href={legalPath(lang, 'mesafeli-satis-sozlesmesi')} target="_blank" rel="noopener noreferrer">{text.termsContract}</a>
                    {isTrial ? text.trialTermsTail : text.termsTail}
                  </span>
                </label>

                {billing.testMode && <p className="cxTest">{text.testMode}</p>}

                <button type="submit" className="cxBtn isPrimary isWide" disabled={isLoading || billing.loading}>
                  {isLoading ? text.preparing : isTrial ? text.trialPayButton : `${text.payButton} · ${total}`}
                </button>
                <p className="cxNote">{isTrial ? text.trialNote : text.cardNote}</p>
              </form>
            )}
          </section>
        </div>
        <LegalLinks className="cxLegal" lang={lang} />
      </main>
    </div>
  );
}

function CheckoutPage({ theme }) {
  const location = useLocation();
  if (location.pathname.startsWith('/checkout/success')) return <ResultView kind="success" theme={theme} />;
  if (location.pathname.startsWith('/checkout/failed')) return <ResultView kind="failed" theme={theme} />;
  return <CheckoutForm theme={theme} />;
}

export default CheckoutPage;
