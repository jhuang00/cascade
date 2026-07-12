# Cascade — Visual Style Brief

A handoff document for the game-wide UI revamp. Covers everything outside the gameplay canvas: main menu, mission select, level intros and outros, tutorials, options, credits, transitions, and shared chrome. The gameplay canvas itself (debris, satellites, trails, reentry FX) is governed by `cascade-design.md` §5.5 — this brief is the **chrome that wraps that canvas**.

**Reference mockup:** `cascade-ui-mockup.html`
**Status:** Direction approved (June 2026). Specific values tunable in production.

---

## 1. Thesis

Cascade's UI is a **piece of mission-control instrumentation** built by someone who cared about the work. Not a game menu dressed in sci-fi paint. Every screen should feel like it was assembled from a real catalog by someone who lost colleagues to a debris event and built the interface to honor what's up there.

Two registers do all the work:

- **Ceremonial** — for moments of decision and consequence (main menu, mission select, level intro, level outro, epilogue). UI in the foreground. Slow. Wide spacing. The screen invites the player to stop and read.
- **Telemetric** — for moments of operation (HUD during gameplay, tutorials, options, transitions). Data in the foreground. Dense. Functional. The screen invites the player to act.

The same visual vocabulary (palette, type, ornament) is shared across both — they differ in *density and pacing*, not in surface treatment. A player should feel they're looking at one instrument with two modes.

---

## 2. Palette

A two-axis system. **One vertical gradient is the ground state of every screen.**

### Vertical gradient (top → bottom)

```
--void          #05070b   (deep space)
--space         #0a0f17   (upper atmosphere)
--night         #121a26   (mid-altitude shadow)
--horizon-cold  #1f2c3d   (dawn-line cold side)
--horizon-warm  #6b3a22   (limb shadow)
--limb          #c4663a   (atmospheric scatter)
```

The gradient is non-negotiable on menu/select screens. Even where Earth isn't drawn, the gradient reads as "looking down from orbit."

### Single warm accent

```
--amber         #ffb547   (active, selected, focused)
--amber-soft    #d99a3c   (ornament, brackets)
--amber-glow    rgba(255, 181, 71, 0.18)
```

**Amber is the only chromatic accent in the chrome.** Buttons, focus states, ornament, brackets, selected card bands, the wordmark node — all amber. This is the discipline that makes the design feel expensive.

### Neutrals (the body voice)

```
--phosphor        #e8e4d4   (catalog labels, body text)
--phosphor-dim    #a09a86   (secondary labels)
--phosphor-muted  #5a5448   (tertiary / disabled)
--rule            rgba(232, 228, 212, 0.22)   (hairline dividers)
```

A warm off-white parchment, never pure white. Reads as aged phosphor / typewriter output.

### State colors (used sparingly, never alongside each other)

```
--cleared       #6fa389   (cool sage — mission complete)
--cascade       #c25656   (cascade red — L6 only, used ONCE in the entire UI)
```

**The cascade red is sacred.** It does not appear in level intros, options, error states, or anywhere outside Mission 06. Its scarcity is what makes it land.

Active-satellite blue and rare-artifact gold from the gameplay canvas (see §5.5 of design doc) are **gameplay signal colors only** and do not appear in chrome.

---

## 3. Typography

Three faces, three jobs. No exceptions.

### Display — `Space Grotesk`

Used for: wordmark, screen titles, level names, menu items, status bands.

- Weight 300 for the wordmark and large display
- Weight 400 for level names
- Always uppercase for titles, tracked 0.35em–0.55em
- Sentence case for menu items, normal tracking

Distinctiveness comes from **extreme letter-spacing**, not from a custom face. A wordmark in Space Grotesk 300 at 0.55em tracking reads as Cascade. A wordmark in Space Grotesk at default tracking reads as a startup landing page. The spacing *is* the brand.

### Data — `IBM Plex Mono`

Used for: catalog labels, telemetry readouts, build/version stamps, dates, NORAD IDs, position counters, divider micro-labels.

- Weight 300–400
- Sizes 9–12px
- Tracking 0.3em–0.4em for short labels, normal for prose data
- Almost always uppercase for labels, mixed case acceptable for inline prose

IBM Plex Mono carries IBM mainframe lineage — the right voice for a NORAD/NASA-ODPO catalog. Substitutions like JetBrains Mono or Space Mono are acceptable but not preferred.

### Body — `Space Grotesk` (regular case, 14–16px)

Used for: tutorial cards, level intro/outro prose, options descriptions, credits.

Body copy is rare. Most of the time the game is showing labels and data. When prose appears, it appears in short paragraphs (2–4 sentences) with generous leading (1.7).

### Type pairings (locked combinations)

| Context | Display / title | Body / data | Size relationship |
| --- | --- | --- | --- |
| Wordmark | Space Grotesk 300, 0.55em | Plex Mono 10px subtitle | Display is 6–8× the subtitle |
| Card header | Space Grotesk 400 uppercase 0.35em | Plex Mono 9–10px micro-label above | Title 17px, micro 9px |
| Menu item | Space Grotesk 300, 18px | — | One face, one size |
| Telemetry pill | Plex Mono 9px label 0.4em | Plex Mono 11px value | Label dim, value phosphor |
| Level intro | Space Grotesk 300, 24–32px prose | Plex Mono 10px epoch above | Epoch is the dateline |

---

## 4. Ornament

**Hairline. Single color. Never filled. Never gradient.**

Every line in the UI is 1px (or 0.5px for traces), in `--amber-soft` for active or `--rule` for neutral. There are no filled badges, no rounded glassy buttons, no gradient borders, no drop shadows on UI chrome. The visual richness comes from the *background gradient and painted hero scenes*, not from chrome ornament.

### Corner brackets

The signature reticle. Four small angled lines at the corners of every card and telemetry pill — 14px arms, 1px stroke, amber-soft when neutral, amber when focused.

Already present in the gameplay HUD per §5.5. The brief here is to **carry the same reticle into the chrome**, so chrome and HUD read as one instrument.

### Hairline rules with chevron interruption

Card dividers are 1px rules with a small 6×6 rotated square (chevron) interrupting at the center. The chevron sits on the rule, in amber-soft, with a 1px stroke on its upper-right edges only. This is the only "deco beat" in the design — used once per card, never repeated within a screen.

### Orbital traces (background ornament)

Thin elliptical paths drifting across the background field. 0.5px stroke, amber-soft, 0.35 opacity. Three or four traces per screen, at varying inclinations. They rotate together very slowly (~240s per full rotation). They are pure atmosphere — no gameplay or interactive meaning.

---

## 5. The heraldic device — orbital sigils

The recurring mark of the game. Replaces the diamond, circle, or hexagon that a templated design would reach for.

**A sigil is a small tilted orbital ellipse** with one or more node markers. Each sigil's geometry encodes the event of its level:

| Mission | Sigil geometry | What it encodes |
| --- | --- | --- |
| 01 The Quiet | Nearly equatorial ellipse, single node | Calm, single tracked object (Vanguard 1) |
| 02 The Breakup | Tilted ellipse, stray fragment dots | Fragmentation era |
| 03 The Test | Vertical (polar) ellipse, debris radiating from impact node | Polar orbit, ASAT impact (FY-1C) |
| 04 The Collision | Two crossed ellipses, bright node at intersection | Two satellites converging (Iridium × Cosmos) |
| 05 The Megaconstellation | Multiple parallel ellipses, many small nodes | Constellation shells (Starlink) |
| 06 The Cascade | Chaotic overlapping ellipses, multiple nodes, **cascade-red tint** | Tangled debris field |

Sigils appear:

- At the top of every level card (mission select)
- At the start of every level intro screen (centered, larger)
- In the level-cleared outro card
- On the save-state slots (continue screen)
- Anywhere the game references a specific level

A sigil is 60×42 viewBox, rendered in amber-soft strokes with amber nodes (or cleared/cascade-red where states apply). It is **never filled**, never colored beyond the amber/state palette, and never decorated beyond what its geometry encodes.

**Do not create new sigils.** The six are the complete set.

---

## 6. Layout principles

### Negative space is the layout

Both ceremonial screens (menu, mission select) put the active content in roughly the center 50% of the viewport, with the remaining 50% reserved for void, stars, Earth, and ornament. **The composition should feel unhurried.** A typical AAA game UI cramming the screen with HUD is wrong for Cascade.

### Anchors, not grid

Place elements by anchor points to viewport edges, not by a grid system:

- Wordmark: 8vh from top, 6vw from left
- Menu items: 16vh from bottom, 6vw from left
- Telemetry pill: 5vh from bottom, 4vw from right
- View toggle / utility controls: 18px from top-right corner
- Card focus: dead center of viewport
- Position indicator: 5vh from bottom, centered

This gives the design its **off-balance asymmetric composition** — content lower-left, Earth lower-right, void upper-right. The same asymmetry as the Dune main menu, but earned through Cascade's own anchors.

### Ceremonial register: card carousel

For mission select and any roster-like screen (save slots, catalog index), use a **focused-center carousel**:

- One card at center, full size, full brightness, full INFORMATION band
- Two flanking cards at 82% scale, 60% opacity, 75% brightness
- Two more cards at 65% scale, 28% opacity (peeking at edges)
- Beyond ±2, cards are hidden
- Click any visible card to focus it (480ms ease)
- Arrow keys, dots, and side arrows all navigate
- Position indicator below: `02 / 06` with the active number in amber

### Telemetric register: pills and corners

For in-gameplay HUD, options, transitions: dense pills with corner brackets, IBM Plex Mono throughout, no large display type. Already established in §5.5 — preserve.

---

## 7. Motion

**Motion is ambient, never decorative.** A player should not consciously notice the screen is moving — they should only feel the screen is alive.

### Always-on background drift

- **Three parallax star layers** — 180s / 120s / 90s cycle. Horizontal drift only.
- **Earth limb texture** — 240s full rotation.
- **Airglow band** — 8s gentle pulse (opacity 1.0 → 0.78 → 1.0).
- **Orbital traces** — 240s full rotation, very slow.

### Interaction motion

- **Focus / hover:** 180ms ease-out. Corner brackets brighten amber. Ring bullets fill amber with glow.
- **Carousel focus change:** 480ms cubic-bezier(0.4, 0, 0.2, 1). All cards transition together.
- **Screen transitions:** 240ms fade. Avoid slide/scale transitions between screens — they break the "single instrument" feel.
- **Disabled hover:** no response. Disabled means disabled.

### Strict prohibitions

- No bouncy easing
- No glow pulses on hover (only on focus/selection)
- No glitch / scanline / CRT shaders on chrome (gameplay canvas may experiment per §5.5 deferred list)
- No parallax that responds to mouse position — only autonomous drift
- No animated gradients in chrome
- No spinners. Loading states use a static three-dot ellipsis in IBM Plex Mono.

---

## 8. Voice — copy that matches the visual

Cascade's UI speaks in **catalog voice**. Short. Datelined. Specific. Never apologetic, never marketing.

### Labels follow a strict format

Catalog labels are always `NAME · YEAR · ORIGIN` separated by middle dots, uppercase, IBM Plex Mono:

```
VANGUARD 1 · 1958 · USA
COSMOS 2251 · 1993 · RUS
STARLINK-4592 · 2023 · USA
```

Secondary catalog metadata gets a separate line below in `--phosphor-dim`:

```
NORAD 00005 · 240Y REMAINING
```

### Button copy is the verb of the action

- "Begin mission" not "Start" or "Play"
- "Continue" not "Resume" or "Load game"
- "Catalog" not "Codex" or "Encyclopedia"
- "Back" with a single ‹ chevron, never "Return to menu"
- "Cleared" not "Completed" or "Done" (matches the gameplay verb)

### Prose tone

Level intros and outros use **factual, declarative sentences**. No second-person, no inspirational copy, no "you will face." The game tells the player what happened, with the dates, and lets the player infer their role.

> **Good:** "January 11, 2007. China launches a direct-ascent missile at one of its own retired weather satellites. The orbital environment changes forever."
>
> **Bad:** "Get ready to witness the most devastating moment in space history!"

### Numbers are always exact, sourced, and unrounded where possible

`1,632 catalogued fragments`, not `over 1,500`.
`11.7 km/s`, not `extremely fast`.
`790 km above Siberia`, not `high above Russia`.

Specificity is the brand.

---

## 9. Per-screen direction

### 9.1 Main menu — ceremonial

Wordmark upper-left (Variant B: Orbital C). Subtitle below: hairline rules flanking `ORBITAL DEBRIS / 1958 — PRESENT` in IBM Plex Mono 10px. Menu items lower-left as ring-bullet list. Build-status telemetry pill lower-right with corner brackets. Earth limb fills lower-right quadrant. No background image — the gradient and limb *are* the image.

### 9.2 Mission select — ceremonial

Topbar with `‹ Back` flush left, centered title block (`MISSION SELECT` over `SIX MISSIONS · 1958 → PRESENT` micro-label). 6-card carousel as described in §6. Position counter and dots at bottom. Side-arrow buttons at 5vw from edges, vertically centered.

### 9.3 Level intro — ceremonial → telemetric

Three beats, each held ~2.5 seconds with 600ms fades between:

1. **Sigil beat.** Sigil centered, large (180×120 viewBox). Below it: epoch line in IBM Plex Mono (e.g. `EPOCH · 11 JAN 2007`). Above it: mission number/name (`MISSION 03 · THE TEST`).
2. **Quote beat.** Sigil shrinks to top-center. Intro prose appears below in Space Grotesk 300, 28px, max 60ch, centered. Pulled directly from §6 of the design doc.
3. **Briefing beat.** Tutorial cards begin (telemetric register — see 9.4).

A single `[ press any key to begin ]` line at bottom in Plex Mono 10px, dim phosphor, gently pulsing (4s cycle).

### 9.4 Tutorial card — telemetric

A small panel anchored bottom-center, ~480px wide. Corner brackets in amber. Title in Plex Mono 10px uppercase tracked (e.g. `BRIEFING · NEW MECHANIC`). Body in Space Grotesk 400, 14px, 2–3 lines. Animated demo (gameplay canvas) plays in the panel's hero region above the text. Single `OK` button (amber band, void text) to dismiss.

Tutorial cards never block the entire screen — the gameplay canvas stays visible behind, dimmed to 40%.

### 9.5 Level outro — ceremonial

Sigil at top (now with state-colored stroke — sage if cleared, cascade-red if Mission 06 ended). Below it: outro fact card. The fact text is Space Grotesk 300, 20px, 3–6 lines, centered, max 56ch. Below the fact: stat row in Plex Mono (`SCORE 8,420 · RARES 2/2 · TIME 1:14`). Two buttons: `‹ Mission select` (ghost) and `Next mission ›` (amber band).

For Mission 06's epilogue: no `Next mission`. Single line `THERE IS NO MISSION 07` in Plex Mono 11px, cascade red, after a 4s hold on the stats. Then the menu returns.

### 9.6 Options — telemetric

Two-column layout. Left: section list (ring-bullet menu, same as main menu). Right: settings panel for the selected section.

Settings use **labeled hairline controls**:

- Sliders: 1px track in `--rule`, amber filled portion, 12px circular thumb in `--phosphor`, value displayed in Plex Mono to the right.
- Toggles: text label + `[ ON ]` / `[ OFF ]` in Plex Mono with brackets, amber when ON.
- Selects: inline pill with chevron, opens a small list panel below.

No checkboxes. No radio buttons. No iOS-style toggles. The UI does not look like a settings page on a phone — it looks like the configuration panel of a ground station.

### 9.7 Credits — ceremonial

Single column, centered, scrolls slowly (player can also scroll manually). Section headings in Space Grotesk 400 uppercase tracked 0.4em. Names in Plex Mono 13px. Attribution block at the end for all data sources (NASA, ESA, NORAD, CelesTrak), with each source line in standard catalog-label format.

The credits scroll continues until a final line: `CASCADE.MCC · 2026` — the same signature that appears in the gameplay HUD bottom strip. Then the player returns to menu.

### 9.8 Transitions

Between screens: 240ms fade through black. The background gradient is continuous across all screens, so screen transitions feel like layers swapping rather than worlds changing.

Between levels (after outro → next intro): 800ms longer fade with the orbital traces briefly visible without any UI — a "between moments" beat.

---

## 10. Per-level mood progression

Each level's chrome subtly shifts to match its emotional register. **The shifts are tiny** — only the hero canvas and the band band-body might tint slightly. The chrome itself does not change palette.

| Mission | Hero canvas dominant hue | Notes |
| --- | --- | --- |
| 01 The Quiet | Aged archival sepia + sage trace | The "completed history" feeling |
| 02 The Breakup | Warm amber + airglow orange | First active mission, energetic |
| 03 The Test | Hot orange + first red traces | Tension. The mission with the missile streak |
| 04 The Collision | Cool blue + warm amber split | The only legitimate two-color hero — the event *is* two satellites |
| 05 The Megaconstellation | Clinical cold blue | Reads as infrastructure, not menace |
| 06 The Cascade | Muted cascade red + density grid | The only place cascade red appears in chrome |

A player flipping through the carousel should feel the **temperature progression** across the game — warming through the middle, cooling at the constellation era, going red at the end. The carousel is a small history lesson in itself.

---

## 11. Anti-patterns (what NOT to do)

- **No glassmorphism beyond the blur on telemetry pills.** No frosted overlays, no large blurred panels.
- **No gradients on UI chrome.** The only gradient is the background limb gradient.
- **No multi-color accents.** If you find yourself wanting a green "success" and a red "error" and a blue "info" — you are designing the wrong game.
- **No iconography library.** Icons are bespoke (the corner reticle, the chevron, the orbital sigils). No Lucide / Heroicons / Material icons.
- **No rounded corners larger than 2px.** Cards have 2px border-radius. Pills have full radius only when they're clearly a pill (the view toggle). Everything else is sharp.
- **No emoji.** Anywhere.
- **No drop shadows on chrome.** Only on the gameplay canvas (debris, etc.) where they serve physics, not on UI.
- **No marketing copy.** "Experience the cascade!" is a hanging offense.
- **No "Are you sure?" modals.** Mission select doesn't ask twice. The game trusts the player.

---

## 12. Relationship to §5.5 (gameplay canvas)

§5.5 of the design doc governs the gameplay canvas — what the player sees during a mission. **This brief governs everything else.** The two share:

- The vertical gradient ground state (chrome's gradient is the same gradient that runs behind the canvas)
- Corner brackets / reticles (HUD reticles match chrome card reticles)
- IBM Plex Mono for catalog labels (gameplay's slice labels use the same format as chrome's catalog labels)
- The single amber accent (gameplay's selection states match chrome's focus states)
- Earth limb (gameplay's curved horizon at the bottom of the canvas is the same horizon visible behind menus)

The two diverge on:

- **Density.** Chrome is sparse and ceremonial; canvas is dense and operational.
- **Gameplay signal colors.** Active-satellite blue, rare-artifact gold, and slice-flash white exist in the canvas only. They are gameplay signal — not allowed in chrome.
- **Motion.** Canvas motion is fast and physical (debris tumbles, satellites arc, fragments scatter). Chrome motion is ambient and slow (drift, pulse, ease).

When the player transitions from chrome to canvas (intro → gameplay start), the gradient stays. The Earth limb stays. The reticles stay. New layers — debris, trails, HUD pills — appear *on top of* the chrome's background. **There should be no perceptible "loading the game" moment.** The mission begins; the instrument is already on.

---

## 13. Implementation notes

### CSS custom properties

All palette values, all typography, and all motion durations should be defined as `:root` CSS custom properties. Single source of truth. Locked names below — do not rename:

```css
--void, --space, --night, --horizon-cold, --horizon-warm, --limb
--amber, --amber-soft, --amber-glow
--phosphor, --phosphor-dim, --phosphor-muted
--rule
--cleared, --cascade
--type-display, --type-mono
```

### Component inventory

A first pass needs these components:

1. `Wordmark` (3 variants — pick one)
2. `MenuList` + `MenuItem` (ring-bullet style)
3. `TelemetryPill` (with corner brackets)
4. `Card` (with bracket corners, divider, sigil slot, hero slot, band, band-body)
5. `Sigil` (one component, six variants by prop)
6. `Carousel` (focused-center, 6-slot)
7. `LevelIntro` (3-beat sequence)
8. `TutorialCard`
9. `LevelOutro`
10. `Slider`, `Toggle`, `Select` (telemetric form controls)
11. `Scene` (background — gradient + stars + limb + traces, shared across all screens)

The `Scene` component is mounted once at the app root and never unmounted between screens. Screens render *on top of* it.

### Performance budget

- All ambient drift via CSS animations / transforms, never JS rAF loops
- Heroes are static canvases painted once on mount, repainted only when carousel focus changes
- Star layers use SVG circles, two copies side-by-side for seamless wrap
- Earth limb is pure CSS (radial gradients + box-shadow), no images

Target: 60fps on a 2019 mid-range laptop with all menus active and the carousel mid-animation.

---

## 14. Open questions

1. **Wordmark variant lock.** Variant B (Orbital C) is recommended but not locked. Decision needed before main menu goes into Claude Code.
2. **Carousel item count visible.** Currently ±2 cards visible. Acceptable at 1920×1080; may need to drop to ±1 on narrower viewports.
3. **Catalog page (deferred).** Spec for a dedicated "Catalog" screen — a browseable index of every real debris object the player has encountered — is not in this brief and should be specced separately.
4. **Save-slot screen.** Continue menu may show 3 save slots. Visual treatment TBD — likely a small carousel reusing the card component.
5. **Accessibility.** Reduced-motion preference must disable all ambient drift. Focus indicators must be visible at all states (amber bracket emphasis). Color-blind testing on the L4 blue+amber split — alternate signaling (label, sigil shape) is already in place but worth a pass.

---

*This brief is a living document. Update as decisions lock in. Last updated: June 2026.*
