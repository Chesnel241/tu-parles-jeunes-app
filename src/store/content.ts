import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EXPRESSIONS } from '@/data/expressions';
import { QUESTIONS } from '@/data/questions';
import type { Expression } from '@/data/types';
import type { ContentBank } from '@/services/backend/types';

type ContentState = ContentBank & {
  refreshedAt: string | null;
  replace: (bank: ContentBank) => void;
  clear: () => void;
};

const bundled: ContentBank = {
  expressions: [...EXPRESSIONS],
  questions: [...QUESTIONS],
};

function mergeBy<T>(base: readonly T[], remote: readonly T[], keyOf: (item: T) => string): T[] {
  const merged = new Map(base.map((item) => [keyOf(item), item]));
  remote.forEach((item) => merged.set(keyOf(item), item));
  return Array.from(merged.values());
}

/** Banque persistée : le contenu embarqué reste disponible hors ligne et après une mise à jour. */
export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      ...bundled,
      refreshedAt: null,
      replace: (bank) =>
        set({
          expressions: mergeBy(EXPRESSIONS, bank.expressions, (e) => e.key),
          questions: mergeBy(QUESTIONS, bank.questions, (q) => q.id),
          refreshedAt: new Date().toISOString(),
        }),
      clear: () => set({ ...bundled, refreshedAt: null }),
    }),
    {
      name: 'tpj.content.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<ContentState>;
        return {
          ...current,
          ...saved,
          expressions: mergeBy(EXPRESSIONS, saved.expressions ?? [], (expression) => expression.key),
          questions: mergeBy(QUESTIONS, saved.questions ?? [], (question) => question.id),
          replace: current.replace,
          clear: current.clear,
        };
      },
    },
  ),
);

export function currentContent(): ContentBank {
  const { expressions, questions } = useContentStore.getState();
  return { expressions, questions };
}

export function expressionFromContent(key: string): Expression | undefined {
  return useContentStore.getState().expressions.find((expression) => expression.key === key);
}
