const TAP_MAX_DURATION_MS = 280;
const TAP_MAX_DISTANCE_PX = 12;

interface InputCallbacks {
  onMove(x: number, y: number): void;
  onTap(x: number, y: number): void;
  onLeave(): void;
  onCollectStart(): void;
  onCollectEnd(): void;
}

export function attachInput(
  canvas: HTMLCanvasElement,
  getDims: () => { w: number; h: number },
  cbs: InputCallbacks,
): () => void {
  // Cache getBoundingClientRect — calling it on every pointermove forces a layout
  // reflow. The canvas position relative to the viewport only changes on resize.
  let cachedRect = canvas.getBoundingClientRect();
  const refreshRect = () => { cachedRect = canvas.getBoundingClientRect(); };
  window.addEventListener('resize', refreshRect);

  function canvasPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const t = 'touches' in e
      ? (e.touches[0] || (e as TouchEvent).changedTouches[0])
      : e;
    const { w, h } = getDims();
    return {
      x: (t.clientX - cachedRect.left) * (w / cachedRect.width),
      y: (t.clientY - cachedRect.top)  * (h / cachedRect.height),
    };
  }

  let pressStart: { x: number; y: number; time: number } | null = null;

  const onMouseMove = (e: MouseEvent) => {
    const p = canvasPos(e);
    cbs.onMove(p.x, p.y);
  };
  const onMouseLeave = () => cbs.onLeave();
  const onMouseDown = (e: MouseEvent) => {
    const p = canvasPos(e);
    cbs.onTap(p.x, p.y);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const p = canvasPos(e);
    pressStart = { x: p.x, y: p.y, time: Date.now() };
  };
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const p = canvasPos(e);
    cbs.onMove(p.x, p.y);
  };
  const onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (!pressStart) { cbs.onLeave(); return; }
    const p = canvasPos(e);
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
    window.removeEventListener('resize', refreshRect);
  };
}
