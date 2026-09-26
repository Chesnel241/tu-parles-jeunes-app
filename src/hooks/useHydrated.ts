import { useSyncExternalStore } from 'react';
import { useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';

const subscribe = (onChange: () => void) => {
  const unsubApp = useAppStore.persist.onFinishHydration(onChange);
  const unsubContent = useContentStore.persist.onFinishHydration(onChange);
  return () => {
    unsubApp();
    unsubContent();
  };
};
const getSnapshot = () => useAppStore.persist.hasHydrated() && useContentStore.persist.hasHydrated();

/** true quand les données sauvegardées sur le téléphone sont rechargées. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
