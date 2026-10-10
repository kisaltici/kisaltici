import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LEGAL_DOCS, getLegalDoc } from './legalDocs';
import { LEGAL_UPDATED, LEGAL_VERSION } from '../config/legal';
import LegalLinks from '../components/LegalLinks';
import './LegalPage.css';

/** Public legal pages: /yasal (index) and /yasal/:slug (one document). Turkish only. */
function LegalPage({ theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const slug = location.pathname.replace(/^\/yasal\/?/, '').replace(/\/+$/, '');
  const doc = slug ? getLegalDoc(slug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = doc ? `${doc.title} | Kısaltıcı` : 'Yasal | Kısaltıcı';
    return () => {
      document.title = previousTitle;
    };
  }, [doc, slug]);

  const goBack = () => navigate('/');

  return (
    <div className="lgPage">
      <header className="lgTop">
        <div className="lgTopInner">
          <button type="button" className="lgBack" onClick={goBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            <span>Ana sayfa</span>
          </button>
          <Link to="/" aria-label="Kısaltıcı">
            <img src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'} alt="Kısaltıcı" className="lgLogo" />
          </Link>
          <span />
        </div>
      </header>

      <main className="lgMain">
        {slug && !doc ? (
          <div className="lgNotFound">
            <h1 className="lgTitle">Sayfa bulunamadı</h1>
            <p className="lgSummary">Aradığın yasal metin mevcut değil.</p>
            <Link to="/yasal" className="lgBtn">Tüm yasal metinler</Link>
          </div>
        ) : doc ? (
          <article className="lgDoc">
            <h1 className="lgTitle">{doc.title}</h1>
            <p className="lgMeta">Son güncelleme: {LEGAL_UPDATED} · Sürüm {LEGAL_VERSION}</p>

            {doc.sections.map((section) => (
              <section key={section.h} className="lgSection">
                <h2>{section.h}</h2>
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
        ) : (
          <div className="lgIndex">
            <h1 className="lgTitle">Yasal</h1>
            <p className="lgSummary">Hizmet koşulları, gizlilik ve satış sözleşmesi metinleri.</p>
            <div className="lgCards">
              {LEGAL_DOCS.map((item) => (
                <Link key={item.slug} to={`/yasal/${item.slug}`} className="lgCard">
                  <span className="lgCardTitle">{item.title}</span>
                  <span className="lgCardText">{item.summary}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="lgFooter">
        <div className="lgFooterInner">
          <LegalLinks />
          <span className="lgRights">© 2026 Kısaltıcı</span>
        </div>
      </footer>
    </div>
  );
}

export default LegalPage;
