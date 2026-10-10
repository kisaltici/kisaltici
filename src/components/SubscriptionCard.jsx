import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { formatPrice, getPlanCopy } from '../config/plans';
import './SubscriptionCard.css';

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

  const sub = userProfile?.subscription;
  if (!sub || !['trialing', 'active', 'canceled', 'past_due'].includes(sub.status)) return null;
  if (sub.status === 'active' && !sub.autoRenew) return null;

  const text = TEXT[lang] || TEXT.en;
  const planCopy = getPlanCopy(lang);
  const planName = planCopy.names[sub.plan] || sub.plan;
  const date = sub.expiresAt ? formatDate(sub.expiresAt, lang) : '';

  const call = async (action) => {
    setBusy(true);
    setError('');
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
      setError(text.failed);
    } finally {
      setBusy(false);
    }
  };

  let message;
  if (sub.status === 'trialing') message = text.trialing(planName, date);
  else if (sub.status === 'canceled') message = text.canceled(planName, date);
  else if (sub.status === 'past_due') message = text.pastDue;
  else message = text.activeAuto(planName, date);

  return (
    <div className="subCard">
      <span className="subCardTitle">{text.title}</span>
      <p className="subCardText">{message}</p>
      {sub.status === 'trialing' && sub.autoRenew && (
        <p className="subCardMuted">{text.thenCharge(formatPrice(sub.plan, sub.period || 'monthly', sub.currency || 'TRY'), date)}</p>
      )}
      {error && (
        <p className="subCardError" role="alert">
          {error}
        </p>
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
