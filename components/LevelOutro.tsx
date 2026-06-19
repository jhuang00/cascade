'use client';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import { recordLevelPass } from '@/lib/progress';
import * as Audio from '@/lib/audio';
import styles from './Screen.module.css';

interface Props {
  onRetry: () => void;
}

export default function LevelOutro({ onRetry }: Props) {
  const router = useRouter();
  const {
    screen, currentLevelIdx, score, cleared, missed, collected, destroyed,
    resultSuccess, failReason, l3Result, fy1cSaved, setScreen,
  } = useGameStore();

  if (screen !== 'outro') return null;

  const lv = LEVELS[currentLevelIdx];
  if (!lv) return null;

  const isLast = currentLevelIdx >= LEVELS.length - 1;

  let resultLabel = resultSuccess ? 'Level passed' : 'Level failed';
  let resultClass = resultSuccess ? styles.success : styles.failure;
  let scoreClass = resultSuccess ? styles.scorePass : styles.scoreFail;
  let outroFact = lv.outroFact;
  let headline = '';

  if (lv.isL3) {
    if (l3Result === 'alternate') {
      resultLabel = 'Level passed · alternate timeline';
      resultClass = styles.alternate;
      scoreClass = styles.scoreAlt;
      headline = 'FY-1C preserved';
      outroFact = "In reality, FY-1C was destroyed on January 11, 2007 — the largest debris-creation event in history. China's ASAT test generated over 3,500 catalogued fragments at altitudes from 200 to 4,000 km. Nineteen years later, more than 3,000 of those fragments are still in orbit. You just played the alternate timeline.";
    } else if (l3Result === 'pass') {
      headline = 'Aftermath cleared';
    } else if (l3Result === 'fail-destroyed') {
      headline = `${destroyed} active satellites destroyed`;
      outroFact = "Slicing active satellites is the worst possible outcome — each destruction produces thousands of debris fragments. In the real world, one such event in 2007 still threatens the ISS in 2026.";
    } else {
      headline = 'Score threshold not met';
      outroFact = "China's 2007 ASAT test generated over 3,500 catalogued fragments. Nineteen years later, more than 3,000 are still in orbit. The real cleanup never happened. We could not clear them then. We cannot clear them now.";
    }
  }

  function handleNext() {
    Audio.playClick();
    if (resultSuccess) recordLevelPass(lv.id, score);
    if (isLast) {
      setScreen('complete');
    } else {
      router.push(`/play/${currentLevelIdx + 2}`);
    }
  }

  function handleRetry() {
    Audio.playClick();
    onRetry();
  }

  function handleMenu() {
    Audio.playClick();
    router.push('/');
  }

  return (
    <div className={styles.screen}>
      <div className={`${styles.resultLabel} ${resultClass}`}>{resultLabel}</div>
      <h1 className={styles.title}>{headline || lv.title}</h1>

      {!resultSuccess && failReason && (
        <div className={styles.failReason}>{failReason}</div>
      )}

      <div className={`${styles.scoreDisplay} ${scoreClass}`}>
        <div className={styles.scoreMain}>
          {score} <span className={styles.scoreDivider}>/</span> {lv.passScore}
        </div>
        <div className={styles.scoreLabel}>your score · required to pass</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{cleared}</span>
          <span className={styles.statLabel}>Cleared</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{collected}</span>
          <span className={styles.statLabel}>Collected</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{missed}</span>
          <span className={styles.statLabel}>Missed</span>
        </div>
        {lv.isL3 && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{fy1cSaved ? 'yes' : 'no'}</span>
            <span className={styles.statLabel}>FY-1C saved</span>
          </div>
        )}
        {lv.hardFails.destroyed && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{destroyed}</span>
            <span className={styles.statLabel}>Sats hit</span>
          </div>
        )}
      </div>

      <div className={styles.factCard}>
        <h3 className={styles.factTitle}>From the catalog</h3>
        <p className={styles.factBody}>{outroFact}</p>
      </div>

      {resultSuccess ? (
        <button className={styles.primary} onClick={handleNext}>
          {isLast ? 'Continue' : 'Next level'}
        </button>
      ) : (
        <button className={styles.primary} onClick={handleRetry}>Retry</button>
      )}
      <button className={styles.secondary} onClick={handleMenu}>Back to menu</button>
    </div>
  );
}
