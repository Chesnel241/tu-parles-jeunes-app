/**
 * Premier filtre côté téléphone, pour un retour immédiat au joueur.
 * Ce n'est PAS la sécurité : le serveur refait les mêmes contrôles (supabase/migrations)
 * et toute proposition reste invisible tant qu'elle n'est pas validée.
 */

const BLOCKLIST = [
  'connard', 'connasse', 'salope', 'pute', 'putain de', 'encule', 'enculé', 'batard', 'bâtard', 'fdp',
  'ntm', 'nique ta', 'niquer ta', 'pd', 'pédé', 'tapette', 'negro', 'nègre', 'bougnoul', 'youpin', 'bicot',
  'sale noir', 'sale arabe', 'sale juif', 'sale blanc', 'suicide', 'viol', 'sexe', 'porno', 'bite', 'chatte', 'couilles',
];

export type ModerationResult = { ok: true } | { ok: false; reason: string };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9@' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkText(text: string, { min = 2, max = 60 } = {}): ModerationResult {
  const raw = text.trim();
  if (raw.length < min) return { ok: false, reason: 'C’est un peu court.' };
  if (raw.length > max) return { ok: false, reason: `${max} caractères maximum.` };
  if (/https?:\/\/|www\.|\.(com|fr|net|org)\b/i.test(raw)) return { ok: false, reason: 'Pas de lien, merci.' };
  if (/@[a-z0-9_.]{2,}/i.test(raw)) return { ok: false, reason: 'Pas de pseudo ni de compte : on ne cite personne.' };
  if (/\d{6,}|(\+|00)\d{2,}/.test(raw.replace(/\s/g, ''))) return { ok: false, reason: 'Pas de numéro, merci.' };
  const n = ` ${normalize(raw)} `;
  const hit = BLOCKLIST.some((w) => n.includes(` ${normalize(w)} `));
  if (hit) return { ok: false, reason: 'Pas d’insulte ni de contenu choquant.' };
  return { ok: true };
}

export function checkProposal(word: string, mean: string): ModerationResult {
  const w = checkText(word, { min: 2, max: 60 });
  if (!w.ok) return w;
  if (mean.trim().length === 0) return { ok: false, reason: 'Dis-nous ce que ça veut dire.' };
  return checkText(mean, { min: 2, max: 120 });
}

export function checkPseudo(pseudo: string): ModerationResult {
  const p = pseudo.trim();
  if (p.length < 2) return { ok: false, reason: 'Au moins 2 caractères.' };
  if (p.length > 16) return { ok: false, reason: '16 caractères maximum.' };
  if (!/^[\p{L}\p{N} ._-]+$/u.test(p)) return { ok: false, reason: 'Lettres, chiffres, point, tiret seulement.' };
  return checkText(p, { min: 2, max: 16 });
}
