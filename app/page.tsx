'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/progress';
import * as Audio from '@/lib/audio';
import { LEVELS } from '@/data/levels';
import { useGameStore } from '@/store/gameStore';
import styles from './page.module.css';

export default function MenuPage() {
  const router = useRouter();
  const reset = useGameStore((s) => s.reset);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [bestScores, setBestScores] = useState<Record<number, number>>({});
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const p = loadProgress();
    setUnlockedLevel(p.unlockedLevel);
    setBestScores(p.bestScores);
  }, []);

  function handleStart() {
    Audio.initAudio();
    Audio.playClick();
    reset();
    router.push('/play/1');
  }

  function handleLevel(levelId: number) {
    if (levelId > unlockedLevel) return;
    Audio.initAudio();
    Audio.playClick();
    reset();
    router.push(`/play/${levelId}`);
  }

  function toggleMute() {
    Audio.initAudio();
    const next = !muted;
    setMuted(next);
    Audio.setMuted(next);
  }

  return (
    <div className={styles.app}>
      <div className={styles.titleBar}>
        <div className={styles.titleLeft}>
          <span className={styles.dot} />
          <span>Cascade · LEO debris tracking station</span>
        </div>
        <button className={styles.muteBtn} onClick={toggleMute}>
          Sound: {muted ? 'off' : 'on'}
        </button>
      </div>

      <div className={styles.canvasWrap}>
        <div className={styles.menuScreen}>
          <div className={styles.era}>A web game by JH</div>
          <h1 className={styles.gameTitle}>Cascade</h1>
          <p className={styles.tagline}>slicing through the history of orbital debris</p>
          <p className={styles.backstory}>
            Six levels. The real history of low Earth orbit, played out as cuts and catches.
            The labels are real. The numbers are real. The cascade is real.
          </p>

          {unlockedLevel > 1 && (
            <div className={styles.levelSelect}>
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  className={`${styles.levelBtn} ${lv.id > unlockedLevel ? styles.locked : ''}`}
                  onClick={() => handleLevel(lv.id)}
                  disabled={lv.id > unlockedLevel}
                  title={lv.id > unlockedLevel ? 'Locked' : `Best: ${bestScores[lv.id] ?? '—'}`}
                >
                  <span className={styles.levelNum}>L{lv.id}</span>
                  <span className={styles.levelName}>{lv.title}</span>
                  {bestScores[lv.id] && <span className={styles.levelBest}>{bestScores[lv.id]} pts</span>}
                  {lv.id > unlockedLevel && <span className={styles.levelLock}>locked</span>}
                </button>
              ))}
            </div>
          )}

          <button className={styles.startBtn} onClick={handleStart}>
            {unlockedLevel > 1 ? 'Restart from L1' : 'Start'}
          </button>
        </div>
      </div>

      <div className={styles.help}>
        move to slice gray junk &nbsp;·&nbsp; hold <kbd>SPACE</kbd> + click (or tap on mobile) gold pulses to collect &nbsp;·&nbsp; avoid blue satellites
      </div>
    </div>
  );
}
