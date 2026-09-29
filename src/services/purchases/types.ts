export type PurchaseResult = 'purchased' | 'cancelled' | 'unavailable' | 'error';

export interface PurchasesService {
  init(appUserId?: string): Promise<void>;
  /** Prix localisé de l'abonnement sans pub (ex. « 1,99 € / mois »), ou null si indisponible. */
  noAdsPrice(): Promise<string | null>;
  buyNoAds(): Promise<PurchaseResult>;
  /** Obligatoire sur l'App Store : restaurer l'abonnement sur un nouveau téléphone. */
  restore(): Promise<boolean>;
  hasNoAds(): Promise<boolean>;
  /** Suit les renouvellements, expirations et restaurations reçus par RevenueCat. */
  subscribeNoAds(listener: (active: boolean) => void): () => void;
  /** Ouvre l'écran système permettant de gérer ou résilier l'abonnement. */
  manageSubscription(): Promise<boolean>;
  readonly available: boolean;
}
