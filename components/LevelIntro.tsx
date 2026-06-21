'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import TutorialCard from '@/components/TutorialCard';
import * as Audio from '@/lib/audio';
import styles from './Screen.module.css';

interface Props {
  onBegin: () => void;
}

const CHARS_PER_TICK = 2;
const TICK_MS = 28;

export default function LevelIntro({ onBegin }: Props) {
  const { screen, currentLevelIdx } = useGameStore();
  const lv = LEVELS[currentLevelIdx];
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (screen !== 'intro' || !lv) return;
    setDisplayed('');
    setDone(false);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += CHARS_PER_TICK;
      if (idx >= lv.backstory.length) {
        setDisplayed(lv.backstory);
        setDone(true);
        clearInterval(intervalRef.current!);
      } else {
        setDisplayed(lv.backstory.slice(0, idx));
      }
    }, TICK_MS);
    return () => clearInterval(intervalRef.current!);
  }, [screen, currentLevelIdx]);

  if (screen !== 'intro' || !lv) return null;

  function handleBegin() {
    Audio.initAudio();
    Audio.playClick();
    onBegin();
  }

  function skipTypewriter() {
    if (!done) {
      clearInterval(intervalRef.current!);
      setDisplayed(lv!.backstory);
      setDone(true);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.era}>{lv.era}</div>
      <h1 className={styles.title}>{lv.title}</h1>
      <p className={styles.backstory} onClick={skipTypewriter} style={{ cursor: done ? 'default' : 'pointer' }}>
        {displayed}
        {!done && <span className={styles.cursor}>▌</span>}
      </p>
      {done && lv.tutorials.map((t, i) => (
        <TutorialCard key={i} tutorial={t} />
      ))}
      {done && <button className={styles.primary} onClick={handleBegin}>Begin</button>}
    </div>
  );
}
