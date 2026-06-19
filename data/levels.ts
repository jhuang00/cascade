import type { LevelConfig } from '@/lib/types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    era: '1958–1990',
    title: 'The Quiet',
    backstory: "The world is small. Sputnik orbits. We start throwing things up — and forgetting about them. Nobody is counting yet.",
    tutorials: [
      {
        title: 'Slice',
        body: 'Move your cursor across the screen. A trail follows your motion. Anything it crosses gets sliced.',
      },
      {
        title: 'Gray junk',
        body: "These are real objects abandoned in orbit. Old satellites, spent rocket stages, even tools dropped by astronauts. They're not coming down on their own.",
      },
    ],
    duration: 60,
    spawn: { junk: 55, active: 0, rare: 0 },
    passScore: 100,
    hardFails: { missed: 12 },
    outroFact: 'Vanguard 1, launched in 1958, is the oldest human-made object still in orbit. It will remain there for an estimated 240 more years. By 1990 there were approximately 5,000 catalogued objects in orbit.',
  },
  {
    id: 2,
    era: '1990–2006',
    title: 'The Breakup',
    backstory: "Rocket stages don't just sit there. In the vacuum of space, leftover fuel cooks off and they explode silently. Hundreds of them did, between 1990 and 2006.",
    tutorials: [
      {
        title: 'Gold pulse — rare artifacts',
        body: 'Gold pulses are historical objects worth preserving. Tap them on mobile, or hold SPACE and click on desktop, to collect them. Each one is worth +100 points.',
      },
      {
        title: 'Blue — active satellites',
        body: "Blue satellites are working infrastructure — GPS, weather, internet. Don't slice them. Each one destroyed costs −25 points and damages real services. They follow stable orbital arcs — let them pass.",
      },
    ],
    duration: 75,
    spawn: { junk: 45, active: 200, rare: 380 },
    passScore: 250,
    hardFails: { missed: 15, destroyed: 3 },
    outroFact: 'Between 1961 and 2006, there were 190 known satellite breakups in orbit. Most were caused by leftover fuel in spent rocket stages exploding years after their missions ended. Some of those stages are still up there today — the same kind that broke up the others.',
  },
  {
    id: 3,
    era: 'January 11, 2007',
    title: 'The Test',
    backstory: "China launches a direct-ascent missile at one of its own retired weather satellites, Fengyun-1C. The test succeeds. The orbital environment changes forever.",
    tutorials: [
      {
        title: 'Blue — active satellites',
        body: "Blue satellites are operating right now — GPS, weather, internet. Do not slice them. Slicing one costs −25 points and damages essential services. They cross the screen on orbital arcs — let them pass.",
      },
      {
        title: 'The cinematic event',
        body: "Around the ten-second mark, a defunct weather satellite drifts in. A missile follows. If you act fast — hold SPACE and click the satellite (or tap on mobile) — you can preserve it for the alternate timeline, +200 points. If you don't, you'll be clearing the fragment cloud while regular junk continues to fall.",
      },
    ],
    duration: 60,
    spawn: { junk: 55, active: 220, rare: 400 },
    passScore: 400,
    hardFails: { destroyed: 3 },
    outroFact: "China's 2007 ASAT test against Fengyun-1C generated over 3,500 catalogued debris fragments. Estimates suggest over a million pieces too small to track. Nineteen years later, more than 3,000 of those catalogued fragments are still in orbit. The debris spread from 200 km to 4,000 km in altitude, crossing the paths of nearly every active LEO satellite. The International Space Station has performed multiple emergency maneuvers to avoid this debris cloud.",
    isL3: true,
  },
];
