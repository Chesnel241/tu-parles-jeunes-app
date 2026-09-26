import { daysBetween } from './dates';

/**
 * Série de jours consécutifs.
 * - déjà joué aujourd'hui : la série ne bouge pas ;
 * - joué hier : +1 ;
 * - sinon : on repart à 1.
 */
export function nextStreak(current: number, lastDay: string | null, today: string): number {
  if (!lastDay) return 1;
  const gap = daysBetween(lastDay, today);
  if (gap <= 0) return Math.max(1, current);
  if (gap === 1) return current + 1;
  return 1;
}

/** Série affichée : elle tombe à 0 si le joueur a raté plus d'un jour. */
export function visibleStreak(current: number, lastDay: string | null, today: string): number {
  if (!lastDay) return 0;
  return daysBetween(lastDay, today) > 1 ? 0 : current;
}
