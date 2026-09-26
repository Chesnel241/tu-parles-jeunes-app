import { CITY_QUOTA, PIONEER_QUOTA } from '@/data/places';

export type CityProgress = {
  players: number;
  expressions: number;
  pioneer: boolean;
};

export function quotaFor(pioneer: boolean) {
  return pioneer ? PIONEER_QUOTA : CITY_QUOTA;
}

export function missing(progress: CityProgress) {
  const q = quotaFor(progress.pioneer);
  return {
    players: Math.max(0, q.players - progress.players),
    expressions: Math.max(0, q.expressions - progress.expressions),
  };
}

export function isReadyToOpen(progress: CityProgress): boolean {
  const m = missing(progress);
  return m.players === 0 && m.expressions === 0;
}

export function ratio(value: number, max: number): number {
  if (max <= 0) return 1;
  return Math.min(1, Math.max(0, value / max));
}

/** Nettoie un nom de ville saisi (espaces, longueur). La vraie app valide contre une liste officielle. */
export function normalizeCityName(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 40);
}
