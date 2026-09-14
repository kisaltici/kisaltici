/**
 * QR Code Custom Rendering Engine for Kısaltıcı.
 * Built using Nayuki's standard QR Code generator algorithm (bundled in-tree, zero extra dependencies).
 * Supports:
 * - Complexity / error correction levels (Minimal = L, Balanced = M, High Reliability = Q)
 * - Foreground & Background colors
 * - Custom Module Shapes (square, rounded, extra-rounded, dots)
 * - Safe finder pattern protection (eyes remain standard/semi-rounded for 100% reliable camera scanning)
 * - High-resolution PNG & vector SVG downloads
 */

// --- Nayuki QR Code Generation Engine (Lightweight in-tree implementation) ---
class QrCode {
  constructor(version, errorCorrectionLevel, dataCodewords, msk) {
    this.version = version;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.size = version * 4 + 17;
    this.modules = [];
    this.isFunction = [];

    const row = [];
    for (let i = 0; i < this.size; i++) row.push(false);
    for (let i = 0; i < this.size; i++) {
      this.modules.push(row.slice());
      this.isFunction.push(row.slice());
    }

    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);

    if (msk === -1) {
      let minPenalty = 1e9;
      let bestMask = 0;
      for (let i = 0; i < 8; i++) {
        this.applyMask(i);
        this.drawFormatBits(i);
        const penalty = this.getPenaltyScore();
        if (penalty < minPenalty) {
          minPenalty = penalty;
          bestMask = i;
        }
        this.applyMask(i); // Undoes the mask
      }
      msk = bestMask;
    }
    this.mask = msk;
    this.applyMask(msk);
    this.drawFormatBits(msk);
    this.isFunction = [];
  }

  getModule(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
  }

  drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);

    const alignPatPos = QrCode.getAlignmentPatternPositions(this.version);
    const numAlign = alignPatPos.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlign - 1) ||
          (i === numAlign - 1 && j === 0)
        )
          continue;
        this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
      }
    }
    this.drawFormatBits(0);
    this.drawVersion();
  }

  drawFinderPattern(x, y) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  drawAlignmentPattern(x, y) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  setFunctionModule(x, y, isDark) {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  drawFormatBits(mask) {
    const data = (this.errorCorrectionLevel.formatBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 1335);
    const bits = ((data << 10) | rem) ^ 21522;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, 7, ((bits >>> 6) & 1) !== 0);
    this.setFunctionModule(8, 8, ((bits >>> 7) & 1) !== 0);
    this.setFunctionModule(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, ((bits >>> i) & 1) !== 0);

    for (let i = 0; i < 8; i++)
      this.setFunctionModule(this.size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
    for (let i = 8; i < 15; i++)
      this.setFunctionModule(8, this.size - 15 + i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, this.size - 8, true);
  }

  drawVersion() {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 7973);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const color = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, color);
      this.setFunctionModule(b, a, color);
    }
  }

  drawCodewords(data) {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  applyMask(mask) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert;
        switch (mask) {
          case 0:
            invert = (x + y) % 2 === 0;
            break;
          case 1:
            invert = y % 2 === 0;
            break;
          case 2:
            invert = x % 3 === 0;
            break;
          case 3:
            invert = (x + y) % 3 === 0;
            break;
          case 4:
            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
            break;
          case 5:
            invert = ((x * y) % 2) + ((x * y) % 3) === 0;
            break;
          case 6:
            invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
            break;
          case 7:
            invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
            break;
          default:
            throw new Error('Mask out of range');
        }
        if (!this.isFunction[y][x] && invert) {
          this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  getPenaltyScore() {
    let result = 0;
    for (let y = 0; y < this.size; y++) {
      let runColor = false;
      let runVal = 0;
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x] === runColor) {
          runVal++;
          if (runVal === 5) result += 3;
          else if (runVal > 5) result++;
        } else {
          runColor = this.modules[y][x];
          runVal = 1;
        }
      }
    }
    for (let x = 0; x < this.size; x++) {
      let runColor = false;
      let runVal = 0;
      for (let y = 0; y < this.size; y++) {
        if (this.modules[y][x] === runColor) {
          runVal++;
          if (runVal === 5) result += 3;
          else if (runVal > 5) result++;
        } else {
          runColor = this.modules[y][x];
          runVal = 1;
        }
      }
    }
    for (let y = 0; y < this.size - 1; y++) {
      for (let x = 0; x < this.size - 1; x++) {
        const color = this.modules[y][x];
        if (
          color === this.modules[y][x + 1] &&
          color === this.modules[y + 1][x] &&
          color === this.modules[y + 1][x + 1]
        ) {
          result += 3;
        }
      }
    }
    let totalDark = 0;
    for (const row of this.modules) {
      for (const cell of row) {
        if (cell) totalDark++;
      }
    }
    const total = this.size * this.size;
    const k = Math.ceil(Math.abs((totalDark * 20) / total - 10)) - 1;
    result += k * 10;
    return result;
  }

  addEccAndInterleave(data) {
    const ver = this.version;
    const ecl = this.errorCorrectionLevel;
    const numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
    const blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
    const rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks = [];
    const rsDiv = QrCode.reedSolomonComputeDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i >= numShortBlocks ? 1 : 0));
      k += dat.length;
      const ecc = QrCode.reedSolomonComputeRemainder(dat, rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push({ data: dat, ecc });
    }

    const result = [];
    for (let i = 0; i < blocks[0].data.length; i++) {
      for (let j = 0; j < blocks.length; j++) {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
          result.push(blocks[j].data[i]);
        }
      }
    }
    for (let i = 0; i < blockEccLen; i++) {
      for (let j = 0; j < blocks.length; j++) {
        result.push(blocks[j].ecc[i]);
      }
    }
    return result;
  }

  static getAlignmentPatternPositions(ver) {
    if (ver === 1) return [];
    const num = Math.floor(ver / 7) + 2;
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
    const result = [6];
    for (let pos = ver * 4 + 10; result.length < num; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  static getNumRawDataModules(ver) {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  static reedSolomonComputeDivisor(degree) {
    const result = [];
    for (let i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < result.length; j++) {
        result[j] = QrCode.reedSolomonMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = QrCode.reedSolomonMultiply(root, 2);
    }
    return result;
  }

  static reedSolomonComputeRemainder(data, divisor) {
    const result = divisor.map(() => 0);
    for (const b of data) {
      const factor = b ^ result.shift();
      result.push(0);
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= QrCode.reedSolomonMultiply(divisor[i], factor);
      }
    }
    return result;
  }

  static reedSolomonMultiply(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 285);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
}

QrCode.MIN_VERSION = 1;
QrCode.MAX_VERSION = 40;
QrCode.Ecc = {
  LOW: { ordinal: 0, formatBits: 1 },
  MEDIUM: { ordinal: 1, formatBits: 0 },
  QUARTILE: { ordinal: 2, formatBits: 3 },
  HIGH: { ordinal: 3, formatBits: 2 },
};

QrCode.ECC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 72, 74, 79],
];

// Alphanumeric character set for optimal segment packing (5.5 bits/char vs 8 bits/char in byte mode)
const ALPHANUMERIC_REGEX = /^[0-9A-Z $%*+.\/:-]*$/;
const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function encodeTextToQr(text, eccLevel) {
  // Check if string can be encoded in Alphanumeric mode (uppercase)
  // For standard short URLs, if we uppercase scheme/domain and it matches, we can evaluate if it fits.
  // However, standard URLs contain lowercase paths which are case-sensitive.
  // We use optimal multi-segment or Byte mode.
  const isAllAlpha = ALPHANUMERIC_REGEX.test(text);

  for (let version = 1; version <= 40; version++) {
    const dataCapacityBits =
      (QrCode.getNumRawDataModules(version) >>> 3) -
      QrCode.ECC_CODEWORDS_PER_BLOCK[eccLevel.ordinal][version] *
        QrCode.NUM_ERROR_CORRECTION_BLOCKS[eccLevel.ordinal][version];
    const maxCapacityBits = dataCapacityBits * 8;

    if (isAllAlpha) {
      // Alphanumeric mode: 4 mode bits + (9, 11, or 13 count bits) + 11 bits per 2 chars (+6 bits for odd)
      const countBits = version <= 9 ? 9 : version <= 26 ? 11 : 13;
      const dataBits = Math.floor(text.length / 2) * 11 + (text.length % 2 === 1 ? 6 : 0);
      const totalBitsNeeded = 4 + countBits + dataBits;

      if (totalBitsNeeded <= maxCapacityBits) {
        const bb = [];
        const appendBits = (val, len) => {
          for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1);
        };
        appendBits(2, 4); // Mode 2: Alphanumeric
        appendBits(text.length, countBits);
        for (let i = 0; i + 2 <= text.length; i += 2) {
          const val =
            ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45 +
            ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
          appendBits(val, 11);
        }
        if (text.length % 2 === 1) {
          appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(text.length - 1)), 6);
        }
        // Terminator
        const termLen = Math.min(4, maxCapacityBits - bb.length);
        appendBits(0, termLen);
        appendBits(0, (8 - (bb.length % 8)) % 8);
        for (let padByte = 236; bb.length < maxCapacityBits; padByte ^= 236 ^ 17) {
          appendBits(padByte, 8);
        }
        const dataCodewords = [];
        for (let i = 0; i < bb.length; i += 8) {
          let byteVal = 0;
          for (let j = 0; j < 8; j++) byteVal = (byteVal << 1) | bb[i + j];
          dataCodewords.push(byteVal);
        }
        return new QrCode(version, eccLevel, dataCodewords, -1);
      }
    } else {
      // Byte mode (UTF-8)
      const bytes = [];
      const encoded = encodeURI(text);
      for (let i = 0; i < encoded.length; i++) {
        if (encoded.charAt(i) !== '%') {
          bytes.push(encoded.charCodeAt(i));
        } else {
          bytes.push(parseInt(encoded.substring(i + 1, i + 3), 16));
          i += 2;
        }
      }

      const ccbits = version <= 9 ? 8 : 16;
      const neededBits = 4 + ccbits + bytes.length * 8;
      if (neededBits <= maxCapacityBits) {
        const bb = [];
        const appendBits = (val, len) => {
          for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1);
        };
        appendBits(4, 4); // Mode 4: Byte mode
        appendBits(bytes.length, ccbits);
        for (const b of bytes) appendBits(b, 8);

        // Terminator
        const termLen = Math.min(4, maxCapacityBits - bb.length);
        appendBits(0, termLen);
        appendBits(0, (8 - (bb.length % 8)) % 8);
        for (let padByte = 236; bb.length < maxCapacityBits; padByte ^= 236 ^ 17) {
          appendBits(padByte, 8);
        }
        const dataCodewords = [];
        for (let i = 0; i < bb.length; i += 8) {
          let byteVal = 0;
          for (let j = 0; j < 8; j++) byteVal = (byteVal << 1) | bb[i + j];
          dataCodewords.push(byteVal);
        }
        return new QrCode(version, eccLevel, dataCodewords, -1);
      }
    }
  }
  throw new Error('Data too long to fit in any QR code version');
}

/**
 * Checks if a given coordinate (x, y) is part of a Finder Pattern (Corner eyes)
 * The 3 finder patterns are at (0..6, 0..6), (size-7..size-1, 0..6), and (0..6, size-7..size-1).
 */
export function isFinderPattern(x, y, size) {
  // Top-left
  if (x < 7 && y < 7) return true;
  // Top-right
  if (x >= size - 7 && y < 7) return true;
  // Bottom-left
  if (x < 7 && y >= size - 7) return true;
  return false;
}

/**
 * Returns the origin coordinates of the 3 finder patterns:
 * [Top-Left, Top-Right, Bottom-Left]
 */
export function getFinderPatternOrigins(size) {
  return [
    { x: 0, y: 0, id: 'tl' },
    { x: size - 7, y: 0, id: 'tr' },
    { x: 0, y: size - 7, id: 'bl' },
  ];
}

/**
 * Generates module matrix and layout metadata for given URL and parameters.
 * Ultra Minimal uses the lowest valid error correction level (Level L - 7% redundancy)
 * and determines the smallest valid QR version capable of encoding the payload.
 * Minimal uses Level M (15% redundancy), producing a genuinely distinct matrix.
 * Automatically elevates error correction level if a center image is present.
 */
export function generateQrMatrix(text, complexity = 'minimal', hasCenterImage = false) {
  let ecc = QrCode.Ecc.MEDIUM;
  let densityLabel = 'Dengeli';
  let scanReliability = 'Normal';

  if (complexity === 'ultra-minimal') {
    // Ultra Minimal: Lowest valid error correction level (Level L - 7%)
    ecc = QrCode.Ecc.LOW;
    densityLabel = 'Ultra Sade';
    scanReliability = 'Standart';
  } else if (complexity === 'minimal') {
    // Minimal: Standard error correction level (Level M - 15%)
    ecc = QrCode.Ecc.MEDIUM;
    densityLabel = 'Sade';
    scanReliability = 'Normal';
  } else if (complexity === 'balanced') {
    // Balanced: Level Q (25% error correction)
    ecc = QrCode.Ecc.QUARTILE;
    densityLabel = 'Dengeli';
    scanReliability = 'Yüksek';
  } else if (complexity === 'high') {
    // High Reliability: Level H (30% error correction)
    ecc = QrCode.Ecc.HIGH;
    densityLabel = 'Detaylı';
    scanReliability = 'Maksimum';
  }

  // Safety protection: if center image is present, boost ECC to at least MEDIUM (or HIGH)
  // to avoid corrupted scans while keeping payload valid.
  if (hasCenterImage) {
    if (ecc === QrCode.Ecc.LOW) {
      ecc = QrCode.Ecc.MEDIUM;
      densityLabel += ' (Logo korumalı)';
      scanReliability = 'Normal';
    }
  }

  const qr = encodeTextToQr(text, ecc);
  const size = qr.size;
  const matrix = [];
  let darkModuleCount = 0;

  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const isDark = qr.getModule(x, y);
      if (isDark) darkModuleCount++;
      row.push(isDark);
    }
    matrix.push(row);
  }

  const eccLabels = { 0: 'L (%7)', 1: 'M (%15)', 2: 'Q (%25)', 3: 'H (%30)' };

  return {
    matrix,
    size,
    version: qr.version,
    moduleCount: `${size} × ${size}`,
    darkModules: darkModuleCount,
    errorCorrectionLevel: eccLabels[qr.errorCorrectionLevel.ordinal] || 'M (%15)',
    densityLabel,
    scanReliability,
    complexity,
  };
}

/**
 * Calculates luminance and color contrast ratio between two hex colors.
 */
export function getContrastRatio(fgHex, bgHex) {
  if (bgHex === 'transparent') return 21; // Assume high contrast on default dark/light background

  const hexToRgb = (hex) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const getLuminance = ({ r, g, b }) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  try {
    const lum1 = getLuminance(hexToRgb(fgHex));
    const lum2 = getLuminance(hexToRgb(bgHex));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch (e) {
    return 21;
  }
}

/**
 * Generates an SVG string representation of the customized QR code.
 * Keeps all QR modules as crisp vector elements (<rect>, <circle>, <polygon>),
 * renders unified tasteful finder patterns (classic, rounded, soft, compact, dot),
 * and embeds the optional center image as an SVG <image> with background padding.
 */
export function generateQrSvgString({
  matrix,
  size,
  fgColor = '#080a11',
  bgColor = '#ffffff',
  moduleShape = 'square',
  finderStyle = 'classic',
  margin = 4,
  centerImage = null,
}) {
  const totalCells = size + margin * 2;
  const elements = [];
  const normalizedFinder = finderStyle === 'square' ? 'classic' : finderStyle === 'circle' ? 'dot' : finderStyle;

  // Background rect if not transparent
  if (bgColor && bgColor !== 'transparent') {
    elements.push(
      `<rect width="${totalCells}" height="${totalCells}" fill="${bgColor}" />`
    );
  }

  // Calculate center image coordinates in grid units
  let centerReserved = null;
  if (centerImage && centerImage.src) {
    const sizePct = (centerImage.sizePercent || 22) / 100;
    const imgSize = Math.max(Math.round(totalCells * sizePct), 3);
    const imgX = (totalCells - imgSize) / 2;
    const imgY = (totalCells - imgSize) / 2;
    centerReserved = {
      x: imgX,
      y: imgY,
      size: imgSize,
      radius: (centerImage.radius || 20) / 100,
      padding: (centerImage.padding || 4) / 10,
      bgColor: centerImage.bgColor || bgColor || '#ffffff',
    };
  }

  // Render Data Modules (skipping finder patterns which are rendered as unified vector elements)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x]) continue;

      // Skip finder patterns - handled separately for high visual quality
      if (isFinderPattern(x, y, size)) continue;

      const posX = x + margin;
      const posY = y + margin;

      // Skip modules completely covered by center image
      if (centerReserved) {
        if (
          posX >= centerReserved.x - 0.2 &&
          posX + 1 <= centerReserved.x + centerReserved.size + 0.2 &&
          posY >= centerReserved.y - 0.2 &&
          posY + 1 <= centerReserved.y + centerReserved.size + 0.2
        ) {
          continue;
        }
      }

      // Data modules: apply chosen moduleShape
      switch (moduleShape) {
        case 'diamond': {
          const cx = posX + 0.5;
          const cy = posY + 0.5;
          const r = 0.48;
          elements.push(
            `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fgColor}" />`
          );
          break;
        }
        case 'rounded':
          elements.push(
            `<rect x="${posX + 0.05}" y="${posY + 0.05}" width="0.9" height="0.9" rx="0.28" ry="0.28" fill="${fgColor}" />`
          );
          break;
        case 'extra-rounded':
          elements.push(
            `<rect x="${posX + 0.05}" y="${posY + 0.05}" width="0.9" height="0.9" rx="0.45" ry="0.45" fill="${fgColor}" />`
          );
          break;
        case 'dots':
          elements.push(
            `<circle cx="${posX + 0.5}" cy="${posY + 0.5}" r="0.44" fill="${fgColor}" />`
          );
          break;
        case 'square':
        default:
          elements.push(
            `<rect x="${posX}" y="${posY}" width="1" height="1" fill="${fgColor}" />`
          );
          break;
      }
    }
  }

  // Render the 3 Large Finder Patterns cleanly
  const origins = getFinderPatternOrigins(size);
  const effectiveBg = bgColor && bgColor !== 'transparent' ? bgColor : '#ffffff';

  origins.forEach((origin) => {
    const fx = origin.x + margin;
    const fy = origin.y + margin;

    if (normalizedFinder === 'dot') {
      // Concentric circles (Outer circle ring + center solid dot)
      const cx = fx + 3.5;
      const cy = fy + 3.5;
      // Outer ring using stroke
      elements.push(
        `<circle cx="${cx}" cy="${cy}" r="3" fill="none" stroke="${fgColor}" stroke-width="1" />`
      );
      // Inner solid eye
      elements.push(
        `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${fgColor}" />`
      );
    } else if (normalizedFinder === 'rounded') {
      // Rounded corners finder pattern
      elements.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="1.6" fill="${fgColor}" />`
      );
      elements.push(
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="0.9" fill="${effectiveBg}" />`
      );
      elements.push(
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="0.8" fill="${fgColor}" />`
      );
    } else if (normalizedFinder === 'soft') {
      // Soft organic curves
      elements.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="2.4" fill="${fgColor}" />`
      );
      elements.push(
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="1.4" fill="${effectiveBg}" />`
      );
      elements.push(
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="1.2" fill="${fgColor}" />`
      );
    } else if (normalizedFinder === 'compact') {
      // Modern compact architectural feel
      elements.push(
        `<rect x="${fx}" y="${fy}" width="7" height="7" rx="0.6" fill="${fgColor}" />`
      );
      elements.push(
        `<rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" rx="0.4" fill="${effectiveBg}" />`
      );
      elements.push(
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx="0.5" fill="${fgColor}" />`
      );
    } else {
      // Classic square frame + solid eye (evenodd path so transparent backgrounds work cleanly)
      elements.push(
        `<path d="M ${fx} ${fy} h 7 v 7 h -7 Z M ${fx + 1} ${fy + 1} v 5 h 5 v -5 Z" fill-rule="evenodd" fill="${fgColor}" />`
      );
      elements.push(
        `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" fill="${fgColor}" />`
      );
    }
  });

  // Render Center Image if present (strictly as vector rect/circle background + embedded <image>)
  if (centerReserved && centerImage && centerImage.src) {
    const rx = centerReserved.size * centerReserved.radius;
    const bgCol = centerReserved.bgColor === 'transparent' ? '#ffffff' : centerReserved.bgColor;

    // Background padding rect
    elements.push(
      `<rect x="${centerReserved.x - centerReserved.padding}" y="${centerReserved.y - centerReserved.padding}" width="${centerReserved.size + centerReserved.padding * 2}" height="${centerReserved.size + centerReserved.padding * 2}" rx="${rx + centerReserved.padding}" ry="${rx + centerReserved.padding}" fill="${bgCol}" />`
    );

    // Clip path ID unique to this QR
    const clipId = `qr-logo-clip-${Math.random().toString(36).substring(2, 9)}`;
    elements.push(
      `<clipPath id="${clipId}"><rect x="${centerReserved.x}" y="${centerReserved.y}" width="${centerReserved.size}" height="${centerReserved.size}" rx="${rx}" ry="${rx}" /></clipPath>`
    );

    // Vector embedded image element
    elements.push(
      `<image href="${centerImage.src}" x="${centerReserved.x}" y="${centerReserved.y}" width="${centerReserved.size}" height="${centerReserved.size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalCells} ${totalCells}" width="100%" height="100%" shape-rendering="geometricPrecision">\n  ${elements.join('\n  ')}\n</svg>`;
}

/**
 * Draws the customized QR code to an HTML5 Canvas context.
 * Renders center image with rounded corners and background padding.
 */
export function drawQrToCanvas(canvas, {
  matrix,
  size,
  fgColor = '#080a11',
  bgColor = '#ffffff',
  moduleShape = 'square',
  finderStyle = 'square',
  canvasSize = 1024,
  margin = 4,
  centerImage = null,
}, callback = null) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Background
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  const totalCells = size + margin * 2;
  const cellSize = canvasSize / totalCells;

  // Center image bounds in canvas pixels
  let centerBounds = null;
  if (centerImage && centerImage.src) {
    const sizePct = (centerImage.sizePercent || 22) / 100;
    const imgPix = Math.max(canvasSize * sizePct, 30);
    const imgX = (canvasSize - imgPix) / 2;
    const imgY = (canvasSize - imgPix) / 2;
    centerBounds = {
      x: imgX,
      y: imgY,
      size: imgPix,
      radius: (imgPix * (centerImage.radius || 20)) / 100,
      padding: (cellSize * (centerImage.padding || 4)) / 10,
      bgColor: centerImage.bgColor || bgColor || '#ffffff',
    };
  }

  // Data Modules (skip finder pattern modules)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x]) continue;

      // Skip finder patterns - drawn with high quality below
      if (isFinderPattern(x, y, size)) continue;

      const posX = (x + margin) * cellSize;
      const posY = (y + margin) * cellSize;

      // Skip modules behind center image
      if (centerBounds) {
        if (
          posX >= centerBounds.x - cellSize * 0.2 &&
          posX + cellSize <= centerBounds.x + centerBounds.size + cellSize * 0.2 &&
          posY >= centerBounds.y - cellSize * 0.2 &&
          posY + cellSize <= centerBounds.y + centerBounds.size + cellSize * 0.2
        ) {
          continue;
        }
      }

      switch (moduleShape) {
        case 'diamond': {
          const cx = posX + cellSize * 0.5;
          const cy = posY + cellSize * 0.5;
          const r = cellSize * 0.48;
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.lineTo(cx + r, cy);
          ctx.lineTo(cx, cy + r);
          ctx.lineTo(cx - r, cy);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'rounded':
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(
              posX + cellSize * 0.05,
              posY + cellSize * 0.05,
              cellSize * 0.9,
              cellSize * 0.9,
              cellSize * 0.28
            );
            ctx.fill();
          } else {
            ctx.fillRect(posX, posY, cellSize, cellSize);
          }
          break;
        case 'extra-rounded':
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(
              posX + cellSize * 0.05,
              posY + cellSize * 0.05,
              cellSize * 0.9,
              cellSize * 0.9,
              cellSize * 0.45
            );
            ctx.fill();
          } else {
            ctx.fillRect(posX, posY, cellSize, cellSize);
          }
          break;
        case 'dots':
          ctx.beginPath();
          ctx.arc(
            posX + cellSize * 0.5,
            posY + cellSize * 0.5,
            cellSize * 0.44,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case 'square':
        default:
          ctx.fillRect(posX, posY, cellSize, cellSize);
          break;
      }
    }
  }

  // Draw 3 Large Finder Patterns cleanly
  const origins = getFinderPatternOrigins(size);
  const normalizedFinder = finderStyle === 'square' ? 'classic' : finderStyle === 'circle' ? 'dot' : finderStyle;
  const effectiveBg = bgColor && bgColor !== 'transparent' ? bgColor : '#ffffff';

  origins.forEach((origin) => {
    const fx = (origin.x + margin) * cellSize;
    const fy = (origin.y + margin) * cellSize;

    if (normalizedFinder === 'dot') {
      const cx = fx + 3.5 * cellSize;
      const cy = fy + 3.5 * cellSize;
      // Outer ring stroke
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = cellSize;
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * cellSize, 0, Math.PI * 2);
      ctx.stroke();
      // Inner solid eye
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.5 * cellSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (normalizedFinder === 'rounded') {
      const rOuter = 1.6 * cellSize;
      const rInner = 0.9 * cellSize;
      const rEye = 0.8 * cellSize;
      // Outer
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx, fy, 7 * cellSize, 7 * cellSize, rOuter);
      else ctx.rect(fx, fy, 7 * cellSize, 7 * cellSize);
      ctx.fill();
      // Inner gap
      ctx.fillStyle = effectiveBg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize, rInner);
      else ctx.rect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fill();
      // Inner eye
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize, rEye);
      else ctx.rect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fill();
    } else if (normalizedFinder === 'soft') {
      const rOuter = 2.4 * cellSize;
      const rInner = 1.4 * cellSize;
      const rEye = 1.2 * cellSize;
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx, fy, 7 * cellSize, 7 * cellSize, rOuter);
      else ctx.rect(fx, fy, 7 * cellSize, 7 * cellSize);
      ctx.fill();
      ctx.fillStyle = effectiveBg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize, rInner);
      else ctx.rect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fill();
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize, rEye);
      else ctx.rect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fill();
    } else if (normalizedFinder === 'compact') {
      const rOuter = 0.6 * cellSize;
      const rInner = 0.4 * cellSize;
      const rEye = 0.5 * cellSize;
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx, fy, 7 * cellSize, 7 * cellSize, rOuter);
      else ctx.rect(fx, fy, 7 * cellSize, 7 * cellSize);
      ctx.fill();
      ctx.fillStyle = effectiveBg;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize, rInner);
      else ctx.rect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fill();
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize, rEye);
      else ctx.rect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
      ctx.fill();
    } else {
      // Classic
      ctx.fillStyle = fgColor;
      ctx.fillRect(fx, fy, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = effectiveBg;
      ctx.fillRect(fx + cellSize, fy + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = fgColor;
      ctx.fillRect(fx + 2 * cellSize, fy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    }
  });

  // Draw Center Image if provided
  if (centerBounds && centerImage && centerImage.src) {
    const bgCol = centerBounds.bgColor === 'transparent' ? '#ffffff' : centerBounds.bgColor;

    // Draw background padding card
    ctx.fillStyle = bgCol;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(
        centerBounds.x - centerBounds.padding,
        centerBounds.y - centerBounds.padding,
        centerBounds.size + centerBounds.padding * 2,
        centerBounds.size + centerBounds.padding * 2,
        centerBounds.radius + centerBounds.padding
      );
      ctx.fill();
    } else {
      ctx.fillRect(
        centerBounds.x - centerBounds.padding,
        centerBounds.y - centerBounds.padding,
        centerBounds.size + centerBounds.padding * 2,
        centerBounds.size + centerBounds.padding * 2
      );
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(
          centerBounds.x,
          centerBounds.y,
          centerBounds.size,
          centerBounds.size,
          centerBounds.radius
        );
        ctx.clip();
      }
      ctx.drawImage(img, centerBounds.x, centerBounds.y, centerBounds.size, centerBounds.size);
      ctx.restore();
      if (callback) callback();
    };
    img.onerror = () => {
      if (callback) callback();
    };
    img.src = centerImage.src;
  } else if (callback) {
    callback();
  }
}
