export type ObjectKind = 'junk' | 'active' | 'rare' | 'fragment' | 'fy1c';

export interface Vertex {
  x: number;
  y: number;
}

export interface CatalogEntry {
  name: string;
  year: string;
  flag: string;
}

export interface GameObject {
  type: ObjectKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  r: number;
  color: string;
  label: string;
  // polygon types (junk, rare, fragment)
  verts?: Vertex[];
  // active satellite arc trajectory
  xStart?: number;
  xEnd?: number;
  yBaseline?: number;
  arcHeight?: number;
  direction?: number;
  speed?: number;
  glowPhase?: number;
  // rare artifact
  pulse?: number;
  bobPhase?: number;
  baseY?: number;
  // fy1c
  sublabel?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Half {
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vrot: number;
  verts: Vertex[];
  color: string;
  life: number;
  maxLife: number;
  type?: string;
}

export interface Flash {
  x: number;
  y: number;
  r: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Ring {
  x: number;
  y: number;
  r: number;
  targetR: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Label {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export interface ReentryStreak {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  streakLen: number;
  intensity: number;
}

export interface MissileObj {
  x: number;
  y: number;
  speed: number;
  trail: { x: number; y: number }[];
}

export type GameScreen = 'menu' | 'intro' | 'playing' | 'outro' | 'complete';
export type L3Phase = 'open' | 'appear' | 'approach' | 'impact' | 'aftermath' | 'outcome';
export type L3Result = 'pass' | 'alternate' | 'fail' | 'fail-destroyed';

export interface TutorialDef {
  title: string;
  body: string;
}

export interface SpawnConfig {
  junk: number;
  active: number;
  rare: number;
}

export interface HardFails {
  missed?: number;
  destroyed?: number;
}

export interface LevelConfig {
  id: number;
  era: string;
  title: string;
  backstory: string;
  tutorials: TutorialDef[];
  duration: number;
  spawn: SpawnConfig;
  passScore: number;
  hardFails: HardFails;
  outroFact: string;
  isL3?: boolean;
}

export interface GameDisplayState {
  screen: GameScreen;
  currentLevelIdx: number;
  score: number;
  timeRemaining: number;
  cleared: number;
  missed: number;
  destroyed: number;
  collected: number;
  trackingCount: number;
  reentryCount: number;
  resultSuccess: boolean;
  failReason: string | null;
  isMuted: boolean;
  l3Result: L3Result | null;
  fy1cSaved: boolean;
}

export interface EngineGameState {
  objs: GameObject[];
  halves: Half[];
  particles: Particle[];
  labels: Label[];
  trail: TrailPoint[];
  flashes: Flash[];
  rings: Ring[];
  reentries: ReentryStreak[];
  score: number;
  cleared: number;
  missed: number;
  collected: number;
  destroyed: number;
  screenFlash: number;
  shake: number;
  junkTimer: number;
  activeTimer: number;
  rareTimer: number;
  collectMode: boolean;
  levelStartMs: number;
  timeRemaining: number;
  currentLevelIdx: number;
  playing: boolean;
  ended: boolean;
  totalReentries: number;
}
