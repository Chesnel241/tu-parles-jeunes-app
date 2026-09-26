import type { AdsService } from './types';

/** Version web (aperçu navigateur) : pas de publicité. */
export const ads: AdsService = {
  init: async () => undefined,
  showRewarded: async () => 'unavailable',
  maybeShowInterstitial: async () => false,
  openPrivacyOptions: async () => undefined,
  available: false,
};
