import { getBlogPost, getPostById, blogPath } from '../content/blogPosts';
import { legalIdFromSlug, legalPath } from '../content/legalSlugs';
import { langFromPath, homePath } from './siteLang';

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
