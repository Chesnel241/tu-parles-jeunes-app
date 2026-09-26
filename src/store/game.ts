import { create } from 'zustand';
import { SECONDS_PER_QUESTION } from '@/data/questions';
import type { GameMode, Question } from '@/data/types';
import { fiftyFifty } from '@/logic/game';

export type Phase = 'question' | 'feedback' | 'done';

export type DuelInfo = { id: string | null; opponent: string; theirScore?: number | null };

type GameState = {
  mode: GameMode;
  duelId: string | null;
  duelOpponent: string | null;
  /** Score de l'adversaire s'il a déjà joué (sinon null). */
  duelTheirScore: number | null;
  questions: Question[];
  index: number;
  /** Réponse choisie pour chaque question ; -1 = temps écoulé. */
  answers: number[];
  phase: Phase;
  timeLeft: number;
  hidden: number[];
  hintShown: boolean;
  used5050: boolean;
  usedHint: boolean;
  /** Expressions débloquées pendant cette partie. */
  newUnlocks: string[];
  committed: boolean;
  doubled: boolean;

  start: (mode: GameMode, questions: Question[], duel?: DuelInfo) => void;
  answer: (choice: number, alreadyUnlocked: readonly string[]) => void;
  tick: (alreadyUnlocked: readonly string[]) => void;
  next: () => void;
  use5050: () => void;
  useHint: () => void;
  markCommitted: () => void;
  markDoubled: () => void;
};

export const useGameStore = create<GameState>()((set, get) => ({
  mode: 'quick',
  duelId: null,
  duelOpponent: null,
  duelTheirScore: null,
  questions: [],
  index: 0,
  answers: [],
  phase: 'question',
  timeLeft: SECONDS_PER_QUESTION,
  hidden: [],
  hintShown: false,
  used5050: false,
  usedHint: false,
  newUnlocks: [],
  committed: false,
  doubled: false,

  start: (mode, questions, duel) =>
    set({
      mode,
      duelId: duel?.id ?? null,
      duelOpponent: duel?.opponent ?? null,
      duelTheirScore: duel?.theirScore ?? null,
      questions,
      index: 0,
      answers: [],
      phase: 'question',
      timeLeft: SECONDS_PER_QUESTION,
      hidden: [],
      hintShown: false,
      used5050: false,
      usedHint: false,
      newUnlocks: [],
      committed: false,
      doubled: false,
    }),

  answer: (choice, alreadyUnlocked) => {
    const s = get();
    if (s.phase !== 'question') return;
    const q = s.questions[s.index];
    if (!q) return;
    const good = choice === q.good;
    const isNew = good && !alreadyUnlocked.includes(q.lex) && !s.newUnlocks.includes(q.lex);
    set({
      answers: [...s.answers, choice],
      phase: 'feedback',
      newUnlocks: isNew ? [...s.newUnlocks, q.lex] : s.newUnlocks,
    });
  },

  tick: (alreadyUnlocked) => {
    const s = get();
    if (s.phase !== 'question') return;
    if (s.timeLeft <= 1) get().answer(-1, alreadyUnlocked);
    else set({ timeLeft: s.timeLeft - 1 });
  },

  next: () => {
    const s = get();
    if (s.index + 1 >= s.questions.length) {
      set({ phase: 'done' });
      return;
    }
    set({ index: s.index + 1, phase: 'question', timeLeft: SECONDS_PER_QUESTION, hidden: [], hintShown: false });
  },

  use5050: () => {
    const s = get();
    const q = s.questions[s.index];
    if (!q || s.used5050) return;
    set({ hidden: fiftyFifty(q), used5050: true });
  },

  useHint: () => {
    if (get().usedHint) return;
    set({ hintShown: true, usedHint: true });
  },

  markCommitted: () => set({ committed: true }),
  markDoubled: () => set({ doubled: true }),
}));

export function scoreOf(s: Pick<GameState, 'questions' | 'answers'>): number {
  return s.answers.reduce((acc, a, i) => acc + (s.questions[i] && a === s.questions[i]?.good ? 1 : 0), 0);
}
