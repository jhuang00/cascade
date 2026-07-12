'use client';
// Audio lab — dev-only listening room for A/B-ing SFX candidates and checking
// the mix. Not linked from the game; open /audio-test directly.

import { useEffect, useState } from 'react';
import * as Audio from '@/lib/audio';
import { ambientBGM, tensionBGM } from '@/lib/music';
import { useGameStore } from '@/store/gameStore';
import styles from './page.module.css';

const VARIANTS: { id: Audio.SliceVariant; name: string; blurb: string }[] = [
  { id: 'A', name: 'Layered knife', blurb: 'transient bite + noise body + metallic shimmer' },
  { id: 'B', name: 'Metallic shear', blurb: 'comb-resonant "shing" of blade on alloy' },
  { id: 'C', name: 'Enhanced warm cut', blurb: 'current sound + transient + longer tail' },
];

const FLAVORS: Audio.SliceFlavor[] = ['junk', 'fragment', 'rare'];

export default function AudioTestPage() {
  const [variant, setVariant] = useState<Audio.SliceVariant>('A');
  const [velocity, setVelocity] = useState(0.5);
  const [pan, setPan] = useState(0);
  const [density, setDensity] = useState(0);
  const [bgm, setBgm] = useState<'off' | 'ambient' | 'tension'>('off');
  const isMuted = useGameStore((s) => s.isMuted);
  const setMuted = useGameStore((s) => s.setMuted);

  useEffect(() => {
    setVariant(Audio.getSliceVariant());
    return () => { Audio.stopMusic(); };
  }, []);

  // The cascade layer smooths toward the slider value, mirroring gameplay.
  // (setCascadeIntensity no-ops safely before the AudioContext exists.)
  useEffect(() => {
    if (density > 0) Audio.initAudio();
    Audio.setCascadeIntensity(density);
  }, [density]);

  function armed(fn: () => void): () => void {
    return () => {
      Audio.initAudio();
      fn();
    };
  }

  function pickVariant(v: Audio.SliceVariant) {
    setVariant(v);
    Audio.setSliceVariant(v);
    Audio.initAudio();
    Audio.playSliceVariant(v, { velocity, pan });
  }

  function startBgm(kind: 'ambient' | 'tension') {
    Audio.initAudio();
    Audio.startMusic(kind === 'ambient' ? ambientBGM : tensionBGM);
    setBgm(kind);
  }

  function stopBgm() {
    Audio.stopMusic();
    setBgm('off');
    setDensity(0);
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>CASCADE · AUDIO LAB</h1>
      <p className={styles.note}>
        Dev-only listening room. The selected slice variant persists and is used in-game.
      </p>

      <section className={styles.section}>
        <h2>Slice candidates <span className={styles.dim}>— pick one, it saves</span></h2>
        <div className={styles.row}>
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              data-testid={`slice-${v.id}`}
              className={variant === v.id ? styles.selected : styles.btn}
              onClick={() => pickVariant(v.id)}
            >
              <strong>{v.id} · {v.name}</strong>
              <span>{v.blurb}</span>
            </button>
          ))}
        </div>
        <div className={styles.row}>
          {FLAVORS.map((f) => (
            <button
              key={f}
              className={styles.btnSmall}
              onClick={armed(() => Audio.playSliceVariant(variant, { velocity, pan, flavor: f }))}
            >
              slice · {f}
            </button>
          ))}
          <button className={styles.btnSmall} onClick={armed(() => {
            // Rapid triple-cut: how it reads under real gameplay density
            Audio.playSliceVariant(variant, { velocity: 0.9, pan: -0.5 });
            setTimeout(() => Audio.playSliceVariant(variant, { velocity: 0.6, pan: 0.1 }), 90);
            setTimeout(() => Audio.playSliceVariant(variant, { velocity: 0.8, pan: 0.6 }), 200);
          })}>
            rapid ×3
          </button>
        </div>
        <label className={styles.slider}>
          velocity {velocity.toFixed(2)}
          <input type="range" min={0} max={1} step={0.05} value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))} />
        </label>
        <label className={styles.slider}>
          pan {pan.toFixed(2)}
          <input type="range" min={-0.85} max={0.85} step={0.05} value={pan}
            onChange={(e) => setPan(Number(e.target.value))} />
        </label>
        <div className={styles.row}>
          <button className={styles.btnSmall} data-testid="pan-left" onClick={armed(() => Audio.playSliceVariant(variant, { velocity, pan: -0.85 }))}>pan hard L</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playSliceVariant(variant, { velocity, pan: 0 }))}>center</button>
          <button className={styles.btnSmall} data-testid="pan-right" onClick={armed(() => Audio.playSliceVariant(variant, { velocity, pan: 0.85 }))}>pan hard R</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>One-shots</h2>
        <div className={styles.row}>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playCollect(pan))}>collect</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playActiveHit(pan))}>active hit</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playExplosion(pan))}>explosion</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playMissileLaunch())}>missile</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playClick())}>ui click</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playLevelWin())}>win</button>
          <button className={styles.btnSmall} onClick={armed(() => Audio.playLevelLose())}>lose</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Music + ambience</h2>
        <div className={styles.row}>
          <button className={bgm === 'ambient' ? styles.selectedSmall : styles.btnSmall} onClick={() => startBgm('ambient')}>ambient BGM + bed</button>
          <button className={bgm === 'tension' ? styles.selectedSmall : styles.btnSmall} onClick={() => startBgm('tension')}>tension BGM</button>
          <button className={styles.btnSmall} onClick={stopBgm}>stop</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>L6 cascade layer <span className={styles.dim}>— drag density, drone follows</span></h2>
        <label className={styles.slider}>
          density {density}
          <input type="range" min={0} max={100} step={1} value={density}
            onChange={(e) => setDensity(Number(e.target.value))} />
        </label>
      </section>

      <section className={styles.section}>
        <h2>Mute</h2>
        <button className={styles.btnSmall} data-testid="mute-toggle" onClick={() => setMuted(!isMuted)}>
          {isMuted ? 'unmute' : 'mute'} (currently {isMuted ? 'MUTED' : 'live'})
        </button>
      </section>
    </main>
  );
}
