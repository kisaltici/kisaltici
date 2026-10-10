import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLegalDocs, getLegalDoc, LEGAL_UI } from './legalDocs';
import { LEGAL_DATES, LEGAL_VERSION } from '../config/legal';
import AbuseReportForm from '../components/AbuseReportForm';
import LegalLinks from '../components/LegalLinks';
import { applySeo } from '../utils/seo';
import { homePath, langFromPath } from '../i18n/siteLang';
import { alternatePath } from '../i18n/alternatePath';
import { legalPath } from '../content/legalSlugs';
import './LegalPage.css';

/** Public legal pages: /yasal(/:slug) in Turkish and /en/legal(/:slug) in English. */
function LegalPage({ theme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const lang = langFromPath(location.pathname);
  const ui = LEGAL_UI[lang];

  const root = lang === 'en' ? /^\/en\/legal\/?/ : /^\/yasal\/?/;
  const slug = decodeURIComponent(location.pathname.replace(root, '').replace(/\/+$/, ''));
  const doc = slug ? getLegalDoc(slug, lang) : null;
  const docs = getLegalDocs(lang);

  useEffect(() => {
    window.scrollTo(0, 0);
    applySeo({
      title: doc ? `${doc.title} | Kısaltıcı` : ui.pageTitle,
      description: doc ? doc.summary : ui.pageDescription,
      path: legalPath(lang, doc ? doc.id : ''),
      noindex: Boolean(slug && !doc),
    });
  }, [doc, slug, lang, ui]);

  const otherLang = lang === 'en' ? 'tr' : 'en';

  return (
    <div className="lgPage">
      <header className="lgTop">
        <div className="lgTopInner">
          <button type="button" className="lgBack" onClick={() => navigate(homePath(lang))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            <span>{ui.home}</span>
          </button>
          <Link to={homePath(lang)} aria-label="Kısaltıcı">
            <img src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'} alt="Kısaltıcı" className="lgLogo" width="74" height="24" />
          </Link>
          <Link to={alternatePath(location.pathname, otherLang)} className="lgLang" hrefLang={otherLang} aria-label={otherLang === 'en' ? 'EN: English' : 'TR: Türkçe'}>
            {otherLang.toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="lgMain">
        {slug && !doc ? (
          <div className="lgNotFound">
            <h1 className="lgTitle">{ui.notFoundTitle}</h1>
            <p className="lgSummary">{ui.notFoundText}</p>
            <Link to={legalPath(lang)} className="lgBtn">{ui.allLegal}</Link>
          </div>
        ) : doc ? (
          <article className="lgDoc">
            <h1 className="lgTitle">{doc.title}</h1>
            <p className="lgMeta">{ui.updated}: {LEGAL_DATES[lang]} · {ui.version} {LEGAL_VERSION}</p>
            {lang === 'en' && <p className="lgNote">{ui.translationNote}</p>}

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

            {doc.id === 'kotuye-kullanim-bildirimi' && <AbuseReportForm lang={lang} />}
          </article>
        ) : (
          <div className="lgIndex">
            <h1 className="lgTitle">{ui.title}</h1>
            <p className="lgSummary">{ui.subtitle}</p>
            {lang === 'en' && <p className="lgNote">{ui.translationNote}</p>}
            <div className="lgCards">
              {docs.map((item) => (
                <Link key={item.id} to={legalPath(lang, item.id)} className="lgCard">
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
          <LegalLinks lang={lang} />
          <span className="lgRights">© 2026 Kısaltıcı</span>
        </div>
      </footer>
    </div>
  );
}

export default LegalPage;
