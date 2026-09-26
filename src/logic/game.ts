import {
  CITY_POINTS_PER_GOOD_ANSWER,
  COINS_PER_GOOD_ANSWER,
  QUESTIONS,
  QUESTIONS_BY_ID,
  QUESTIONS_PER_GAME,
} from '@/data/questions';
import { EXPRESSIONS_BY_KEY } from '@/data/expressions';
import type { GameMode, Look, Mood, Question, Region } from '@/data/types';
import { colors } from '@/theme';
import { dayKey } from './dates';
import { hashString, seededRandom, shuffle } from './random';

export type PickOptions = {
  univers?: readonly Region[];
  date?: Date;
  /** Graine explicite (duel) ; sinon aléatoire pour la partie rapide. */
  seed?: number;
  questions?: readonly Question[];
  expressionsByKey?: Readonly<Record<string, { region: Region }>>;
};

function regionOf(q: Question, expressionsByKey: Readonly<Record<string, { region: Region }>> = EXPRESSIONS_BY_KEY): Region {
  return expressionsByKey[q.lex]?.region ?? 'eu';
}

/**
 * Choisit les questions d'une partie.
 * - quick : aléatoire, en priorité dans les univers choisis à l'onboarding ;
 * - daily : les mêmes pour tout le monde le même jour ;
 * - darons : expressions des parents ;
 * - duel : graine partagée par les deux joueurs.
 */
export function pickQuestions(mode: GameMode, options: PickOptions = {}): Question[] {
  const bank = options.questions ?? QUESTIONS;
  const expressionsByKey = options.expressionsByKey ?? EXPRESSIONS_BY_KEY;
  const nonDarons = bank.filter((q) => regionOf(q, expressionsByKey) !== 'darons');
  const darons = bank.filter((q) => regionOf(q, expressionsByKey) === 'darons');

  if (mode === 'darons') {
    const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
    return shuffle(darons, seededRandom(seed)).slice(0, QUESTIONS_PER_GAME);
  }
  if (mode === 'daily') {
    const seed = hashString(`daily:${dayKey(options.date)}`);
    return shuffle(nonDarons, seededRandom(seed)).slice(0, QUESTIONS_PER_GAME);
  }
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rand = seededRandom(seed);
  if (mode === 'duel') return shuffle(nonDarons, rand).slice(0, QUESTIONS_PER_GAME);

  const wanted: Region[] = (options.univers ?? []).filter((r) => r !== 'darons');
  const preferred = wanted.length ? nonDarons.filter((q) => wanted.includes(regionOf(q, expressionsByKey))) : nonDarons;
  const first = shuffle(preferred, rand);
  if (first.length >= QUESTIONS_PER_GAME) return first.slice(0, QUESTIONS_PER_GAME);
  const rest = shuffle(
    nonDarons.filter((q) => !first.includes(q)),
    rand,
  );
  return first.concat(rest).slice(0, QUESTIONS_PER_GAME);
}

export function questionsFromIds(ids: readonly string[], bank: readonly Question[] = QUESTIONS): Question[] {
  const byId = bank === QUESTIONS ? QUESTIONS_BY_ID : Object.fromEntries(bank.map((question) => [question.id, question]));
  return ids.map((id) => byId[id]).filter((q): q is Question => Boolean(q));
}

/** Indices de deux mauvaises réponses à masquer (joker 50/50), stables pour une question. */
export function fiftyFifty(q: Question): number[] {
  return [0, 1, 2, 3].filter((i) => i !== q.good).slice(0, 2);
}

export type GameReward = { coins: number; cityPoints: number };

export function rewardFor(score: number): GameReward {
  return { coins: score * COINS_PER_GOOD_ANSWER, cityPoints: score * CITY_POINTS_PER_GOOD_ANSWER };
}

export type EndLook = { title: string; bg: string; mood: Mood; acc: Look | 'user'; bulle: string };

/** Titre et ambiance de l'écran de fin selon le score (sur 5). */
export function endLook(score: number): EndLook {
  if (score >= 5) return { title: 'LÉGENDE DU QUARTIER', bg: colors.lime, mood: 'proud', acc: 'crown', bulle: colors.pink };
  if (score === 4) return { title: "C'EST CARRÉ !", bg: colors.lime, mood: 'proud', acc: 'user', bulle: colors.pink };
  if (score === 3) return { title: 'PAS MAL, FRÉROT', bg: colors.orange, mood: 'happy', acc: 'user', bulle: colors.lime };
  return { title: 'AÏE, COUP DE VIEUX', bg: colors.violet, mood: 'seum', acc: 'none', bulle: colors.cream };
}

export type FeedbackKind = 'good' | 'wrong' | 'timeout';

export function feedbackTitle(kind: FeedbackKind): [string, string] {
  if (kind === 'good') return ["C'EST", 'CARRÉ !'];
  if (kind === 'timeout') return ['TROP LENT,', 'FRÉROT'];
  return ['AÏE…', 'COUP DE VIEUX'];
}

export const MODE_LABELS: Record<GameMode, string> = {
  quick: 'Partie rapide',
  daily: 'Défi du jour',
  darons: 'Jeunes vs Darons',
  duel: 'Duel',
};

export const MODE_COLORS: Record<GameMode, string> = {
  quick: colors.pink,
  daily: colors.lime,
  darons: colors.violet,
  duel: colors.blue,
};
