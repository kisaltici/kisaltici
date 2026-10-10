import { POSTS_TR } from './blogPosts.tr';
import { POSTS_EN } from './blogPosts.en';

/**
 * Blog content API for both languages. Turkish posts (blogPosts.tr.js) are the source; each has an English
 * translation in blogPosts.en.js keyed by the Turkish slug. To add a post: add it at the top of POSTS_TR and add
 * its translation to POSTS_EN. Language is part of the URL: /blog/<tr slug> and /en/blog/<en slug>.
 */

const CATEGORY_KEYS = {
  Pazarlama: 'marketing',
  Rehber: 'guide',
  'Güvenlik': 'security',
  Marka: 'brand',
  'Temel Bilgi': 'basics',
};

export const CATEGORY_LABELS = {
  tr: { marketing: 'Pazarlama', guide: 'Rehber', security: 'Güvenlik', brand: 'Marka', basics: 'Temel Bilgi' },
  en: { marketing: 'Marketing', guide: 'Guide', security: 'Security', brand: 'Brand', basics: 'Basics' },
};

export const BLOG_UI = {
  tr: {
    home: 'Ana sayfa',
    allPosts: 'Tüm yazılar',
    eyebrow: 'Blog',
    heroTitle: 'Link, QR kod ve ölçüm üzerine rehberler',
    heroText:
      'Bağlantılarını daha iyi paylaşmak, QR kodlarını doğru hazırlamak ve sonuçları ölçmek için kısa, uygulanabilir yazılar.',
    search: 'Yazılarda ara',
    all: 'Tümü',
    empty: 'Aramana uyan yazı bulunamadı.',
    read: 'Oku',
    minRead: 'dk okuma',
    minShort: 'dk',
    summary: 'Kısaca',
    onThisPage: 'Bu yazıda',
    progress: 'İlerleme',
    reading: 'Okuma',
    copyLink: 'Bağlantıyı kopyala',
    copied: 'Bağlantı kopyalandı',
    tryTitle: 'Bağlantını hemen kısalt',
    tryText: 'Kısa bağlantı ve QR kod oluştur, tıklamaları takip et.',
    tryButton: 'Kısaltıcı’yı dene',
    related: 'Önerilen yazılar',
    notFoundTitle: 'Yazı bulunamadı',
    notFoundText: 'Aradığın blog yazısı mevcut değil.',
    pageTitle: 'Blog: Link Kısaltma ve QR Kod Rehberleri | Kısaltıcı',
    pageDescription:
      'Link kısaltma, QR kod oluşturma, UTM ve tıklama takibi hakkında kısa, uygulanabilir rehberler ve ipuçları.',
    landingTitle: 'Rehberler ve ipuçları',
    landingText: 'Link kısaltma, QR kod ve tıklama takibi üzerine kısa yazılar.',
    allLink: 'Tüm yazılar',
  },
  en: {
    home: 'Home',
    allPosts: 'All posts',
    eyebrow: 'Blog',
    heroTitle: 'Guides on links, QR codes and measurement',
    heroText:
      'Short, practical articles on sharing your links better, preparing QR codes the right way and measuring the results.',
    search: 'Search posts',
    all: 'All',
    empty: 'No posts match your search.',
    read: 'Read',
    minRead: 'min read',
    minShort: 'min',
    summary: 'In short',
    onThisPage: 'On this page',
    progress: 'Progress',
    reading: 'Reading',
    copyLink: 'Copy link',
    copied: 'Link copied',
    tryTitle: 'Shorten your link now',
    tryText: 'Create short links and QR codes, and track clicks.',
    tryButton: 'Try Kısaltıcı',
    related: 'Recommended posts',
    notFoundTitle: 'Post not found',
    notFoundText: 'The blog post you are looking for does not exist.',
    pageTitle: 'Blog: Link Shortening and QR Code Guides | Kısaltıcı',
    pageDescription:
      'Short, practical guides and tips on link shortening, creating QR codes, UTM tags and click tracking.',
    landingTitle: 'Guides and tips',
    landingText: 'Short articles on link shortening, QR codes and click tracking.',
    allLink: 'All posts',
  },
};

/** URL path of a blog page in a language (slug optional). */
export const blogPath = (lang, slug = '') => `${lang === 'en' ? '/en/blog' : '/blog'}${slug ? `/${slug}` : ''}`;

const flatten = (trPost, lang) => {
  const base = { id: trPost.slug, date: trPost.date, readMinutes: trPost.readMinutes };
  const key = CATEGORY_KEYS[trPost.category] || 'guide';
  if (lang === 'en' && POSTS_EN[trPost.slug]) {
    return { ...base, ...POSTS_EN[trPost.slug], category: CATEGORY_LABELS.en[key], categoryKey: key };
  }
  return { ...base, ...trPost, category: CATEGORY_LABELS.tr[key], categoryKey: key };
};

/** All posts in a language, newest first. */
export const getPosts = (lang) => POSTS_TR.map((post) => flatten(post, lang === 'en' ? 'en' : 'tr'));

/** Both language versions of a post by its id (the Turkish slug), for hreflang alternates. */
export const getPostById = (id, lang) => getPosts(lang).find((post) => post.id === id) || null;

export const getBlogPost = (slug, lang) => getPosts(lang).find((post) => post.slug === slug) || null;

/** Other posts for the "recommended" block under an article: same category first, then newest. */
export const getRelatedPosts = (id, lang, count = 3) => {
  const all = getPosts(lang);
  const current = all.find((post) => post.id === id);
  const others = all.filter((post) => post.id !== id);
  const same = others.filter((post) => current && post.categoryKey === current.categoryKey);
  const rest = others.filter((post) => !same.includes(post));
  return [...same, ...rest].slice(0, count);
};

export const getCategories = (lang) => {
  const keys = [...new Set(getPosts(lang).map((post) => post.categoryKey))];
  return keys.map((key) => ({ key, label: CATEGORY_LABELS[lang === 'en' ? 'en' : 'tr'][key] }));
};

/** URL-safe id for a heading (table of contents anchors). */
export const headingId = (text = '') =>
  text
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const formatPostDate = (iso, lang = 'tr') =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
