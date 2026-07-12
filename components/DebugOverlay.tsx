'use client';
// Playtest telemetry overlay — only rendered when the page URL has ?debug=1.
// Shows recorded run count and the last run's summary; exports/clears the log.

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import * as Telemetry from '@/lib/telemetry';

export default function DebugOverlay() {
  const screen = useGameStore((s) => s.screen);
  const [enabled, setEnabled] = useState(false);
  const [runs, setRuns] = useState<Telemetry.RunRecord[]>([]);

  useEffect(() => { setEnabled(Telemetry.telemetryEnabled()); }, []);

  // Refresh after each run ends (screen flips to outro) and on mount.
  useEffect(() => {
    if (enabled) setRuns(Telemetry.getRuns());
  }, [enabled, screen]);

  if (!enabled) return null;

  const last = runs[runs.length - 1];

  return (
    <div style={{
      position: 'fixed', top: 8, right: 8, zIndex: 1000,
      background: 'rgba(6,10,18,0.92)', border: '1px solid #7ac0e8',
      color: '#9fd6f5', font: '11px ui-monospace, Menlo, monospace',
      padding: '8px 10px', maxWidth: 260, pointerEvents: 'auto',
    }}>
      <div style={{ color: '#7ac0e8', letterSpacing: '0.1em' }}>TELEMETRY · {runs.length} runs</div>
      {last && (
        <div style={{ marginTop: 4, opacity: 0.9 }}>
          last: L{last.level} {last.result} · {last.finalScore} pts · {last.durationS}s
          {last.survivalTime !== undefined && ` · survived ${last.survivalTime}s`}
          <br />
          cleared {last.cleared} · missed {last.missed} · destroyed {last.destroyed}
        </div>
      )}
      <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
        <button style={btn} onClick={() => Telemetry.downloadRuns()}>export json</button>
        <button style={btn} onClick={() => { Telemetry.clearRuns(); setRuns([]); }}>clear</button>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: '#0a1522', border: '1px solid #1d3a52', color: '#9fd6f5',
  font: 'inherit', padding: '3px 8px', cursor: 'pointer',
};
