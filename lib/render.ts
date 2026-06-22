import type { GameObject, MissileObj } from '@/lib/types';
import type { L3Phase } from '@/lib/types';

export function drawJunk(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number): void {
  if (!o.verts) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot);
  ctx.fillStyle = o.color;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  o.verts.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  const half = o.verts.slice(0, Math.ceil(o.verts.length / 2) + 1);
  half.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawActive(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number): void {
  o.glowPhase = (o.glowPhase ?? 0) + 0.04;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(o.x, o.y);
  const glowA = 0.14 + Math.sin(o.glowPhase) * 0.04;
  ctx.fillStyle = `rgba(95,179,255,${glowA})`;
  ctx.beginPath();
  ctx.arc(0, 0, o.r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(o.rot * 0.3);
  ctx.fillStyle = '#2d4a7c';
  ctx.fillRect(-o.r * 2, -2, o.r * 0.9, 4);
  ctx.fillRect(o.r * 1.1, -2, o.r * 0.9, 4);
  ctx.fillStyle = '#cfd9e6';
  ctx.fillRect(-o.r * 0.6, -o.r * 0.55, o.r * 1.2, o.r * 1.1);
  ctx.fillStyle = '#5fb3ff';
  ctx.fillRect(-1, -o.r * 0.8, 2, 4);
  ctx.restore();
}

// Dead satellite (Cosmos 2251) — gray, tumbling, larger than active
export function drawDeadSat(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot);
  // Very faint haze (no active glow)
  ctx.fillStyle = 'rgba(120,120,130,0.08)';
  ctx.beginPath();
  ctx.arc(0, 0, o.r * 1.7, 0, Math.PI * 2);
  ctx.fill();
  // Degraded solar panels (rust-brown)
  ctx.fillStyle = '#5a4f3a';
  ctx.fillRect(-o.r * 2.1, -2.5, o.r * 0.95, 5);
  ctx.fillRect(o.r * 1.15, -2.5, o.r * 0.95, 5);
  // Body (darker, weathered)
  ctx.fillStyle = '#8a8890';
  ctx.fillRect(-o.r * 0.65, -o.r * 0.58, o.r * 1.3, o.r * 1.16);
  ctx.fillStyle = '#6a6870';
  ctx.fillRect(-1, -o.r * 0.85, 2, 4);
  // Rust streaks
  ctx.strokeStyle = 'rgba(160,100,60,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-o.r * 0.4, -o.r * 0.5);
  ctx.lineTo(-o.r * 0.2, o.r * 0.3);
  ctx.stroke();
  ctx.restore();
}

export function drawRare(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number, collectMode: boolean): void {
  if (!o.verts) return;
  o.pulse = (o.pulse ?? 0) + 0.08;
  const pulseR = o.r + Math.sin(o.pulse) * 3 + 6;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(o.x, o.y);
  const auraBoost = collectMode ? 0.12 : 0;
  ctx.fillStyle = `rgba(255,200,116,${0.22 + Math.sin(o.pulse) * 0.08 + auraBoost})`;
  ctx.beginPath();
  ctx.arc(0, 0, pulseR + (collectMode ? 3 : 0), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,160,0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, o.r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(o.rot);
  ctx.fillStyle = o.color;
  ctx.strokeStyle = 'rgba(180,110,30,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  o.verts.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawFY1C(ctx: CanvasRenderingContext2D, o: GameObject, phase: L3Phase): void {
  o.pulse = (o.pulse ?? 0) + 0.06;
  const pulseR = o.r * 2.2 + Math.sin(o.pulse) * 4;
  ctx.save();
  ctx.translate(o.x, o.y);
  const targeted = phase === 'approach';
  const auraColor = targeted
    ? `rgba(255,90,90,${0.18 + Math.sin(o.pulse) * 0.08})`
    : `rgba(95,179,255,${0.16 + Math.sin(o.pulse) * 0.05})`;
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
  ctx.fill();
  if (targeted) {
    ctx.strokeStyle = `rgba(255,90,90,${0.5 + Math.sin(o.pulse * 2) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, o.r * 2.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#2d4a7c';
  ctx.fillRect(-o.r * 2.2, -3, o.r * 1.0, 6);
  ctx.fillRect(o.r * 1.2, -3, o.r * 1.0, 6);
  ctx.fillStyle = '#dfe7f2';
  ctx.fillRect(-o.r * 0.7, -o.r * 0.6, o.r * 1.4, o.r * 1.2);
  ctx.fillStyle = targeted ? '#ff5a5a' : '#5fb3ff';
  ctx.fillRect(-1, -o.r * 0.9, 2, 5);
  ctx.restore();

  if (phase === 'appear' || phase === 'approach') {
    ctx.save();
    ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'left';
    ctx.fillText(o.label, o.x + 28, o.y - 2);
    if (o.sublabel) {
      ctx.font = '10px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.fillStyle = 'rgba(180,180,200,0.7)';
      ctx.fillText(o.sublabel, o.x + 28, o.y + 12);
    }
    ctx.restore();
  }
}

// L4 cinematic satellites with trajectory lines
export function drawCinematicSat(
  ctx: CanvasRenderingContext2D,
  o: GameObject,
  convergencePoint: { x: number; y: number },
  isCritical: boolean,
): void {
  if (o.isDeadSat) {
    drawDeadSat(ctx, o, 1);
  } else {
    drawActive(ctx, o, 1);
  }

  // Label
  ctx.save();
  ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = o.isDeadSat ? 'rgba(180,170,160,0.9)' : 'rgba(180,220,255,0.95)';
  ctx.textAlign = 'left';
  // Place each label on the outward side of the convergence point so the two
  // satellites' labels stay separated (and legible) as they close in.
  const labelX = o.x < convergencePoint.x ? o.x - o.r - 8 : o.x + o.r + 8;
  const labelAlign = o.x < convergencePoint.x ? 'right' : 'left';
  ctx.textAlign = labelAlign;
  ctx.fillText(o.label, labelX, o.y - 6);
  if (o.sublabel) {
    ctx.font = '9px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = 'rgba(140,130,120,0.7)';
    ctx.fillText(o.sublabel, labelX, o.y + 6);
  }
  ctx.restore();

  // Trajectory line to convergence point
  const lineAlpha = isCritical ? 0.7 + Math.sin(Date.now() / 80) * 0.3 : 0.45;
  const lineColor = o.isDeadSat
    ? `rgba(180,140,100,${lineAlpha})`
    : `rgba(95,179,255,${lineAlpha})`;
  ctx.save();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(convergencePoint.x, convergencePoint.y);
  ctx.stroke();
  ctx.setLineDash([]);
  // Convergence marker
  ctx.strokeStyle = isCritical ? `rgba(255,80,80,${lineAlpha})` : `rgba(255,180,80,${lineAlpha * 0.8})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(convergencePoint.x, convergencePoint.y, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(convergencePoint.x - 12, convergencePoint.y);
  ctx.lineTo(convergencePoint.x + 12, convergencePoint.y);
  ctx.moveTo(convergencePoint.x, convergencePoint.y - 12);
  ctx.lineTo(convergencePoint.x, convergencePoint.y + 12);
  ctx.stroke();
  ctx.restore();
}

export function drawMissile(ctx: CanvasRenderingContext2D, missile: MissileObj, fy1cPos: { x: number; y: number } | null): void {
  ctx.save();
  ctx.translate(missile.x, missile.y);
  ctx.fillStyle = '#ff5a3a';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,160,80,0.45)';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < missile.trail.length; i++) {
    const p = missile.trail[i];
    const a = (i / missile.trail.length) * 0.6;
    ctx.fillStyle = `rgba(255,140,60,${a})`;
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  }

  if (fy1cPos) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,90,90,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(missile.x, missile.y);
    ctx.lineTo(fy1cPos.x, fy1cPos.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// L6 density meter — thin strip at top of canvas
export function drawDensityMeter(ctx: CanvasRenderingContext2D, density: number, W: number): void {
  const barH = 6;
  const filled = Math.min(1, density / 100) * W;
  const critical = density > 70;
  const warning = density > 40;

  // Background track
  ctx.save();
  ctx.fillStyle = 'rgba(30,30,40,0.7)';
  ctx.fillRect(0, 0, W, barH);

  // Filled portion
  const fillColor = critical
    ? `rgba(255,60,60,${0.7 + Math.sin(Date.now() / 120) * 0.2})`
    : warning
    ? 'rgba(255,160,60,0.75)'
    : 'rgba(95,179,255,0.6)';
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, filled, barH);

  // Label
  ctx.font = '9px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = critical ? 'rgba(255,120,120,0.9)' : 'rgba(160,180,210,0.75)';
  ctx.textAlign = 'left';
  ctx.fillText(`ORBITAL DENSITY  ${Math.round(density)}%`, 8, barH + 12);

  if (critical) {
    ctx.fillStyle = `rgba(255,80,80,${0.6 + Math.sin(Date.now() / 80) * 0.4})`;
    ctx.textAlign = 'right';
    ctx.fillText('CASCADE THRESHOLD EXCEEDED', W - 8, barH + 12);
  }

  ctx.restore();
}

export function drawObj(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number, collectMode: boolean): void {
  if (o.type === 'active') {
    if (o.isDeadSat) drawDeadSat(ctx, o, alpha);
    else drawActive(ctx, o, alpha);
  } else if (o.type === 'rare') drawRare(ctx, o, alpha, collectMode);
  else drawJunk(ctx, o, alpha);
}

export function drawCatalogLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  alpha: number,
  color: string,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '10px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  const w = text.length * 6;  // ~6px/char at 10px monospace; avoids forced layout from measureText
  ctx.strokeStyle = `rgba(95,179,255,${alpha * 0.4})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 - 6, y - 9, w + 12, 13);
  ctx.fillText(text, x, y);
  ctx.restore();
}
