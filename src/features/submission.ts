import { backend } from '@/services/backend';
import type { GameSubmission } from '@/services/backend/types';
import { playerContext } from '@/store/app';

let pending: Promise<string | null> = Promise.resolve(null);

/** Envoie la partie au serveur (qui recalcule le score). Renvoie un message d'erreur éventuel. */
export function submitGame(game: GameSubmission): Promise<string | null> {
  pending = backend
    .submitGame(playerContext(), game)
    .then(() => null)
    .catch((e: unknown) => (e instanceof Error ? e.message : 'Envoi impossible'));
  return pending;
}

/** Attend la fin du dernier envoi (avant de créer un duel à partir de cette partie). */
export function lastSubmission(): Promise<string | null> {
  return pending;
}
