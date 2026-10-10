import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth, preloadAuth } from '../context/AuthContext';
import { LANDING_COPY } from '../i18n/landingCopy';
import { COLOR_THEMES } from '../utils/themePresets';
import {
  SALE_PLANS,
  TRIAL_DAYS,
  formatListPrice,
  FEATURED_PLAN,
  DEFAULT_PERIOD,
  buildPlanRows,
  formatPrice,
  getPlanCopy,
} from '../config/plans';
import { useLocation, useNavigate } from 'react-router-dom';
import BillingToggle from '../components/BillingToggle';
import { useBillingConfig } from '../utils/useBillingConfig';
import LegalLinks from '../components/LegalLinks';
import { BLOG_UI, blogPath } from '../content/blogUi';
import BlogCard from '../components/BlogCard';
import { homePath } from '../i18n/siteLang';
import { detectBrowserLanguage } from '../i18n/LanguageContext';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);
// The mobile URL bar collapsing resizes the viewport; do not rebuild every trigger for that (causes jumps and flicker)
ScrollTrigger.config({ ignoreMobileResize: true });

const THEME_LIST = Object.values(COLOR_THEMES);

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...common}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} strokeWidth={2.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      );
    case 'link':
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1l-1.2 1.2" />
          <path d="M14 11a5 5 0 0 0-7.1 0L4.5 13.4a5 5 0 0 0 7.1 7.1l1.2-1.2" />
        </svg>
      );
    case 'qr':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5" />
        </svg>
      );
    case 'minus':
      return (
        <svg {...common} strokeWidth={2.5}>
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        </svg>
      );
    default:
      return null;
  }
}

function LandingPage({ theme, onToggleTheme, onOpenAuthModal, onStartCheckout, isSigningIn = false }) {
  const { t, lang, setLanguageMode } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const copy = LANDING_COPY[lang] || LANDING_COPY.en;
  const blogUi = BLOG_UI[lang] || BLOG_UI.en;

  // The three newest posts are loaded after first paint: the post texts are large and the cards sit far below the fold
  // Load Firebase as soon as the visitor shows intent (first touch, pointer move, key or scroll), so the Google
  // popup can open straight from the click without waiting for a download
  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    const warm = () => {
      preloadAuth().catch(() => {});
      events.forEach((name) => window.removeEventListener(name, warm));
    };
    events.forEach((name) => window.addEventListener(name, warm, { passive: true, once: true }));
    return () => events.forEach((name) => window.removeEventListener(name, warm));
  }, []);

  const [latestPosts, setLatestPosts] = useState([]);
  useEffect(() => {
    let active = true;
    import('../content/blogPosts').then((module) => {
      if (active) setLatestPosts(module.getPosts(lang).slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, [lang]);

  // Suggest the other language when the browser prefers it (never redirects automatically)
  const browserLang = detectBrowserLanguage();
  const [hintDismissed, setHintDismissed] = useState(() => {
    try {
      return localStorage.getItem('kslt_lang_hint') === '1';
    } catch {
      return false;
    }
  });
  const showLangHint = !hintDismissed && browserLang !== lang;

  const rootRef = useRef(null);
  const sentinelRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  // Trial wording is only shown while it is true: before payments open, or when the server has trials enabled
  const billing = useBillingConfig();
  const showTrial = billing.loading || !billing.enabled || billing.trial;
  const [clicks, setClicks] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1284 : 0
  );

  /* Smooth anchor scrolling only while the landing page is mounted */
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);

  /* Nav state via a sentinel (no scroll listener, state flips only when crossing the top) */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /* Reveal-on-scroll and the active "how it works" step (IntersectionObserver) */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const revealTargets = root.querySelectorAll('[data-reveal]');
    root.classList.add('lpReady');

    if (typeof IntersectionObserver === 'undefined') {
      revealTargets.forEach((el) => el.classList.add('isIn'));
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('isIn');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.getAttribute('data-step')));
          }
        });
      },
      { rootMargin: '-42% 0px -42% 0px' }
    );
    root.querySelectorAll('[data-step]').forEach((el) => stepObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      stepObserver.disconnect();
    };
  }, []);

  /* Scroll-driven motion (GSAP ScrollTrigger). Writes to the DOM only, never to React state. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 1021px)',
      },
      (context) => {
        const { motion, wide } = context.conditions;
        if (!motion) return undefined;

        const q = (selector) => root.querySelector(selector);
        const qa = (selector) => gsap.utils.toArray(selector, root);

        // Hero card drifts up and tilts as the page is scrolled away from it
        [['.lpHvMain', -10], ['.lpHvQr', -26], ['.lpHvStats', -16]].forEach(([target, shift]) => {
          gsap.to(target, {
            yPercent: shift,
            ease: 'none',
            scrollTrigger: { trigger: '.lpHero', start: 'top top', end: 'bottom top', scrub: true },
          });
        });

        // Statement: words light up one by one while the block crosses the viewport
        gsap.fromTo(
          '.lpWord',
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: {
              trigger: '.lpStatement',
              start: 'top 72%',
              end: 'bottom 52%',
              scrub: true,
            },
          }
        );

        // How it works: the rail fills with scroll progress
        const steps = q('.lpSteps');
        if (steps) {
          ScrollTrigger.create({
            trigger: steps,
            start: 'top 55%',
            end: 'bottom 60%',
            onUpdate: (self) => steps.style.setProperty('--lp-progress', self.progress.toFixed(3)),
          });
        }

        // Sticky stack: the card underneath shrinks while the next one slides over it (desktop)
        const cards = wide ? qa('.lpStackCard') : [];
        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;
          gsap.to(card.querySelector('.lpStackInner'), {
            scale: 0.93,
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top 88%', end: 'top 16%', scrub: true },
          });
        });

        // Themes: vertical scroll pans the gallery sideways (desktop only)
        const themes = q('.lpThemes');
        const track = q('.lpThemesTrack');
        let unpin = null;
        if (wide && themes && track) {
          themes.classList.add('lpPinned');
          unpin = () => themes.classList.remove('lpPinned');
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: themes,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          gsap.fromTo(
            '.lpThemesBarFill',
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: themes,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // Ticker: the three verbs slide with the scroll position
        gsap.fromTo(
          '.lpTickerTrack',
          { xPercent: 0 },
          {
            xPercent: -33.333,
            ease: 'none',
            scrollTrigger: { trigger: '.lpTicker', start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );

        return () => {
          if (unpin) unpin();
        };
      },
      root
    );

    return () => mm.revert();
  }, []);

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', err);
      onOpenAuthModal('login');
    }
  };

  const scrollToTop = (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPlans = () => {
    document.getElementById('planlar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Hero stats card: the click counter counts up once on load (static when motion is reduced)
  useEffect(() => {
    const target = 1284;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame;
    const start = performance.now() + 700;
    const tick = (now) => {
      const progress = Math.min(Math.max((now - start) / 1400, 0), 1);
      setClicks(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDark = theme === 'dark';
  const { hero, nav, how, statement, stack, themes, ticker, plans, faq, cta, footer } = copy;

  const renderHeroTitle = () => {
    const [before, after] = hero.title.split(hero.titleAccent);
    return (
      <>
        {before}
        <span className="lpAccent">{hero.titleAccent}</span>
        {after}
      </>
    );
  };

  const themeName = (item) => {
    const label = t(item.nameKey);
    return label === item.nameKey ? item.nameFallback : label;
  };

  const renderStackVisual = (index, item) => {
    switch (index) {
      case 0:
        return (
          <div className="lpVisFlow" data-reveal>
            <p className="lpFlowFrom">{item.from}</p>
            <span className="lpFlowRule" aria-hidden="true" />
            <p className="lpFlowTo">{item.to}</p>
          </div>
        );
      case 1:
        return (
          <div className="lpVisQr" data-reveal aria-hidden="true">
            <div className="lpQrCard lpQrBack">
              <QRCodeSVG value="https://kisaltici.com/b" size={128} level="L" bgColor="#080a11" fgColor="#DEFF36" marginSize={0} />
            </div>
            <div className="lpQrCard lpQrMid">
              <QRCodeSVG value="https://kisaltici.com/c" size={128} level="L" bgColor="#ffffff" fgColor="#080a11" marginSize={0} />
            </div>
            <div className="lpQrCard lpQrFront">
              <QRCodeSVG value="https://kisaltici.com/a" size={176} level="M" bgColor="#ffffff" fgColor="#080a11" marginSize={0} />
            </div>
          </div>
        );
      case 2:
        return (
          <figure className="lpVisChart" data-reveal>
            <svg viewBox="0 0 520 260" className="lpChart" role="img" aria-label={item.sample}>
              {[50, 110, 170, 230].map((y) => (
                <line key={y} x1="0" x2="520" y1={y} y2={y} className="lpChartGrid" />
              ))}
              <path className="lpChartLine" d="M0 210 C44 200 68 160 110 168 S176 220 218 160 S292 64 346 100 S432 44 520 30" fill="none" stroke="var(--accent-color)" strokeWidth="3.5" strokeLinecap="round" />
              <circle className="lpChartDot" cx="520" cy="30" r="6" fill="var(--accent-color)" />
            </svg>
            <figcaption>{item.sample}</figcaption>
          </figure>
        );
      default:
        return (
          <div className="lpVisCustom" data-reveal>
            <span className="lpCustomUrl">{item.example}</span>
            <span className="lpCustomTag">{item.tag}</span>
          </div>
        );
    }
  };

  const planCopy = getPlanCopy(lang);

  const statementWords = (text, accent) =>
    text.split(' ').map((word, i) => (
      <span key={`${word}-${i}`} className={`lpWord ${accent ? 'lpWordAccent' : ''}`}>
        {word}{' '}
      </span>
    ));

  return (
    <div className="lp" ref={rootRef}>
      <div ref={sentinelRef} className="lpSentinel" aria-hidden="true" />

      {showLangHint && (
        <div className="lpLangHint" role="note">
          <span>{lang === 'tr' ? 'This page is also available in English.' : 'Bu sayfanın Türkçe sürümü de var.'}</span>
          <a
            href={homePath(browserLang)}
            onClick={(event) => {
              event.preventDefault();
              navigate(homePath(browserLang));
            }}
          >
            {browserLang === 'en' ? 'View in English' : 'Türkçe görüntüle'}
          </a>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setHintDismissed(true);
              try {
                localStorage.setItem('kslt_lang_hint', '1');
              } catch {
                /* storage unavailable */
              }
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* NAVIGATION */}
      <header className={`lpNavWrap ${isScrolled ? 'isScrolled' : ''}`}>
        <nav className="lpNav" aria-label="Main">
          <a href="#top" className="lpBrand" onClick={scrollToTop} aria-label="Kısaltıcı">
            <img
              src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'}
              alt="Kısaltıcı"
              className="lpBrandImg"
              width="80"
              height="26"
            />
          </a>

          <ul className="lpNavLinks">
            <li><a href="#nasil">{nav.how}</a></li>
            <li><a href="#ozellikler">{nav.features}</a></li>
            <li><a href="#planlar">{nav.plans}</a></li>
            <li><a href="#sss">{nav.faq}</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>

          <div className="lpNavActions">
            <button
              type="button"
              className="lpIconBtn lpLangBtn"
              onClick={() => {
                const next = lang === 'tr' ? 'en' : 'tr';
                setLanguageMode(next);
                navigate(homePath(next));
              }}
              aria-label={`${lang === 'tr' ? 'EN' : 'TR'}: ${nav.language}`}
              title={nav.language}
            >
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>
            <button
              type="button"
              className="lpIconBtn"
              onClick={onToggleTheme}
              aria-label={nav.themeToggle}
              title={nav.themeToggle}
            >
              <Icon name={isDark ? 'sun' : 'moon'} />
            </button>
            <button type="button" className="lpBtn lpBtnGhost lpHideSm" onClick={() => onOpenAuthModal('login')}>
              {nav.signIn}
            </button>
            <button type="button" className="lpBtn lpBtnPrimary" onClick={() => onOpenAuthModal('register')}>
              {nav.start}
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="lpHero">
          <div className="lpHeroCopy">
            <p className="lpEyebrow lpLoadIn" style={{ '--i': 0 }}>
              <span className="lpLiveDot" aria-hidden="true" />
              {hero.eyebrow}
            </p>
            <h1 className="lpHeroTitle lpLoadIn" style={{ '--i': 1 }}>
              {renderHeroTitle()}
            </h1>
            <p className="lpHeroSub lpLoadIn" style={{ '--i': 2 }}>
              {hero.sub}
            </p>

            <div className="lpHeroActions lpLoadIn" style={{ '--i': 3 }}>
              <button type="button" className="lpBtn lpBtnPrimary lpBtnLg" onClick={scrollToPlans}>
                <span>{showTrial ? planCopy.trialCta(TRIAL_DAYS) : hero.ctaPrimary}</span>
                <Icon name="arrow" />
              </button>
              <a href="#nasil" className="lpBtn lpBtnGhost lpBtnLg">
                {hero.ctaSecondary}
              </a>
            </div>
            <p className="lpHeroNote lpLoadIn" style={{ '--i': 4 }}>
              {showTrial ? hero.note : hero.noteNoTrial}
            </p>

            <ul className="lpHeroProof lpLoadIn" style={{ '--i': 5 }}>
              {hero.proof.map((item, index) => (
                <li key={item}>
                  <Icon name={index === 0 ? 'link' : index === 1 ? 'qr' : 'spark'} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lpHeroVisual lpLoadIn" style={{ '--i': 3 }} aria-hidden="true">
            <div className="lpHvMain lpGlass">
              <p className="lpHvLong">{hero.previewLong}</p>
              <div className="lpHvFlow">
                <span className="lpHvRail"><span className="lpHvPulse" /></span>
              </div>
              <div className="lpHvShortRow">
                <span className="lpResultLinkIcon"><Icon name="link" /></span>
                <div className="lpResultLinkText">
                  <span className="lpResultLabel">{hero.previewLinkLabel}</span>
                  <span className="lpResultShort">kisaltici.com/aB3xYz</span>
                </div>
                <span className="lpResultCopy"><Icon name="copy" /></span>
              </div>
            </div>

            <div className="lpHvQr lpGlass">
              <div className="lpQrTile">
                <QRCodeSVG value="https://kisaltici.com" size={104} level="M" bgColor="#ffffff" fgColor="#080a11" marginSize={0} />
              </div>
              <span className="lpHvChip">{hero.previewQr}</span>
            </div>

            <div className="lpHvStats lpGlass">
              <span className="lpResultLabel">{hero.previewClicks}</span>
              <span className="lpHvNumber">{clicks.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}</span>
              <div className="lpHvBars">
                {[38, 52, 34, 60, 48, 72, 56, 84, 66, 92, 78, 100].map((height, index) => (
                  <span key={index} style={{ '--h': `${height}%`, '--d': `${0.8 + index * 0.06}s` }} />
                ))}
              </div>
              <span className="lpHvTrend">{hero.previewTrend}</span>
            </div>
          </div>
        </section>

        {/* STATEMENT (scrubbed word reveal) */}
        <section className="lpStatement" aria-label={`${statement.lead} ${statement.accent}`}>
          <p className="lpStatementText" aria-hidden="true">
            {statementWords(statement.lead, false)}
            {statementWords(statement.accent, true)}
          </p>
        </section>

        {/* HOW IT WORKS (sticky intro + progress rail) */}
        <section className="lpSection lpHow" id="nasil">
          <div className="lpHowIntro" data-reveal>
            <h2 className="lpH2">{how.title}</h2>
            <p className="lpLead">{how.sub}</p>
          </div>

          <ol className="lpSteps">
            <span className="lpProgress" aria-hidden="true"><span className="lpProgressFill" /></span>
            {how.steps.map((step, index) => (
              <li
                key={step.title}
                className={`lpStep ${activeStep === index ? 'isActive' : ''}`}
                data-step={index}
                data-reveal
              >
                <span className="lpStepNum">{String(index + 1).padStart(2, '0')}</span>
                <div className="lpStepBody">
                  <h3 className="lpH3">{step.title}</h3>
                  <p className="lpCellText">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* STICKY STACK (features) */}
        <section className="lpStack" id="ozellikler">
          {stack.items.map((item, index) => (
            <article
              key={item.num}
              className={`lpStackCard lpStackCard${index + 1}`}
              style={{ '--k': index }}
            >
              <div className="lpStackInner">
                <div className="lpStackCopy">
                  <span className="lpStackNum">{item.num}</span>
                  <h2 className="lpStackTitle">{item.title}</h2>
                  <p className="lpStackText">{item.text}</p>
                </div>
                <div className="lpStackVisual">{renderStackVisual(index, item)}</div>
              </div>
            </article>
          ))}
        </section>

        {/* THEMES (pinned horizontal pan on desktop, native swipe on mobile) */}
        <section className="lpThemes" aria-label={themes.title}>
          <div className="lpThemesTrack">
            <div className="lpThemesIntro">
              <h2 className="lpH2">{themes.title}</h2>
              <p className="lpLead">{themes.text}</p>
            </div>

            {THEME_LIST.map((item) => (
              <figure
                key={item.id}
                className="lpThemeCard"
                style={{
                  '--t-bg': item.preview.bg,
                  '--t-surface': item.preview.surface,
                  '--t-border': item.preview.border,
                  '--t-accent': item.preview.accent,
                }}
              >
                <div className="lpThemeBar">
                  <span /><span /><span />
                </div>
                <div className="lpThemeBody">
                  <span className="lpThemeHeading">{themes.sampleTitle}</span>
                  <div className="lpThemeRow">
                    <span className="lpThemeLink">{themes.sampleLink}</span>
                    <span className="lpThemeChip" />
                  </div>
                  <div className="lpThemeRow lpThemeRowDim">
                    <span className="lpThemeLine" />
                    <span className="lpThemeChip lpThemeChipDim" />
                  </div>
                  <span className="lpThemeBtn" />
                </div>
                <figcaption className="lpThemeCaption">
                  <span>{themeName(item)}</span>
                  <em>{item.isPro ? themes.pro : themes.free}</em>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="lpThemesBar" aria-hidden="true">
            <span className="lpThemesBarFill" />
          </div>
        </section>

        {/* TICKER (one marquee, driven by scroll) */}
        <section className="lpTicker" aria-hidden="true">
          <div className="lpTickerTrack">
            {[0, 1, 2].map((group) => (
              <div className="lpTickerGroup" key={group}>
                {ticker.map((word) => (
                  <span className="lpTickerItem" key={`${group}-${word}`}>
                    {word}
                    <i className="lpTickerDot" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PLANS (one featured panel + two compact ones) */}
        <section className="lpSection" id="planlar">
          <div className="lpSectionHead" data-reveal>
            <h2 className="lpH2">{plans.title}</h2>
            <p className="lpLead">{plans.sub}</p>
          </div>

          <div className="lpBillingToggle" data-reveal>
            <BillingToggle period={period} onChange={setPeriod} />
          </div>

          <div className="lpPlans">
            {SALE_PLANS.map((planId, index) => {
              const featured = planId === FEATURED_PLAN;
              const rows = buildPlanRows(planId, lang);
              return (
                <article
                  key={planId}
                  className={`lpPlan ${featured ? 'isFeatured' : ''}`}
                  data-reveal
                  style={{ '--i': index }}
                >
                  <header className="lpPlanHead">
                    <div className="lpPlanTitleRow">
                      <h3 className="lpH3">{planCopy.names[planId]}</h3>
                      {featured && <span className="lpBadge">{planCopy.recommended}</span>}
                    </div>
                    <p className="lpCellText">{planCopy.descs[planId]}</p>
                    <div className="lpPrice">
                      {formatListPrice(planId, period, billing.currency) && (
                        <span className="lpPriceWas" aria-label={planCopy.launchPrice}>
                          {formatListPrice(planId, period, billing.currency)}
                        </span>
                      )}
                      <div className="lpPriceNow">
                        <span className="lpPriceAmount">{formatPrice(planId, period, billing.currency)}</span>
                        <span className="lpPricePeriod">{period === 'yearly' ? planCopy.periodYear : planCopy.period}</span>
                      </div>
                      <span className="lpPriceTag">{showTrial ? `${planCopy.launchPrice} · ${planCopy.trialBadge(TRIAL_DAYS)}` : planCopy.launchPrice}</span>
                    </div>
                  </header>

                  <ul className="lpPlanList">
                    {rows.map((row) => (
                      <li key={row.key} className={row.included ? '' : 'isOff'}>
                        <span className="lpPointIcon">
                          <Icon name={row.included ? 'check' : 'minus'} />
                        </span>
                        <span>{row.label}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`lpBtn ${featured ? 'lpBtnPrimary' : 'lpBtnGhost'} lpPlanBtn`}
                    onClick={() => (onStartCheckout ? onStartCheckout(planId, period) : onOpenAuthModal('login'))}
                  >
                    {showTrial ? planCopy.trialCta(TRIAL_DAYS) : planCopy.selectPlan(planCopy.names[planId])}
                  </button>
                </article>
              );
            })}
          </div>

          {showTrial && <p className="lpTrialNote" data-reveal>{planCopy.trialNote(TRIAL_DAYS)}</p>}
        </section>

        {/* FAQ */}
        <section className="lpSection lpFaq" id="sss">
          <div className="lpSectionHead" data-reveal>
            <h2 className="lpH2">{faq.title}</h2>
          </div>

          <div className="lpFaqList" data-reveal>
            {faq.items.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.q} className={`lpFaqItem ${isOpen ? 'isOpen' : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className="lpFaqQ"
                      aria-expanded={isOpen}
                      aria-controls={`lp-faq-${index}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span className="lpFaqIndex">{String(index + 1).padStart(2, '0')}</span>
                      <span className="lpFaqText">{item.q}</span>
                      <span className="lpFaqPlus" aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`lp-faq-${index}`} className="lpFaqA" role="region">
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BLOG */}
        <section className="lpSection lpBlog" id="blog">
          <div className="lpSectionHead" data-reveal>
            <h2 className="lpH2">Blog</h2>
            <p className="lpLead">{blogUi.landingText}</p>
          </div>
          <div className="lpBlogGrid">
            {[0, 1, 2].map((index) => (
              <div key={index} data-reveal style={{ '--i': index }}>
                {latestPosts[index] ? (
                  <BlogCard post={latestPosts[index]} lang={lang} minLabel={blogUi.minRead} />
                ) : (
                  <div className="lpBlogSkeleton" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <p className="lpBlogAll" data-reveal>
            <a
              href={blogPath(lang)}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                navigate(blogPath(lang));
              }}
            >
              {blogUi.allLink} →
            </a>
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="lpSection lpFinal">
          <div className="lpFinalInner" data-reveal>
            <h2 className="lpFinalTitle">{cta.title}</h2>
            <p className="lpLead">{cta.text}</p>
            <button type="button" className="lpBtn lpBtnPrimary lpBtnLg" onClick={handleGoogle}>
              <span>{cta.button}</span>
              <Icon name="arrow" />
            </button>
          </div>
        </section>
      </main>

      {/* Shown while the Google window is open / the account is being signed in */}
      {isSigningIn && (
        <div className="lpSigningIn" role="status" aria-live="polite">
          <div className="lpSigningInCard lpGlass">
            <img
              src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'}
              alt="Kısaltıcı"
              className="lpSigningInLogo"
            />
            <span className="lpSigningInBar" aria-hidden="true" />
            <h2 className="lpSigningInTitle">{t('signingInTitle')}</h2>
            <p className="lpSigningInText">{t('signingInText')}</p>
          </div>
        </div>
      )}

      <footer className="lpFooter">
        <div className="lpFooterInner">
          <div className="lpFooterBrand">
            <img
              src={isDark ? '/KSLT_LOGO_DARK.svg' : '/KSLT_LOGO_LIGHT.svg'}
              alt="Kısaltıcı"
              width="68"
              height="22"
            />
            <p>{footer.tagline}</p>
          </div>
          <ul className="lpFooterLinks">
            <li><a href="#nasil">{nav.how}</a></li>
            <li><a href="#ozellikler">{nav.features}</a></li>
            <li><a href="#planlar">{nav.plans}</a></li>
            <li><a href="#sss">{nav.faq}</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>
          <span className="lpFooterRights">{footer.rights}</span>
          <LegalLinks className="lpFooterLegal" lang={lang} />
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
