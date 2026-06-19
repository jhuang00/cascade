const TAP_MAX_DURATION_MS = 280;
const TAP_MAX_DISTANCE_PX = 12;

interface InputCallbacks {
  onMove(x: number, y: number): void;
  onTap(x: number, y: number): void;
  onLeave(): void;
  onCollectStart(): void;
  onCollectEnd(): void;
}

function canvasPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement, W: number, H: number): { x: number; y: number } {
  const r = canvas.getBoundingClientRect();
  const t = 'touches' in e
    ? (e.touches[0] || (e as TouchEvent).changedTouches[0])
    : e;
  return {
    x: (t.clientX - r.left) * (W / r.width),
    y: (t.clientY - r.top) * (H / r.height),
  };
}

export function attachInput(
  canvas: HTMLCanvasElement,
  W: number,
  H: number,
  cbs: InputCallbacks,
): () => void {
  let pressStart: { x: number; y: number; time: number } | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const p = canvasPos(e, canvas, W, H);
    cbs.onMove(p.x, p.y);
  };
  const onMouseLeave = () => cbs.onLeave();
  const onMouseDown = (e: MouseEvent) => {
    const p = canvasPos(e, canvas, W, H);
    cbs.onTap(p.x, p.y);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const p = canvasPos(e, canvas, W, H);
    pressStart = { x: p.x, y: p.y, time: Date.now() };
  };
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const p = canvasPos(e, canvas, W, H);
    cbs.onMove(p.x, p.y);
  };
  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (!pressStart) { cbs.onLeave(); return; }
    const p = canvasPos(e, canvas, W, H);
    const dt = Date.now() - pressStart.time;
    const dx = p.x - pressStart.x;
    const dy = p.y - pressStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dt < TAP_MAX_DURATION_MS && dist < TAP_MAX_DISTANCE_PX) cbs.onTap(p.x, p.y);
    pressStart = null;
    cbs.onLeave();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      cbs.onCollectStart();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      cbs.onCollectEnd();
    }
  };
  const onBlur = () => cbs.onCollectEnd();

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
  };
}
