import { drawQrToCanvas } from './qrRenderer';

/** Triggers a browser download for a data/blob URL. */
const triggerDownload = (href, fileName) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** High-resolution (1024px) PNG export using the canvas renderer. */
export function downloadQrPng(options, fileName) {
  const canvas = document.createElement('canvas');
  drawQrToCanvas(canvas, { ...options, canvasSize: 1024 }, () => {
    triggerDownload(canvas.toDataURL('image/png'), fileName);
  });
}

/** Vector SVG export. */
export function downloadQrSvg(svgString, fileName) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
  URL.revokeObjectURL(url);
}
