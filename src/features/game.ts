import { router } from 'expo-router';
import type { GameMode } from '@/data/types';
import { pickQuestions, questionsFromIds } from '@/logic/game';
import { backend, initializeBackend } from '@/services/backend';
import { useAppStore } from '@/store/app';
import { currentContent, useContentStore } from '@/store/content';
import { useGameStore, type DuelInfo } from '@/store/game';

/** Lance une partie et ouvre l'écran de jeu. */
export async function startGame(mode: GameMode, options: { questionIds?: string[]; duel?: DuelInfo } = {}): Promise<void> {
  try {
    await initializeBackend();
    useContentStore.getState().replace(await backend.contentBank());
  } catch {
    // Le catalogue embarqué ou le dernier cache permet de jouer hors ligne.
  }
  const { univers } = useAppStore.getState();
  const content = currentContent();
  const expressionsByKey = Object.fromEntries(content.expressions.map((expression) => [expression.key, expression]));
  const fromIds = options.questionIds?.length ? questionsFromIds(options.questionIds, content.questions) : [];
  const questions =
    fromIds.length === 5
      ? fromIds
      : pickQuestions(mode, { univers, date: new Date(), questions: content.questions, expressionsByKey });
  useGameStore.getState().start(mode, questions, options.duel);
  router.push('/game/play');
}
