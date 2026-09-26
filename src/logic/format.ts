/** 48210 → « 48 210 » avec espace insécable (typographie française). */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 1 → « 1re », 5 → « 5e ». */
export function ordinal(rank: number): string {
  return rank === 1 ? '1re' : `${rank}e`;
}

export function plural(n: number, singular: string, pluralForm?: string): string {
  return `${n} ${n > 1 ? (pluralForm ?? `${singular}s`) : singular}`;
}
