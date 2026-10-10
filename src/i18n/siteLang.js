import { getBlogPost, getPostById, blogPath } from '../content/blogPosts';
import { legalIdFromSlug, legalPath } from '../content/legalSlugs';

/** Public pages carry their language in the URL: Turkish at the root, English under /en. */
export const langFromPath = (pathname = '/') => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr');

export const homePath = (lang) => (lang === 'en' ? '/en' : '/');

/** Is this one of the public marketing pages (landing, blog, legal) in either language? */
export const isPublicPath = (pathname = '/') => {
  const rest = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return rest === '/' || rest === '/blog' || rest.startsWith('/blog/') || rest === '/yasal' || rest.startsWith('/yasal/') || rest === '/legal' || rest.startsWith('/legal/');
};

/** The same page in the other language (landing, blog index/article, legal index/document). */
export const alternatePath = (pathname, toLang) => {
  const from = langFromPath(pathname);
  if (from === toLang) return pathname;
  const rest = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const clean = rest.replace(/\/+$/, '') || '/';

  if (clean === '/blog') return blogPath(toLang);
  if (clean.startsWith('/blog/')) {
    const post = getBlogPost(decodeURIComponent(clean.slice('/blog/'.length)), from);
    const target = post ? getPostById(post.id, toLang) : null;
    return target ? blogPath(toLang, target.slug) : blogPath(toLang);
  }
  const legalRoot = from === 'en' ? '/legal' : '/yasal';
  if (clean === legalRoot) return legalPath(toLang);
  if (clean.startsWith(`${legalRoot}/`)) {
    const id = legalIdFromSlug(clean.slice(legalRoot.length + 1), from);
    return id ? legalPath(toLang, id) : legalPath(toLang);
  }
  return homePath(toLang);
};
