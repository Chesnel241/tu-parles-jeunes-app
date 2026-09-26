export type RewardedResult = 'earned' | 'closed' | 'unavailable';

export type AdsInitOptions = {
  /** Joueur de moins de 16 ans : pubs non personnalisées, signalé à Google (RGPD). */
  underAgeOfConsent: boolean;
};

export interface AdsService {
  init(options: AdsInitOptions): Promise<void>;
  /** Pub récompensée (« Doubler mes gains »). Ne donne la récompense que si elle est vue. */
  showRewarded(): Promise<RewardedResult>;
  /** Interstitiel entre deux parties, plafonné (1 toutes les 3 parties max). */
  maybeShowInterstitial(gamesSinceLast: number): Promise<boolean>;
  /** Rouvre le formulaire de consentement (obligatoire : réglage accessible à tout moment). */
  openPrivacyOptions(): Promise<void>;
  readonly available: boolean;
}
