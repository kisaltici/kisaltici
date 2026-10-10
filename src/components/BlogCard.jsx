import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { blogPath, formatPostDate } from '../content/blogPosts';
import './BlogCard.css';

// Seeded random numbers so every post gets its own stable cover
const seeded = (text) => {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

// Fine grid and low opacities keep the cover a quiet texture instead of a loud pattern
const COLS = 48;
const ROWS = 18;
const SOFT = 0.55;
const VARIANTS = ['mosaic', 'bars', 'halftone', 'stripes'];

const finderCell = (x, y, ox, oy) => {
  const dx = x - ox;
  const dy = y - oy;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return null;
  return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
};

/** Builds the shapes of one cover. Every post id maps to one of four on-brand patterns. */
const buildCover = (id) => {
  const random = seeded(id);
  const variant = id.includes('qr') ? 'qr' : VARIANTS[Math.floor(random() * VARIANTS.length)];
  const shapes = [];

  if (variant === 'qr' || variant === 'mosaic') {
    // QR-like module field; "qr" posts also get finder markers in two corners
    const markers = variant === 'qr' ? [[2, 2], [COLS - 9, 2]] : [];
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        let marker = null;
        markers.forEach(([ox, oy]) => {
          const hit = finderCell(x, y, ox, oy);
          if (hit !== null) marker = hit;
        });
        const nearMarker = markers.some(([ox, oy]) => x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7);
        if (marker === true) shapes.push({ type: 'rect', x, y, o: 0.9 });
        else if (marker === false || nearMarker) continue;
        else if (random() < 0.42 - (x / COLS) * 0.2) shapes.push({ type: 'rect', x, y, o: 0.12 + random() * 0.55 });
      }
    }
  } else if (variant === 'bars') {
    // statistics bars with a smooth random trend
    let level = 0.35 + random() * 0.2;
    for (let x = 0; x < COLS; x += 1) {
      level = Math.min(0.9, Math.max(0.15, level + (random() - 0.42) * 0.12));
      const height = Math.max(1, Math.round(level * (ROWS - 1)));
      for (let y = 0; y < height; y += 1) {
        shapes.push({ type: 'rect', x, y: ROWS - 1 - y, o: 0.1 + (y / height) * 0.6 });
      }
    }
  } else if (variant === 'halftone') {
    // dots that grow towards a random focus point
    const fx = 12 + random() * 24;
    const fy = 4 + random() * 10;
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const distance = Math.hypot(x - fx, (y - fy) * 1.6);
        const radius = Math.max(0, 0.42 - distance * 0.017);
        if (radius > 0.05) shapes.push({ type: 'dot', x, y, r: radius, o: 0.2 + radius });
      }
    }
  } else {
    // diagonal stripes of modules
    const gap = 6 + Math.floor(random() * 3);
    const shift = Math.floor(random() * gap);
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if ((x + y + shift) % gap === 0) shapes.push({ type: 'rect', x, y, o: 0.14 + (x / COLS) * 0.4 + random() * 0.1 });
      }
    }
  }
  return shapes;
};

/** Abstract cover generated from the post id: no stock images, always on brand. */
function PostCover({ id }) {
  const shapes = useMemo(() => buildCover(id), [id]);
  return (
    <svg className="bcCoverArt" viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {shapes.map((shape) =>
        shape.type === 'dot' ? (
          <circle key={`${shape.x}-${shape.y}`} cx={shape.x + 0.5} cy={shape.y + 0.5} r={shape.r} fillOpacity={Math.min(shape.o * SOFT, 1)} />
        ) : (
          <rect key={`${shape.x}-${shape.y}`} x={shape.x + 0.12} y={shape.y + 0.12} width="0.76" height="0.76" rx="0.16" fillOpacity={Math.min(shape.o * SOFT, 1)} />
        )
      )}
    </svg>
  );
}

/** Blog post card: generated cover, category, title, summary, date and reading time. */
function BlogCard({ post, lang, minLabel, featured = false }) {
  return (
    <Link to={blogPath(lang, post.slug)} className={`bcCard ${featured ? 'isFeatured' : ''}`}>
      <span className="bcCover">
        <PostCover id={post.id} />
        <span className="bcCategory">{post.category}</span>
      </span>
      <span className="bcBody">
        <span className="bcTitle">{post.title}</span>
        <span className="bcText">{post.description}</span>
        <span className="bcFoot">
          <span>
            {formatPostDate(post.date, lang)} · {post.readMinutes} {minLabel}
          </span>
          <span className="bcArrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </span>
    </Link>
  );
}

export default BlogCard;
