// Scene — the shared chrome backdrop (design-refs/cascade-visual.md §13):
// vertical gradient, Earth limb, airglow band, two star layers, orbital
// traces. Pure CSS/SVG, zero rAF — ambient drift is CSS animation and is
// disabled under prefers-reduced-motion.
import styles from './Scene.module.css';

export default function Scene() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.gradient} />
      <div className={styles.airglow} />
      <div className={styles.limb} />
      <div className={styles.stars} />
      <div className={styles.traces}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <ellipse cx="50" cy="50" rx="60" ry="14" transform="rotate(-12 50 50)" />
          <ellipse cx="50" cy="50" rx="48" ry="9" transform="rotate(8 50 50)" />
          <ellipse cx="50" cy="50" rx="72" ry="20" transform="rotate(-25 50 50)" opacity="0.5" />
          <ellipse cx="50" cy="50" rx="38" ry="6" transform="rotate(18 50 50)" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
