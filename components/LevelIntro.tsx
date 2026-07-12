'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import TutorialCard from '@/components/TutorialCard';
import Illustration from '@/components/Illustration';
import Sigil from '@/components/Sigil';
import * as Audio from '@/lib/audio';
import styles from './Screen.module.css';

interface Props {
  onBegin: () => void;
}

const CHARS_PER_TICK = 2;
const TICK_MS = 28;
// How long the finished backstory holds on screen before auto-advancing.
const BACKSTORY_PAUSE_MS = 1500;

export default function LevelIntro({ onBegin }: Props) {
  const { screen, currentLevelIdx } = useGameStore();
  const lv = LEVELS[currentLevelIdx];
  // frame 0 = backstory; frames 1..N = one instruction block each.
  const [frame, setFrame] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to the backstory frame whenever the screen or level changes.
  useEffect(() => {
    if (screen !== 'intro' || !lv) return;
    setFrame(0);
    setDisplayed('');
    setTypingDone(false);
  }, [screen, currentLevelIdx]);

  // Typewriter for the backstory frame.
  useEffect(() => {
    if (screen !== 'intro' || !lv || frame !== 0) return;
    setDisplayed('');
    setTypingDone(false);
    let idx = 0;
    typeRef.current = setInterval(() => {
      idx += CHARS_PER_TICK;
      if (idx >= lv.backstory.length) {
        setDisplayed(lv.backstory);
        setTypingDone(true);
        if (typeRef.current) clearInterval(typeRef.current);
      } else {
        setDisplayed(lv.backstory.slice(0, idx));
      }
    }, TICK_MS);
    return () => { if (typeRef.current) clearInterval(typeRef.current); };
  }, [screen, currentLevelIdx, frame]);

  // Once the backstory finishes typing, hold briefly, then auto-advance.
  useEffect(() => {
    if (frame !== 0 || !typingDone) return;
    pauseRef.current = setTimeout(() => setFrame(1), BACKSTORY_PAUSE_MS);
    return () => { if (pauseRef.current) clearTimeout(pauseRef.current); };
  }, [typingDone, frame]);

  if (screen !== 'intro' || !lv) return null;

  // Backstory frame: clicking finishes the typewriter, or advances if done.
  function handleBackstoryClick() {
    if (!typingDone) {
      if (typeRef.current) clearInterval(typeRef.current);
      setDisplayed(lv!.backstory);
      setTypingDone(true);
    } else {
      if (pauseRef.current) clearTimeout(pauseRef.current);
      setFrame(1);
    }
  }

  function handleContinue() {
    Audio.initAudio();
    Audio.playClick();
    // Clamp so a rapid double-click can't skip past the last instruction
    // frame (frame N maps to the final tutorial) into a blank overlay.
    setFrame((f) => Math.min(f + 1, lv!.tutorials.length));
  }

  function handleBack() {
    Audio.initAudio();
    Audio.playClick();
    // Frame 0 is the backstory; backing into it replays the typewriter.
    setFrame((f) => Math.max(f - 1, 0));
  }

  function handleBegin() {
    Audio.initAudio();
    Audio.playClick();
    onBegin();
  }

  // ── Frame 0: era + title + typewriter backstory ──
  if (frame === 0) {
    return (
      <div className={styles.screen}>
        <div className={styles.sigilSlot}>
          <Sigil level={lv.id} width={84} />
        </div>
        <div className={styles.era}>{lv.era}</div>
        <h1 className={styles.title}>{lv.title}</h1>
        <p
          className={styles.backstory}
          onClick={handleBackstoryClick}
          style={{ cursor: 'pointer' }}
        >
          {displayed}
          {!typingDone && <span className={styles.cursor}>▌</span>}
        </p>
        <button className={styles.skip} onClick={handleBegin}>
          Skip briefing ›
        </button>
      </div>
    );
  }

  // ── Frames 1..N: one instruction block per frame ──
  const tutorialIdx = frame - 1;
  const tutorial = lv.tutorials[tutorialIdx];
  if (!tutorial) return null;
  const isLast = tutorialIdx === lv.tutorials.length - 1;

  return (
    <div className={styles.screen}>
      <div className={styles.stepHeader}>
        <span className={styles.stepEyebrow}>L{lv.id} · {lv.title}</span>
        <span className={styles.stepCount}>{tutorialIdx + 1} / {lv.tutorials.length}</span>
      </div>
      <div className={styles.cols}>
        {tutorial.illustration && (
          <div className={styles.colA}>
            <Illustration kind={tutorial.illustration} />
          </div>
        )}
        <div className={styles.colB}>
          <TutorialCard tutorial={tutorial} />
          <div className={styles.introNav}>
            <button className={`btn btnGhost ${styles.secondary}`} onClick={handleBack}>
              ‹ Back
            </button>
            {isLast ? (
              <button className={`btn btnPrimary ${styles.primary}`} onClick={handleBegin}>Begin</button>
            ) : (
              <button className={`btn btnPrimary ${styles.primary}`} onClick={handleContinue}>Next ›</button>
            )}
          </div>
        </div>
      </div>
      <button className={styles.skip} onClick={handleBegin}>
        Skip briefing ›
      </button>
    </div>
  );
}
