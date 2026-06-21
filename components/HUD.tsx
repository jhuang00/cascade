'use client';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import styles from './HUD.module.css';

export default function HUD() {
  const { screen, currentLevelIdx, score, timeRemaining, missed, destroyed, densityMeter, survivalTime } = useGameStore();
  if (screen !== 'playing') return null;

  const lv = LEVELS[currentLevelIdx];
  if (!lv) return null;

  const missWarn = lv.hardFails.missed && missed >= Math.floor((lv.hardFails.missed ?? 0) * 0.7);
  const satWarn = lv.hardFails.destroyed && destroyed >= Math.floor((lv.hardFails.destroyed ?? 0) * 0.6);

  // L6: survival display instead of score/threshold
  if (lv.isL6) {
    const mm = String(Math.floor(survivalTime / 60)).padStart(2, '0');
    const ss = String(survivalTime % 60).padStart(2, '0');
    const densityCritical = densityMeter > 70;
    const densityWarn = densityMeter > 40;
    return (
      <div className={styles.hud}>
        <div className={styles.block}>
          <span className={styles.dim}>Lv 6</span>
          {' · '}
          <span className={styles.bright}>{mm}:{ss}</span>
          <span className={styles.dim}> held</span>
        </div>
        <div className={styles.block}>
          <span className={styles.bright}>{score}</span>
          <span className={styles.dim}> pts</span>
        </div>
        <div className={styles.block}>
          <span className={styles.dim}>density </span>
          <span className={densityCritical ? styles.warn : densityWarn ? styles.caution : styles.bright}>
            {Math.round(densityMeter)}%
          </span>
        </div>
        {destroyed > 0 && (
          <div className={styles.block}>
            <span className={styles.dim}>sats hit </span>
            <span className={styles.warn}>{destroyed}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.hud}>
      <div className={styles.block}>
        <span className={styles.dim}>Lv {lv.id}</span>
        {' · '}
        <span className={styles.bright}>{timeRemaining}</span>
        <span className={styles.dim}>s</span>
      </div>
      <div className={styles.block}>
        <span className={styles.bright}>{score}</span>
        <span className={styles.dim}> / {lv.passScore} pts</span>
      </div>
      {lv.hardFails.missed != null && (
        <div className={styles.block}>
          <span className={styles.dim}>missed </span>
          <span className={missWarn ? styles.warn : styles.bright}>{missed}</span>
          <span className={styles.dim}> / {lv.hardFails.missed}</span>
        </div>
      )}
      {lv.hardFails.destroyed != null && (
        <div className={styles.block}>
          <span className={styles.dim}>sats hit </span>
          <span className={satWarn ? styles.warn : styles.bright}>{destroyed}</span>
          <span className={styles.dim}> / {lv.hardFails.destroyed}</span>
        </div>
      )}
    </div>
  );
}
