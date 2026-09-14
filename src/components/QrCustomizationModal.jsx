import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  generateQrMatrix,
  generateQrSvgString,
  drawQrToCanvas,
  getContrastRatio,
} from '../utils/qrRenderer';
import './QrCustomizationModal.css';

// Curated brand & modern color palettes matching prompt specification
const FG_PRESET_COLORS = [
  { label: 'Black', hex: '#000000' },
  { label: 'Dark Gray', hex: '#1e293b' },
  { label: 'Navy', hex: '#1e3a8a' },
  { label: 'Deep Green', hex: '#065f46' },
  { label: 'Burgundy', hex: '#881337' },
  { label: 'Kısaltıcı Lime', hex: '#DEFF36' },
];

const BG_PRESET_COLORS = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Light Blue', hex: '#cfe8ff' },
  { label: 'Light Pink', hex: '#ffd6e0' },
  { label: 'Dark Navy', hex: '#172033' },
  { label: 'Dark Green', hex: '#183a2a' },
  { label: 'Burgundy', hex: '#4a1824' },
  { label: 'Transparent', hex: 'transparent' },
];

const DEFAULT_SETTINGS = {
  complexity: 'minimal',
  preset: 'custom',
  level: 'M',
  fgColor: '#000000',
  bgColor: '#ffffff',
  moduleShape: 'square',
  finderStyle: 'classic',
  quietZone: 'standard', // 4
  centerImage: null,
};

function QrCustomizationModal({
  isOpen,
  onClose,
  shortCode,
  shortUrl,
  initialSettings = null,
  onSettingsSaved = null,
}) {
  const { t } = useTranslation();
  const { user, getIdToken } = useAuth();

  const getEffectiveSettings = useCallback(() => {
    if (initialSettings && initialSettings.fgColor) {
      return initialSettings;
    }
    try {
      const stored = localStorage.getItem(`qrCustomization:${shortCode}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load local QR settings:', e);
    }
    return DEFAULT_SETTINGS;
  }, [initialSettings, shortCode]);

  // Settings States
  const [complexity, setComplexity] = useState(() => getEffectiveSettings().complexity || 'minimal');
  const [fgColor, setFgColor] = useState(() => getEffectiveSettings().fgColor || '#000000');
  const [bgColor, setBgColor] = useState(() => {
    const s = getEffectiveSettings();
    return s.bgColor !== undefined ? s.bgColor : '#ffffff';
  });
  const [moduleShape, setModuleShape] = useState(() => getEffectiveSettings().moduleShape || 'square');
  const [finderStyle, setFinderStyle] = useState(() => {
    const fs = getEffectiveSettings().finderStyle;
    return fs === 'square' ? 'classic' : fs === 'circle' ? 'dot' : fs || 'classic';
  });
  const [quietZone, setQuietZone] = useState(() => getEffectiveSettings().quietZone || 'standard');
  const [centerImage, setCenterImage] = useState(() => getEffectiveSettings().centerImage || null);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', ''
  const [isDragOver, setIsDragOver] = useState(false);

  // References
  const exportCanvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const fileInputRef = useRef(null);
  const fgColorInputRef = useRef(null);
  const bgColorInputRef = useRef(null);

  // Sync settings when shortCode changes
  const prevCodeRef = useRef(shortCode);
  useEffect(() => {
    if (prevCodeRef.current !== shortCode) {
      prevCodeRef.current = shortCode;
      const s = getEffectiveSettings();
      isInitialMount.current = true;
      setComplexity(s.complexity || 'minimal');
      setFgColor(s.fgColor || '#000000');
      setBgColor(s.bgColor !== undefined ? s.bgColor : '#ffffff');
      setModuleShape(s.moduleShape || 'square');
      const fs = s.finderStyle;
      setFinderStyle(fs === 'square' ? 'classic' : fs === 'circle' ? 'dot' : fs || 'classic');
      setQuietZone(s.quietZone || 'standard');
      setCenterImage(s.centerImage || null);
      setSaveStatus('');
      setTimeout(() => {
        isInitialMount.current = false;
      }, 50);
    }
  }, [shortCode, getEffectiveSettings]);

  // Persist settings (Debounced to avoid excessive API requests)
  const persistSettings = useCallback(
    async (settingsObj) => {
      // 1. Always save in localStorage keyed by shortCode
      try {
        localStorage.setItem(
          `qrCustomization:${shortCode}`,
          JSON.stringify(settingsObj)
        );
      } catch (e) {
        console.error('Failed to write QR settings to localStorage:', e);
      }

      // 2. If user is authenticated, persist to MongoDB backend
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
            if (onSettingsSaved) {
              onSettingsSaved(shortCode, settingsObj);
            }
          } else {
            setSaveStatus('');
          }
        } catch (err) {
          console.error('Failed to persist QR settings to backend:', err);
          setSaveStatus('');
        }
      } else {
        // Guest mode
        setSaveStatus('saved');
        if (onSettingsSaved) {
          onSettingsSaved(shortCode, settingsObj);
        }
      }

      // Clear 'saved' indicator after 2s
      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'saved' ? '' : prev));
      }, 2000);
    },
    [user, shortCode, getIdToken, onSettingsSaved]
  );

  // Auto-save on customization change (debounced 450ms)
  useEffect(() => {
    if (!isOpen || isInitialMount.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const currentConfig = {
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

    saveTimeoutRef.current = setTimeout(() => {
      persistSettings(currentConfig);
    }, 450);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    complexity,
    fgColor,
    bgColor,
    moduleShape,
    finderStyle,
    quietZone,
    centerImage,
    isOpen,
    persistSettings,
  ]);

  // Margin size in grid cells
  const marginSize = useMemo(() => {
    if (quietZone === 'compact') return 2;
    if (quietZone === 'generous') return 6;
    return 4; // standard
  }, [quietZone]);

  // Compute QR Matrix in real time with center image safety check
  const qrData = useMemo(() => {
    if (!shortUrl) return null;
    try {
      const hasLogo = Boolean(centerImage && centerImage.src);
      return generateQrMatrix(shortUrl, complexity, hasLogo);
    } catch (e) {
      console.error('Error generating QR matrix:', e);
      return null;
    }
  }, [shortUrl, complexity, centerImage]);

  // Generate Vector SVG string
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

  // Contrast ratio check
  const contrastRatio = useMemo(() => {
    return getContrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);
  const isLowContrast = contrastRatio < 3.0;

  // Image Upload helper
  const processUploadedFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Görsel boyutu 5MB limitini aşıyor.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCenterImage({
        src: dataUrl,
        sizePercent: centerImage?.sizePercent || 20,
        radius: centerImage?.radius !== undefined ? centerImage.radius : 20,
        padding: centerImage?.padding !== undefined ? centerImage.padding : 4,
        bgColor: centerImage?.bgColor || (bgColor === 'transparent' ? '#ffffff' : bgColor),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    processUploadedFile(file);
    e.target.value = null; // reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    processUploadedFile(file);
  };

  const handleRemoveImage = () => {
    setCenterImage(null);
  };

  // Handle PNG Download
  const handleDownloadPng = () => {
    if (!qrData) return;
    try {
      const canvas = exportCanvasRef.current || document.createElement('canvas');
      drawQrToCanvas(
        canvas,
        {
          matrix: qrData.matrix,
          size: qrData.size,
          fgColor,
          bgColor,
          moduleShape,
          finderStyle,
          canvasSize: 1024,
          margin: marginSize,
          centerImage,
        },
        () => {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `kisaltici-qr-${shortCode}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      );
    } catch (e) {
      console.error('PNG download error:', e);
    }
  };

  // Handle SVG Download
  const handleDownloadSvg = () => {
    if (!svgString) return;
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `kisaltici-qr-${shortCode}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('SVG download error:', e);
    }
  };

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="qrModalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrModalTitle"
    >
      <div className="qrModalContainer">
        {/* Modal Header */}
        <header className="qrModalHeader">
          <div className="qrModalTitleGroup">
            <div className="qrModalIcon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3v1h-3z" />
              </svg>
            </div>
            <h2 id="qrModalTitle" className="qrModalTitle">
              {t('qrCustomizationTitle')}
            </h2>
            {saveStatus === 'saving' && (
              <span className="qrSaveStatusTag">{t('qrSaving')}</span>
            )}
            {saveStatus === 'saved' && (
              <span className="qrSaveStatusTag saved">✓ {t('qrSaved')}</span>
            )}
          </div>

          <button
            type="button"
            className="qrModalCloseBtn"
            onClick={onClose}
            aria-label={t('closeModal')}
            title={t('closeModal')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Modal Body Layout: Desktop 2-Columns */}
        <div className="qrModalBody">
          {/* Left Column: Organized Customization Controls */}
          <section className="qrControlsPane">
            {/* 1. QR Section: Detail level */}
            <div className="qrControlSection">
              <div className="qrControlHeader">
                <h3 className="qrControlTitle">
                  <span className="qrSectionNumber">1</span>
                  <span>{t('qrTabQr')}: {t('qrComplexityTitle')}</span>
                </h3>
              </div>
              <div className="qrComplexityGrid">
                {/* Ultra Minimal */}
                <button
                  type="button"
                  className={`qrOptionCard ${complexity === 'ultra-minimal' ? 'selected' : ''}`}
                  onClick={() => setComplexity('ultra-minimal')}
                >
                  <div className="qrOptionCardTop">
                    <span className="qrOptionCardName">{t('qrComplexityUltraMinimal')}</span>
                    <span className="qrOptionCardTag">L (%7)</span>
                  </div>
                  <span className="qrOptionCardDesc">{t('qrComplexityUltraMinimalDesc')}</span>
                </button>

                {/* Minimal */}
                <button
                  type="button"
                  className={`qrOptionCard ${complexity === 'minimal' ? 'selected' : ''}`}
                  onClick={() => setComplexity('minimal')}
                >
                  <div className="qrOptionCardTop">
                    <span className="qrOptionCardName">{t('qrComplexityMinimal')}</span>
                    <span className="qrOptionCardTag">M (%15)</span>
                  </div>
                  <span className="qrOptionCardDesc">{t('qrComplexityMinimalDesc')}</span>
                </button>

                {/* Balanced */}
                <button
                  type="button"
                  className={`qrOptionCard ${complexity === 'balanced' ? 'selected' : ''}`}
                  onClick={() => setComplexity('balanced')}
                >
                  <div className="qrOptionCardTop">
                    <span className="qrOptionCardName">{t('qrComplexityBalanced')}</span>
                    <span className="qrOptionCardTag">Q (%25)</span>
                  </div>
                  <span className="qrOptionCardDesc">{t('qrComplexityBalancedDesc')}</span>
                </button>

                {/* High Reliability */}
                <button
                  type="button"
                  className={`qrOptionCard ${complexity === 'high' ? 'selected' : ''}`}
                  onClick={() => setComplexity('high')}
                >
                  <div className="qrOptionCardTop">
                    <span className="qrOptionCardName">{t('qrComplexityHigh')}</span>
                    <span className="qrOptionCardTag">H (%30)</span>
                  </div>
                  <span className="qrOptionCardDesc">{t('qrComplexityHighDesc')}</span>
                </button>
              </div>
              <p className="qrHelpHintText">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{t('qrComplexityHint')}</span>
              </p>
            </div>

            {/* 2. Stil: Module Shapes, Finder Styles & Quiet Zone */}
            <div className="qrControlSection">
              <div className="qrControlHeader">
                <h3 className="qrControlTitle">
                  <span className="qrSectionNumber">2</span>
                  <span>{t('qrTabStyle')}</span>
                </h3>
              </div>

              {/* Module Shape (5 Options) */}
              <div>
                <span className="qrFieldSubLabel">{t('qrModuleShape')}</span>
                <div className="qrShapesRow">
                  <button
                    type="button"
                    className={`qrShapeCard ${moduleShape === 'square' ? 'selected' : ''}`}
                    onClick={() => setModuleShape('square')}
                    title={t('qrShapeSquare')}
                  >
                    <div className="qrShapeIconBox">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" />
                        <rect x="13" y="2" width="9" height="9" />
                        <rect x="2" y="13" width="9" height="9" />
                        <rect x="13" y="13" width="9" height="9" />
                      </svg>
                    </div>
                    <span className="qrShapeTitle">{t('qrShapeSquare')}</span>
                  </button>

                  <button
                    type="button"
                    className={`qrShapeCard ${moduleShape === 'rounded' ? 'selected' : ''}`}
                    onClick={() => setModuleShape('rounded')}
                    title={t('qrShapeRounded')}
                  >
                    <div className="qrShapeIconBox">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" rx="2.5" />
                        <rect x="13" y="2" width="9" height="9" rx="2.5" />
                        <rect x="2" y="13" width="9" height="9" rx="2.5" />
                        <rect x="13" y="13" width="9" height="9" rx="2.5" />
                      </svg>
                    </div>
                    <span className="qrShapeTitle">{t('qrShapeRounded')}</span>
                  </button>

                  <button
                    type="button"
                    className={`qrShapeCard ${moduleShape === 'extra-rounded' ? 'selected' : ''}`}
                    onClick={() => setModuleShape('extra-rounded')}
                    title={t('qrShapeExtraRounded')}
                  >
                    <div className="qrShapeIconBox">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" rx="4.5" />
                        <rect x="13" y="2" width="9" height="9" rx="4.5" />
                        <rect x="2" y="13" width="9" height="9" rx="4.5" />
                        <rect x="13" y="13" width="9" height="9" rx="4.5" />
                      </svg>
                    </div>
                    <span className="qrShapeTitle">{t('qrShapeExtraRounded')}</span>
                  </button>

                  <button
                    type="button"
                    className={`qrShapeCard ${moduleShape === 'dots' ? 'selected' : ''}`}
                    onClick={() => setModuleShape('dots')}
                    title={t('qrShapeDots')}
                  >
                    <div className="qrShapeIconBox">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="6.5" cy="6.5" r="4.2" />
                        <circle cx="17.5" cy="6.5" r="4.2" />
                        <circle cx="6.5" cy="17.5" r="4.2" />
                        <circle cx="17.5" cy="17.5" r="4.2" />
                      </svg>
                    </div>
                    <span className="qrShapeTitle">{t('qrShapeDots')}</span>
                  </button>

                  <button
                    type="button"
                    className={`qrShapeCard ${moduleShape === 'diamond' ? 'selected' : ''}`}
                    onClick={() => setModuleShape('diamond')}
                    title={t('qrShapeDiamond')}
                  >
                    <div className="qrShapeIconBox">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6.5,2 11,6.5 6.5,11 2,6.5" />
                        <polygon points="17.5,2 22,6.5 17.5,11 13,6.5" />
                        <polygon points="6.5,13 11,17.5 6.5,22 2,17.5" />
                        <polygon points="17.5,13 22,17.5 17.5,22 13,17.5" />
                      </svg>
                    </div>
                    <span className="qrShapeTitle">{t('qrShapeDiamond')}</span>
                  </button>
                </div>
              </div>

              {/* Sub-styles: Finder Pattern Styles & Quiet Zone */}
              <div className="qrSubStyleRow">
                <div>
                  <span className="qrFieldSubLabel">{t('qrFinderStyle')}</span>
                  <div className="qrFinderPillsSelector">
                    <button
                      type="button"
                      className={`qrPillBtn ${finderStyle === 'classic' ? 'selected' : ''}`}
                      onClick={() => setFinderStyle('classic')}
                    >
                      {t('qrFinderClassic')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${finderStyle === 'rounded' ? 'selected' : ''}`}
                      onClick={() => setFinderStyle('rounded')}
                    >
                      {t('qrFinderRounded')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${finderStyle === 'soft' ? 'selected' : ''}`}
                      onClick={() => setFinderStyle('soft')}
                    >
                      {t('qrFinderSoft')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${finderStyle === 'compact' ? 'selected' : ''}`}
                      onClick={() => setFinderStyle('compact')}
                    >
                      {t('qrFinderCompact')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${finderStyle === 'dot' ? 'selected' : ''}`}
                      onClick={() => setFinderStyle('dot')}
                    >
                      {t('qrFinderDot')}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="qrFieldSubLabel">{t('qrQuietZone')}</span>
                  <div className="qrPillsSelector">
                    <button
                      type="button"
                      className={`qrPillBtn ${quietZone === 'compact' ? 'selected' : ''}`}
                      onClick={() => setQuietZone('compact')}
                      title={t('qrQuietZoneHint')}
                    >
                      {t('qrQuietZoneCompact')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${quietZone === 'standard' ? 'selected' : ''}`}
                      onClick={() => setQuietZone('standard')}
                      title={t('qrQuietZoneHint')}
                    >
                      {t('qrQuietZoneStandard')}
                    </button>
                    <button
                      type="button"
                      className={`qrPillBtn ${quietZone === 'generous' ? 'selected' : ''}`}
                      onClick={() => setQuietZone('generous')}
                      title={t('qrQuietZoneHint')}
                    >
                      {t('qrQuietZoneGenerous')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Renk: Foreground & Background Color Controls */}
            <div className="qrControlSection">
              <div className="qrControlHeader">
                <h3 className="qrControlTitle">
                  <span className="qrSectionNumber">3</span>
                  <span>{t('qrTabColor')}</span>
                </h3>
              </div>

              <div className="qrColorsContainer">
                {/* Foreground Color Card */}
                <div className="qrColorPickerCard">
                  <div className="qrColorPickerHeader">
                    <span className="qrColorPickerLabel">{t('qrForegroundColor')}</span>
                    <span className="qrColorValueTag">{fgColor.toUpperCase()}</span>
                  </div>

                  <div className="qrColorInteractiveRow">
                    <div
                      className="qrColorPreviewThumb"
                      style={{ backgroundColor: fgColor }}
                      onClick={() => fgColorInputRef.current?.click()}
                      title="Özel renk seç"
                      role="button"
                      tabIndex={0}
                    >
                      <svg
                        className="qrColorPipetteIcon"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <input
                        ref={fgColorInputRef}
                        type="color"
                        className="qrNativeColorInput"
                        value={fgColor.startsWith('#') ? fgColor : '#000000'}
                        onChange={(e) => setFgColor(e.target.value)}
                      />
                    </div>

                    <div className="qrHexInputWrapper">
                      <span className="qrHexHash">#</span>
                      <input
                        type="text"
                        className="qrHexTextInput"
                        value={fgColor.startsWith('#') ? fgColor.slice(1) : fgColor}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          setFgColor(val ? `#${val}` : '#');
                        }}
                        maxLength={6}
                        placeholder="000000"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="qrSwatchesList">
                    {FG_PRESET_COLORS.map((presetItem) => (
                      <button
                        key={presetItem.hex}
                        type="button"
                        className={`qrSwatchItem ${fgColor.toLowerCase() === presetItem.hex.toLowerCase() ? 'active' : ''}`}
                        style={{ backgroundColor: presetItem.hex }}
                        onClick={() => setFgColor(presetItem.hex)}
                        title={presetItem.label}
                        aria-label={presetItem.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Background Color Card */}
                <div className="qrColorPickerCard">
                  <div className="qrColorPickerHeader">
                    <span className="qrColorPickerLabel">{t('qrBackgroundColor')}</span>
                    <span className="qrColorValueTag">
                      {bgColor === 'transparent' ? 'SAYDAM' : bgColor.toUpperCase()}
                    </span>
                  </div>

                  <div className="qrColorInteractiveRow">
                    <div
                      className={`qrColorPreviewThumb ${bgColor === 'transparent' ? 'transparentThumb' : ''}`}
                      style={{
                        backgroundColor: bgColor === 'transparent' ? undefined : bgColor,
                      }}
                      onClick={() => bgColorInputRef.current?.click()}
                      title="Özel renk seç"
                      role="button"
                      tabIndex={0}
                    >
                      <svg
                        className="qrColorPipetteIcon"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <input
                        ref={bgColorInputRef}
                        type="color"
                        className="qrNativeColorInput"
                        value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                    </div>

                    <div className="qrHexInputWrapper">
                      <span className="qrHexHash">{bgColor === 'transparent' ? '' : '#'}</span>
                      <input
                        type="text"
                        className="qrHexTextInput"
                        value={
                          bgColor === 'transparent'
                            ? 'Saydam'
                            : bgColor.startsWith('#')
                            ? bgColor.slice(1)
                            : bgColor
                        }
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          setBgColor(val ? `#${val}` : '#');
                        }}
                        maxLength={6}
                        placeholder="FFFFFF"
                        spellCheck={false}
                        disabled={bgColor === 'transparent'}
                      />
                    </div>
                  </div>

                  <div className="qrSwatchesList">
                    {BG_PRESET_COLORS.map((presetItem) => (
                      <button
                        key={presetItem.hex}
                        type="button"
                        className={`qrSwatchItem ${presetItem.hex === 'transparent' ? 'transparentItem' : ''} ${bgColor.toLowerCase() === presetItem.hex.toLowerCase() ? 'active' : ''}`}
                        style={{
                          backgroundColor:
                            presetItem.hex === 'transparent' ? undefined : presetItem.hex,
                        }}
                        onClick={() => setBgColor(presetItem.hex)}
                        title={presetItem.label}
                        aria-label={presetItem.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Low Contrast Warning */}
              {isLowContrast && (
                <div className="qrContrastAlert" role="alert">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{t('qrContrastWarning')}</span>
                </div>
              )}
            </div>

            {/* 4. Görsel: Center Image / Logo */}
            <div className="qrControlSection">
              <div className="qrControlHeader">
                <h3 className="qrControlTitle">
                  <span className="qrSectionNumber">4</span>
                  <span>{t('qrTabImage')}: {t('qrCenterImageTitle')}</span>
                </h3>
              </div>

              <div className="qrCenterImageCard">
                {!centerImage?.src ? (
                  /* Modern neutral upload drop zone */
                  <div
                    className={`qrUploadDropZone ${isDragOver ? 'dragActive' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="qrUploadIconCircle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="qrUploadDropText">
                      <span className="qrUploadPrimaryLabel">{t('qrUploadPlaceholder')}</span>
                      <span className="qrUploadSecondaryLabel">{t('qrUploadSubtitle')}</span>
                    </div>
                  </div>
                ) : (
                  /* Active image preview & controls */
                  <div className="qrActiveImageContainer">
                    <div className="qrActiveImageRow">
                      <img
                        src={centerImage.src}
                        alt="Merkez logo önizleme"
                        className="qrLogoPreviewThumb"
                      />
                      <div className="qrActiveImageActions">
                        <button
                          type="button"
                          className="qrImageActionBtn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>{t('qrChangeImage')}</span>
                        </button>
                        <button
                          type="button"
                          className="qrImageActionBtn remove"
                          onClick={handleRemoveImage}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>{t('qrRemoveImage')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Adjustment Sliders */}
                    <div className="qrSliderGroup">
                      {/* Size Slider */}
                      <div className="qrSliderRow">
                        <label>{t('qrImageSize')}</label>
                        <input
                          type="range"
                          className="qrRangeInput"
                          min="14"
                          max="24"
                          value={centerImage.sizePercent || 20}
                          onChange={(e) =>
                            setCenterImage((prev) => ({
                              ...prev,
                              sizePercent: Number(e.target.value),
                            }))
                          }
                        />
                        <span>{centerImage.sizePercent || 20}%</span>
                      </div>

                      {/* Corner Radius Slider */}
                      <div className="qrSliderRow">
                        <label>{t('qrImageRadius')}</label>
                        <input
                          type="range"
                          className="qrRangeInput"
                          min="0"
                          max="50"
                          value={centerImage.radius !== undefined ? centerImage.radius : 20}
                          onChange={(e) =>
                            setCenterImage((prev) => ({
                              ...prev,
                              radius: Number(e.target.value),
                            }))
                          }
                        />
                        <span>{centerImage.radius !== undefined ? centerImage.radius : 20}%</span>
                      </div>

                      {/* Padding Slider */}
                      <div className="qrSliderRow">
                        <label>{t('qrImagePadding')}</label>
                        <input
                          type="range"
                          className="qrRangeInput"
                          min="0"
                          max="8"
                          value={centerImage.padding !== undefined ? centerImage.padding : 4}
                          onChange={(e) =>
                            setCenterImage((prev) => ({
                              ...prev,
                              padding: Number(e.target.value),
                            }))
                          }
                        />
                        <span>{centerImage.padding !== undefined ? centerImage.padding : 4}px</span>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />

                <p className="qrImageNote">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>{t('qrCenterImageNote')}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Live Preview & Features */}
          <section className="qrPreviewPane">
            <div className="qrPreviewHeader">
              <span className="qrPreviewLabel">Önizleme</span>
            </div>

            <div className="qrPreviewCardWrapper">
              <div
                className={`qrPreviewFrame ${bgColor === 'transparent' ? 'transparentBg' : ''}`}
                style={{
                  backgroundColor: bgColor === 'transparent' ? undefined : bgColor,
                }}
              >
                <div
                  className="qrSvgContainer"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              </div>
              <span className="qrPreviewUrlText" title={shortUrl}>
                {shortUrl}
              </span>
            </div>

            {/* User-Friendly "QR'ın özellikleri" Card */}
            {qrData && (
              <div className="qrFeaturesCard">
                <div className="qrFeaturesCardHeader">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <path d="M14 14h7v7h-7z" />
                  </svg>
                  <span>{t('qrInfoFeaturesTitle')}</span>
                </div>

                <div className="qrFeaturesGrid">
                  <div className="qrFeatureItem">
                    <span className="qrFeatureItemLabel">{t('qrInfoSize')}</span>
                    <span className="qrFeatureItemVal">{qrData.moduleCount}</span>
                  </div>

                  <div className="qrFeatureItem">
                    <span className="qrFeatureItemLabel">{t('qrInfoDetailLevel')}</span>
                    <span className="qrFeatureItemVal">{qrData.densityLabel}</span>
                  </div>

                  <div className="qrFeatureItem">
                    <span className="qrFeatureItemLabel">{t('qrInfoScanSafety')}</span>
                    <span className="qrFeatureItemVal">{qrData.scanReliability}</span>
                  </div>

                  <div className="qrFeatureItem">
                    <span className="qrFeatureItemLabel">{t('qrInfoContent')}</span>
                    <span className="qrFeatureItemVal truncate">{t('qrInfoContentValue')}</span>
                  </div>
                </div>

                <div className="qrFeaturesSubtleFooter">
                  <span>{t('qrInfoVersionSubtle').replace('{version}', qrData.version)}</span>
                  <span>·</span>
                  <span>Hata toleransı: {qrData.errorCorrectionLevel}</span>
                </div>
              </div>
            )}

            {/* Direct Export Buttons (Dışa aktar) */}
            <div className="qrExportSection">
              <span className="qrExportSectionLabel">Dışa aktar</span>
              <div className="qrExportButtonGroup">
                <button
                  type="button"
                  className="qrExportBtn primary"
                  onClick={handleDownloadPng}
                  aria-label={t('qrExportPng')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{t('qrExportPng')}</span>
                </button>

                <button
                  type="button"
                  className="qrExportBtn secondary"
                  onClick={handleDownloadSvg}
                  aria-label={t('qrExportSvg')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <span>{t('qrExportSvg')}</span>
                </button>
              </div>
            </div>

            {/* Hidden canvas for high-resolution PNG exports */}
            <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default QrCustomizationModal;
