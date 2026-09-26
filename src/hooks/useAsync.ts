import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type AsyncState<T> = { data: T | null; loading: boolean; error: string | null; reload: () => void };

type Stored<T> = { key: string | null; data: T | null; error: string | null };

/**
 * Charge une donnée asynchrone (classements, duels…) avec état de chargement et d'erreur.
 * Pendant un rechargement, l'ancienne donnée reste affichée (pas de clignotement).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [nonce, setNonce] = useState(0);
  const [stored, setStored] = useState<Stored<T>>({ key: null, data: null, error: null });
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  const key = JSON.stringify([...deps, nonce]);

  useEffect(() => {
    let alive = true;
    fnRef
      .current()
      .then((data) => {
        if (alive) setStored({ key, data, error: null });
      })
      .catch((e: unknown) => {
        if (alive) setStored((s) => ({ key, data: s.data, error: e instanceof Error ? e.message : 'Oups, réessaie.' }));
      });
    return () => {
      alive = false;
    };
  }, [key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data: stored.data, loading: stored.key !== key, error: stored.key === key ? stored.error : null, reload };
}
