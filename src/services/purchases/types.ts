export type PurchaseResult = 'purchased' | 'cancelled' | 'unavailable' | 'error';

export interface PurchasesService {
  init(appUserId?: string): Promise<void>;
  /** Prix localisé du pack sans pub (ex. « 3,99 € »), ou null si indisponible. */
  noAdsPrice(): Promise<string | null>;
  buyNoAds(): Promise<PurchaseResult>;
  /** Obligatoire sur l'App Store : restaurer un achat sur un nouveau téléphone. */
  restore(): Promise<boolean>;
  hasNoAds(): Promise<boolean>;
  readonly available: boolean;
}
