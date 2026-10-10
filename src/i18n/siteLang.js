/** Public pages carry their language in the URL: Turkish at the root, English under /en. */
export const langFromPath = (pathname = '/') => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr');

export const homePath = (lang) => (lang === 'en' ? '/en' : '/');

/** Is this one of the public marketing pages (landing, blog, legal) in either language? */
export const isPublicPath = (pathname = '/') => {
  const rest = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return rest === '/' || rest === '/blog' || rest.startsWith('/blog/') || rest === '/yasal' || rest.startsWith('/yasal/') || rest === '/legal' || rest.startsWith('/legal/');
};
