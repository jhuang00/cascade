import type { TutorialDef } from '@/lib/types';
import styles from './TutorialCard.module.css';

export default function TutorialCard({ tutorial }: { tutorial: TutorialDef }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{tutorial.title}</h3>
      <p className={styles.body}>{tutorial.body}</p>
    </div>
  );
}
