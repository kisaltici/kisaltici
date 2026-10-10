import { getPosts, blogPath } from './blogPosts';

/**
 * Automatic internal links between posts. Each post declares the phrases that should link to it (LINK_TERMS, keyed by
 * the post id = Turkish slug). While an article is built, the first occurrence of each phrase from OTHER posts in the
 * body text (paragraphs and list items, never headings or the summary) becomes a link, up to MAX_LINKS per article.
 * New posts only need an entry here to be linked from every existing article.
 */
const LINK_TERMS = {
  tr: {
    'qr-kod-nasil-olusturulur': ['QR kod oluştur', 'QR kod oluşturma', 'QR kodu oluştur', 'QR kod'],
    'link-kisaltma-nedir': ['link kısaltma', 'bağlantı kısaltma', 'URL kısaltma', 'kısa bağlantı', 'kısaltılmış bağlantı'],
    'link-tiklamalari-nasil-takip-edilir': ['tıklama takibi', 'tıklama sayısı', 'tıklamaları takip', 'tıklama sayılarını', 'tıklama'],
    'utm-parametreleri-nasil-olusturulur': ['UTM etiket', 'UTM parametre', 'UTM'],
    'statik-ve-dinamik-qr-kod-farki': ['statik QR', 'dinamik QR', 'statik ve dinamik'],
    'sahte-qr-kod-quishing-korunma': ['quishing', 'sahte QR'],
    'ozel-kisa-link-marka-baglantisi': ['özel bağlantı', 'özel kısa bağlantı', 'özel kısa link'],
    'kisa-link-seo-etkisi': ['SEO'],
    'kartvizit-afis-menu-qr-kod-ipuclari': ['kartvizit', 'basılı materyal'],
    'kampanya-link-planlama-kontrol-listesi': ['kampanya planı', 'kampanya planlama'],
    'sosyal-medya-biyografi-link-ipuclari': ['biyografi'],
    'etkinlik-konferans-qr-kod-kullanimi': ['etkinlik'],
    'e-posta-bultenlerinde-link-kullanimi': ['e-posta bülten', 'bülten'],
    'instagram-biyografi-link-ekleme': ['Instagram'],
    'google-yorum-baglantisi-qr-kod': ['Google yorum', 'yorum bağlantısı'],
    'qr-menu-nasil-hazirlanir': ['QR menü', 'restoran'],
    'whatsapp-link-paylasimi': ['WhatsApp'],
    'e-posta-imzasi-link-qr': ['e-posta imza'],
    'freelancer-portfolyo-linki': ['portfolyo', 'freelancer'],
    'pazaryeri-magaza-baglantisi': ['pazaryeri', 'mağaza bağlantı'],
    'etkinlik-daveti-qr-kod': ['davetiye', 'davet'],
    'kisa-linkler-nasil-calisir': ['yönlendirme'],
    'qr-kod-ile-yol-tarifi': ['yol tarifi', 'konum'],
  },
  en: {
    'qr-kod-nasil-olusturulur': ['create a QR code', 'creating a QR code', 'QR code creation', 'QR code'],
    'link-kisaltma-nedir': ['link shortening', 'URL shortening', 'URL shortener', 'short link', 'shortened link'],
    'link-tiklamalari-nasil-takip-edilir': ['click tracking', 'click count', 'track clicks', 'click counts', 'clicks'],
    'utm-parametreleri-nasil-olusturulur': ['UTM tags', 'UTM parameters', 'UTM'],
    'statik-ve-dinamik-qr-kod-farki': ['static QR', 'dynamic QR', 'static and dynamic'],
    'sahte-qr-kod-quishing-korunma': ['quishing', 'fake QR'],
    'ozel-kisa-link-marka-baglantisi': ['custom link', 'custom short link', 'branded link'],
    'kisa-link-seo-etkisi': ['SEO'],
    'kartvizit-afis-menu-qr-kod-ipuclari': ['business card', 'print materials'],
    'kampanya-link-planlama-kontrol-listesi': ['campaign planning'],
    'sosyal-medya-biyografi-link-ipuclari': ['social media bio', 'bio link'],
    'etkinlik-konferans-qr-kod-kullanimi': ['events and conferences', 'at events'],
    'e-posta-bultenlerinde-link-kullanimi': ['email newsletter', 'newsletter'],
    'instagram-biyografi-link-ekleme': ['Instagram'],
    'google-yorum-baglantisi-qr-kod': ['Google review', 'review link'],
    'qr-menu-nasil-hazirlanir': ['QR menu', 'restaurant'],
    'whatsapp-link-paylasimi': ['WhatsApp'],
    'e-posta-imzasi-link-qr': ['email signature'],
    'freelancer-portfolyo-linki': ['portfolio', 'freelancer'],
    'pazaryeri-magaza-baglantisi': ['marketplace', 'store link'],
    'etkinlik-daveti-qr-kod': ['invitation', 'invitations'],
    'kisa-linkler-nasil-calisir': ['redirect'],
    'qr-kod-ile-yol-tarifi': ['directions', 'location'],
  },
};

const MAX_LINKS = 4;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns the article's sections with every text split into segments: { text } or { text, href }.
 * Pure: the same post always produces the same links (safe for React renders and for the build-time prerender).
 */
export const buildLinkedSections = (post, lang) => {
  const language = lang === 'en' ? 'en' : 'tr';
  const targets = getPosts(language)
    .filter((other) => other.id !== post.id)
    .map((other) => ({
      id: other.id,
      href: blogPath(language, other.slug),
      // longest phrases first so "UTM parametre" wins over "UTM"; Turkish suffixes are allowed after the phrase
      patterns: [...(LINK_TERMS[language][other.id] || [])]
        .sort((a, b) => b.length - a.length)
        .map(
          (term) =>
            new RegExp(
              `(?<![\\p{L}\\p{N}])(${escapeRegExp(term)}${language === 'tr' ? '[\\p{L}]*' : ''})(?![\\p{L}\\p{N}])`,
              'iu'
            )
        ),
    }));

  const used = new Set();
  let count = 0;

  const linkify = (text) => {
    if (count >= MAX_LINKS) return [{ text }];
    // find the earliest match among targets that are not linked yet
    let best = null;
    for (const target of targets) {
      if (used.has(target.id)) continue;
      for (const pattern of target.patterns) {
        const match = pattern.exec(text);
        if (match && (!best || match.index < best.index)) best = { index: match.index, length: match[0].length, target };
      }
    }
    if (!best) return [{ text }];
    used.add(best.target.id);
    count += 1;
    const before = text.slice(0, best.index);
    const anchor = text.slice(best.index, best.index + best.length);
    const rest = text.slice(best.index + best.length);
    return [...(before ? [{ text: before }] : []), { text: anchor, href: best.target.href }, ...linkify(rest)];
  };

  return post.sections.map((section) => ({
    h: section.h,
    p: (section.p || []).map(linkify),
    list: section.list ? section.list.map(linkify) : null,
  }));
};
