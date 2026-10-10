import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BLOG_UI,
  blogPath,
  getBlogPost,
  getCategories,
  getPosts,
  getRelatedPosts,
  formatPostDate,
  headingId,
} from '../content/blogPosts';
import LegalLinks from '../components/LegalLinks';
import BlogCard from '../components/BlogCard';
import { applySeo } from '../utils/seo';
import { alternatePath, homePath, langFromPath } from '../i18n/siteLang';
import './BlogPage.css';

/* ---------------- index ---------------- */
function BlogIndex({ lang, ui }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => getCategories(lang), [lang]);
  const posts = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang === 'en' ? 'en-US' : 'tr-TR');
    return getPosts(lang).filter((post) => {
      if (category !== 'all' && post.categoryKey !== category) return false;
      if (!q) return true;
      return `${post.title} ${post.description} ${post.category}`.toLocaleLowerCase(lang === 'en' ? 'en-US' : 'tr-TR').includes(q);
    });
  }, [query, category, lang]);

  return (
    <>
      <section className="blHero">
        <p className="blEyebrow">{ui.eyebrow}</p>
        <h1 className="blHeroTitle">{ui.heroTitle}</h1>
        <p className="blLead">{ui.heroText}</p>
      </section>

      <div className="blTools">
        <div className="blTabs" role="tablist" aria-label="Categories">
          {[{ key: 'all', label: ui.all }, ...categories].map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={category === item.key}
              className={`blTab ${category === item.key ? 'isOn' : ''}`}
              onClick={() => setCategory(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="blSearch">
          <span className="blSrOnly">{ui.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.search} />
        </label>
      </div>

      {posts.length > 0 ? (
        <section className="blGrid" aria-label="Posts">
          {posts.map((post, index) => (
            <BlogCard
              key={post.id}
              post={post}
              lang={lang}
              minLabel={ui.minRead}
              featured={index === 0 && category === 'all' && !query.trim()}
            />
          ))}
        </section>
      ) : (
        <p className="blEmpty">{ui.empty}</p>
      )}
    </>
  );
}

/* ---------------- article ---------------- */
function BlogArticle({ post, lang, ui }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  const toc = post.sections.filter((section) => section.h).map((section) => ({ id: headingId(section.h), text: section.h }));

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.6, 1);
      const done = Math.min(Math.max(-(rect.top - 70), 0), total);
      setProgress(Math.round((done / total) * 100));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [post.id]);

  useEffect(() => {
    const headings = toc.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!headings.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, lang]);

  const copyLink = async () => {
    const url = `${window.location.origin}${blogPath(lang, post.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const goTo = (event, id) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="blProgress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="blDoc">
        <article className="blArticle" ref={articleRef}>
          <header className="blArticleHead">
            <p className="blEyebrow">
              {post.category} · {formatPostDate(post.date, lang)} · {post.readMinutes} {ui.minRead}
            </p>
            <h1 className="blTitle">{post.title}</h1>
            <p className="blLead">{post.description}</p>
          </header>

          {post.highlights && post.highlights.length > 0 && (
            <aside className="blHighlights" aria-label={ui.summary}>
              <strong>{ui.summary}</strong>
              <ul>
                {post.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          )}

          {post.sections.map((section, index) => (
            <section key={index} className="blSection">
              {section.h && <h2 id={headingId(section.h)}>{section.h}</h2>}
              {section.p && section.p.map((text, i) => <p key={i}>{text}</p>)}
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <aside className="blSide">
          <div className="blSideBlock blSideToc">
            <p className="blSideLabel">{ui.onThisPage}</p>
            <nav className="blToc">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={activeId === item.id ? 'isActive' : ''}
                  onClick={(event) => goTo(event, item.id)}
                >
                  {item.text}
                </a>
              ))}
            </nav>
            <dl className="blStats">
              <div>
                <dt>{ui.reading}</dt>
                <dd>
                  {post.readMinutes} {ui.minShort}
                </dd>
              </div>
              <div>
                <dt>{ui.progress}</dt>
                <dd>%{progress}</dd>
              </div>
            </dl>
            <button type="button" className="blTextBtn" onClick={copyLink}>
              {copied ? ui.copied : ui.copyLink}
            </button>
          </div>

          <div className="blSideBlock blTry">
            <strong>{ui.tryTitle}</strong>
            <span>{ui.tryText}</span>
            <Link to={homePath(lang)} className="blBtn">
              {ui.tryButton}
            </Link>
          </div>
        </aside>
      </div>

      <section className="blRelated" aria-label={ui.related}>
        <h2>{ui.related}</h2>
        <div className="blGrid">
          {getRelatedPosts(post.id, lang).map((item) => (
            <BlogCard key={item.id} post={item} lang={lang} minLabel={ui.minRead} />
          ))}
        </div>
      </section>
    </>
  );
}

/** Public blog: /blog and /en/blog (index with search and categories), /blog/:slug and /en/blog/:slug (article). */
function BlogPage({ theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const lang = langFromPath(location.pathname);
  const ui = BLOG_UI[lang];

  const rest = location.pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\/blog\/?/, '').replace(/\/+$/, '');
  const slug = decodeURIComponent(rest);
  const post = slug ? getBlogPost(slug, lang) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    applySeo({
      title: post ? `${post.title} | Kısaltıcı` : ui.pageTitle,
      description: post ? post.description : ui.pageDescription,
      path: blogPath(lang, slug),
      noindex: Boolean(slug && !post),
    });
  }, [post, slug, lang, ui]);

  const otherLang = lang === 'en' ? 'tr' : 'en';

  return (
    <div className="blPage">
      <header className="blTop">
        <div className="blTopInner">
          <button type="button" className="blBack" onClick={() => navigate(post ? blogPath(lang) : homePath(lang))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            <span>{post ? ui.allPosts : ui.home}</span>
          </button>
          <Link to={homePath(lang)} aria-label="Kısaltıcı">
            <img src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'} alt="Kısaltıcı" className="blLogo" />
          </Link>
          <Link to={alternatePath(location.pathname, otherLang)} className="blLang" hrefLang={otherLang} aria-label={otherLang === 'en' ? 'English' : 'Türkçe'}>
            {otherLang.toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="blMain">
        {slug && !post ? (
          <div className="blNotFound">
            <h1 className="blTitle">{ui.notFoundTitle}</h1>
            <p className="blLead">{ui.notFoundText}</p>
            <Link to={blogPath(lang)} className="blBtn">
              {ui.allPosts}
            </Link>
          </div>
        ) : post ? (
          <BlogArticle key={post.id + lang} post={post} lang={lang} ui={ui} />
        ) : (
          <BlogIndex key={lang} lang={lang} ui={ui} />
        )}
      </main>

      <footer className="blFooter">
        <div className="blFooterInner">
          <LegalLinks lang={lang} />
          <span className="blRights">© 2026 Kısaltıcı</span>
        </div>
      </footer>
    </div>
  );
}

export default BlogPage;
