import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { formatPrice, getPlanCopy } from '../config/plans';
import { checkoutPath } from '../utils/checkout';
import './SubscriptionCard.css';
import { useToast } from './Toast';

const TEXT = {
  tr: {
    title: 'Abonelik',
    trialing: (plan, date) => `${plan} denemen ${date} tarihine kadar ücretsiz.`,
    activeAuto: (plan, date) => `${plan} planın ${date} tarihinde yenilenir.`,
    thenCharge: (price, date) => `${date} tarihinde ${price} kartından çekilir.`,
    canceled: (plan, date) =>
      `${plan} aboneliğin iptal edildi, ${date} tarihine kadar kullanabilirsin. Sonrasında ücret alınmaz.`,
    pastDue: 'Son ödeme alınamadı, abonelik sona erdi. Linklerin çalışmaya devam ediyor.',
    cancel: 'Aboneliği iptal et',
    cancelAsk: 'Emin misin? Süre sonuna kadar kullanmaya devam edersin, sonra ücret alınmaz.',
    cancelYes: 'Evet, iptal et',
    cancelNo: 'Vazgeç',
    resume: 'İptali geri al',
    failed: 'İşlem yapılamadı, lütfen tekrar dene.',
    oneTime: (plan, date, days) => `${plan} planın ${date} tarihine kadar geçerli (${days} gün kaldı).`,
    soon: 'Süre dolunca linklerin çalışmaya devam eder; yeni bağlantı ve QR oluşturmak için planını uzatman gerekir.',
    expired: (plan, date) => `${plan} planının süresi ${date} tarihinde doldu. Linklerin çalışıyor; yeni bağlantı ve QR oluşturmak için planını yenile.`,
    extend: 'Planı uzat',
    renewNow: 'Planı yenile',
  },
  en: {
    title: 'Subscription',
    trialing: (plan, date) => `Your ${plan} trial is free until ${date}.`,
    activeAuto: (plan, date) => `Your ${plan} plan renews on ${date}.`,
    thenCharge: (price, date) => `${price} is charged to your card on ${date}.`,
    canceled: (plan, date) =>
      `Your ${plan} subscription is canceled. You can use it until ${date}, and you will not be charged after.`,
    pastDue: 'The last payment failed and the subscription ended. Your links keep working.',
    cancel: 'Cancel subscription',
    cancelAsk: 'Are you sure? You keep access until the period ends and are not charged after.',
    cancelYes: 'Yes, cancel',
    cancelNo: 'Keep it',
    resume: 'Undo cancellation',
    failed: 'Something went wrong, please try again.',
    oneTime: (plan, date, days) => `Your ${plan} plan is valid until ${date} (${days} days left).`,
    soon: 'When it ends your links keep working; you will need to extend your plan to create new links and QR codes.',
    expired: (plan, date) => `Your ${plan} plan ended on ${date}. Your links still work; renew your plan to create new links and QR codes.`,
    extend: 'Extend plan',
    renewNow: 'Renew plan',
  },
};

const formatDate = (value, lang) =>
  new Date(value).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Trial / auto-renew status with cancel and undo (Settings > Account). Hidden when there is nothing to manage. */
function SubscriptionCard() {
  const { lang } = useTranslation();
  const { userProfile, getIdToken, refetchProfile } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const showError = (message) => {
    setError(message);
    if (message) toast.error(message);
  };

  const sub = userProfile?.subscription;
  if (!sub || !['trialing', 'active', 'canceled', 'past_due', 'expired'].includes(sub.status)) return null;
  // A paid period without automatic renewal (the current one-time purchase) still shows its end date and a renew link
  const isOneTime = sub.status === 'active' && !sub.autoRenew && Boolean(sub.expiresAt);
  if (sub.status === 'active' && !sub.autoRenew && !isOneTime) return null;

  const text = TEXT[lang] || TEXT.en;
  const planCopy = getPlanCopy(lang);
  const planName = planCopy.names[sub.plan] || sub.plan;
  const date = sub.expiresAt ? formatDate(sub.expiresAt, lang) : '';

  const call = async (action) => {
    setBusy(true);
    showError('');
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/billing/${action}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error('failed');
      setConfirming(false);
      if (refetchProfile) await refetchProfile();
    } catch {
      showError(text.failed);
    } finally {
      setBusy(false);
    }
  };

  const daysLeft = sub.expiresAt ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86400000)) : 0;
  const renewHref = checkoutPath(sub.plan, sub.period || 'monthly');

  let message;
  if (sub.status === 'expired') message = text.expired(planName, date);
  else if (isOneTime) message = text.oneTime(planName, date, daysLeft);
  else if (sub.status === 'trialing') message = text.trialing(planName, date);
  else if (sub.status === 'canceled') message = text.canceled(planName, date);
  else if (sub.status === 'past_due') message = text.pastDue;
  else message = text.activeAuto(planName, date);

  return (
    <div className="subCard">
      <span className="subCardTitle">{text.title}</span>
      <p className="subCardText">{message}</p>
      {isOneTime && daysLeft <= 7 && <p className="subCardMuted">{text.soon}</p>}
      {(isOneTime || sub.status === 'expired') && (
        <a className="subBtn" href={renewHref}>
          {sub.status === 'expired' ? text.renewNow : text.extend}
        </a>
      )}
      {sub.status === 'trialing' && sub.autoRenew && (
        <p className="subCardMuted">{text.thenCharge(formatPrice(sub.plan, sub.period || 'monthly', sub.currency || 'TRY'), date)}</p>
      )}

      {sub.autoRenew &&
        ['trialing', 'active'].includes(sub.status) &&
        (confirming ? (
          <div className="subCardConfirm">
            <p className="subCardMuted">{text.cancelAsk}</p>
            <div className="subCardActions">
              <button type="button" className="subBtn isDanger" disabled={busy} onClick={() => call('cancel')}>
                {text.cancelYes}
              </button>
              <button type="button" className="subBtn" disabled={busy} onClick={() => setConfirming(false)}>
                {text.cancelNo}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="subBtn" onClick={() => setConfirming(true)}>
            {text.cancel}
          </button>
        ))}
      {sub.status === 'canceled' && (
        <button type="button" className="subBtn" disabled={busy} onClick={() => call('resume')}>
          {text.resume}
        </button>
      )}
    </div>
  );
}

export default SubscriptionCard;
