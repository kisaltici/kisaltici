const SITE = 'https://kisaltici.com';

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

/** Updates title, description, canonical and robots for the current route (the SPA never reloads the HTML head). */
export function applySeo({ title, description, path, noindex = false }) {
  if (title) document.title = title;
  if (description) {
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:description"]', 'content', description);
  }
  if (title) setMeta('meta[property="og:title"]', 'content', title);
  if (path) {
    setMeta('link[rel="canonical"]', 'href', SITE + path);
    setMeta('meta[property="og:url"]', 'content', SITE + path);
  }
  setMeta(
    'meta[name="robots"]',
    'content',
    noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'
  );
}
