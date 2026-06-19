'use client';
import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/data/levels';
import TutorialCard from '@/components/TutorialCard';
import * as Audio from '@/lib/audio';
import styles from './Screen.module.css';

interface Props {
  onBegin: () => void;
}

export default function LevelIntro({ onBegin }: Props) {
  const { screen, currentLevelIdx } = useGameStore();
  if (screen !== 'intro') return null;

  const lv = LEVELS[currentLevelIdx];
  if (!lv) return null;

  function handleBegin() {
    Audio.initAudio();
    Audio.playClick();
    onBegin();
  }

  return (
    <div className={styles.screen}>
      <div className={styles.era}>{lv.era}</div>
      <h1 className={styles.title}>{lv.title}</h1>
      <p className={styles.backstory}>{lv.backstory}</p>
      {lv.tutorials.map((t, i) => (
        <TutorialCard key={i} tutorial={t} />
      ))}
      <button className={styles.primary} onClick={handleBegin}>Begin</button>
    </div>
  );
}
