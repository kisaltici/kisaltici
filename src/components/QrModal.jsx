import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { consumeQr } from '../utils/shortenApi';
import { getClientLimits } from '../config/plans';
import { generateQrMatrix, generateQrSvgString } from '../utils/qrRenderer';
import { downloadQrPng, downloadQrSvg } from '../utils/qrExport';
import QrStudio from './QrStudio';
import './QrModal.css';

const svgProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function Glyph({ name }) {
  switch (name) {
    case 'qr':
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...svgProps}>
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
          <path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...svgProps} width="14" height="14">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case 'close':
      return (
        <svg {...svgProps} width="18" height="18">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'back':
      return (
        <svg {...svgProps} width="16" height="16">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      );
    case 'download':
      return (
        <svg {...svgProps} width="16" height="16">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'info':
      return (
        <svg {...svgProps} width="15" height="15">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * QR entry point. Two options: a standard QR (all plans) and the custom QR designer (Starter and above).
 * Both draw from the same daily QR allowance. The allowance is taken the moment the user ENTERS a QR
 * screen (not on download), so a screenshot of the designer cannot bypass the limit. Reopening the same
 * link's QR on the same day is free (the server counts distinct links per day).
 */
function QrModal({
  isOpen,
  onClose,
  shortCode,
  shortUrl,
  initialSettings = null,
  onSettingsSaved = null,
  onUpgrade = null,
}) {
  const { t } = useTranslation();
  const { user, getIdToken, refetchProfile, membershipPlan, userProfile } = useAuth();

  const [step, setStep] = useState('choose'); // 'choose' | 'standard' | 'custom'
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null); // { text, action: 'guest' | 'plan' }

  const limits = getClientLimits(user ? membershipPlan : 'free');
  const canCustom = Boolean(limits.customQr);
  const usage = userProfile?.usage;

  // Always start from the chooser when the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setBusy(null);
      setNotice(null);
    }
  }, [isOpen, shortCode]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Standard QR: black on white, medium error correction (no customization)
  const standard = useMemo(() => {
    if (!isOpen || step !== 'standard' || !shortUrl) return null;
    try {
      const qr = generateQrMatrix(shortUrl, 'minimal', false);
      const svg = generateQrSvgString({
        matrix: qr.matrix,
        size: qr.size,
        fgColor: '#000000',
        bgColor: '#ffffff',
        moduleShape: 'square',
        finderStyle: 'classic',
        margin: 4,
        centerImage: null,
      });
      return { qr, svg };
    } catch (e) {
      console.error('Error generating QR:', e);
      return null;
    }
  }, [isOpen, step, shortUrl]);

  if (!isOpen) return null;

  const goUpgrade = (action) => {
    onClose();
    if (onUpgrade) onUpgrade(action);
  };

  const choose = async (mode) => {
    if (busy) return;

    if (mode === 'custom' && !canCustom) {
      setNotice({ text: t('qrCustomNeedsPlan'), action: user ? 'plan' : 'guest' });
      return;
    }

    setBusy(mode);
    setNotice(null);
    const gate = await consumeQr(shortCode, getIdToken, mode);
    setBusy(null);

    if (gate.allowed) {
      // The allowance is taken now: refresh the usage bar and open the screen
      if (user && refetchProfile) refetchProfile();
      setStep(mode);
      return;
    }

    if (gate.errorCode === 'guest_limit') {
      setNotice({ text: t('guestQrLimitReached'), action: 'guest' });
    } else if (gate.errorCode === 'no_plan') {
      setNotice({ text: t('noPlanQr'), action: 'plan' });
    } else if (gate.errorCode === 'plan_required') {
      setNotice({ text: t('qrCustomNeedsPlan'), action: user ? 'plan' : 'guest' });
    } else {
      setNotice({ text: t('dailyQrLimitReached', { limit: gate.limit }), action: 'plan' });
    }
  };

  const renderHeader = ({ title, extra = null, backable = true }) => (
    <header className="qrxHeader">
      <div className="qrxHeaderLeft">
        {backable && step !== 'choose' && (
          <button type="button" className="qrxBack" onClick={() => setStep('choose')}>
            <Glyph name="back" />
            <span>{t('qrBack')}</span>
          </button>
        )}
        <h2 id="qrx-title" className="qrxTitle">{title}</h2>
        {extra}
      </div>
      <button type="button" className="qrxClose" onClick={onClose} aria-label={t('closeModal')} title={t('closeModal')}>
        <Glyph name="close" />
      </button>
    </header>
  );

  return (
    <div
      className="qrxOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrx-title"
    >
      <div className={`qrxDialog qrx-${step}`}>
        {step === 'choose' && (
          <>
            {renderHeader({ title: t('qrChooseTitle'), backable: false })}
            <div className="qrxChooseBody">
              <p className="qrxLead">{t('qrChooseSub')}</p>

              <div className="qrxOptions">
                <button type="button" className="qrxOption" onClick={() => choose('standard')} disabled={Boolean(busy)}>
                  <span className="qrxOptionIcon"><Glyph name="qr" /></span>
                  <span className="qrxOptionTitle">{t('qrBasicTitle')}</span>
                  <span className="qrxOptionDesc">{t('qrBasicDesc')}</span>
                  <span className="qrxChip">{busy === 'standard' ? '…' : t('qrAllPlans')}</span>
                </button>

                <button
                  type="button"
                  className={`qrxOption ${canCustom ? '' : 'isLocked'}`}
                  onClick={() => choose('custom')}
                  disabled={Boolean(busy)}
                >
                  <span className="qrxOptionIcon"><Glyph name="spark" /></span>
                  <span className="qrxOptionTitle">{t('qrCustomTitle')}</span>
                  <span className="qrxOptionDesc">{t('qrCustomDesc')}</span>
                  <span className={`qrxChip ${canCustom ? '' : 'isLock'}`}>
                    {busy === 'custom' ? '…' : canCustom ? t('qrIncluded') : (<><Glyph name="lock" /> {t('qrPlanBadge')}</>)}
                  </span>
                </button>
              </div>

              {notice && (
                <div className="qrxNotice" role="alert">
                  <span>{notice.text}</span>
                  <button type="button" className="qrxBtn isPrimary" onClick={() => goUpgrade(notice.action)}>
                    {notice.action === 'guest' ? t('qrSignInCta') : t('qrSeePlans')}
                  </button>
                </div>
              )}

              <p className="qrxNote">
                <Glyph name="info" />
                <span>
                  {t('qrQuotaNote')}
                  {user && usage && limits.dailyQr !== null
                    ? ` ${t('qrQuotaUsed', { used: usage.qr, limit: limits.dailyQr })}.`
                    : ''}
                </span>
              </p>
            </div>
          </>
        )}

        {step === 'standard' && (
          <>
            {renderHeader({ title: t('qrBasicTitle') })}
            <div className="qrxBasicBody">
              <div className="qrxPreviewFrame">
                {standard && <div className="qrxPreviewSvg" dangerouslySetInnerHTML={{ __html: standard.svg }} />}
              </div>
              <p className="qrxUrl" title={shortUrl}>{shortUrl}</p>
              <p className="qrxHint">{t('qrBasicHint')}</p>

              <div className="qrxActions">
                <button
                  type="button"
                  className="qrxBtn isPrimary"
                  disabled={!standard}
                  onClick={() =>
                    downloadQrPng(
                      { matrix: standard.qr.matrix, size: standard.qr.size, fgColor: '#000000', bgColor: '#ffffff', moduleShape: 'square', finderStyle: 'classic', margin: 4, centerImage: null },
                      `kisaltici-qr-${shortCode}.png`
                    )
                  }
                >
                  <Glyph name="download" />
                  <span>{t('qrExportPng')}</span>
                </button>
                <button
                  type="button"
                  className="qrxBtn"
                  disabled={!standard}
                  onClick={() => downloadQrSvg(standard.svg, `kisaltici-qr-${shortCode}.svg`)}
                >
                  <Glyph name="download" />
                  <span>{t('qrExportSvg')}</span>
                </button>
              </div>

              <button
                type="button"
                className="qrxUpsell"
                onClick={() => (canCustom ? setStep('custom') : goUpgrade(user ? 'plan' : 'guest'))}
              >
                <Glyph name="spark" />
                <span>
                  {t('qrWantCustom')} <strong>{t('qrCustomTitle')}</strong>
                </span>
                {!canCustom && <span className="qrxChip isLock"><Glyph name="lock" /> {t('qrPlanBadge')}</span>}
              </button>
            </div>
          </>
        )}

        {step === 'custom' && (
          <QrStudio
            shortCode={shortCode}
            shortUrl={shortUrl}
            initialSettings={initialSettings}
            onSettingsSaved={onSettingsSaved}
            header={renderHeader}
          />
        )}
      </div>
    </div>
  );
}

export default QrModal;
