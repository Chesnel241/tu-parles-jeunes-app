import { useEffect } from 'react';
import { ads } from '@/services/ads';
import { backend, initializeBackend } from '@/services/backend';
import { purchases } from '@/services/purchases';
import { isUnderAgeOfConsent, playerContext, useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';

/**
 * Démarrage des services, une fois l'onboarding terminé :
 * connexion anonyme, profil, consentement pub (RGPD) puis achats.
 */
export function Bootstrap() {
  const onboarded = useAppStore((s) => s.onboarded);
  const ageRange = useAppStore((s) => s.ageRange);
  const pseudo = useAppStore((s) => s.pseudo);
  const city = useAppStore((s) => s.city);
  const heart = useAppStore((s) => s.heart);
  const setNoAds = useAppStore((s) => s.setNoAds);

  useEffect(() => {
    initializeBackend()
      .then(() => backend.contentBank())
      .then((bank) => useContentStore.getState().replace(bank))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!onboarded) return;
    let alive = true;
    (async () => {
      try {
        await initializeBackend();
      } catch {
        /* hors ligne : on réessaiera au prochain lancement */
      }
      await ads.init({ underAgeOfConsent: isUnderAgeOfConsent(ageRange) });
      await purchases.init();
      if (alive && purchases.available) setNoAds(await purchases.hasNoAds());
    })();
    return () => {
      alive = false;
    };
  }, [onboarded, ageRange, setNoAds]);

  // Synchronise le profil quand le pseudo, la ville ou le pays de cœur changent.
  useEffect(() => {
    if (!onboarded) return;
    const t = setTimeout(() => {
      initializeBackend()
        .then(() => backend.syncProfile(playerContext()))
        .catch(() => undefined);
    }, 800);
    return () => clearTimeout(t);
  }, [onboarded, pseudo, city, heart]);

  return null;
}
