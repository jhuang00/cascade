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

export function drawObj(ctx: CanvasRenderingContext2D, o: GameObject, alpha: number, collectMode: boolean): void {
  if (o.type === 'active') drawActive(ctx, o, alpha);
  else if (o.type === 'rare') drawRare(ctx, o, alpha, collectMode);
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
  const w = ctx.measureText(text).width;
  ctx.strokeStyle = `rgba(95,179,255,${alpha * 0.4})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 - 6, y - 9, w + 12, 13);
  ctx.fillText(text, x, y);
  ctx.restore();
}
