// Legal page slugs per language: the Turkish slug is the document id, the English slug is its URL under /en/legal.
export const LEGAL_SLUG_PAIRS = [
  { tr: 'satici-bilgileri', en: 'seller-information' },
  { tr: 'mesafeli-satis-sozlesmesi', en: 'distance-sales-agreement' },
  { tr: 'on-bilgilendirme-formu', en: 'pre-contract-information' },
  { tr: 'iade-ve-iptal-kosullari', en: 'refund-and-cancellation' },
  { tr: 'gizlilik-politikasi', en: 'privacy-policy' },
  { tr: 'kvkk-aydinlatma-metni', en: 'kvkk-privacy-notice' },
  { tr: 'cerez-politikasi', en: 'cookie-and-local-storage-policy' },
  { tr: 'kullanim-kosullari', en: 'terms-of-use' },
  { tr: 'kotuye-kullanim-bildirimi', en: 'report-abuse' },
];

export const legalSlug = (id, lang) => {
  const pair = LEGAL_SLUG_PAIRS.find((item) => item.tr === id);
  return pair ? pair[lang === 'en' ? 'en' : 'tr'] : id;
};

export const legalIdFromSlug = (slug, lang) => {
  const pair = LEGAL_SLUG_PAIRS.find((item) => item[lang === 'en' ? 'en' : 'tr'] === slug);
  return pair ? pair.tr : null;
};

export const legalPath = (lang, id = '') => `${lang === 'en' ? '/en/legal' : '/yasal'}${id ? `/${legalSlug(id, lang)}` : ''}`;
