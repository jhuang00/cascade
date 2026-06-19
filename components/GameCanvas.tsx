'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { createEngine } from '@/lib/engine';
import { recordLevelPass } from '@/lib/progress';
import type { GameDisplayState } from '@/lib/types';
import styles from './GameCanvas.module.css';

interface Props {
  levelIdx: number;
  onLevelEnd: (success: boolean, failReason?: string, l3Result?: string) => void;
}

export default function GameCanvas({ levelIdx, onLevelEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const { syncFromEngine, isMuted } = useGameStore();

  // Keep canvas pixel buffer in sync with display size × device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.round(canvas.clientWidth  * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas, {
      onDisplayUpdate: (partial: Partial<GameDisplayState>) => {
        syncFromEngine(partial);
      },
      onLevelEnd: (success, failReason, l3Result) => {
        onLevelEnd(success, failReason, l3Result);
      },
    });
    engineRef.current = engine;
    engine.startLevel(levelIdx);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [levelIdx]);

  useEffect(() => {
    engineRef.current?.setMuted(isMuted);
  }, [isMuted]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={460}
      className={styles.canvas}
    />
  );
}
