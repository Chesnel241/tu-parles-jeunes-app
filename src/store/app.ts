import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STARTER_UNLOCKED } from '@/data/expressions';
import { countryOfCity } from '@/data/places';
import { LOOKS, STARTER_COINS } from '@/data/shop';
import type { AgeRange, GameMode, Look, Region } from '@/data/types';
import { dayKey, isoWeek } from '@/logic/dates';
import { rewardFor } from '@/logic/game';
import { nextStreak, visibleStreak } from '@/logic/streak';
import type { PlayerContext } from '@/services/backend/types';

function weekKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-W${isoWeek(d)}`;
}

export type GameRecord = {
  mode: GameMode;
  score: number;
  unlocked: string[];
};

type Profile = {
  onboarded: boolean;
  pseudo: string;
  ageRange: AgeRange | null;
  /** Date d'acceptation des CGU et règles communautaires en vigueur. */
  termsAcceptedAt: string | null;
  /** Duel reçu avant l'onboarding, repris automatiquement une fois le profil créé. */
  pendingDuelId: string | null;
  city: string;
  customCity: boolean;
  country: string;
  heart: string | null;
  univers: Region[];
};

type Progress = {
  coins: number;
  streak: number;
  lastPlayedDay: string | null;
  unlocked: string[];
  look: Look;
  owned: Look[];
  noAds: boolean;
  games: number;
  weeklyPoints: number;
  weekKey: string;
  dailyDay: string | null;
  dailyScore: number;
  gamesSinceInterstitial: number;
  cityOpenedSeen: boolean;
};

type Actions = {
  setPseudo: (pseudo: string) => void;
  setAgeRange: (age: AgeRange) => void;
  acceptTerms: () => void;
  setPendingDuelId: (id: string | null) => void;
  chooseCity: (city: string) => void;
  launchCity: (city: string, country: string) => void;
  toggleUnivers: (r: Region) => void;
  completeOnboarding: () => void;
  recordGame: (g: GameRecord) => void;
  addCoins: (n: number) => void;
  buyLook: (look: Look) => 'ok' | 'owned' | 'poor' | 'locked';
  equipLook: (look: Look) => void;
  setNoAds: (v: boolean) => void;
  setHeart: (country: string | null) => void;
  markCityOpenedSeen: () => void;
  resetInterstitialCounter: () => void;
  resetAll: () => void;
};

export type AppState = Profile & Progress & Actions;

const initialProfile: Profile = {
  onboarded: false,
  pseudo: '',
  ageRange: null,
  termsAcceptedAt: null,
  pendingDuelId: null,
  city: 'Lyon',
  customCity: false,
  country: 'France',
  heart: null,
  univers: ['eu', 'af', 'web', 'darons'],
};

const initialProgress = (): Progress => ({
  coins: STARTER_COINS,
  streak: 0,
  lastPlayedDay: null,
  unlocked: [...STARTER_UNLOCKED],
  look: 'cap',
  owned: ['none', 'cap'],
  noAds: false,
  games: 0,
  weeklyPoints: 0,
  weekKey: weekKey(),
  dailyDay: null,
  dailyScore: 0,
  gamesSinceInterstitial: 0,
  cityOpenedSeen: false,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialProfile,
      ...initialProgress(),

      setPseudo: (pseudo) => set({ pseudo: pseudo.trim().slice(0, 16) }),
      setAgeRange: (ageRange) => set({ ageRange }),
      acceptTerms: () => set({ termsAcceptedAt: new Date().toISOString() }),
      setPendingDuelId: (pendingDuelId) => set({ pendingDuelId }),
      chooseCity: (city) => set({ city, customCity: false, country: countryOfCity(city) ?? get().country, cityOpenedSeen: false }),
      launchCity: (city, country) => set({ city, country, customCity: true, cityOpenedSeen: false }),
      toggleUnivers: (r) => {
        const cur = get().univers;
        set({ univers: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] });
      },
      completeOnboarding: () => set({ onboarded: true }),

      recordGame: ({ mode, score, unlocked }) => {
        const s = get();
        const today = dayKey();
        const wk = weekKey();
        const { coins, cityPoints } = rewardFor(score);
        set({
          coins: s.coins + coins,
          games: s.games + 1,
          streak: nextStreak(s.streak, s.lastPlayedDay, today),
          lastPlayedDay: today,
          weeklyPoints: (s.weekKey === wk ? s.weeklyPoints : 0) + cityPoints,
          weekKey: wk,
          unlocked: Array.from(new Set([...s.unlocked, ...unlocked])),
          dailyDay: mode === 'daily' ? today : s.dailyDay,
          dailyScore: mode === 'daily' ? score : s.dailyScore,
          gamesSinceInterstitial: s.gamesSinceInterstitial + 1,
        });
      },

      addCoins: (n) => set({ coins: Math.max(0, get().coins + n) }),

      buyLook: (look) => {
        const s = get();
        const item = LOOKS.find((l) => l.id === look);
        if (!item || item.lockedLabel) return 'locked';
        if (s.owned.includes(look)) return 'owned';
        if (s.coins < item.price) return 'poor';
        set({ coins: s.coins - item.price, owned: [...s.owned, look], look });
        return 'ok';
      },
      equipLook: (look) => {
        if (get().owned.includes(look)) set({ look });
      },
      setNoAds: (noAds) => set({ noAds }),
      setHeart: (heart) => set({ heart }),
      markCityOpenedSeen: () => set({ cityOpenedSeen: true }),
      resetInterstitialCounter: () => set({ gamesSinceInterstitial: 0 }),
      resetAll: () => set({ ...initialProfile, ...initialProgress() }),
    }),
    {
      name: 'tpj.app.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Contexte envoyé au backend (classements, duels, propositions). */
export function playerContext(s: AppState = useAppStore.getState()): PlayerContext {
  return {
    pseudo: s.pseudo,
    ageRange: s.ageRange,
    termsAcceptedAt: s.termsAcceptedAt,
    city: s.city,
    country: s.country,
    customCity: s.customCity,
    heart: s.heart,
    weeklyPoints: s.weekKey === weekKey() ? s.weeklyPoints : 0,
  };
}

export function displayedStreak(s: Pick<AppState, 'streak' | 'lastPlayedDay'>): number {
  return visibleStreak(s.streak, s.lastPlayedDay, dayKey());
}

export function dailyDoneToday(s: Pick<AppState, 'dailyDay'>): boolean {
  return s.dailyDay === dayKey();
}

/** Moins de 16 ans : pubs non personnalisées (RGPD). */
export function isUnderAgeOfConsent(age: AgeRange | null): boolean {
  return age === '13-15' || age === 'under13' || age === null;
}
