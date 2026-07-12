'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import DebugOverlay from '@/components/DebugOverlay';
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
  // True when a touch device is held in portrait — the game pauses and a
  // rotate-to-landscape prompt is shown (the playfield is too narrow upright).
  const [rotateGate, setRotateGate] = useState(false);

  const lv = LEVELS[levelIdx];

  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => setRotateGate(portrait.matches && coarse.matches);
    update();
    portrait.addEventListener('change', update);
    coarse.addEventListener('change', update);
    return () => {
      portrait.removeEventListener('change', update);
      coarse.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!lv) { router.push('/'); return; }
    // The engine no longer starts until "Begin", so seed the level index the
    // intro reads from before the engine would otherwise set it.
    syncFromEngine({ currentLevelIdx: levelIdx });
    setScreen('intro');
  }, [levelIdx]);

  useEffect(() => {
    missionStartRef.current = Date.now();
    const id = setInterval(() => {
      setMissionMs(Date.now() - missionStartRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Freeze the mission-elapsed clock while the rotate gate is up.
  const missionPauseRef = useRef<number | null>(null);
  useEffect(() => {
    if (rotateGate) {
      missionPauseRef.current = Date.now();
    } else if (missionPauseRef.current != null) {
      missionStartRef.current += Date.now() - missionPauseRef.current;
      missionPauseRef.current = null;
    }
  }, [rotateGate]);

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

  function handleLevelEnd(success: boolean, failReason?: string, extras?: { l3Result?: string; l4Result?: string; survivalTime?: number }) {
    setLevelResult(success, failReason ?? null, extras);
    setScreen('outro');
  }

  function handleRetry() {
    setEngineKey((k) => k + 1);
    setScreen('intro');
  }

  function handleMute() {
    Audio.initAudio();
    setMuted(!isMuted);
  }

  // Stop any BGM when leaving the play screen.
  useEffect(() => () => { Audio.stopMusic(); }, []);

  // M key toggles mute from anywhere on the play screen.
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

      <div className={styles.stageArea}>
      <div className={styles.canvasWrap}>
        <GameCanvas
          key={engineKey}
          levelIdx={levelIdx}
          onLevelEnd={handleLevelEnd}
          started={screen === 'playing'}
          paused={rotateGate}
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
            <div className={`${styles.pill} ${styles.pillSecondary}`}>
              <span className={styles.pillLabel}>ALT</span>
              <span className={styles.pillValue}>487 km</span>
            </div>
            <div className={`${styles.pill} ${styles.pillSecondary}`}>
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

        {/* Playtest telemetry (dev-only, ?debug=1) */}
        <DebugOverlay />

        {/* Screen overlays */}
        <LevelIntro onBegin={handleBegin} />
        <LevelOutro onRetry={handleRetry} />

        {/* Portrait rotate gate (touch devices only) */}
        {rotateGate && (
          <div className={styles.rotateGate}>
            <div className={styles.rotateIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M7 2.5a4 4 0 0 1 4 1.5M17 21.5a4 4 0 0 1-4-1.5" />
              </svg>
            </div>
            <div className={styles.rotateTitle}>Rotate your device</div>
            <p className={styles.rotateBody}>Turn your phone sideways to play Cascade in landscape.</p>
          </div>
        )}

        {/* Complete screen */}
        {screen === 'complete' && (
          <div className={styles.completeScreen}>
            <div className={styles.completeEra}>All six levels complete</div>
            <h1 className={styles.completeTitle}>There is no level 7.</h1>
            <p className={styles.completeBody}>
              The European Space Agency's ClearSpace-1 mission will be the first attempt
              in history to remove a single piece of orbital debris. The contract is €86 million.
              Objects in orbit larger than 1 cm: over 1,200,000.
            </p>
            <p className={styles.completeBody} style={{ marginTop: '0.5rem', opacity: 0.6, fontSize: '0.85em' }}>
              You have just played through 68 years of inaction.
            </p>
            <button className={styles.completeBtn} onClick={() => router.push('/')}>Back to start</button>
          </div>
        )}
      </div>
      </div>

      <div className={styles.help}>
        <span className={styles.helpDesktop}>
          move to slice gray junk &nbsp;·&nbsp; hold <kbd>SPACE</kbd> + click gold pulses to collect &nbsp;·&nbsp; avoid blue satellites
        </span>
        <span className={styles.helpMobile}>
          swipe to slice gray junk &nbsp;·&nbsp; tap gold pulses to collect &nbsp;·&nbsp; avoid blue satellites
        </span>
      </div>
    </div>
  );
}
