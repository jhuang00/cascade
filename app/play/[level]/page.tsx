'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import HUD from '@/components/HUD';
import LevelIntro from '@/components/LevelIntro';
import LevelOutro from '@/components/LevelOutro';
import { LEVELS } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';
import * as Audio from '@/lib/audio';
import styles from './page.module.css';

interface Props {
  params: Promise<{ level: string }>;
}

export default function PlayPage({ params }: Props) {
  const { level: levelParam } = use(params);
  const router = useRouter();
  const levelId = parseInt(levelParam, 10);
  const levelIdx = levelId - 1;

  const {
    screen, setScreen, syncFromEngine, setLevelResult, setMuted, isMuted,
    score, timeRemaining, cleared, trackingCount, reentryCount,
    currentLevelIdx,
  } = useGameStore();

  const [missionMs, setMissionMs] = useState(0);
  const missionStartRef = useRef(Date.now());
  const [engineKey, setEngineKey] = useState(0);

  const lv = LEVELS[levelIdx];

  useEffect(() => {
    if (!lv) { router.push('/'); return; }
    setScreen('intro');
  }, [levelIdx]);

  useEffect(() => {
    missionStartRef.current = Date.now();
    const id = setInterval(() => {
      setMissionMs(Date.now() - missionStartRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!lv) return null;

  const elapsed = Math.floor(missionMs / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const met = `${mm}:${ss}`;

  const statusLevel = trackingCount >= 10 || reentryCount > 12 ? 'critical'
    : trackingCount >= 6 ? 'elevated'
    : 'nominal';

  function handleBegin() {
    syncFromEngine({ screen: 'playing' });
    setScreen('playing');
  }

  function handleLevelEnd(success: boolean, failReason?: string, l3Result?: string) {
    setLevelResult(success, failReason ?? null, l3Result);
    setScreen('outro');
  }

  function handleRetry() {
    setEngineKey((k) => k + 1);
    setScreen('intro');
  }

  function handleMute() {
    Audio.initAudio();
    const next = !isMuted;
    setMuted(next);
    Audio.setMuted(next);
  }

  return (
    <div className={styles.app}>
      <div className={styles.titleBar}>
        <div className={styles.titleLeft}>
          <span className={styles.dot} />
          <span>Cascade · L{lv.id} — {lv.title}</span>
        </div>
        <div className={styles.titleRight}>
          <span className={styles.metLabel}>Mission elapsed:</span>
          <span className={styles.metValue}>{met}</span>
          <button className={styles.muteBtn} onClick={handleMute}>
            Sound: {isMuted ? 'off' : 'on'}
          </button>
        </div>
      </div>

      <div className={styles.canvasWrap}>
        <GameCanvas
          key={engineKey}
          levelIdx={levelIdx}
          onLevelEnd={handleLevelEnd}
        />

        {/* Corner brackets */}
        <div className={styles.brackets}>
          <div className={`${styles.bracket} ${styles.tl}`} />
          <div className={`${styles.bracket} ${styles.tr}`} />
          <div className={`${styles.bracket} ${styles.bl}`} />
          <div className={`${styles.bracket} ${styles.br}`} />
        </div>

        {/* Status pills — mission-control HUD */}
        {screen === 'playing' && (
          <div className={styles.hudTop}>
            <div className={styles.pill}>
              <span className={`${styles.statusDot} ${styles[statusLevel]}`} />
              <span className={styles.pillLabel}>STATUS</span>
              <span className={styles.pillValue}>{statusLevel.toUpperCase()}</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>ALT</span>
              <span className={styles.pillValue}>487 km</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>INC</span>
              <span className={styles.pillValue}>51.6°</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>CLEARED</span>
              <span className={styles.pillValue}>{cleared}</span>
            </div>
          </div>
        )}

        {/* Bottom telemetry */}
        {screen === 'playing' && (
          <div className={styles.hudBottom}>
            <span className={styles.tracking}>
              Tracking <span className={styles.trackValue}>{trackingCount}</span> objects · <span className={styles.trackValue}>{reentryCount}</span> reentries
            </span>
            <span className={styles.signature}>CASCADE.MCC · 2026</span>
          </div>
        )}

        {/* Gameplay HUD (score, time, misses) */}
        <HUD />

        {/* Screen overlays */}
        <LevelIntro onBegin={handleBegin} />
        <LevelOutro onRetry={handleRetry} />

        {/* Complete screen */}
        {screen === 'complete' && (
          <div className={styles.completeScreen}>
            <div className={styles.completeEra}>Stage 1 complete</div>
            <h1 className={styles.completeTitle}>To be continued</h1>
            <p className={styles.completeBody}>
              Levels 4 through 6 are in development. The Iridium / Cosmos predictive collision,
              the megaconstellation discrimination layer, and the Kessler cascade endgame are next.
            </p>
            <button className={styles.completeBtn} onClick={() => router.push('/')}>Back to menu</button>
          </div>
        )}
      </div>

      <div className={styles.help}>
        move to slice gray junk &nbsp;·&nbsp; hold <kbd>SPACE</kbd> + click (or tap on mobile) gold pulses to collect &nbsp;·&nbsp; avoid blue satellites
      </div>
    </div>
  );
}
