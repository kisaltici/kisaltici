// SEO text shared by the app (document head updates) and the build-time prerender (scripts/prerender.mjs).
export const SITE = 'https://kisaltici.com';

export const LANDING_SEO = {
  tr: {
    title: 'Kısaltıcı | URL Kısaltma, QR Kod ve Link Takibi',
    description:
      'Uzun bağlantıları saniyeler içinde kısalt, markana uygun QR kod oluştur ve tıklamaları takip et. 7 gün ücretsiz dene.',
    ogAlt: 'Kısaltıcı: bağlantını kısalt, paylaş ve takip et',
    image: '/og-image.png',
    locale: 'tr_TR',
  },
  en: {
    title: 'Kısaltıcı | URL Shortener, QR Code Generator and Link Tracking',
    description:
      'Shorten long links in seconds, create branded QR codes and track clicks. Try it free for 7 days.',
    ogAlt: 'Kısaltıcı: shorten, share and track your links',
    image: '/og-image-en.png',
    locale: 'en_US',
  },
};
