'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import { recordLevelPass } from '@/lib/progress';
import * as Audio from '@/lib/audio';
import styles from './Screen.module.css';

interface Props {
  onRetry: () => void;
}

const COUNT_DURATION_MS = 900;

export default function LevelOutro({ onRetry }: Props) {
  const router = useRouter();
  const {
    screen, currentLevelIdx, score, cleared, missed, collected, destroyed,
    resultSuccess, failReason, l3Result, fy1cSaved, l4Result, survivalTime,
    setScreen,
  } = useGameStore();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (screen !== 'outro') return;
    setDisplayScore(0);
    const start = performance.now();
    const target = score;
    let rafId: number;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / COUNT_DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (t < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [screen, score]);

  if (screen !== 'outro') return null;

  const lv = LEVELS[currentLevelIdx];
  if (!lv) return null;

  const isLast = currentLevelIdx >= LEVELS.length - 1;

  let resultLabel = resultSuccess ? 'Level passed' : 'Level failed';
  let resultClass = resultSuccess ? styles.success : styles.failure;
  let scoreClass = resultSuccess ? styles.scorePass : styles.scoreFail;
  let outroFact = lv.outroFact;
  let headline = '';

  // ── L6 epilogue ──────────────────────────────────────────────────────────
  if (lv.isL6) {
    const mm = String(Math.floor(survivalTime / 60)).padStart(2, '0');
    const ss = String(survivalTime % 60).padStart(2, '0');
    return (
      <div className={styles.screen}>
        <div className={`${styles.resultLabel} ${styles.cascade}`}>Cascade reached</div>
        <h1 className={styles.title}>The math has already decided.</h1>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{mm}:{ss}</span>
            <span className={styles.statLabel}>Survived</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{cleared}</span>
            <span className={styles.statLabel}>Cleared</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{collected}</span>
            <span className={styles.statLabel}>Collected</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{score}</span>
            <span className={styles.statLabel}>Score</span>
          </div>
        </div>

        <div className={styles.factCard}>
          <h3 className={styles.factTitle}>From the catalog</h3>
          <p className={styles.factBody}>{outroFact}</p>
        </div>

        <p className={styles.epilogue}>There is no level 7.</p>

        <button className={styles.primary} onClick={() => { Audio.playClick(); setScreen('complete'); }}>
          Continue
        </button>
        <button className={styles.secondary} onClick={() => { Audio.playClick(); router.push('/'); }}>
          Back to menu
        </button>
      </div>
    );
  }

  // ── L3 outcomes ──────────────────────────────────────────────────────────
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

  // ── L4 outcomes ──────────────────────────────────────────────────────────
  if (lv.isL4) {
    if (l4Result === 'saved') {
      resultLabel = 'Level passed · collision averted';
      resultClass = styles.alternate;
      scoreClass = styles.scoreAlt;
      headline = 'Iridium 33 deflected';
      outroFact = "In reality, nobody intervened. Cosmos 2251 had been drifting dead since 1995. Iridium 33 was a commercial satellite with no maneuvering capability left. They collided at 790 km altitude at 11.7 km/s, producing 1,632 catalogued fragments. Most are still in orbit today. You just played the intervention that never happened.";
    } else if (l4Result === 'deflected') {
      resultLabel = 'Level passed · dead satellite cleared';
      headline = 'Cosmos 2251 destroyed';
      outroFact = "Cosmos 2251 was a defunct Soviet military satellite that had been drifting since 1995, completely uncontrolled. In reality, no one destroyed it before it could collide. The collision it caused with Iridium 33 in 2009 added 1,632 catalogued fragments to low Earth orbit — most still present today.";
    } else if (l4Result === 'cleaned') {
      headline = 'Collision aftermath cleared';
    } else if (l4Result === 'fail-score') {
      headline = 'Score threshold not reached';
      outroFact = "The real collision generated 1,632 catalogued fragments from a single 3-second event. The debris spread over hundreds of kilometers of altitude, crossing the paths of nearly every active LEO satellite. Most fragments are still in orbit. The cleanup never happened.";
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
          {displayScore}
          {!lv.isL6 && (
            <> <span className={styles.scoreDivider}>/</span> {lv.passScore}</>
          )}
        </div>
        <div className={styles.scoreLabel}>
          {lv.isL6 ? 'final score' : 'your score · required to pass'}
        </div>
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
        {lv.isL4 && (
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {l4Result === 'saved' ? 'averted' : l4Result === 'deflected' ? 'deflected' : 'collision'}
            </span>
            <span className={styles.statLabel}>Collision</span>
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
