// Plan definitions for the marketing surfaces (landing page, pricing modal).
// The enforced limits live on the server (server/config/plans.js). Keep the two in sync.
// `null` means unlimited.

// Flip to true once the payment flow is live; until then paid plan buttons read "soon".
export const PAYMENTS_ENABLED = false;

export const PLAN_ORDER = ['free', 'starter', 'pro', 'business'];
export const FEATURED_PLAN = 'pro';

export const PLAN_PRICES = { free: 0, starter: 49, pro: 149, business: 399 };

export const PLAN_LIMITS = {
  free: { dailyLinks: 5, dailyQr: 3, statsDays: 30, customLinks: false, themes: 5 },
  starter: { dailyLinks: 30, dailyQr: 20, statsDays: 90, customLinks: false, themes: 15 },
  pro: { dailyLinks: 100, dailyQr: 100, statsDays: 365, customLinks: true, themes: 15 },
  business: { dailyLinks: 500, dailyQr: 500, statsDays: null, customLinks: true, themes: 15 },
};

export const GUEST_LIMITS = { dailyLinks: 1, dailyQr: 1 };

const COPY = {
  tr: {
    names: { free: 'Ücretsiz', starter: 'Başlangıç', pro: 'Profesyonel', business: 'Kurumsal' },
    descs: {
      free: 'Denemek ve küçük işler için.',
      starter: 'Düzenli paylaşım yapanlar için.',
      pro: 'Büyüyen projeler ve kişisel markalar için.',
      business: 'Yoğun kullanım ve ekipler için.',
    },
    support: {
      free: 'Standart destek',
      starter: 'E-posta desteği',
      pro: 'Öncelikli destek',
      business: 'Öncelikli destek, hızlı yanıt',
    },
    links: (n) => `Günde ${n} bağlantı`,
    qr: (n) => `Günde ${n} QR kod`,
    stats: (d) =>
      d === null ? 'Sınırsız istatistik geçmişi' : d === 365 ? '1 yıllık istatistik geçmişi' : `Son ${d} gün istatistik`,
    lifetime: 'Süresiz aktif bağlantılar',
    history: 'Bağlantı geçmişi',
    custom: 'Özel bağlantılar',
    themes: (n) => `${n} renk teması`,
    period: '/ ay',
    recommended: 'Önerilen',
    soon: 'Yakında',
    currentPlan: 'Mevcut planın',
    startFree: 'Ücretsiz başla',
    usageToday: (l, q, limits) =>
      `Bugün: ${l}/${limits.dailyLinks} bağlantı, ${q}/${limits.dailyQr} QR`,
    adminNote: 'Hesabın ADMIN: tüm limitler kapalı, her şey sınırsız.',
    selectPlan: (name) => `${name} planını seç`,
  },
  en: {
    names: { free: 'Free', starter: 'Starter', pro: 'Professional', business: 'Business' },
    descs: {
      free: 'For trying it out and small jobs.',
      starter: 'For people who share regularly.',
      pro: 'For growing projects and personal brands.',
      business: 'For heavy usage and teams.',
    },
    support: {
      free: 'Standard support',
      starter: 'Email support',
      pro: 'Priority support',
      business: 'Priority support, fast response',
    },
    links: (n) => `${n} links per day`,
    qr: (n) => `${n} QR codes per day`,
    stats: (d) =>
      d === null ? 'Unlimited stats history' : d === 365 ? '1 year of stats history' : `Last ${d} days of stats`,
    lifetime: 'Links never expire',
    history: 'Link history',
    custom: 'Custom links',
    themes: (n) => `${n} color themes`,
    period: '/ mo',
    recommended: 'Recommended',
    soon: 'Soon',
    currentPlan: 'Your current plan',
    startFree: 'Start free',
    usageToday: (l, q, limits) =>
      `Today: ${l}/${limits.dailyLinks} links, ${q}/${limits.dailyQr} QR`,
    adminNote: 'Your account is ADMIN: all limits are off, everything is unlimited.',
    selectPlan: (name) => `Choose ${name}`,
  },
};

export const getPlanCopy = (lang) => COPY[lang] || COPY.en;

export const formatPrice = (planId) => `₺${PLAN_PRICES[planId]}`;

/**
 * Feature rows for one plan. Every plan returns the same rows in the same order so cards
 * can be aligned side by side. `included: false` renders a muted, struck-through row.
 */
export const buildPlanRows = (planId, lang) => {
  const copy = getPlanCopy(lang);
  const limits = PLAN_LIMITS[planId];
  return [
    { key: 'links', label: copy.links(limits.dailyLinks), included: true },
    { key: 'qr', label: copy.qr(limits.dailyQr), included: true },
    { key: 'stats', label: copy.stats(limits.statsDays), included: true },
    { key: 'lifetime', label: copy.lifetime, included: true },
    { key: 'history', label: copy.history, included: true },
    { key: 'custom', label: copy.custom, included: limits.customLinks },
    { key: 'themes', label: copy.themes(limits.themes), included: true },
    { key: 'support', label: copy.support[planId], included: true },
  ];
};

/** Limits for the current plan, with a safe fallback for unknown or admin plans. */
export const getClientLimits = (planId) => {
  if (planId === 'admin') {
    return { dailyLinks: null, dailyQr: null, statsDays: null, customLinks: true, themes: 15 };
  }
  return PLAN_LIMITS[planId] || PLAN_LIMITS.free;
};
