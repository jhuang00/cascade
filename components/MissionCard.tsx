'use client';
// Mission card — ported from design-refs/cascade-ui-mockup.html .select-screen.
// Three states: cleared (sage), active (amber INFORMATION band), locked
// (ghosted, striped hero). Hero canvases are painted once on mount, no rAF.
import { useEffect, useRef } from 'react';
import type { LevelConfig } from '@/lib/types';
import { drawMissionHero } from '@/lib/heroes';
import Sigil from '@/components/Sigil';
import styles from './MissionCard.module.css';

export type MissionCardState = 'cleared' | 'active' | 'locked';

interface Props {
  level: LevelConfig;
  state: MissionCardState;
  bestScore?: number;
  onSelect?: () => void;
}

export default function MissionCard({ level, state, bestScore, onSelect }: Props) {
  const heroRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = heroRef.current;
    if (state === 'locked' || !canvas) return;
    drawMissionHero(level.id, canvas);
    // Repaint if the hero box changes size after the initial paint (e.g.
    // web-font load reflows the band body). Still no rAF — paints are
    // event-driven only.
    const observer = new ResizeObserver(() => drawMissionHero(level.id, canvas));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [level.id, state]);

  const clickable = state !== 'locked';
  const num = String(level.id).padStart(2, '0');
  // M06's sigil carries the cascade tint (the one sanctioned use in chrome).
  const sigilState = state === 'cleared' ? 'cleared' : level.id === 6 ? 'cascade' : 'default';

  const inner = (
    <>
      <span className={styles.bracketTL} aria-hidden="true" />
      <span className={styles.bracketTR} aria-hidden="true" />
      <span className={styles.bracketBL} aria-hidden="true" />
      <span className={styles.bracketBR} aria-hidden="true" />

      <div className={styles.sigil}>
        <Sigil level={level.id} state={sigilState} width={52} />
      </div>

      <div className={styles.titleBlock}>
        <div className={styles.levelNum}>Mission · {num}</div>
        <div className={styles.levelName}>{level.title}</div>
        <div className={styles.epoch}>{level.era}</div>
      </div>

      <div className={styles.divider} />

      <div className={styles.hero}>
        {state !== 'locked' && <canvas ref={heroRef} className={styles.heroCanvas} />}
      </div>

      {state === 'active' && <div className={styles.bandActive}>Information</div>}
      {state === 'cleared' && <div className={styles.bandCleared}>Cleared</div>}

      {state === 'active' && (
        <div className={styles.bandBody}>
          {level.card.blurb}
          {level.card.newLine && <div className={styles.newLine}>{level.card.newLine}</div>}
        </div>
      )}
      {state === 'cleared' && (
        <div className={`${styles.bandBody} ${styles.bandBodyCentered}`}>
          Best · <span className={styles.bright}>{bestScore ?? '—'}</span>
        </div>
      )}
      {state === 'locked' && (
        <div className={`${styles.bandBody} ${styles.bandBodyCentered} ${styles.bandBodyMuted}`}>
          Locked — complete Mission {String(level.id - 1).padStart(2, '0')} to unlock.
        </div>
      )}
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        className={`${styles.card} ${state === 'active' ? styles.active : styles.cleared}`}
        onClick={onSelect}
        aria-label={`Mission ${num} — ${level.title}`}
      >
        {inner}
      </button>
    );
  }

  return <article className={`${styles.card} ${styles.locked}`}>{inner}</article>;
}
