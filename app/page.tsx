'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/progress';
import * as Audio from '@/lib/audio';
import { useGameStore } from '@/store/gameStore';
import Scene from '@/components/Scene';
import styles from './page.module.css';

export default function MenuPage() {
  const router = useRouter();
  const reset = useGameStore((s) => s.reset);
  const isMuted = useGameStore((s) => s.isMuted);
  const setMuted = useGameStore((s) => s.setMuted);
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  useEffect(() => {
    setUnlockedLevel(loadProgress().unlockedLevel);
  }, []);

  function handleBegin() {
    Audio.initAudio();
    Audio.playClick();
    reset();
    router.push(`/play/${unlockedLevel}`);
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

      <button className={styles.soundToggle} onClick={toggleMute}>
        Sound [ {isMuted ? 'OFF' : 'ON'} ]
      </button>

      <div className={styles.wordmarkWrap}>
        <h1 className={styles.wordmark}>CASCADE</h1>
        <div className={styles.subtitle}>
          <span className={styles.subtitleRule} />
          <span className={styles.subtitleLabel}>Orbital debris / 1958 — present</span>
          <span className={styles.subtitleRule} />
        </div>
      </div>

      <nav className={styles.menuNav}>
        <button className={styles.menuItem} onClick={handleBegin}>
          Begin mission
        </button>
      </nav>

      <div className={styles.signature}>
        CASCADE.MCC · CATALOG NORAD / NASA-ODPO
      </div>
    </div>
  );
}
