# Cascade — performance / energy baseline

Working notes for the Phase 2c energy pass. This directory is also the drop
spot for the UI-redesign reference files (`cascade-ui-mockup.html`,
`cascade-visual.md`).

## Structural fixes landed 2026-07-12 (pre-redesign)

1. **Idle rAF suspension** (`lib/engine.ts`): the engine loop stops scheduling
   frames when gameplay is stopped/paused and no FX remain; one static frame
   stays on the canvas. Resumes on level start / unpause. Before this, the
   full canvas repainted at display refresh rate under intro/outro overlays.
2. **60 fps simulation cap** (`lib/engine.ts`): refresh ticks arriving <15.5ms
   apart are skipped. On 120Hz displays this halves render work AND fixes the
   game running at 2x speed (physics are per-frame tuned).
3. **Menu backdrop capped at 30 fps** (`app/page.tsx`): ambient star drift
   doesn't need refresh-rate redraws.

Verified via rAF call counter in the preview browser: 0 calls on a settled
intro screen (loop suspended), calls resume after "Begin".

## Measurement matrix — fill in on a FOCUSED browser window

(The dev preview throttles rAF when unfocused, so these numbers must come
from a normal foreground Chrome window. DevTools → ⋮ → More tools →
Performance monitor, read "CPU usage" steady-state; Activity Monitor →
Energy tab for Energy Impact.)

| Scene                         | CPU % (pre-redesign) | CPU % (post-redesign) | Notes |
|-------------------------------|----------------------|-----------------------|-------|
| Menu (idle)                   |                      |                       | 30fps ambient backdrop |
| L1 intro (settled, idle)      |                      |                       | expect ~0 — loop suspended |
| L2 mid-play                   |                      |                       | fragmentation + actives + rares |
| L6 at density ≥ 60            |                      |                       | worst case: 100+ objects |
| Outro screen (after FX decay) |                      |                       | expect ~0 — loop suspended |

Targets (from the plan): idle screens ≤ ~2% CPU; stable 60 fps during play
(no sustained frame times > 16.7ms in a Performance recording of a 60s L6
run); no sustained "High" Energy Impact.

## Known headroom / later levers

- Existing good practice: gradients hoisted out of the frame loop (commit
  09a3dac), DPR capped at 2 (play canvas) / 1.5 (menu), static layers
  pre-rendered offscreen (stars, nebulae, Earth, scanlines).
- If L6 exceeds budget after the redesign: cap concurrent catalog labels,
  pool debris objects, degrade label rendering at high density.
