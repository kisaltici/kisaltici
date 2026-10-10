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

export { BLOG_UI, blogPath, headingId, formatPostDate } from './blogUi';
