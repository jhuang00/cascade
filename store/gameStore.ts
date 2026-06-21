'use client';
import { create } from 'zustand';
import type { GameDisplayState, GameScreen, L4Result } from '@/lib/types';

interface GameStore extends GameDisplayState {
  setScreen: (screen: GameScreen) => void;
  setMuted: (m: boolean) => void;
  syncFromEngine: (partial: Partial<GameDisplayState>) => void;
  setLevelResult: (success: boolean, failReason: string | null, extras?: { l3Result?: string; l4Result?: string; survivalTime?: number }) => void;
  reset: () => void;
}

const initialState: GameDisplayState = {
  screen: 'menu',
  currentLevelIdx: 0,
  score: 0,
  timeRemaining: 60,
  cleared: 0,
  missed: 0,
  destroyed: 0,
  collected: 0,
  trackingCount: 0,
  reentryCount: 0,
  resultSuccess: false,
  failReason: null,
  isMuted: false,
  l3Result: null,
  fy1cSaved: false,
  l4Result: null,
  densityMeter: 0,
  survivalTime: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  setMuted: (isMuted) => set({ isMuted }),

  syncFromEngine: (partial) => set((state) => ({ ...state, ...partial })),

  setLevelResult: (resultSuccess, failReason, extras) =>
    set({
      resultSuccess,
      failReason,
      l3Result: (extras?.l3Result as GameDisplayState['l3Result']) ?? null,
      l4Result: (extras?.l4Result as L4Result) ?? null,
      survivalTime: extras?.survivalTime ?? 0,
    }),

  reset: () => set({ ...initialState }),
}));
