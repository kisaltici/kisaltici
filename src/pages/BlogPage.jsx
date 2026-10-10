import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BLOG_POSTS, getBlogPost, getRelatedPosts, formatPostDate } from '../content/blogPosts';
import LegalLinks from '../components/LegalLinks';
import { applySeo } from '../utils/seo';
import './BlogPage.css';

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blCard">
      <span className="blCardMeta">
        {post.category} · {post.readMinutes} dk okuma
      </span>
      <span className="blCardTitle">{post.title}</span>
      <span className="blCardText">{post.description}</span>
      <span className="blCardMore">Devamını oku →</span>
    </Link>
  );
}

/** Public blog: /blog (index) and /blog/:slug (article with recommended posts). Turkish only. */
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
            <span>{post ? 'Blog' : 'Ana sayfa'}</span>
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
            <Link to="/blog" className="blBtn">Tüm yazılar</Link>
          </div>
        ) : post ? (
          <>
            <article className="blArticle">
              <p className="blCardMeta">
                {post.category} · {formatPostDate(post.date)} · {post.readMinutes} dk okuma
              </p>
              <h1 className="blTitle">{post.title}</h1>
              <p className="blLead">{post.description}</p>

              {post.sections.map((section, index) => (
                <section key={index} className="blSection">
                  {section.h && <h2>{section.h}</h2>}
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

              <aside className="blCta">
                <strong>Bağlantını hemen kısalt</strong>
                <span>Kısa bağlantı ve QR kod oluştur, tıklamaları takip et.</span>
                <Link to="/" className="blBtn">Kısaltıcı’yı dene</Link>
              </aside>
            </article>

            <section className="blRelated" aria-label="Önerilen yazılar">
              <h2>Önerilen yazılar</h2>
              <div className="blCards">
                {getRelatedPosts(post.slug).map((item) => (
                  <PostCard key={item.slug} post={item} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <h1 className="blTitle">Blog</h1>
            <p className="blLead">Link kısaltma, QR kod ve tıklama takibi hakkında rehberler ve ipuçları.</p>
            <div className="blCards">
              {BLOG_POSTS.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </>
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
