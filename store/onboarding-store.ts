import { create } from 'zustand';

interface OnboardingState {
  favoriteBrands: string[];
  routineTime: string;
  beautyVibe: string;
  xpPoints: number;

  setFavoriteBrands: (brands: string[]) => void;
  setRoutineTime: (time: string) => void;
  setBeautyVibe: (vibe: string) => void;
  addXP: (xp: number) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  favoriteBrands: [],
  routineTime: '',
  beautyVibe: '',
  xpPoints: 0,

  setFavoriteBrands: (brands) =>
    set({ favoriteBrands: brands }),

  setRoutineTime: (time) =>
    set({ routineTime: time }),

  setBeautyVibe: (vibe) =>
    set({ beautyVibe: vibe }),

  addXP: (xp) =>
    set((state) => ({ xpPoints: state.xpPoints + xp })),

  resetOnboarding: () =>
    set({
      favoriteBrands: [],
      routineTime: '',
      beautyVibe: '',
      xpPoints: 0,
    }),
}));
