// Seller / data controller details used by the legal pages and the checkout.
// Edit this file to change them everywhere (satıcı bilgileri, KVKK, mesafeli satış sözleşmesi, ön bilgilendirme).
export const SELLER = {
  brand: 'Kısaltıcı',
  site: 'https://kisaltici.com',
  domain: 'kisaltici.com',
  unvan: 'Emrecan Yerlikaya',
  type: 'Şahıs işletmesi',
  taxOffice: 'Bolu Vergi Dairesi',
  taxNo: '26080379140',
  address: 'Beşkavaklar Mah. Necdet Gören Cad. No:19/4, Merkez / Bolu',
  phone: '0 533 425 14 95',
  email: 'kisaltici@gmail.com',
  kep: 'emrecan.yerlikaya@hs02.kep.tr',
  supportHours: 'Hafta içi 09:00 – 18:00',
  trialDays: 7, // keep in sync with TRIAL_DAYS (src/config/plans.js, server/config/billing.js)
};

// Bump when a legal text changes materially; stored with each order as the accepted version.
export const LEGAL_VERSION = '1.1';
export const LEGAL_UPDATED = '11 Ekim 2026';
export const LEGAL_DATES = { tr: LEGAL_UPDATED, en: 'October 11, 2026' };
