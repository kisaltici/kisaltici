import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getBlogPost,
  getRelatedPosts,
  formatPostDate,
  headingId,
} from '../content/blogPosts';
import LegalLinks from '../components/LegalLinks';
import { applySeo } from '../utils/seo';
import './BlogPage.css';

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function PostCard({ post, featured = false }) {
  return (
    <Link to={`/blog/${post.slug}`} className={`blCard ${featured ? 'isFeatured' : ''}`}>
      <span className="blChip">{post.category}</span>
      <span className="blCardTitle">{post.title}</span>
      <span className="blCardText">{post.description}</span>
      <span className="blCardFoot">
        <span>
          {formatPostDate(post.date)} · {post.readMinutes} dk
        </span>
        <span className="blCardMore">
          Oku <Arrow />
        </span>
      </span>
    </Link>
  );
}

/* ---------------- /blog ---------------- */
function BlogIndex() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tümü');

  const posts = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return BLOG_POSTS.filter((post) => {
      if (category !== 'Tümü' && post.category !== category) return false;
      if (!q) return true;
      return `${post.title} ${post.description} ${post.category}`.toLocaleLowerCase('tr-TR').includes(q);
    });
  }, [query, category]);

  const [first, ...rest] = posts;

  return (
    <>
      <section className="blHero">
        <span className="blEyebrow">Blog</span>
        <h1 className="blHeroTitle">Link, QR kod ve ölçüm üzerine rehberler</h1>
        <p className="blLead">
          Bağlantılarını daha iyi paylaşmak, QR kodlarını doğru hazırlamak ve sonuçları ölçmek için kısa, uygulanabilir yazılar.
        </p>

        <div className="blTools">
          <label className="blSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Yazılarda ara"
              aria-label="Yazılarda ara"
            />
          </label>
          <div className="blChips" role="tablist" aria-label="Kategoriler">
            {['Tümü', ...BLOG_CATEGORIES].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`blFilter ${category === item ? 'isOn' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {first ? (
        <section className="blListing" aria-label="Yazılar">
          <PostCard post={first} featured />
          {rest.length > 0 && (
            <div className="blCards">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="blEmpty">Aramana uyan yazı bulunamadı.</p>
      )}
    </>
  );
}

/* ---------------- /blog/:slug ---------------- */
function BlogArticle({ post }) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  const toc = post.sections.filter((section) => section.h).map((section) => ({ id: headingId(section.h), text: section.h }));

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-(rect.top - 70), 0), Math.max(total, 1));
      setProgress(Math.round((done / Math.max(total, 1)) * 100));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [post.slug]);

  // Active heading in the table of contents
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
  }, [post.slug]);

  const copyLink = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
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
            <span className="blChip">{post.category}</span>
            <h1 className="blTitle">{post.title}</h1>
            <p className="blLead">{post.description}</p>
            <p className="blMetaRow">
              {formatPostDate(post.date)} · {post.readMinutes} dk okuma
            </p>
          </header>

          {post.highlights && post.highlights.length > 0 && (
            <aside className="blHighlights" aria-label="Kısaca">
              <strong>Kısaca</strong>
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

        <aside className="blSide" aria-label="Yazı paneli">
          <div className="blPanel">
            <span className="blPanelTitle">Bu yazıda</span>
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
            <div className="blStats">
              <div>
                <span>Okuma</span>
                <strong>{post.readMinutes} dk</strong>
              </div>
              <div>
                <span>İlerleme</span>
                <strong>%{progress}</strong>
              </div>
            </div>
            <button type="button" className="blCopy" onClick={copyLink}>
              {copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
            </button>
          </div>

          <div className="blPanel blTry">
            <strong>Bağlantını hemen kısalt</strong>
            <span>Kısa bağlantı ve QR kod oluştur, tıklamaları takip et.</span>
            <Link to="/" className="blBtn">
              Kısaltıcı’yı dene
            </Link>
          </div>
        </aside>
      </div>

      <section className="blRelated" aria-label="Önerilen yazılar">
        <h2>Önerilen yazılar</h2>
        <div className="blCards isThree">
          {getRelatedPosts(post.slug).map((item) => (
            <PostCard key={item.slug} post={item} />
          ))}
        </div>
      </section>
    </>
  );
}

/** Public blog: /blog (index with search and categories) and /blog/:slug (article). Turkish only. */
function BlogPage({ theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const slug = location.pathname.replace(/^\/blog\/?/, '').replace(/\/+$/, '');
  const post = slug ? getBlogPost(slug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    applySeo({
      title: post ? `${post.title} | Kısaltıcı` : 'Blog | Kısaltıcı',
      description: post
        ? post.description
        : 'Link kısaltma, QR kod ve tıklama takibi hakkında rehberler ve ipuçları.',
      path: slug ? `/blog/${slug}` : '/blog',
      noindex: Boolean(slug && !post),
    });
  }, [post, slug]);

  return (
    <div className="blPage">
      <header className="blTop">
        <div className="blTopInner">
          <button type="button" className="blBack" onClick={() => navigate(post ? '/blog' : '/')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            <span>{post ? 'Tüm yazılar' : 'Ana sayfa'}</span>
          </button>
          <Link to="/" aria-label="Kısaltıcı">
            <img src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'} alt="Kısaltıcı" className="blLogo" />
          </Link>
          <span />
        </div>
      </header>

      <main className="blMain">
        {slug && !post ? (
          <div className="blNotFound">
            <h1 className="blTitle">Yazı bulunamadı</h1>
            <p className="blLead">Aradığın blog yazısı mevcut değil.</p>
            <Link to="/blog" className="blBtn">
              Tüm yazılar
            </Link>
          </div>
        ) : post ? (
          <BlogArticle key={post.slug} post={post} />
        ) : (
          <BlogIndex />
        )}
      </main>

      <footer className="blFooter">
        <div className="blFooterInner">
          <LegalLinks />
          <span className="blRights">© 2026 Kısaltıcı</span>
        </div>
      </footer>
    </div>
  );
}

export default BlogPage;
