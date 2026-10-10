// Post-build SEO step (runs after `vite build`): the app is a client-rendered SPA, so crawlers and
// link previews would otherwise only see an empty <div id="root">. This script
//  - injects JSON-LD and static, crawlable content for the landing page into dist/index.html
//  - writes a static HTML file per legal page (dist/yasal/<slug>/index.html) with its own title/description/canonical
//  - writes dist/sitemap.xml
// The static markup is replaced by React as soon as the app mounts. Content is generated from the same
// copy/config modules the UI uses, so it can never drift from what users see.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://kisaltici.com';
const NAME = 'Kısaltıcı';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const vite = await createServer({
  root,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
});

try {
  const { LANDING_COPY } = await vite.ssrLoadModule('/src/i18n/landingCopy.js');
  const plansCfg = await vite.ssrLoadModule('/src/config/plans.js');
  const { LEGAL_DOCS } = await vite.ssrLoadModule('/src/pages/legalDocs.js');
  const { SELLER, LEGAL_UPDATED } = await vite.ssrLoadModule('/src/config/legal.js');

  const tr = LANDING_COPY.tr;
  const planCopy = plansCfg.getPlanCopy('tr');
  const baseHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  if (!baseHtml.includes('<!--SEO_STATIC-->') || !baseHtml.includes('<!--SEO_JSONLD-->')) {
    throw new Error('index.html is missing the SEO_STATIC / SEO_JSONLD placeholders');
  }

  /* ---------- Landing page ---------- */
  const planBlocks = plansCfg.PLAN_ORDER.map((id) => {
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
    const price = id === 'free' ? '₺0' : `₺${plansCfg.PLAN_PRICES[id]} ${planCopy.period}`;
    return `<li><h3>${esc(planCopy.names[id])} – ${esc(price)}</h3><p>${esc(planCopy.descs[id])}</p><ul>${items
      .map((i) => `<li>${esc(i)}</li>`)
      .join('')}</ul></li>`;
  }).join('');

  const landingStatic = `<div id="seo-static"><main>
<h1>${esc(tr.hero.title)}</h1>
<p>${esc(tr.hero.sub)}</p>
<h2>${esc(tr.how.title)}</h2>
<p>${esc(tr.how.sub)}</p>
<ol>${tr.how.steps.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
<h2>${esc(tr.statement.lead)} ${esc(tr.statement.accent)}</h2>
<ul>${tr.stack.items.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ul>
<h2>${esc(tr.themes.title)}</h2>
<p>${esc(tr.themes.text)}</p>
<h2>${esc(tr.plans.title)}</h2>
<p>${esc(tr.plans.sub)} ${esc(tr.plans.guestNote)}</p>
<ul>${planBlocks}</ul>
<h2>${esc(tr.faq.title)}</h2>
<dl>${tr.faq.items.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>
<nav aria-label="Yasal">${LEGAL_DOCS.map((d) => `<a href="/yasal/${d.slug}">${esc(d.title)}</a>`).join(' ')}</nav>
</main></div>`;

  const homeLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: NAME,
      url: `${SITE}/`,
      logo: `${SITE}/icon-512.png`,
      email: SELLER.email,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: NAME,
      url: `${SITE}/`,
      inLanguage: 'tr-TR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: NAME,
      url: `${SITE}/`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Uzun bağlantıları kısaltan, özelleştirilebilir QR kod üreten ve tıklama istatistiklerini gösteren web uygulaması.',
      inLanguage: 'tr-TR',
      offers: plansCfg.PLAN_ORDER.map((id) => ({
        '@type': 'Offer',
        name: planCopy.names[id],
        price: String(plansCfg.PLAN_PRICES[id]),
        priceCurrency: 'TRY',
        url: `${SITE}/#planlar`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tr.faq.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]
    .map(jsonLd)
    .join('\n    ');

  fs.writeFileSync(
    path.join(dist, 'index.html'),
    baseHtml.replace('<!--SEO_STATIC-->', landingStatic).replace('<!--SEO_JSONLD-->', homeLd)
  );

  /* ---------- Legal pages ---------- */
  const setHead = (html, { title, description, url, ld }) =>
    html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
      .replace('<!--SEO_JSONLD-->', ld || '');

  const shell = (inner) => baseHtml.replace('<!--SEO_STATIC-->', `<div id="seo-static"><main>${inner}</main></div>`);

  const breadcrumb = (items) =>
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: it.url,
      })),
    });

  const writePage = (relDir, html) => {
    const dir = path.join(dist, relDir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  };

  const legalNav = `<nav aria-label="Yasal">${LEGAL_DOCS.map(
    (d) => `<a href="/yasal/${d.slug}">${esc(d.title)}</a>`
  ).join(' ')}</nav>`;

  // /yasal index
  writePage(
    'yasal',
    setHead(
      shell(`<h1>Yasal</h1><p>Hizmet koşulları, gizlilik ve satış sözleşmesi metinleri.</p>${legalNav}`),
      {
        title: `Yasal Metinler | ${NAME}`,
        description: 'Kısaltıcı hizmet koşulları, gizlilik politikası, KVKK aydınlatma metni ve mesafeli satış sözleşmesi.',
        url: `${SITE}/yasal`,
        ld: breadcrumb([
          { name: NAME, url: `${SITE}/` },
          { name: 'Yasal', url: `${SITE}/yasal` },
        ]),
      }
    )
  );

  for (const doc of LEGAL_DOCS) {
    const sections = doc.sections
      .map(
        (s) =>
          `<section><h2>${esc(s.h)}</h2>${(s.p || []).map((p) => `<p>${esc(p)}</p>`).join('')}${
            s.list ? `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
          }</section>`
      )
      .join('');
    writePage(
      `yasal/${doc.slug}`,
      setHead(shell(`<h1>${esc(doc.title)}</h1><p>Son güncelleme: ${esc(LEGAL_UPDATED)}</p>${sections}${legalNav}`), {
        title: `${doc.title} | ${NAME}`,
        description: doc.summary,
        url: `${SITE}/yasal/${doc.slug}`,
        ld: breadcrumb([
          { name: NAME, url: `${SITE}/` },
          { name: 'Yasal', url: `${SITE}/yasal` },
          { name: doc.title, url: `${SITE}/yasal/${doc.slug}` },
        ]),
      })
    );
  }

  /* ---------- Sitemap ---------- */
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE}/yasal`, priority: '0.3', changefreq: 'yearly' },
    ...LEGAL_DOCS.map((d) => ({ loc: `${SITE}/yasal/${d.slug}`, priority: '0.3', changefreq: 'yearly' })),
  ];
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('\n')}\n</urlset>\n`
  );

  console.log(`prerender: landing + ${LEGAL_DOCS.length + 1} legal pages + sitemap (${urls.length} urls)`);
} finally {
  await vite.close();
}
