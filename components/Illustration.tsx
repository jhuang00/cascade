import type { CSSProperties } from 'react';
import type { IllustrationKind } from '@/lib/types';
import styles from './Illustration.module.css';

const GOLD = '#ffc874';
const BLUE = '#5fb3ff';
const RED = '#ff7060';
// Gray subset of the in-game JUNK_PALETTE (lib/spawn.ts) — all debris uses these.
const GRAYS = ['#9aa0aa', '#8a8e98', '#7c8088'];

// Jagged rock silhouettes (offsets from a center), emulating makePoly (lib/spawn.ts).
const ROCK_A = [[-12, 3], [-8, -9], [1, -12], [10, -7], [12, 3], [5, 11], [-6, 10]];
const ROCK_B = [[-11, 5], [-10, -6], [-2, -12], [8, -10], [12, -1], [8, 9], [-3, 12], [-9, 9]];
const ROCK_C = [[-10, 2], [-5, -10], [6, -11], [12, -2], [9, 8], [0, 12], [-8, 9]];
// Smaller jagged shards for split / fragment / collision debris.
const SHARD_A = [[-7, 2], [-3, -6], [5, -6], [7, 1], [2, 7], [-5, 6]];
const SHARD_B = [[-6, 3], [-5, -5], [3, -7], [7, -1], [4, 6], [-3, 7]];
const SHARD_C = [[-6, 1], [-2, -6], [5, -4], [5, 4], [-1, 7], [-6, 5]];
// Two halves of one rock, split down the seam at x=0 (for the slice demo).
const HALF_L = [[-12, 2], [-8, -10], [-1, -7], [0, 11], [-6, 11], [-11, 7]];
const HALF_R = [[1, -7], [8, -10], [12, 2], [10, 8], [4, 11], [1, 11]];

function pts(shape: number[][], cx: number, cy: number, s = 1): string {
  return shape.map(([x, y]) => `${(cx + x * s).toFixed(1)},${(cy + y * s).toFixed(1)}`).join(' ');
}

/** A rock rendered the in-game way: filled polygon + dark stroke + a lighter
 *  highlight facet over the first half of the points (mirrors drawJunk). */
function Rock({ points, fill, stroke = 'rgba(0,0,0,0.35)', facet = true, className, style }: {
  points: string;
  fill: string;
  stroke?: string;
  facet?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const list = points.trim().split(/\s+/);
  const facetPts = list.slice(0, Math.ceil(list.length / 2) + 1).join(' ');
  return (
    <g className={className} style={style}>
      <polygon points={points} fill={fill} stroke={stroke} strokeWidth="1" />
      {facet && <polygon points={facetPts} fill="rgba(255,255,255,0.12)" />}
    </g>
  );
}

/** Blue active satellite — glow + dark panels + light body + accent (drawActive). */
function ActiveSat({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="15" fill="rgba(95,179,255,0.14)" />
      <rect x={cx - 16} y={cy - 2} width="7" height="4" fill="#2d4a7c" />
      <rect x={cx + 9} y={cy - 2} width="7" height="4" fill="#2d4a7c" />
      <rect x={cx - 5} y={cy - 4.5} width="10" height="9" rx="1" fill="#cfd9e6" />
      <rect x={cx - 0.8} y={cy - 6.5} width="1.6" height="3.6" fill="#5fb3ff" />
    </g>
  );
}

/** Gray dead satellite — faint haze + rust panels + weathered body (drawDeadSat). */
function DeadSat({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="14" fill="rgba(120,120,130,0.08)" />
      <rect x={cx - 16.5} y={cy - 2.5} width="7.5" height="5" fill="#5a4f3a" />
      <rect x={cx + 9} y={cy - 2.5} width="7.5" height="5" fill="#5a4f3a" />
      <rect x={cx - 5.2} y={cy - 4.6} width="10.4" height="9.3" rx="1" fill="#8a8890" />
      <rect x={cx - 0.8} y={cy - 6.8} width="1.6" height="3.6" fill="#6a6870" />
    </g>
  );
}

/** Animated SVG demos that visually show each level mechanic. */
export default function Illustration({ kind }: { kind: IllustrationKind }) {
  return (
    <div className={styles.frame} aria-hidden="true">
      <svg viewBox="0 0 220 130" className={styles.svg} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="densGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GOLD} />
            <stop offset="1" stopColor={RED} />
          </linearGradient>
        </defs>
        {render(kind)}
      </svg>
    </div>
  );
}

function render(kind: IllustrationKind) {
  switch (kind) {
    case 'slice':     return <Slice />;
    case 'junk':      return <Junk />;
    case 'collect':   return <Collect />;
    case 'avoid':     return <Avoid />;
    case 'fragment':  return <Fragment />;
    case 'collision': return <Collision />;
    case 'density':   return <Density />;
  }
}

/* ───────── A gray junk rock cut in two by a cursor trail ───────── */
function Slice() {
  return (
    <g>
      <Rock className={styles.sliceLeft} points={pts(HALF_L, 110, 65)} fill={GRAYS[0]} />
      <Rock className={styles.sliceRight} points={pts(HALF_R, 110, 65)} fill={GRAYS[1]} />
      <g className={styles.sliceTrail}>
        <line x1="98" y1="50" x2="122" y2="80" stroke={BLUE} strokeWidth="6"
          strokeLinecap="round" opacity="0.25" />
        <line x1="98" y1="50" x2="122" y2="80" stroke={BLUE} strokeWidth="2.5"
          strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ───────── Drifting field of abandoned gray debris ───────── */
function Junk() {
  return (
    <g>
      <Rock className={styles.junkA} points={pts(ROCK_A, 32, 46)} fill={GRAYS[0]} />
      <Rock className={styles.junkB} points={pts(ROCK_B, 30, 76)} fill={GRAYS[1]} />
      <Rock className={styles.junkC} points={pts(ROCK_C, 34, 100)} fill={GRAYS[2]} />
    </g>
  );
}

/* ───────── A gold pulse being tapped / collected (drawRare) ───────── */
function Collect() {
  return (
    <g>
      <circle className={styles.collectBurst} cx="110" cy="68" r="16"
        fill="none" stroke={GOLD} strokeWidth="2" />
      <circle className={styles.collectTap} cx="110" cy="68" r="22"
        fill="none" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="110" cy="68" r="12" fill="rgba(255,220,160,0.30)" />
      <Rock className={styles.collectCore} points={pts(ROCK_C, 110, 68)} fill={GOLD}
        stroke="rgba(180,110,30,0.6)" facet={false} />
      <text className={`${styles.collectPlus} ${styles.plus}`} x="110" y="44"
        textAnchor="middle">+100</text>
    </g>
  );
}

/* ───────── A blue active satellite gliding past on its arc ───────── */
function Avoid() {
  return (
    <g>
      <path d="M4,84 Q110,40 216,84" fill="none" stroke={BLUE}
        strokeWidth="1" strokeDasharray="3 5" opacity="0.35" />
      <g className={styles.avoidSat}>
        <ActiveSat cx={110} cy={65} />
      </g>
    </g>
  );
}

/* ───────── One rock breaking into smaller rock shards ───────── */
function Fragment() {
  return (
    <g>
      <Rock className={styles.fragWhole} points={pts(ROCK_A, 110, 66)} fill={GRAYS[0]} />
      <Rock className={styles.fragP1} points={pts(SHARD_A, 109, 63)} fill={GRAYS[0]} />
      <Rock className={styles.fragP2} points={pts(SHARD_B, 111, 66)} fill={GRAYS[1]} />
      <Rock className={styles.fragP3} points={pts(SHARD_C, 112, 63)} fill={GRAYS[2]} />
    </g>
  );
}

/* ───────── Two satellites converging into a rock-debris burst ───────── */
function Collision() {
  return (
    <g>
      <g className={styles.colA}>
        <DeadSat cx={110} cy={65} />
      </g>
      <g className={styles.colB}>
        <ActiveSat cx={110} cy={65} />
      </g>
      <circle className={styles.colFlash} cx="110" cy="65" r="12"
        fill="none" stroke={RED} strokeWidth="2.5" />
      <Rock className={styles.colF1} points={pts(SHARD_A, 108, 63, 0.9)} fill={GRAYS[0]} />
      <Rock className={styles.colF2} points={pts(SHARD_B, 110, 64, 0.8)} fill={GRAYS[1]} />
      <Rock className={styles.colF3} points={pts(SHARD_C, 109, 66, 0.9)} fill={GRAYS[2]} />
      <Rock className={styles.colF4} points={pts(SHARD_A, 111, 64, 0.8)} fill={GRAYS[0]} />
    </g>
  );
}

/* ───────── Density meter saturating as debris compounds ───────── */
function Density() {
  const dots = [
    { x: 60, y: 40, shape: SHARD_A }, { x: 150, y: 36, shape: SHARD_B },
    { x: 92, y: 30, shape: SHARD_C }, { x: 120, y: 52, shape: SHARD_A },
    { x: 44, y: 58, shape: SHARD_B }, { x: 168, y: 56, shape: SHARD_C },
    { x: 110, y: 44, shape: SHARD_A },
  ];
  return (
    <g>
      {dots.map((d, i) => (
        <Rock key={i} className={styles.densDot} points={pts(d.shape, d.x, d.y, 0.5)}
          fill={GRAYS[i % GRAYS.length]} style={{ animationDelay: `${i * 0.42}s` }} />
      ))}
      <rect x="40" y="96" width="140" height="11" rx="5.5"
        fill="#16161c" stroke="#2c2c36" strokeWidth="1" />
      <rect className={styles.densFill} x="40" y="96" width="140" height="11" rx="5.5"
        fill="url(#densGrad)" />
    </g>
  );
}
