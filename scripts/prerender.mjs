// Post-build SEO step (runs after `vite build`): the app is a client-rendered SPA, so crawlers and link previews
// would otherwise only see an empty <div id="root">. For BOTH languages (Turkish at the root, English under /en) this
// script writes static HTML with its own <title>, description, canonical, hreflang alternates, JSON-LD and crawlable
// content for: the landing page, the blog (index + every post) and the legal pages, plus dist/sitemap.xml.
// The static markup is replaced by React as soon as the app mounts. Content comes from the same modules the UI uses,
// so it can never drift from what users see.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://kisaltici.com';
const NAME = 'Kısaltıcı';
const LANGS = ['tr', 'en'];
const intlPricing = process.env.INTL_PRICING === '1';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const vite = await createServer({
  root,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
  define: { __INTL_PRICING__: JSON.stringify(intlPricing) },
});

try {
  const { LANDING_COPY } = await vite.ssrLoadModule('/src/i18n/landingCopy.js');
  const plansCfg = await vite.ssrLoadModule('/src/config/plans.js');
  const { SELLER, LEGAL_DATES } = await vite.ssrLoadModule('/src/config/legal.js');
  const { getLegalDocs, LEGAL_UI } = await vite.ssrLoadModule('/src/pages/legalDocs.js');
  const blog = await vite.ssrLoadModule('/src/content/blogPosts.js');
  const { legalPath } = await vite.ssrLoadModule('/src/content/legalSlugs.js');
  const { LANDING_SEO } = await vite.ssrLoadModule('/src/config/seo.js');

  const baseHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  for (const marker of ['<!--SEO_STATIC-->', '<!--SEO_JSONLD-->', '<!--SEO_HREFLANG-->']) {
    if (!baseHtml.includes(marker)) throw new Error(`index.html is missing the ${marker} placeholder`);
  }

  const homePath = (lang) => (lang === 'en' ? '/en' : '/');
  const abs = (p) => `${SITE}${p}`;
  const currencyOf = (lang) => (intlPricing && lang === 'en' ? 'USD' : 'TRY');

  /* ---------- head helpers ---------- */
  const alternatesBlock = (paths) =>
    [
      ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(paths[l])}" />`),
      `<link rel="alternate" hreflang="x-default" href="${abs(paths.tr)}" />`,
    ].join('\n    ');

  const setHead = (html, { lang, title, description, urlPath, ld, paths, ogType = 'website', extraHead = '' }) => {
    const seo = LANDING_SEO[lang];
    return html
      .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${abs(urlPath)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${abs(urlPath)}$2`)
      .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${ogType}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${seo.locale}$2`)
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${abs(seo.image)}$2`)
      .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(seo.ogAlt)}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${abs(seo.image)}$2`)
      .replace('<!--SEO_HREFLANG-->', (paths ? alternatesBlock(paths) : '') + extraHead)
      .replace('<!--SEO_JSONLD-->', ld || '');
  };

  const shell = (inner) => baseHtml.replace('<!--SEO_STATIC-->', `<div id="seo-static"><main>${inner}</main></div>`);

  const breadcrumb = (items) =>
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
    });

  const writePage = (urlPath, html) => {
    const dir = urlPath === '/' ? dist : path.join(dist, urlPath.replace(/^\//, ''));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  };

  const sitemapEntries = [];
  const addToSitemap = (paths, priority, changefreq, lastmod) => sitemapEntries.push({ paths, priority, changefreq, lastmod });

  /* ---------- Landing (both languages) ---------- */
  const landingPaths = { tr: homePath('tr'), en: homePath('en') };
  for (const lang of LANGS) {
    const copy = LANDING_COPY[lang];
    const planCopy = plansCfg.getPlanCopy(lang);
    const currency = currencyOf(lang);
    const posts = blog.getPosts(lang);

    const planBlocks = plansCfg.SALE_PLANS.map((id) => {
      const l = plansCfg.PLAN_LIMITS[id];
      const items = [
        planCopy.links(l.dailyLinks),
        planCopy.qr(l.dailyQr),
        planCopy.stats(l.statsDays),
        l.customLinks ? planCopy.custom : null,
        l.customQr ? planCopy.customQr : null,
        planCopy.themes(l.themes),
        planCopy.support[id],
      ].filter(Boolean);
      const price = `${plansCfg.formatPrice(id, 'monthly', currency)} ${planCopy.period}`;
      return `<li><h3>${esc(planCopy.names[id])} – ${esc(price)}</h3><p>${esc(planCopy.descs[id])}</p><ul>${items
        .map((i) => `<li>${esc(i)}</li>`)
        .join('')}</ul></li>`;
    }).join('');

    const legalDocs = getLegalDocs(lang);
    const landingStatic = `<h1>${esc(copy.hero.title)}</h1>
<p>${esc(copy.hero.sub)}</p>
<h2>${esc(copy.how.title)}</h2>
<p>${esc(copy.how.sub)}</p>
<ol>${copy.how.steps.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
<h2>${esc(copy.statement.lead)} ${esc(copy.statement.accent)}</h2>
<ul>${copy.stack.items.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ul>
<h2>${esc(copy.themes.title)}</h2>
<p>${esc(copy.themes.text)}</p>
<h2>${esc(copy.plans.title)}</h2>
<p>${esc(copy.plans.sub)}</p>
<ul>${planBlocks}</ul>
<h2>${esc(copy.faq.title)}</h2>
<dl>${copy.faq.items.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>
<h2>Blog</h2>
<ul>${posts.map((b) => `<li><a href="${blog.blogPath(lang, b.slug)}">${esc(b.title)}</a> – ${esc(b.description)}</li>`).join('')}</ul>
<nav aria-label="${lang === 'en' ? 'Legal' : 'Yasal'}">${legalDocs.map((d) => `<a href="${legalPath(lang, d.id)}">${esc(d.title)}</a>`).join(' ')}</nav>`;

    const seo = LANDING_SEO[lang];
    const homeLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: NAME,
        url: abs(homePath(lang)),
        logo: abs('/icon-512.png'),
        email: SELLER.email,
      },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: abs(homePath(lang)), inLanguage: lang === 'en' ? 'en' : 'tr-TR' },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: NAME,
        url: abs(homePath(lang)),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          lang === 'en'
            ? 'A web app that shortens long links, creates customizable QR codes and shows click statistics.'
            : 'Uzun bağlantıları kısaltan, özelleştirilebilir QR kod üreten ve tıklama istatistiklerini gösteren web uygulaması.',
        inLanguage: lang === 'en' ? 'en' : 'tr-TR',
        offers: plansCfg.SALE_PLANS.map((id) => ({
          '@type': 'Offer',
          name: planCopy.names[id],
          price: String(plansCfg.getPlanPrice(id, 'monthly', currency)),
          priceCurrency: currency,
          url: `${abs(homePath(lang))}#planlar`,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: copy.faq.items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ]
      .map(jsonLd)
      .join('\n    ');

    writePage(
      homePath(lang),
      setHead(shell(landingStatic), {
        lang,
        title: seo.title,
        description: seo.description,
        urlPath: homePath(lang),
        ld: homeLd,
        paths: landingPaths,
      })
    );
  }
  addToSitemap(landingPaths, '1.0', 'weekly');

  /* ---------- Legal pages (both languages) ---------- */
  const legalIndexPaths = { tr: legalPath('tr'), en: legalPath('en') };
  for (const lang of LANGS) {
    const ui = LEGAL_UI[lang];
    const docs = getLegalDocs(lang);
    const nav = `<nav aria-label="${lang === 'en' ? 'Legal' : 'Yasal'}">${docs
      .map((d) => `<a href="${legalPath(lang, d.id)}">${esc(d.title)}</a>`)
      .join(' ')}</nav>`;
    const note = ui.translationNote ? `<p>${esc(ui.translationNote)}</p>` : '';

    writePage(
      legalIndexPaths[lang],
      setHead(shell(`<h1>${esc(ui.title)}</h1><p>${esc(ui.subtitle)}</p>${note}${nav}`), {
        lang,
        title: ui.pageTitle,
        description: ui.pageDescription,
        urlPath: legalIndexPaths[lang],
        paths: legalIndexPaths,
        ld: breadcrumb([
          { name: NAME, url: abs(homePath(lang)) },
          { name: ui.title, url: abs(legalIndexPaths[lang]) },
        ]),
      })
    );

    for (const doc of docs) {
      const paths = { tr: legalPath('tr', doc.id), en: legalPath('en', doc.id) };
      const sections = doc.sections
        .map(
          (s) =>
            `<section><h2>${esc(s.h)}</h2>${(s.p || []).map((p) => `<p>${esc(p)}</p>`).join('')}${
              s.list ? `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
            }</section>`
        )
        .join('');
      writePage(
        paths[lang],
        setHead(shell(`<h1>${esc(doc.title)}</h1><p>${esc(ui.updated)}: ${esc(LEGAL_DATES[lang])}</p>${note}${sections}${nav}`), {
          lang,
          title: `${doc.title} | ${NAME}`,
          description: doc.summary,
          urlPath: paths[lang],
          paths,
          ld: breadcrumb([
            { name: NAME, url: abs(homePath(lang)) },
            { name: ui.title, url: abs(legalIndexPaths[lang]) },
            { name: doc.title, url: abs(paths[lang]) },
          ]),
        })
      );
      if (lang === 'tr') addToSitemap(paths, '0.3', 'yearly');
    }
  }
  addToSitemap(legalIndexPaths, '0.3', 'yearly');

  /* ---------- Blog (both languages) ---------- */
  const blogIndexPaths = { tr: blog.blogPath('tr'), en: blog.blogPath('en') };
  const rssLink = (lang) => `\n    <link rel="alternate" type="application/rss+xml" title="${NAME} Blog" href="${blog.blogPath(lang)}/feed.xml" />`;
  for (const lang of LANGS) {
    const ui = blog.BLOG_UI[lang];
    const posts = blog.getPosts(lang);
    const blogNav = `<nav aria-label="Blog">${posts.map((b) => `<a href="${blog.blogPath(lang, b.slug)}">${esc(b.title)}</a>`).join(' ')}</nav>`;

    writePage(
      blogIndexPaths[lang],
      setHead(
        shell(
          `<h1>${esc(ui.heroTitle)}</h1><p>${esc(ui.heroText)}</p><ul>${posts
            .map((b) => `<li><a href="${blog.blogPath(lang, b.slug)}">${esc(b.title)}</a><p>${esc(b.description)}</p></li>`)
            .join('')}</ul>`
        ),
        {
          lang,
          title: ui.pageTitle,
          description: ui.pageDescription,
          urlPath: blogIndexPaths[lang],
          paths: blogIndexPaths,
          extraHead: rssLink(lang),
          ld: breadcrumb([
            { name: NAME, url: abs(homePath(lang)) },
            { name: 'Blog', url: abs(blogIndexPaths[lang]) },
          ]),
        }
      )
    );

    for (const post of posts) {
      const paths = {
        tr: blog.blogPath('tr', blog.getPostById(post.id, 'tr').slug),
        en: blog.blogPath('en', blog.getPostById(post.id, 'en').slug),
      };
      const body = post.sections
        .map(
          (s) =>
            `<section>${s.h ? `<h2 id="${blog.headingId(s.h)}">${esc(s.h)}</h2>` : ''}${(s.p || []).map((t) => `<p>${esc(t)}</p>`).join('')}${
              s.list ? `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
            }</section>`
        )
        .join('');
      const related = blog
        .getRelatedPosts(post.id, lang)
        .map((r) => `<li><a href="${blog.blogPath(lang, r.slug)}">${esc(r.title)}</a></li>`)
        .join('');
      const article = jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: lang === 'en' ? 'en' : 'tr-TR',
        mainEntityOfPage: abs(paths[lang]),
        image: abs(LANDING_SEO[lang].image),
        author: { '@type': 'Organization', name: NAME, url: abs(homePath(lang)) },
        publisher: { '@type': 'Organization', name: NAME, logo: { '@type': 'ImageObject', url: abs('/icon-512.png') } },
      });
      writePage(
        paths[lang],
        setHead(
          shell(
            `<article><p>${esc(post.category)} · ${esc(blog.formatPostDate(post.date, lang))}</p><h1>${esc(post.title)}</h1><p>${esc(post.description)}</p>${
              post.highlights
                ? `<aside><strong>${esc(ui.summary)}</strong><ul>${post.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></aside>`
                : ''
            }${body}</article><h2>${esc(ui.related)}</h2><ul>${related}</ul>${blogNav}`
          ),
          {
            lang,
            title: `${post.seoTitle || post.title} | ${NAME}`,
            description: post.description,
            urlPath: paths[lang],
            paths,
            ogType: 'article',
            extraHead: `${rssLink(lang)}\n    <meta property="article:published_time" content="${post.date}" />`,
            ld:
              article +
              '\n    ' +
              breadcrumb([
                { name: NAME, url: abs(homePath(lang)) },
                { name: 'Blog', url: abs(blogIndexPaths[lang]) },
                { name: post.title, url: abs(paths[lang]) },
              ]),
          }
        )
      );
      if (lang === 'tr') addToSitemap(paths, '0.8', 'monthly', post.date);
    }
  }
  addToSitemap(blogIndexPaths, '0.7', 'weekly');

  /* ---------- RSS feeds (one per language) ---------- */
  for (const lang of LANGS) {
    const posts = blog.getPosts(lang);
    const items = posts
      .map(
        (b) => `    <item>
      <title>${esc(b.title)}</title>
      <link>${abs(blog.blogPath(lang, b.slug))}</link>
      <guid isPermaLink="true">${abs(blog.blogPath(lang, b.slug))}</guid>
      <pubDate>${new Date(b.date + 'T09:00:00Z').toUTCString()}</pubDate>
      <category>${esc(b.category)}</category>
      <description>${esc(b.description)}</description>
    </item>`
      )
      .join('\n');
    const dir = path.join(dist, lang === 'en' ? 'en/blog' : 'blog');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'feed.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NAME} Blog</title>
    <link>${abs(blog.blogPath(lang))}</link>
    <atom:link href="${abs(blog.blogPath(lang))}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(blog.BLOG_UI[lang].pageDescription)}</description>
    <language>${lang === 'en' ? 'en' : 'tr'}</language>
${items}
  </channel>
</rss>
`
    );
  }

  /* ---------- 404 page (served with status 404 for unknown public URLs) ---------- */
  fs.writeFileSync(
    path.join(dist, '404.html'),
    `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>404 | ${NAME}</title>
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
    <style>
      body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #000; color: #f2f3f5; font-family: system-ui, sans-serif; text-align: center; padding: 1.5rem; }
      h1 { margin: 0 0 .5rem; font-size: clamp(3rem, 12vw, 6rem); letter-spacing: -.04em; color: #deff36; }
      p { margin: .25rem 0; color: #a1a1aa; }
      a { color: #deff36; }
    </style>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>Aradığın sayfa bulunamadı.</p>
      <p>The page you are looking for was not found.</p>
      <p><a href="/">${NAME}</a> · <a href="/blog">Blog</a> · <a href="/en">English</a></p>
    </main>
  </body>
</html>
`
  );

  /* ---------- Sitemap with hreflang alternates ---------- */
  const today = new Date().toISOString().slice(0, 10);
  const entry = (loc, e) =>
    `  <url><loc>${abs(loc)}</loc><lastmod>${e.lastmod || today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority>${LANGS.map(
      (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(e.paths[l])}"/>`
    ).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${abs(e.paths.tr)}"/></url>`;
  const urlset = sitemapEntries.flatMap((e) => LANGS.map((l) => entry(e.paths[l], e))).join('\n');
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlset}\n</urlset>\n`
  );

  console.log(
    `prerender: ${sitemapEntries.length * LANGS.length} pages in ${LANGS.length} languages + sitemap (intl pricing ${intlPricing ? 'on' : 'off'})`
  );
} finally {
  await vite.close();
}
