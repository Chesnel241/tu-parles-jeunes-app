import type { RankRow } from '@/data/types';
import { formatNumber, ordinal } from './format';

export type DisplayRow = {
  key: string;
  rank: number | null;
  name: string;
  pts: number;
  ptsText: string;
  share: number;
  me: boolean;
  heart: boolean;
  separator: boolean;
  color?: string;
};

function sortRows(rows: readonly RankRow[]): RankRow[] {
  return rows.slice().sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name, 'fr'));
}

/**
 * Transforme un classement brut en lignes affichables.
 * Affiche le top `limit`, puis « … » et les lignes importantes (moi, pays de cœur) si elles sont plus bas.
 */
export function toDisplayRows(rows: readonly RankRow[], limit = 10): DisplayRow[] {
  const sorted = sortRows(rows);
  const max = sorted[0]?.pts || 1;
  const mk = (r: RankRow, i: number): DisplayRow => ({
    key: `${r.name}-${i}`,
    rank: i + 1,
    name: r.name,
    pts: r.pts,
    ptsText: formatNumber(r.pts),
    share: Math.max(0.03, r.pts / max),
    me: Boolean(r.me),
    heart: Boolean(r.heart),
    separator: false,
    color: r.color,
  });
  const out = sorted.slice(0, limit).map(mk);
  const extras = sorted
    .map((r, i) => ({ r, i }))
    .filter(({ r, i }) => i >= limit && (r.me || r.heart));
  extras.forEach(({ r, i }) => {
    out.push({ key: `sep-${i}`, rank: null, name: '…', pts: 0, ptsText: '', share: 0, me: false, heart: false, separator: true });
    out.push(mk(r, i));
  });
  return out;
}

export function myRank(rows: readonly RankRow[]): number | null {
  const idx = sortRows(rows).findIndex((r) => r.me);
  return idx < 0 ? null : idx + 1;
}

/** Message sous le classement : combien de points pour doubler l'équipe devant. */
export function chaseMessage(rows: readonly RankRow[]): { head: string; body: string } | null {
  const sorted = sortRows(rows);
  const idx = sorted.findIndex((r) => r.me);
  if (idx < 0) return null;
  const me = sorted[idx] as RankRow;
  if (idx === 0) return { head: `${me.name} est ${ordinal(1)}.`, body: 'Tiens bon jusqu’à dimanche, tout le monde te court après.' };
  const ahead = sorted[idx - 1] as RankRow;
  const gap = ahead.pts - me.pts + 10;
  return {
    head: `${me.name} est ${ordinal(idx + 1)}.`,
    body: `Encore ${formatNumber(gap)} pts pour doubler ${ahead.name}. Chaque bonne réponse compte.`,
  };
}
