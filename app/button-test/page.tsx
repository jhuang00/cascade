'use client';
// Temporary lab page — 8 button-style explorations for the premium control
// look. Not linked from the game; visit /button-test directly. Delete after
// a direction is picked.
import Scene from '@/components/Scene';
import styles from './page.module.css';

const VARIANTS: Array<{ id: string; name: string; note: string; cls: string }> = [
  {
    id: 'A',
    name: 'Notched plaque',
    note: 'clipped corners · double frame · engraved label',
    cls: 'vA',
  },
  {
    id: 'B',
    name: 'Etched brass',
    note: 'brushed-metal frame pattern · matte center',
    cls: 'vB',
  },
  {
    id: 'C',
    name: 'Flat band + brackets',
    note: 'no gradient at all · brackets breathe on hover',
    cls: 'vC',
  },
  {
    id: 'D',
    name: 'Tick frame',
    note: 'instrument tick-mark border · diamond flanks',
    cls: 'vD',
  },
  {
    id: 'E',
    name: 'Console key',
    note: 'deep bevel · radial top-light · heavy press',
    cls: 'vE',
  },
  {
    id: 'F',
    name: 'Scanline glass',
    note: 'translucent · fine line pattern · rim light',
    cls: 'vF',
  },
  {
    id: 'G',
    name: 'Ceremonial seal',
    note: 'offset double frame · chevron flanks',
    cls: 'vG',
  },
  {
    id: 'H',
    name: 'Amber inlay',
    note: 'dark body · recessed amber channel border',
    cls: 'vH',
  },
];

export default function ButtonTestPage() {
  return (
    <div className={styles.app}>
      <Scene />
      <div className={styles.content}>
        <h1 className={styles.title}>CASCADE · BUTTON LAB</h1>
        <p className={styles.subtitle}>
          8 explorations · hover and press each · primary label shown large, ghost companion below
        </p>

        <div className={styles.grid}>
          {VARIANTS.map((v) => (
            <div key={v.id} className={styles.tile}>
              <div className={styles.tileHead}>
                <span className={styles.tileId}>{v.id}</span>
                <span className={styles.tileName}>{v.name}</span>
              </div>
              <div className={styles.tileNote}>{v.note}</div>
              <div className={styles.stage}>
                <button className={`${styles.btn} ${styles[v.cls]}`}>
                  <span className={styles.label}>Begin mission</span>
                </button>
                <button className={`${styles.btn} ${styles[v.cls]} ${styles.ghost}`}>
                  <span className={styles.label}>View missions</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
