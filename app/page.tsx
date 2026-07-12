'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/progress';
import * as Audio from '@/lib/audio';
import { LEVELS } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';
import Scene from '@/components/Scene';
import MissionCard from '@/components/MissionCard';
import styles from './page.module.css';

export default function MenuPage() {
  const router = useRouter();
  const reset = useGameStore((s) => s.reset);
  const isMuted = useGameStore((s) => s.isMuted);
  const setMuted = useGameStore((s) => s.setMuted);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});
  const [showAll, setShowAll] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setUnlockedLevel(p.unlockedLevel);
    setBestScores(p.bestScores);
    setReady(true);
  }, []);

  const hasProgress = unlockedLevel > 1;
  const cardsVisible = ready && (hasProgress || showAll);
  const visibleLevels = showAll
    ? LEVELS
    : LEVELS.filter((lv) => lv.id <= unlockedLevel);

  function handlePlay(levelId: number) {
    Audio.initAudio();
    Audio.playClick();
    reset();
    router.push(`/play/${levelId}`);
  }

  function toggleShowAll() {
    Audio.initAudio();
    Audio.playClick();
    setShowAll((v) => !v);
  }

  function toggleMute() {
    Audio.initAudio();
    setMuted(!isMuted);
  }

  // M key toggles mute from the menu too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        Audio.initAudio();
        setMuted(!useGameStore.getState().isMuted);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMuted]);

  return (
    <div className={styles.app}>
      <Scene />

      <button className={`btn btnGhost ${styles.soundToggle}`} onClick={toggleMute}>
        Sound [ {isMuted ? 'OFF' : 'ON'} ]
      </button>

      <div className={`${styles.wordmarkWrap} ${cardsVisible ? styles.wordmarkCompact : ''}`}>
        <h1 className={styles.wordmark}>CASCADE</h1>
        <div className={styles.subtitle}>
          <span className={styles.subtitleRule} />
          <span className={styles.subtitleLabel}>Orbital debris / 1958 — present</span>
          <span className={styles.subtitleRule} />
        </div>
      </div>

      {/* First visit, default view: single ceremonial CTA */}
      {ready && !hasProgress && !showAll && (
        <div className={styles.freshCenter}>
          <div className={styles.ctaFrame}>
            <span className={styles.ctaBracketTL} aria-hidden="true" />
            <span className={styles.ctaBracketTR} aria-hidden="true" />
            <span className={styles.ctaBracketBL} aria-hidden="true" />
            <span className={styles.ctaBracketBR} aria-hidden="true" />
            <button className={`btn btnPrimary ${styles.heroCta}`} onClick={() => handlePlay(1)}>
              Begin mission
            </button>
          </div>
          <button className={`btn btnGhost ${styles.ghostCta}`} onClick={toggleShowAll}>
            View missions
          </button>
        </div>
      )}

      {/* Card views: progress default (passed + next) or full preview */}
      {cardsVisible && (
        <>
          <div className={styles.cardArea}>
            <div className={styles.cardRow}>
              {visibleLevels.map((lv) => {
                const state = lv.id < unlockedLevel ? 'cleared'
                  : lv.id === unlockedLevel ? 'active'
                  : 'locked';
                return (
                  <MissionCard
                    key={lv.id}
                    level={lv}
                    state={state}
                    bestScore={bestScores[lv.id]}
                    onSelect={state === 'locked' ? undefined : () => handlePlay(lv.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.actionsRow}>
            {hasProgress && (
              <button className={`btn btnPrimary ${styles.actionBtn}`} onClick={() => handlePlay(unlockedLevel)}>
                Continue
              </button>
            )}
            <button className={`btn btnGhost ${styles.actionBtn}`} onClick={toggleShowAll}>
              {showAll ? '‹ Back' : 'View all missions'}
            </button>
          </div>
        </>
      )}

      <div className={styles.signature}>
        CASCADE.MCC · CATALOG NORAD / NASA-ODPO
      </div>
    </div>
  );
}
