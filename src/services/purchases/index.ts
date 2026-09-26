import type { PurchasesService } from './types';

/** Version web (aperçu navigateur) : pas d'achat intégré. */
export const purchases: PurchasesService = {
  init: async () => undefined,
  noAdsPrice: async () => null,
  buyNoAds: async () => 'unavailable',
  restore: async () => false,
  hasNoAds: async () => false,
  available: false,
};
