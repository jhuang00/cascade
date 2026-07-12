# Cascade — Game Design Document

A meaning-driven web game. Fruit Ninja's slice mechanic repurposed: you're not cutting fruit, you're clearing orbital debris. Every piece is real — labels drawn from the actual NORAD/NASA catalog. Across six levels you live through the history of how we trashed low Earth orbit, from Sputnik to the Kessler cascade we're already inside.

**Status:** Stage 0 prototype (v3). Core slice + tap-to-collect mechanic, three object types, arc trajectory for satellites. Single endless mode. No levels yet, no audio yet.

**Title:** Cascade (locked)
**Owner:** JH
**Stack target:** Next.js 15 web prototype → eventual native port
**Last updated:** June 2026

---

## Table of contents

1. Concept and rationale
2. Core thesis (what the game is *saying*)
3. Research foundation — facts, numbers, sources
4. Game mechanics
5. Visual design
6. Level structure (with intros, tutorials, outros, facts)
7. Story arc summary
8. Technical architecture
9. Roadmap and open questions
10. Build log (what's been prototyped)

---

## 1. Concept and rationale

The brief was a web game in the spirit of Fruit Ninja but cutting something other than fruit. The brainstorm yielded four directions: Crystal Shatter, Origami Ninja, Inbox Zero, Cosmic Slice. JH chose Cosmic Slice on the condition that it carry meaning. The research phase landed the meaning on **Kessler Syndrome** — the runaway debris cascade currently underway in low Earth orbit.

The reason the concept is strong: the Fruit Ninja combo mechanic (one slice triggers more) maps cleanly onto Kessler physics (one missed object collides with another and creates more). The mechanic *is* the message. Difficulty isn't authored — it emerges from the real-world feedback loop the game is depicting.

The game design progression decided: traditional escalating difficulty across levels, each level introduces one new mechanic that maps to a real historical event, the slice + tap-to-collect verbs are the spine, the ending preserves agency (player still acts, doesn't just watch).

---

## 2. Core thesis

Humanity's most polluted commons is the one nobody can see. Low Earth orbit is full of things we forgot we left up there — and the things up there are now killing each other on their own. You can't clean it up faster than it makes itself dirtier. The game ends because mathematically the cascade has already started.

The player's takeaway should be: *I made it this far. Reality has already passed this point.*

The thesis is delivered without lectures. Every debris label is real. Every level outro shows one fact the player just earned through play. There is no narrator. The game tells the story by being the story.

---

## 3. Research foundation

All facts below were verified via web search in June 2026. Source attribution in parentheses; full URLs available on request.

### 3.1 The numbers (current state)

- **~40,000** tracked objects in orbit. Of these, **~11,000** are active satellites. The rest are dead satellites, rocket bodies, large fragments. (ESA Space Environment Report 2025)
- **~1.2 million+** debris objects larger than 1 cm — large enough to destroy a satellite. **~330 million+** smaller than 1 cm but bigger than 1 mm. (ESA estimates)
- **~14,500+** active satellites operating right now. (SatFleet Live, March 2026)
- **10,400+** Starlink satellites alone — more than half of all operational satellites in orbit. (Orbital Radar, June 2026)
- **~648** OneWeb. **~175+** Kuiper. **29+** Guowang. **90+** Qianfan. Many more planned. (Britannica, 2025)
- SpaceX's full Starlink plan: up to **29,988** satellites. China's Guowang plan: **12,992**. Qianfan: **~15,000**.
- US alone operates **~70%** of all active satellites, almost entirely due to Starlink. (SatFleet Live)

### 3.2 The threshold

A 2025 Lewis & Kessler paper found that the current population of intact objects **exceeds the unstable threshold at all altitudes between 400 km and 1000 km**, and **exceeds the runaway threshold at nearly all altitudes between 520 km and 1000 km**. Translation: the cascade is no longer hypothetical. The debris environment is growing on its own, independent of new launches. Stopping launches tomorrow would not stop the growth.

### 3.3 Historical events (the level anchors)

**1958 — Vanguard 1.** Launched by the US. Became and remains the oldest human-made object in orbit. Will persist for an estimated 240 more years.

**1961–1963 — West Ford project.** MIT Lincoln Laboratory for the US Air Force deliberately dispersed copper needles into orbit at ~3,600 km altitude as a passive radio reflector for military communications. Seven catalogued objects from the failed first deployment are still in orbit. Some clumps from the second deployment also still orbit.

**1965 — Ed White's glove.** Lost during the first American spacewalk. Real object, real loss, in the orbital debris catalog.

**1966 — Michael Collins' camera.** Lost during Gemini 10.

**1961–2006 — 190 known satellite breakups.** Mostly from leftover fuel cooking off in spent rocket stages. By 2015 the total had grown to 250 fragmentation events.

**February 10, 2009 — Iridium 33 / Cosmos 2251 collision.** First accidental collision between two intact satellites in history. Iridium 33 was operational (560 kg, US, commercial communications). Cosmos 2251 was defunct since 1995 (900 kg, Russian military). Impact at **11.7 km/s** at **790 km altitude over the Taymyr Peninsula in Siberia**. Produced **~1,632 catalogued fragments** plus thousands of smaller. Most still in orbit.

**January 11, 2007 — Fengyun-1C ASAT test.** China destroyed its own retired weather satellite with a direct-ascent ASAT missile. The single largest debris-creation event in history. **Over 3,500 catalogued fragments**, estimates of **over 1 million pieces 1mm or larger**, **35,000+ pieces 1cm or larger**. As of 2026, **3,000+ fragments still in orbit** spread across altitudes from 200 km to 4,000 km, crossing nearly every active LEO orbit.

**March 27, 2019 — India ASAT (Microsat-R).** Lower altitude (283 km). Most fragments decayed within months. Only one trackable piece remains in orbit.

**November 15, 2021 — Russia ASAT (Cosmos 1408).** Destroyed a Soviet electronic intelligence satellite from 1982. **1,500+ catalogued fragments** at ~480 km. ISS crew sheltered in spacecraft. In May 2022, a 5mm hole was punched in the ISS robotic arm — likely from this debris field.

**2007–2025 — ASAT signatories.** Four nations have conducted destructive ASAT tests: China, US (2008, retrieving an errant US satellite — debris all decayed), India, Russia.

**2024 — Two more major breakups.** Long March 6A upper stage broke up in August (700+ fragments). Intelsat 33e fragmented in geostationary orbit in October (1,104+ fragments). GEO debris is essentially permanent.

**2026 — ClearSpace-1.** ESA's first active debris removal mission. Will rendezvous with and remove the defunct 95 kg PROBA-1 satellite. **€86 million** contract for removing ONE object. Tens of thousands of equivalent objects remain.

### 3.4 The casualty

**1997 — Lottie Williams.** Tulsa, Oklahoma. Hit by a piece of a Delta II rocket fuel tank that survived re-entry. Only confirmed case of a human being hit by space debris. Unharmed.

### 3.5 Real-world penalty scaling

If "slice debris = +10 points" is the gameplay unit, then a strictly proportional penalty for destroying one active satellite would be roughly **−3,000 points** (because one destroyed satellite ≈ 3,000+ catalogued fragments). Obviously unplayable. The game scales down: −25 in standard levels, with the proportional penalty applied narratively in Level 6 (Cascade) where slicing an active *will* spawn fragments that compound.

---

## 4. Game mechanics

### 4.1 Core verbs

Two verbs, distinguished by gesture type:

- **Slice** = continuous motion (mouse moves, finger swipes). The default. Creates a cursor trail; anything the trail crosses is sliced.
- **Collect** = discrete intent.
  - On desktop: hold **SPACE** to enter Collect Mode (trail vanishes, amber border appears, cursor changes to pointer). Click on a target to collect.
  - On mobile: tap (touchstart + quick touchend at the same spot, no significant drag) directly on a target.

Cross-platform consistency: the same input device produces both verbs through different gesture patterns. No mode toggles, no UI controls.

### 4.2 Object types

Three categories. Each has a distinct visual signature AND a distinct motion signature so the player can identify intent from movement alone.

**Gray junk (slice).** Tumbling angular polygons. Parabolic toss trajectory — thrown up from off-screen, gravity pulls down. Multiple sizes, metallic gray palette with occasional rust orange. Labels: real debris catalog (COSMOS 1408 fragment, FENGYUN-1C fragment, LONG MARCH 3B R/B, etc.).

**Blue active satellites (avoid — like Fruit Ninja's bomb).** Cleanly designed bus + solar panels + antenna. Soft blue glow halo. **Arc trajectory** — enters from one side at lower altitude, rises in a sine arc, peaks mid-screen, descends to opposite side. Mimics a real orbital pass viewed from below. Slow horizontal motion with no tumbling (real satellites are attitude-stabilized). Labels: real active satellite names (STARLINK-30421, KUIPER-178, ONEWEB-642, QIANFAN-44, GUOWANG-12).

**Gold-pulse rare artifacts (tap to collect).** Soft pulsing gold aura, slowly drifting horizontally with gentle vertical bob. No gravity. Slow enough to be deliberately collected. Labels: historical artifacts (VANGUARD 1 (1958), ED WHITE's glove (1965), COLLINS' camera (1966), WEST FORD needle (1963), EXPLORER 1 stage, SPUTNIK 4 fragment).

### 4.3 Scoring

| Action | Points | Notes |
|--------|--------|-------|
| Slice junk | +10 | Standard target |
| Collect rare | +100 | Big bonus, deliberate action |
| Slice rare | +5 | No bonus but no penalty |
| Slice active | −25 | Plus warning flash; in Level 6 also spawns fragments |
| Miss junk (falls off bottom) | −5 | Penalizes wild swiping |
| Tap junk | 0 | Allowed but no payoff |
| Tap active | 0 | Safe non-action |

### 4.4 Pass / fail mechanism

Every level has a binary outcome: pass or fail. Failed levels must be replayed before progressing — no soft credit, no partial advancement. The pass condition is a **point threshold** specific to the level. The running game score (computed continuously from the table above) must meet or exceed the threshold within the level's time limit.

**Three ways to fail a level:**
1. **Timeout fail** — Time runs out and score is below threshold.
2. **Miss limit hard fail** — Number of unsliced junk pieces exceeds the per-level cap. Triggers immediate level-end regardless of score.
3. **Destruction hard fail** (Level 2+) — Number of active satellites sliced exceeds the per-level cap. Triggers immediate level-end.

**Why threshold over goal count:**
- Multiple paths to victory (slicer, collector, or balanced)
- Penalties contribute to score directly, so the threshold is a single comprehensible target rather than two separate goal/loss numbers
- Player can recover from a few mistakes by performing well afterward
- Score and threshold both displayed live in HUD — player always knows the gap

**Per-level thresholds:**

| Level | Threshold | Miss limit | Destroy limit | Time | Notes |
|-------|-----------|------------|---------------|------|-------|
| 1 | 150 pts | 12 | n/a | 60s | ~15 net junk slices (raised from 100 after playtest — 10 ended the level too fast) |
| 2 | 250 pts | 15 | 3 | 75s | Multiple paths: 25 slices, or 15+1 rare, or 5+2 rares |
| 3 (planned) | 500 pts | n/a (event-driven) | 1 | event | Must catch ≥ 8 of FY-1C's 40 fragments |
| 4 (planned) | 600 pts | n/a | 1 (the live sat) | ~60s | Must prevent collision OR clean its aftermath |
| 5 (planned) | 800 pts | 20 | 5 | 60s | Density discrimination level |
| 6 (planned) | n/a (survival) | n/a | n/a | until saturation | No win condition, survival time scored |

### 4.5 Input modes by platform

| Platform | Slice | Collect |
|----------|-------|---------|
| Desktop | mouse/trackpad movement | hold SPACE + click |
| Mobile | finger swipe | finger tap |

Collect Mode (desktop): when SPACE is held, slice trail array is cleared, no new trail points are added, slice hit detection is suspended, canvas border tints amber, "COLLECT MODE" indicator appears top-center, rare objects get a slight aura boost. Releasing SPACE instantly returns to slice mode. A `window.blur` listener releases collect mode if focus is lost, preventing stuck-modifier bugs.

### 4.6 Mechanics not yet built (planned)

- **Fragmentation** — some debris fragments mid-flight into 2-3 smaller pieces. Introduced in Level 2. Preview of Kessler physics.
- **Predictive collision** — two satellites enter on convergent trajectories with visible orbit lines. Player must collect one or slice the dead one before they meet. Introduced in Level 4 as the cinematic Iridium/Cosmos event.
- **Cascade** — missed debris has a chance to spawn 2 new pieces. Slicing actives spawns fragments. Density meter at top of screen. Game ends when density saturates. Introduced in Level 6.
- **Boss event (single-target burst)** — one cinematic object enters; cannot be sliced; event triggers a 40-fragment scatter. Introduced in Level 3 as the FY-1C event.

---

## 5. Audiovisual design

### 5.1 Palette

- Background: near-black `#08080c` with subtle white star dots at low alpha
- Trail: white-cyan `rgba(200,230,255,...)` fading rapidly
- Junk: metallic grays `#9a9aa3 #7c7c85 #aaaab2 #b89878 #8a8a92`, occasional rust `#c4956a`
- Active satellite: `#5fb3ff` glow, `#2d4a7c` solar panels, `#cfd9e6` bus, `#5fb3ff` antenna
- Rare: `#ffc874` body, `#ffe0a8` particles, `#ffd080` label
- Slice flash: white `#ffffff`
- Active-hit warning flash: red `#ff5050`
- Collect mode border: amber `rgba(255,200,116,0.4)`

### 5.2 Motion signatures (the language)

The three object types are immediately readable through motion alone, without any UI legend:

- **Junk** tumbles, rotates fast, arcs parabolic. Reads as "uncontrolled debris."
- **Active satellites** glide, don't rotate (or rotate imperceptibly), follow a smooth sine arc. Reads as "working spacecraft on an orbital pass."
- **Rares** drift slowly with a subtle vertical bob, pulse gently in gold. Reads as "important, take your time."

### 5.3 Aesthetic direction

Dark mode, restrained. Closer to a planetarium screen than to neon/cyberpunk. Labels in monospace (`ui-monospace, "SF Mono", Menlo`) for the catalog-feel. Minimal UI chrome.

### 5.4 Audio design

All sounds are **synthesized at runtime using the Web Audio API** — no external audio files, no licensing concerns, no load time, no CORS issues. The whole audio module is ~80 lines of JS and ships in the same file as the game. Easy to tune in code, trivial to port.

The synthesized approach is appropriate for this prototype because game sounds are short, percussive, and effects-driven — exactly the kind of audio Web Audio synthesis does well. (Long ambient music or human vocals would need recorded assets; we have neither.)

Four core sounds:

- **Slice** (`playSlice`) — Brief band-pass filtered white noise burst with sharp exponential decay. ~120ms. Center frequency 3500 Hz. Reads as a clean *shink* / blade-through-air.
- **Collect** (`playCollect`) — Two ascending sine tones (E5 → B5, a perfect fifth) staggered by 40ms with soft envelopes. ~500ms. Reads as a small, warm chime — preservation rather than triumph.
- **Active hit / penalty** (`playActiveHit`) — Sawtooth wave descending from 200 Hz to 70 Hz over 400ms. Reads as a low warning growl. Sad and serious, not abusive.
- **UI click** (`playClick`) — Short 800 Hz square pulse with sharp envelope. ~50ms. Generic UI feedback.

Implementation notes:
- `AudioContext` is lazily initialized on the first user interaction (browser autoplay policy requirement).
- A `masterGain` node sits between all sources and the destination so the mute toggle adjusts one value rather than per-sound state.
- Mute button persists across screens.

Future audio work (deferred):
- Ambient low rumble during gameplay (subtle, builds over time in Level 6 as cascade intensifies)
- Distinct cinematic event sound for Level 3 boss (missile launch + impact)
- Possibly recorded radio static / NASA mission audio as flavor

If we later decide we want richer / more produced audio, open-source options include freesound.org (Creative Commons licensed game sounds), OpenGameArt.org (game-focused, MIT/CC), and pixabay.com/sound-effects (royalty-free). For now, runtime synthesis is the right tool.

### 5.5 Visual direction baseline (LOCKED — June 2026; chrome re-locked July 2026)

Established by the visual prototype `cascade-visual-prototype.html`. All structural decisions below are committed. Specific values (colors, sizes, intensities) remain tunable in production.

> **July 2026 update — chrome split out.** Everything *outside* the gameplay canvas (menu, intro/outro, HUD pills, tutorials, transitions) is now governed by `design-refs/cascade-visual.md` (reference mockup `design-refs/cascade-ui-mockup.html`): token palette (void→limb gradient, single amber accent, phosphor neutrals), Space Grotesk + IBM Plex Mono, corner-bracket reticles, orbital sigils. Implemented in `app/globals.css` (tokens), `components/Scene.tsx` (chrome backdrop), `components/Sigil.tsx`. This section continues to govern the gameplay canvas itself — its layers, gameplay signal colors (active blue, rare gold), and FX are unchanged.

**Aesthetic identity.** Mission-control telemetry. The player is a ground controller looking through their station's display at a tracked area of low Earth orbit. Restrained, technical, atmospheric.

**Background layers, back to front:**

1. **Deep space backdrop.** Base fill `#02030a` (slightly cooler than v3's `#08080c`).
2. **Nebulae.** Three large radial gradients at low alpha (0.10-0.18): deep blue, magenta-rose, purple-violet. Static positions. Pure atmosphere — no gameplay relevance.
3. **Parallax star field.** Three layers with differential drift creating depth:
   - Far: ~140 tiny stars (0.2-0.8px), alpha 0.1-0.45, drift -0.012 px/frame
   - Mid: ~65 medium stars (0.4-1.3px), alpha 0.25-0.7, drift -0.04 px/frame
   - Near: ~28 bright stars (0.7-1.9px), alpha 0.5-0.9, drift -0.11 px/frame, with twinkle and horizontal sparkle spikes on the largest
4. **Earth horizon.** Curved arc at bottom of canvas. Conceptual center far below viewport (`cy = H + 1100, r = 1300`). Three concentric layers:
   - Earth body: radial gradient from `#1a3458` (dawn side, upper-left) through `#0c1f3a` to `#020816` (dark side). City lights flicker on dark side. Cloud wisps drift across surface.
   - Atmospheric glow band: bright cyan-blue ring at horizon (`rgba(140, 200, 255, 0.55)` core, fading to transparent). The visible signature of atmospheric scattering.
   - Outer haze: softer fading halo extending into space.
   - Slow rotation: 0.00015 radians/frame, suggesting eastward orbital motion.

**HUD identity:**

- **Outer status bar** (above canvas): blinking blue indicator dot + mission title + mission elapsed time.
- **Corner brackets** inside canvas: thin blue corner reticles framing the viewport.
- **Status pills** (top of canvas): `[● STATUS NOMINAL] [ALT 487km] [INC 51.6°] [CLEARED N]`. Status dot color: blue (nominal), orange (elevated), red (critical) based on tracked-object count and reentry count.
- **Bottom telemetry strip**: `Tracking N objects · M reentries` + signature `CASCADE.MCC · 2026`.

**Catalog labels.** Each slice flashes a label in this format:
```
[ COSMOS 1408 fragment · 1982 · USSR ]
```
Three fields (name · year · origin), wrapped in a thin blue bracket frame. Turns each piece into a real catalog entry; adds historical context to every action.

**Atmospheric reentry on miss.** When junk falls off the bottom edge:
- Orange-yellow vertical flame streak rises from the impact point (gradient: warm core, cooler edges, 50-frame fade)
- 22 fire-colored particles fan upward and outward
- 8 dark smoke particles trail higher with longer lifetime

Communicates *this object reentered the atmosphere and burned up*. The Earth below you is why.

**Trail color.** White-cyan `rgba(180, 220, 255, ...)`. Bluer than previous prototypes, harmonizing with the horizon glow — reads as satellite-cleanup laser.

**What stays the same.** The three object types (gray junk / blue active satellites / gold rares) keep their existing visual identities. Their distinctive motion patterns (junk parabolic-tumbling, satellites arc-stable, rares slow-drift-pulsing) are unchanged. The visual layer is additive — it wraps the existing gameplay objects in a richer environment.

**What's deferred (tunable but not yet locked):**

- Specific Earth color and feature detail (could go more colorful, more atmospheric, or stay restrained)
- Whether visible Earth shows landmass features (continents) or stays abstract blue-with-lights
- Whether to add scanline / CRT overlay for retro-mission-control feel
- Whether to add radar sweep or scope reticle
- Specific HUD copy density (more / fewer pills, different telemetry readouts)
- Whether labels stay simple or get expanded (mass, altitude, threat level)
- Transition effects between screens (currently snap; could be fade or scanline glitch)

---

## 6. Level structure

Six levels. Each level has:
- **Intro screen** with era label, date range, backstory paragraph
- **Tutorial card(s)** when a new mechanic or object type is introduced
- **Gameplay** with specific spawn rates, mix ratios, win/lose conditions
- **Outro fact card** revealing a real-world fact tied to that level's theme
- **Next-level button** or, for Level 6, a final epilogue screen

The level progression is also a teaching curve. Each level introduces ONE new thing on top of all previous mechanics.

### Level 1 — The Quiet (1958–1990)

**Intro screen.** Dim starfield. Single vintage-feeling text: "1958. The world is small. Sputnik orbits. We start throwing things up — and forgetting about them."

**Tutorial card #1 (FIRST TIME — slice mechanic):** "Move your cursor across the screen. A trail follows your motion. Anything it crosses gets sliced." Animated demo: cursor sweeps through a piece of gray debris, debris splits.

**Tutorial card #2 (FIRST TIME — gray junk):** "These are real objects abandoned in orbit. Old satellites, spent rocket stages, even tools dropped by astronauts. They're not coming down."

**Gameplay.** Gray junk only. Spawn cadence one every ~3 seconds. Baseline speed 1.0x. Sizes 18–28px. No actives, no rares, no fragmentation. Sparse, slow, learnable.

**Goal.** Pass score: **100 points**. Hard fail: miss > 12 pieces. 60-second time limit. Multiple paths to 100: 10 clean slices, or 15 slices with up to 10 misses (each miss costs −5).

**Outro fact card.** "Vanguard 1, launched in 1958, is the oldest human-made object still in orbit. It will remain there for an estimated 240 more years. There were approximately 5,000 catalogued objects in orbit by the year 1990."

### Level 2 — The Breakup (1990–2006)

**Intro screen.** Same starfield but slightly busier. Text: "Rocket stages don't just sit there. In the vacuum of space, leftover fuel cooks off and they explode silently. Hundreds of them did, between 1990 and 2006."

**Tutorial card #1 (FIRST TIME — fragmentation):** "Some debris breaks apart in flight. When a piece fragments, two smaller pieces fly out. Catch them all." Animated demo: junk piece arcs across, splits into 3 fragments mid-flight.

**Tutorial card #2 (FIRST TIME — gold rare artifact):** "Gold pulses are historical objects worth preserving — early-era artifacts that survived. Don't slice them. **Tap them on mobile, or hold SPACE + click on desktop**, to collect them. Each is worth +100 points." Animated demo: gold pulse drifts in, SPACE+click captures it.

**Gameplay.** Gray junk + ~30% chance of mid-flight fragmentation. One or two rare artifacts may appear during the level. Spawn cadence one every ~2 seconds. Speed 1.2x.

**Goal.** Pass score: **250 points**. Hard fails: miss > 15 OR destroy > 3 active satellites. 75-second time limit. Multiple paths to 250: 25 junk slices = 250; 15 junk + 1 rare = 250; 5 junk + 2 rares = 250. Rewards both careful slicing and rare collection.

**Outro fact card.** "Between 1961 and 2006, there were 190 known satellite breakups in orbit. Most were caused by leftover fuel in spent rocket stages that exploded years after the mission ended. Some of those rocket stages are still up there today, the same kind that broke up the others."

### Level 3 — The Test (January 11, 2007)

**Intro screen.** Specific date and place. "January 11, 2007. China launches a direct-ascent missile at one of its own retired weather satellites, Fengyun-1C. The test succeeds. The orbital environment changes forever."

**Tutorial card #1 (FIRST TIME — blue active satellites):** "Blue satellites are operating right now — GPS, weather, internet. They're not threats. They're infrastructure. **Do not slice them.** Slicing one costs −25 points and damages essential services. They cross the screen on orbital arcs — let them pass." Animated demo: a Starlink-style satellite arcs across, cursor avoids it.

**Tutorial card #2:** "When a working satellite is destroyed, it produces thousands of new debris fragments. This is the central event of the modern orbital era. You're about to watch one happen."

**Gameplay.** Regular gray junk + actives crossing the screen + then the **boss event**: the FY-1C satellite drifts across the screen for ~6 seconds (cannot be sliced — it's labeled "FY-1C, defunct since 2002, decommissioned weather satellite"). A red trajectory line streaks in from below. The satellite shatters into 40 scattered fragments. Spawn rate goes from 0 to 40-in-one-burst. The player has roughly 8 seconds to clear as many fragments as they can.

**Goal.** Clear at least 15 of the 40 fragments. **Lose:** clear fewer than 8.

**Special scoring.** Each FY-1C fragment slice = +25pts (smaller, faster, more valuable).

**Outro fact card.** "China's 2007 ASAT test against Fengyun-1C generated over 3,500 catalogued debris fragments. Estimates suggest over a million pieces too small to track. Nineteen years later, more than 3,000 of those catalogued fragments are still in orbit. The debris spread from 200 km to 4,000 km in altitude, crossing the paths of nearly every active LEO satellite. The International Space Station has performed multiple emergency maneuvers to avoid this debris cloud."

### Level 4 — The Collision (February 10, 2009)

**Intro screen.** Two-shot graphic: an active satellite icon (blue) and a dead satellite icon (gray) on opposite sides of an orbital intersection. "Two satellites. One alive, one dead. Both ignored the math. February 10, 2009, over the Taymyr Peninsula."

**Tutorial card (FIRST TIME — predictive collision):** "When two satellites are on a collision course, you'll see their trajectory lines. You have a few seconds. Choose one of three:
1. **Collect the live one** (hold SPACE + click) to safely deflect — best outcome.
2. **Slice the dead one** to destroy it — saves the live one. Trade-off.
3. Do nothing — they collide, the screen explodes into a fragment cloud you must clean up." Animated demo.

**Gameplay.** Regular junk + actives + rares + one cinematic collision event partway through. Two named satellites enter (Iridium 33 from one side, Cosmos 2251 from the other) with visible orbit lines arcing toward an intersection. ~5-second window. Standard junk continues spawning at 1.3x speed throughout — divided attention pressure.

**Goal.** Prevent the collision or clean up its aftermath (clear at least 30 of the 50 collision fragments). **Lose:** density of unsliced fragments exceeds 30 simultaneously.

**Outro fact card.** "On February 10, 2009, the dead Russian satellite Cosmos 2251 collided with the operational American satellite Iridium 33 at a relative velocity of 11.7 kilometers per second — about 26,000 miles per hour. It happened 790 km above Siberia. It was the first confirmed accidental collision between two intact satellites. The collision produced 1,632 catalogued fragments. Most are still in orbit. Cosmos 2251 had been defunct since 1995 — a corpse that had been drifting for 14 years before it killed a working satellite."

### Level 5 — The Megaconstellation (2019–present)

**Intro screen.** Dense field of glowing blue dots in formation across the screen. "The sky is now mostly artificial. And mostly one company's."

**Tutorial card (FIRST TIME — penalty escalation):** "Active satellites are now everywhere. Slicing one still costs −25 and damages real infrastructure — only now there are dozens at once. The mix shifts: about half of what you see is something you cannot touch. Read the screen before you swipe."

**Gameplay.** Spawn cadence one every ~1 second. Speed 1.4x. Mix: 50% gray junk, 35% blue actives, 15% rares. Active satellites now spawn from multiple altitudes (varying yBaseline in the arc trajectory). The player must constantly distinguish targets.

Additional flavor: some debris labeled from earlier-era events ("FY-1C fragment", "COSMOS 2251 fragment", "COSMOS 1408 fragment", "LONG MARCH 6A frag") visibly persists into this level — the residue of every previous level is now present in the sky.

**Goal.** 60-second survival with score above 500. **Lose:** 5 active satellites destroyed, OR net score drops below 0.

**Outro fact card.** "As of 2026, over 14,500 active satellites orbit Earth. SpaceX's Starlink operates more than 10,400 of them — more satellites than every other operator on Earth combined. Two major breakups occurred in 2024 alone: a Long March 6A upper stage produced 700+ fragments in August, and Intelsat 33e fragmented in geostationary orbit in October producing 1,104+ fragments. The orbits are filling. The ASAT tests from China (2007) and Russia (2021) are still up there, mixing with the new constellations."

### Level 6 — The Cascade (now and forward)

**Intro screen.** Dimmer. Slightly trembling text or particles. "The cascade is no longer a future scenario. The current population of intact objects already exceeds the runaway threshold at nearly all altitudes between 520 and 1000 km. The math has already decided."

**Tutorial card (FIRST TIME — cascade physics):** "Missed debris collides with other debris and spawns more pieces. Slicing an active satellite now generates fragments proportional to the chaos. The orbital density meter at the top of the screen fills as the cascade compounds. **You cannot win.** You can only hold the line longer than the player before you."

**Tutorial card #2 (collect strategy):** "Collecting actives instead of avoiding them now matters — every collected satellite removes density from the meter. But collecting takes time, and the cascade is fast. Choose your battles."

**Gameplay.** Spawn cadence one every ~0.7 seconds, accelerating. Speed 1.6x. Cascade rule: any missed debris has a 40% chance to spawn 2 new debris on the next cycle. Slicing an active spawns 3 fragments (proportional realism, finally). Collecting an active relieves density (counts double on the meter).

A new visual element: a thin **density band** at the top of the screen visibly fills with junk silhouettes as the cascade compounds. When the band saturates, the game ends — screen turns to static.

**Goal.** Survive. No win condition. Score is *time held* and slice/collect ratio.

**Outro / epilogue.** After the inevitable end:
- Player's stats: time held, debris cleared, rares collected, actives destroyed.
- Single fact: "The European Space Agency's ClearSpace-1 mission, planned for 2026, will be the first attempt in history to actively remove a single piece of orbital debris. The contract is €86 million. Objects in orbit larger than 1 cm: 1,200,000+. You have just played through 68 years of inaction."
- Final line: "There is no level 7."

---

## 7. Story arc summary

| Level | Era | Mechanic introduced | Real event |
|-------|-----|---------------------|------------|
| 1 | 1958–1990 | Slice | The quiet birth of orbital debris |
| 2 | 1990–2006 | Fragmentation, collect (rares) | Silent rocket stage explosions |
| 3 | Jan 11, 2007 | Active satellites (avoid) + boss event | Fengyun-1C ASAT test |
| 4 | Feb 10, 2009 | Predictive collision | Iridium 33 / Cosmos 2251 collision |
| 5 | 2019–now | Dense actives, mix discrimination | Megaconstellation era |
| 6 | Now → future | Cascade physics, density meter | Kessler cascade in progress |

The arc: innocence → breakup → first willful mistake → first accidental consequence → mass commercialization → reckoning. From "we didn't know" through "we knew and did it anyway" to "we cannot stop."

The throughline that earlier-era debris persists across all levels is important — Vanguard 1 and West Ford needles and COSMOS 2251 fragments show up in Level 5 and Level 6 because they really are still up there. Persistence is the point.

---

## 8. Technical architecture

### 8.1 Current prototype (Stage 0)

Single HTML file at `cascade-prototype.html`. Vanilla JS, HTML5 canvas, no dependencies. Runs in any browser by double-clicking.

File structure inside the prototype:
- `CONFIG` block — all tunable numbers (spawn rates, score values, tap thresholds)
- `CATALOG` — real-world labels by type
- `state` object — game state
- `spawnJunk()`, `spawnActive()`, `spawnRare()` — three spawners
- `drawJunk()`, `drawActive()`, `drawRare()` — three renderers
- `sliceFx()`, `collectFx()` — action visual effects
- `checkSliceHits()`, `handleTap()` — hit detection per verb
- Input handlers — mouse, touch, keyboard
- Game loop — `requestAnimationFrame` driven

### 8.2 Next.js port plan

When ready to commit to the production build:

```
/lib
  types.ts              GameObject, ObjectKind, GameState, LevelConfig
  spawn.ts              spawnJunk, spawnActive, spawnRare (pure functions)
  render.ts             drawJunk, drawActive, drawRare
  engine.ts             update + render game loop (decoupled from React)
  input.ts              mouse/touch/keyboard handlers, returns events
  fx.ts                 sliceFx, collectFx
  cascade.ts            Level 6 cascade rule logic
  collision.ts          Level 4 predictive collision logic
/data
  catalog.ts            real-world labels (junk, active, rare)
  levels.ts             LevelConfig[] — spawn rates, mix, win/lose, intro/outro/fact text
/components
  GameCanvas.tsx        React wrapper, canvas ref, engine attach
  LevelIntro.tsx        intro screen with backstory + tutorial cards
  LevelOutro.tsx        outro screen with stats + fact card
  HUD.tsx               score/stats display
  TutorialCard.tsx      reusable tutorial card component
/hooks
  useGameInput.ts       input event normalization
  useGameLoop.ts        rAF orchestration with React lifecycle
/pages
  index.tsx             main menu / level select
  play/[level].tsx      per-level game route
```

State management: Zustand for game state (lightweight, fits JH's existing stack from other projects). React state for menu/level UI.

The single-file prototype is sized exactly right for this translation — each section becomes a file, no rewrites needed.

### 8.3 Eventual native iOS port

The Kessler thesis carries over. SwiftUI with SpriteKit for the canvas layer. Same level structure. Same data. The web prototype proves the design; the native port is for polish, performance, and possible App Store distribution alongside JH's other iOS project.

---

## 9. Audit — what's still to figure out

Working list as of v4.l3 (June 2026). Categorized by domain, prioritized for the Stage 1 push. Items marked HIGH need decisions before Claude Code production build; items marked MEDIUM can be decided in parallel; items marked LOW can wait.

### 9.1 Visual atmosphere and identity — LOCKED (see 5.5)

Baseline locked June 2026 via `cascade-visual-prototype.html`. See section 5.5 for the full specification: mission-control identity, curved Earth horizon with atmospheric glow, three-layer parallax stars, low-alpha nebulae, mission-control HUD with corner brackets and status pills, atmospheric reentry burnup on missed junk, expanded catalog labels (name · year · origin).

Deferred for future polish: landmass features, scanline overlay, radar sweep, expanded label fields, transition effects between screens. None block Claude Code session 1.

### 9.2 Audio and sound design — ✓ DONE (July 2026)

Shipped in the `feat/audio-remediation` branch, all synthesized via Web Audio API (zero assets), built against the `/game-audio` skill standard:
- Full SFX set with mixing buses (sfx/music) + limiter; mute persisted via localStorage, M key
- BGM: look-ahead step sequencer (`lib/music.ts`) — ambient bed (pads + rumble/hiss noise drone) and tension pattern with anti-repetition (phrase variants, coprime layer lengths, note omission, humanize, filter drift; ~111s before realignment)
- Slice SFX: "metallic shear" design (comb-resonant, velocity-sensitive, per-object flavor); two alternate candidates remain switchable at `/audio-test`
- Spatial: stereo panning by object position; shared generated-impulse reverb send
- L6 cascade: continuous drone tracking the density meter from ~20% (gain/detune/brightness escalate)

Remaining (LOW, post-launch): distant radio chatter texture, original composition question.

### 9.3 Levels 4, 5, 6 — ✓ DONE (June 2026, "Stage 2" commit)

All three built and playable: L4 predictive collision with three outcome branches (save Iridium / deflect Cosmos / cleanup), L5 megaconstellation density tuning, L6 cascade physics with density meter and survival scoring (`lib/l4Cinematic.ts`, `lib/cascade.ts`).

Resolved decisions: L4 reduces background spawn during the predictive window (like L3); L6 loss condition is density saturation at 100. Difficulty numbers still need playtest calibration — see 9.4.

### 9.4 Pacing and difficulty calibration — MEDIUM

**Current thresholds:** L1 100/60s, L2 250/75s, L3 400/60s. First-pass numbers based on intuition, not playtesting.

**Open:**
- Are the thresholds tuned right? Need playtest data.
- Does the difficulty curve feel right from L1 → L6?
- Time pressure: should all levels be 60s, or should longer/shorter levels alternate?

### 9.5 Progression and persistence — ✓ MOSTLY DONE (June 2026)

Shipped (`lib/progress.ts`, localStorage): per-level best scores, linear unlock (pass L(n) to open L(n+1)), level select from the menu, replay of unlocked levels, reset.

Remaining (LOW): run-level scoring across all six, rare-artifact collection log / "Museum" view — bundled with the endgame/replayability work in 9.7.

### 9.6 Tutorials and onboarding — LOW

**Current:** Text tutorial cards before each level.

**Open:**
- Interactive practice / sandbox mode for first-timers?
- Skip option for tutorials on replay
- Differentiated first-time vs. returning player flow

### 9.7 Endgame and replayability — LOW

**Current:** Game ends after L6 with the "to be continued" placeholder.

**Open:**
- What is the post-L6 ending? Just credits? Free-play / survival mode unlocked? "Museum" of collected rares?
- Time attack mode for completed levels?
- Daily seed challenge (random level config each day)?

### 9.8 Pre-level intro structure — LOW

**Current:** era + title + backstory + tutorial cards + Begin button. All text.

**Open:**
- Visual element in intro screen (illustration, period photo, animated diagram)
- Audio cue / sting on intro screen open
- Branded chrome / consistent identity across screens

### 9.9 Post-level outro structure — LOW

**Current:** pass/fail status + score display + stats + fact card + buttons.

**Open:**
- Animated count-up reveal of stats (feels more rewarding)
- Bigger visual weight on the fact card (it's the lesson — should land harder)
- Comparison framing ("your score vs. minimum required" — currently shown; could also show "vs. real-world reference number")

### 9.10 Narrative voice and tone — LOW

**Current:** Fact cards are dry-factual. Some fail copy leans heavy ("we could not clear them then. We cannot clear them now.").

**Open:**
- Is the heavy copy right, or does it lecture?
- Should there be a unifying narrator voice across levels, or stay data-driven and impersonal?
- Should rare-artifact labels carry more flavor (longer captions on "Ed White's glove" etc.)?

### 9.11 Mobile and accessibility — MEDIUM

**Current:** Mobile uses tap for collect; desktop uses SPACE + click. Touch targets sized for finger, but not tested across devices.

**Open:**
- Performance on lower-end mobile (Level 6 cascade might be heavy with hundreds of objects)
- Screen orientation: landscape-only or both? Most assets sized for landscape.
- iOS installable PWA?
- Screen reader support for narrative content / accessibility audit

### 9.12 Brand and packaging — LOW (later)

- Logo / wordmark (currently just "Cascade" in monospace)
- Domain name + hosting
- About / credits page
- Social sharing meta tags

---

## 9.13 When to move to Claude Code

The single-file prototypes have served their purpose: validate the core mechanics (slice + collect + arc trajectories), the level scaffolding (state machine + intros + outros + tutorials), the cinematic event pattern (L3), the pass/fail scoring model, and the visual identity (mission-control telemetry, Earth horizon, parallax depth).

**Three decisions need to be made before Claude Code session 1. Status:**

1. ~~**Visual direction locked.**~~ ✓ **DONE** — see section 5.5. The mission-control + Earth horizon + parallax visual identity is the production baseline.
2. **L4, L5, L6 mechanics spec'd.** Mostly done in section 6. A quick re-read pass for completeness — specifically L4's predictive collision precise rules, L6's exact cascade physics math, and L5's mix ratios.
3. **Save state and progression model decided.** Architectural choice that affects the data layer. Options below.

**Save state — decision needed:**

- **Storage:** localStorage (simple, no auth, browser-bound) vs. user accounts (cross-device, requires auth backend). Recommend localStorage for v1; user accounts is a v2 feature.
- **What gets persisted:** Best score per level, total completion state (which levels passed), rare artifacts collected log, total play time, last play date.
- **Level access:** Linear unlock (must pass L1 to access L2) vs. always-open (any level accessible from menu). Recommend linear unlock for the narrative arc; revisit once a player completes the game.
- **Reset option:** Should the user be able to wipe progress? Yes — accessible from settings, requires confirmation.

**What Claude Code handles best:**

- Full Next.js project setup with the architecture from section 8
- Multi-file refactor with proper types and modules
- Implementing all six levels with the locked visual direction
- Persistent storage / progression / level select UI
- Sound design integration and expansion
- Mobile responsiveness audit
- Accessibility audit
- Deployment pipeline

**Recommended sequence:**

1. **Now (here in chat):** Quick re-read of section 6 to lock L4/L5/L6 specs. Make the save state decisions above.
2. **Claude Code session 1:** Set up Next.js project per section 8 architecture. Port v4.1 main game + L3 mechanics. Implement the locked visual layer (section 5.5).
3. **Claude Code session 2:** Build L4 (predictive collision) following L3 cinematic pattern.
4. **Claude Code session 3:** Build L6 (cascade physics + density meter + survival).
5. **Claude Code session 4:** Build L5 (mostly tuning + parameter work).
6. **Claude Code session 5:** Save state + progression + level select.
7. **Claude Code session 6:** Audio expansion, mobile polish, deploy.

Each Claude Code session is sized for a focused weekend block. Full build to a deployable Cascade: roughly 6 sessions from now.

---

## 10. Build log

### v0 (June 2026)
- Initial slice prototype. Single object type (gray junk). Parabolic spawn. Trail rendering. Hit detection via segment-circle proximity. Established the slice feel as solid baseline.

### v1 (June 2026)
- Added object types (junk, active, rare). Speed-based slice/collect: fast cursor = slice, slow cursor = collect.
- Active satellites and rare artifacts rendered with distinct visuals.
- Penalty for slicing actives: −50, spawn 3 fragments, red flash.
- Issue identified: speed-based collect broken on trackpad. Cursor naturally moves too fast.

### v2 (June 2026)
- Reframed: actives became "bombs" (avoid, not collect). Rares became the only collect target.
- Introduced tap-vs-swipe distinction: continuous motion = slice, discrete tap/click = collect.
- Penalty reduced to −25 + flash, no fragment spawn (proportional realism deferred to Level 6).
- New satellite visual (more elaborate — later reverted in v3).
- Issues identified: still hard to tap rares on desktop because cursor transits through them; satellite visual overdesigned.

### v3 (June 2026) — current
- Desktop collect mode: hold SPACE → slice mode off, click to collect. Amber border indicator. Cursor changes to pointer. `window.blur` releases stuck modifier.
- Mobile collect: tap (touchstart + quick touchend, < 280ms, < 12px movement) unchanged.
- Active satellites now follow **arc trajectory** — sine curve from edge to edge with apex mid-screen — mimicking real orbital pass viewed from below.
- Active satellite visual reverted to cleaner v1 design: single soft glow, simple solar panels + bus + antenna dot.
- Standalone HTML file deliverable at `cascade-prototype.html`.

### v4.1 (June 2026)
- **Pass/fail mechanism.** Replaced soft "60% goal" timeout pass with strict per-level point threshold. Each level now has a `passScore` and `hardFails` config (missed limit + destroyed limit). Three fail conditions: timeout below threshold, miss limit exceeded, destroy limit exceeded.
- **Miss penalty.** Junk falling off bottom now costs −5 points (was 0). Discourages wild swiping and makes the score → threshold gap meaningful.
- **HUD redesign.** Now shows score / threshold (instead of cleared / goal), missed / miss-limit, and conditionally sats-hit / destroy-limit for L2+. Hard limits visible at all times so player can self-pace.
- **Outro redesign.** Pass/fail header colored explicitly (blue / red). Failed levels show plain-language fail reason ("too many pieces missed", "time ran out before reaching the score threshold", "too many active satellites destroyed"). Score-vs-threshold displayed prominently in a bordered card colored to match outcome.
- **Retry flow.** Failed levels must be retried before progressing. Pass-only advance to next level.

### v4.l3 (June 2026) — Level 3 standalone prototype
Separate file: `cascade-l3-fy1c-prototype.html`. Built as an isolated layer so we can iterate on cinematic feel without disturbing the working L1/L2 flow.

**Design correction (v2 of the L3 prototype).** First pass made the cinematic the entire level — saving FY-1C ended the level in 2-3 seconds. JH flagged: gameplay first, concept second; each level should run at least 30-45 seconds. The cinematic is now an *event embedded in a 60-second level*, not the whole level. Phase timing:

- 0-10s **OPEN** — regular gameplay starts. Junk, occasional active satellites, occasional rares. Same shape as Level 2.
- 10-13s **APPEAR** — FY-1C drifts in with label box. Background gameplay slows. Player can already grab FY-1C.
- 13-16s **APPROACH** — Missile incoming. Red trajectory line + border pulse. Player still can grab FY-1C.
- 16s **branch** — IMPACT (explosion + 40 fragments) if FY-1C not saved; otherwise skip to AFTERMATH.
- 16-60s **AFTERMATH** — Regular gameplay continues. If destroyed, fragments mix with junk; gradually fragments exit screen and gameplay returns to baseline. If saved, normal junk/active/rare flow throughout.
- 60s **OUTCOME** — Score checked against threshold.

**Pass/fail at L3:**
- Pass threshold: **400 points**
- Save FY-1C bonus: **+200** (was +500; reduced so it isn't a one-click pass)
- Hard fail: destroy 3+ active satellites
- Three outcomes: pass + alternate (saved), pass (cleared aftermath), fail (didn't reach threshold OR hit destruction limit)

**Other technical pieces:**
- Phase manager. Five scripted phases. Time-based transitions with collision-based early triggers (missile reaches FY-1C earlier than the time budget).
- FY-1C as protected target. Cannot be sliced. Can only be tapped/collected (SPACE + click on desktop).
- Homing missile. Spawns at bottom of canvas, chases FY-1C with linear interpolation (4.2 px/frame). Orange trail. Dashed red trajectory line drawn from missile to target.
- Cinematic explosion. Screen flash + 14px screen shake + dual expanding shockwave rings + 40 radial particles + low boom + high crackle audio. Fragments spawn at low gravity (0.06 vs normal 0.18) so they linger for cleanup.
- Two new sounds. `playMissileLaunch` (sawtooth pitch sweep 180Hz → 1200Hz over 2.8s, lowpass-filtered, crescendos at impact). `playExplosion` (sine boom 70Hz → 20Hz + high-frequency crackle burst).

### v4.visual (June 2026) — Visual direction prototype + lock
Separate file: `cascade-visual-prototype.html`. Pure visual demonstration with simplified gameplay. Visual direction locked as production baseline (see section 5.5).

- **Five visual layers implemented and tested together.** Deep space backdrop, three-layer parallax stars with differential drift, three low-alpha nebula gradients, curved Earth horizon with atmospheric glow band and outer haze, atmospheric reentry burnup on missed junk.
- **Earth horizon.** Drawn as a massive arc with conceptual center far below viewport (cy = H + 1100, r = 1300). Dawn-side lighting via radial gradient. City lights flicker on dark side. Cloud wisps drift at 0.00015 rad/frame to suggest eastward orbital motion.
- **Mission-control HUD identity.** Corner brackets framing canvas + status pills with colored dot indicators (`[● STATUS NOMINAL]`, `[ALT 487km]`, `[INC 51.6°]`, `[CLEARED N]`) + bottom telemetry strip with tracking counts + outer mission elapsed time. Status dot color shifts based on object density and reentry count.
- **Atmospheric reentry burnup FX.** Junk falling off the bottom triggers orange-yellow flame streak rising upward + 22 fire particles + 8 smoke particles. Misses no longer disappear silently — they reenter and burn up. The Earth below is the reason.
- **Catalog label upgrade.** Labels now display name + year + origin country in thin bracket frame: `[ COSMOS 1408 fragment · 1982 · USSR ]`.

### v4 (June 2026)
- **State machine.** Added five game states: `menu`, `intro`, `playing`, `outro`, `complete`. Screen transitions handled via opacity-toggled overlay divs.
- **Level config system.** `LEVELS` array drives the game. Each entry has era/title/backstory/tutorials/duration/spawn config/goal/loss/outroFact.
- **Level 1 fully built.** Backstory + slice tutorial + gray junk tutorial. 60-second timer. Goal: clear 15 pieces. Loss: miss 10. Outro fact about Vanguard 1.
- **Level 2 fully built.** Backstory + rare artifact tutorial + active satellite tutorial. 75-second timer. Goal: clear 25 pieces. Loss: miss 12. Outro fact about 190 breakups.
- **HUD.** Live time/score/goal/miss display during gameplay. Mute button persistent across screens.
- **Audio module.** Web Audio API synthesized sounds: slice (band-pass noise burst), collect (two-note chime), active hit (descending sawtooth), UI click (square pulse). Lazy init on first user interaction. Mute toggle.
- **Screen transitions.** Menu → Intro → Playing → Outro → next Intro / Complete. Smooth opacity fades.
- **Stage 1 complete screen.** After Level 2, transitional screen indicating remaining levels are in development. Returns to menu.
- Fragmentation, predictive collision, cascade, and boss event still deferred.
