import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  generateQrMatrix,
  generateQrSvgString,
  getContrastRatio,
} from '../utils/qrRenderer';
import { downloadQrPng, downloadQrSvg } from '../utils/qrExport';

const FG_PRESETS = ['#000000', '#1e293b', '#1e3a8a', '#065f46', '#881337', '#DEFF36'];
const BG_PRESETS = ['#ffffff', '#cfe8ff', '#ffd6e0', '#172033', '#183a2a', '#4a1824', 'transparent'];

const SHAPES = ['square', 'rounded', 'extra-rounded', 'dots', 'diamond'];
const FINDERS = ['classic', 'rounded', 'soft', 'compact', 'dot'];
const COMPLEXITY = [
  { id: 'ultra-minimal', tag: 'L', labelKey: 'qrComplexityUltraMinimal' },
  { id: 'minimal', tag: 'M', labelKey: 'qrComplexityMinimal' },
  { id: 'balanced', tag: 'Q', labelKey: 'qrComplexityBalanced' },
  { id: 'high', tag: 'H', labelKey: 'qrComplexityHigh' },
];
const QUIET = [
  { id: 'compact', labelKey: 'qrQuietZoneCompact' },
  { id: 'standard', labelKey: 'qrQuietZoneStandard' },
  { id: 'generous', labelKey: 'qrQuietZoneGenerous' },
];
const SHAPE_KEYS = {
  square: 'qrShapeSquare',
  rounded: 'qrShapeRounded',
  'extra-rounded': 'qrShapeExtraRounded',
  dots: 'qrShapeDots',
  diamond: 'qrShapeDiamond',
};
const FINDER_KEYS = {
  classic: 'qrFinderClassic',
  rounded: 'qrFinderRounded',
  soft: 'qrFinderSoft',
  compact: 'qrFinderCompact',
  dot: 'qrFinderDot',
};

const DEFAULT_SETTINGS = {
  complexity: 'minimal',
  fgColor: '#000000',
  bgColor: '#ffffff',
  moduleShape: 'square',
  finderStyle: 'classic',
  quietZone: 'standard',
  centerImage: null,
};

const normalizeFinder = (value) =>
  value === 'square' ? 'classic' : value === 'circle' ? 'dot' : value || 'classic';

/* ---------- small icons ---------- */
function ShapeIcon({ shape }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };
  const cells = [[2, 2], [13, 2], [2, 13], [13, 13]];
  if (shape === 'dots') {
    return <svg {...common}>{cells.map(([x, y]) => <circle key={`${x}${y}`} cx={x + 4.5} cy={y + 4.5} r="4.2" />)}</svg>;
  }
  if (shape === 'diamond') {
    return (
      <svg {...common}>
        {cells.map(([x, y]) => (
          <polygon key={`${x}${y}`} points={`${x + 4.5},${y} ${x + 9},${y + 4.5} ${x + 4.5},${y + 9} ${x},${y + 4.5}`} />
        ))}
      </svg>
    );
  }
  const rx = shape === 'rounded' ? 2.5 : shape === 'extra-rounded' ? 4.5 : 0;
  return <svg {...common}>{cells.map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="9" height="9" rx={rx} />)}</svg>;
}

function FinderIcon({ style }) {
  const common = { width: 26, height: 26, viewBox: '0 0 28 28', 'aria-hidden': true };
  if (style === 'dot') {
    return (
      <svg {...common} fill="none" stroke="currentColor">
        <circle cx="14" cy="14" r="10.5" strokeWidth="3" />
        <circle cx="14" cy="14" r="4.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  const r = style === 'rounded' ? 4 : style === 'soft' ? 8 : style === 'compact' ? 1.5 : 0;
  return (
    <svg {...common} fill="none" stroke="currentColor">
      <rect x="3" y="3" width="22" height="22" rx={r} strokeWidth="3" />
      <rect x="10" y="10" width="8" height="8" rx={Math.min(r, 3)} fill="currentColor" stroke="none" />
    </svg>
  );
}

const Icon = ({ name }) => {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'download') return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
  if (name === 'check') return <svg {...props} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
  if (name === 'alert') return <svg {...props}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
  if (name === 'upload') return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
  return null;
};

/* ---------- controls ---------- */
function ColorField({ label, value, presets, onChange, customLabel, transparentLabel }) {
  const isHex = typeof value === 'string' && value.startsWith('#');
  const isPreset = presets.includes(value);
  return (
    <div className="qrxField">
      <span className="qrxFieldLabel">{label}</span>
      <div className="qrxSwatches" role="radiogroup" aria-label={label}>
        {presets.map((hex) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={value === hex}
            aria-label={hex === 'transparent' ? transparentLabel : hex}
            title={hex === 'transparent' ? transparentLabel : hex}
            className={`qrxSwatch ${value === hex ? 'isOn' : ''} ${hex === 'transparent' ? 'isTransparent' : ''}`}
            style={hex === 'transparent' ? undefined : { '--sw': hex }}
            onClick={() => onChange(hex)}
          />
        ))}
        <label
          className={`qrxSwatch qrxSwatchCustom ${isHex && !isPreset ? 'isOn' : ''}`}
          style={isHex && !isPreset ? { '--sw': value } : undefined}
          title={customLabel}
        >
          <input
            type="color"
            value={isHex ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            aria-label={customLabel}
          />
        </label>
      </div>
    </div>
  );
}

function Tiles({ label, options, value, onChange, renderIcon, getLabel }) {
  return (
    <div className="qrxField">
      <span className="qrxFieldLabel">{label}</span>
      <div className="qrxTiles" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            className={`qrxTile ${value === option ? 'isOn' : ''}`}
            onClick={() => onChange(option)}
          >
            {renderIcon(option)}
            <span>{getLabel(option)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="qrxField">
      <span className="qrxFieldLabel">{label}</span>
      <div className="qrxSegmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            className={`qrxSegment ${value === option.id ? 'isOn' : ''}`}
            onClick={() => onChange(option.id)}
          >
            <span>{option.label}</span>
            {option.tag && <em>{option.tag}</em>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Range({ label, value, min, max, unit, onChange }) {
  return (
    <label className="qrxRange">
      <span className="qrxRangeHead">
        <span>{label}</span>
        <span className="qrxRangeValue">{value}{unit}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/**
 * Custom QR designer (Starter and above). Entering this screen has already counted against the
 * daily QR allowance (done by QrModal), so exporting here costs nothing extra.
 */
function QrStudio({ shortCode, shortUrl, initialSettings, onSettingsSaved, header }) {
  const { t } = useTranslation();
  const { user, getIdToken } = useAuth();

  const getEffectiveSettings = useCallback(() => {
    if (initialSettings && initialSettings.fgColor) return initialSettings;
    try {
      const stored = localStorage.getItem(`qrCustomization:${shortCode}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load local QR settings:', e);
    }
    return DEFAULT_SETTINGS;
  }, [initialSettings, shortCode]);

  const initial = useMemo(() => getEffectiveSettings(), [getEffectiveSettings]);

  const [complexity, setComplexity] = useState(initial.complexity || 'minimal');
  const [fgColor, setFgColor] = useState(initial.fgColor || '#000000');
  const [bgColor, setBgColor] = useState(initial.bgColor !== undefined ? initial.bgColor : '#ffffff');
  const [moduleShape, setModuleShape] = useState(initial.moduleShape || 'square');
  const [finderStyle, setFinderStyle] = useState(normalizeFinder(initial.finderStyle));
  const [quietZone, setQuietZone] = useState(initial.quietZone || 'standard');
  const [centerImage, setCenterImage] = useState(initial.centerImage || null);
  const [saveStatus, setSaveStatus] = useState('');
  const [imageError, setImageError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Skip the auto-save for the values we just loaded
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const persistSettings = useCallback(
    async (settingsObj) => {
      try {
        localStorage.setItem(`qrCustomization:${shortCode}`, JSON.stringify(settingsObj));
      } catch (e) {
        console.error('Failed to write QR settings to localStorage:', e);
      }

      if (user && shortCode) {
        try {
          setSaveStatus('saving');
          const token = await getIdToken();
          const res = await fetch(`${API_BASE_URL}/api/urls/${shortCode}/qr`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(settingsObj),
          });
          if (res.ok) {
            setSaveStatus('saved');
            if (onSettingsSaved) onSettingsSaved(shortCode, settingsObj);
          } else {
            setSaveStatus('');
          }
        } catch (err) {
          console.error('Failed to persist QR settings to backend:', err);
          setSaveStatus('');
        }
      } else {
        setSaveStatus('saved');
        if (onSettingsSaved) onSettingsSaved(shortCode, settingsObj);
      }
      setTimeout(() => setSaveStatus((prev) => (prev === 'saved' ? '' : prev)), 2000);
    },
    [user, shortCode, getIdToken, onSettingsSaved]
  );

  useEffect(() => {
    if (isInitialMount.current) return undefined;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const config = {
      complexity,
      preset: 'custom',
      level: complexity === 'high' ? 'H' : complexity === 'balanced' ? 'Q' : complexity === 'minimal' ? 'M' : 'L',
      fgColor,
      bgColor,
      moduleShape,
      finderStyle,
      quietZone,
      centerImage,
    };
    saveTimeoutRef.current = setTimeout(() => persistSettings(config), 450);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [complexity, fgColor, bgColor, moduleShape, finderStyle, quietZone, centerImage, persistSettings]);

  const marginSize = quietZone === 'compact' ? 2 : quietZone === 'generous' ? 6 : 4;

  const qrData = useMemo(() => {
    if (!shortUrl) return null;
    try {
      return generateQrMatrix(shortUrl, complexity, Boolean(centerImage && centerImage.src));
    } catch (e) {
      console.error('Error generating QR matrix:', e);
      return null;
    }
  }, [shortUrl, complexity, centerImage]);

  const svgString = useMemo(() => {
    if (!qrData) return '';
    return generateQrSvgString({
      matrix: qrData.matrix,
      size: qrData.size,
      fgColor,
      bgColor,
      moduleShape,
      finderStyle,
      margin: marginSize,
      centerImage,
    });
  }, [qrData, fgColor, bgColor, moduleShape, finderStyle, marginSize, centerImage]);

  const isLowContrast = getContrastRatio(fgColor, bgColor) < 3.0;

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError(t('errorInvalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError(t('qrUploadSubtitle'));
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setCenterImage({
        src: event.target.result,
        sizePercent: centerImage?.sizePercent || 20,
        radius: centerImage?.radius !== undefined ? centerImage.radius : 20,
        padding: centerImage?.padding !== undefined ? centerImage.padding : 4,
        bgColor: centerImage?.bgColor || (bgColor === 'transparent' ? '#ffffff' : bgColor),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPng = () => {
    if (!qrData) return;
    downloadQrPng(
      { matrix: qrData.matrix, size: qrData.size, fgColor, bgColor, moduleShape, finderStyle, margin: marginSize, centerImage },
      `kisaltici-qr-${shortCode}.png`
    );
  };

  const handleDownloadSvg = () => {
    if (svgString) downloadQrSvg(svgString, `kisaltici-qr-${shortCode}.svg`);
  };

  return (
    <>
      {header({
        title: t('qrCustomHeading'),
        extra:
          saveStatus === 'saving' ? (
            <span className="qrxSaveTag">{t('qrSaving')}</span>
          ) : saveStatus === 'saved' ? (
            <span className="qrxSaveTag isSaved"><Icon name="check" /> {t('qrSaved')}</span>
          ) : null,
      })}

      <div className="qrxStudioBody">
        {/* Preview stage */}
        <section className="qrxStage" aria-label={t('qrLivePreview')}>
          <span className="qrxStageLabel">{t('qrLivePreview')}</span>
          <div className={`qrxPreviewFrame ${bgColor === 'transparent' ? 'isTransparent' : ''}`}>
            <div className="qrxPreviewSvg" dangerouslySetInnerHTML={{ __html: svgString }} />
          </div>

          <div className={`qrxScan ${isLowContrast ? 'isRisk' : 'isGood'}`} role="status">
            <Icon name={isLowContrast ? 'alert' : 'check'} />
            <span>{isLowContrast ? t('qrContrastWarning') : t('qrScanGood')}</span>
          </div>

          <p className="qrxUrl" title={shortUrl}>{shortUrl}</p>

          <div className="qrxActions">
            <button type="button" className="qrxBtn isPrimary" onClick={handleDownloadPng} disabled={!qrData}>
              <Icon name="download" />
              <span>{t('qrExportPng')}</span>
            </button>
            <button type="button" className="qrxBtn" onClick={handleDownloadSvg} disabled={!svgString}>
              <Icon name="download" />
              <span>{t('qrExportSvg')}</span>
            </button>
          </div>
        </section>

        {/* Controls */}
        <section className="qrxPanel">
          <div className="qrxGroup">
            <h3 className="qrxGroupTitle">{t('qrSectionColors')}</h3>
            <ColorField
              label={t('qrForegroundColor')}
              value={fgColor}
              presets={FG_PRESETS}
              onChange={setFgColor}
              customLabel={t('qrCustomColor')}
              transparentLabel={t('qrTransparent')}
            />
            <ColorField
              label={t('qrBackgroundColor')}
              value={bgColor}
              presets={BG_PRESETS}
              onChange={setBgColor}
              customLabel={t('qrCustomColor')}
              transparentLabel={t('qrTransparent')}
            />
          </div>

          <div className="qrxGroup">
            <h3 className="qrxGroupTitle">{t('qrSectionPattern')}</h3>
            <Tiles
              label={t('qrModuleShape')}
              options={SHAPES}
              value={moduleShape}
              onChange={setModuleShape}
              renderIcon={(shape) => <ShapeIcon shape={shape} />}
              getLabel={(shape) => t(SHAPE_KEYS[shape])}
            />
            <Tiles
              label={t('qrFinderStyle')}
              options={FINDERS}
              value={finderStyle}
              onChange={setFinderStyle}
              renderIcon={(style) => <FinderIcon style={style} />}
              getLabel={(style) => t(FINDER_KEYS[style])}
            />
          </div>

          <div className="qrxGroup">
            <h3 className="qrxGroupTitle">{t('qrSectionLogo')}</h3>
            {centerImage ? (
              <div className="qrxLogoCard">
                <div className="qrxLogoRow">
                  <img src={centerImage.src} alt="" className="qrxLogoThumb" />
                  <div className="qrxLogoActions">
                    <button type="button" className="qrxLink" onClick={() => fileInputRef.current?.click()}>{t('qrChangeImage')}</button>
                    <button type="button" className="qrxLink isDanger" onClick={() => setCenterImage(null)}>{t('qrRemoveImage')}</button>
                  </div>
                </div>
                <Range label={t('qrImageSize')} value={centerImage.sizePercent} min={10} max={30} unit="%" onChange={(v) => setCenterImage({ ...centerImage, sizePercent: v })} />
                <Range label={t('qrImageRadius')} value={centerImage.radius} min={0} max={50} unit="%" onChange={(v) => setCenterImage({ ...centerImage, radius: v })} />
                <Range label={t('qrImagePadding')} value={centerImage.padding} min={0} max={12} unit="" onChange={(v) => setCenterImage({ ...centerImage, padding: v })} />
                <p className="qrxHint">{t('qrCenterImageNote')}</p>
              </div>
            ) : (
              <button
                type="button"
                className={`qrxDrop ${isDragOver ? 'isOver' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  processFile(e.dataTransfer.files && e.dataTransfer.files[0]);
                }}
              >
                <Icon name="upload" />
                <span className="qrxDropTitle">{t('qrUploadPlaceholder')}</span>
                <span className="qrxDropSub">{t('qrUploadSubtitle')}</span>
              </button>
            )}
            {imageError && <p className="qrxError" role="alert">{imageError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                processFile(e.target.files && e.target.files[0]);
                e.target.value = null;
              }}
            />
          </div>

          <div className="qrxGroup">
            <h3 className="qrxGroupTitle">{t('qrSectionReadability')}</h3>
            <Segmented
              label={t('qrComplexityTitle')}
              options={COMPLEXITY.map((c) => ({ id: c.id, label: t(c.labelKey), tag: c.tag }))}
              value={complexity}
              onChange={setComplexity}
            />
            <Segmented
              label={t('qrQuietZone')}
              options={QUIET.map((q) => ({ id: q.id, label: t(q.labelKey) }))}
              value={quietZone}
              onChange={setQuietZone}
            />
            <p className="qrxHint">{t('qrQuietZoneHint')}</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default QrStudio;
