import { Platform } from 'react-native';
import { config } from '../config';
import type { AdsInitOptions, AdsService, RewardedResult } from './types';

type GMA = typeof import('react-native-google-mobile-ads');

/**
 * Le module natif AdMob n'existe pas dans Expo Go : on le charge prudemment
 * pour que l'app ne plante jamais (on retombe alors sur « pas de pub dispo »).
 */
let gma: GMA | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  gma = require('react-native-google-mobile-ads') as GMA;
} catch {
  gma = null;
}

const INTERSTITIAL_EVERY = 3;
let ready = false;
let personalized = false;

function unitId(kind: 'rewarded' | 'interstitial'): string {
  if (!gma) return '';
  const { TestIds } = gma;
  const ios = Platform.OS === 'ios';
  const real = kind === 'rewarded'
    ? (ios ? config.admob.rewardedIos : config.admob.rewardedAndroid)
    : (ios ? config.admob.interstitialIos : config.admob.interstitialAndroid);
  // Tout build interne utilise TOUJOURS les pubs de test, même si une variable
  // EAS partagée contient par erreur un identifiant réel.
  if (!config.isProductionBuild || __DEV__ || !real) return kind === 'rewarded' ? TestIds.REWARDED : TestIds.INTERSTITIAL;
  return real;
}

async function init({ underAgeOfConsent }: AdsInitOptions): Promise<void> {
  if (!gma || ready) return;
  const { default: mobileAds, AdsConsent, MaxAdContentRating } = gma;
  try {
    // 1. Consentement RGPD (formulaire Google UMP, affiché seulement si nécessaire).
    const info = await AdsConsent.gatherConsent({ tagForUnderAgeOfConsent: underAgeOfConsent });
    if (!info.canRequestAds) return;
    const choices = await AdsConsent.getUserChoices().catch(() => null);
    personalized = !underAgeOfConsent && Boolean(choices?.selectPersonalisedAds);
    // 2. Réglages pour un public ado : contenus classés « Teen » maximum.
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.T,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: underAgeOfConsent,
    });
    // 3. Initialisation seulement après le consentement.
    await mobileAds().initialize();
    ready = true;
  } catch {
    ready = false;
  }
}

function showRewarded(): Promise<RewardedResult> {
  if (!gma || !ready) return Promise.resolve('unavailable');
  const { RewardedAd, RewardedAdEventType, AdEventType } = gma;
  return new Promise<RewardedResult>((resolve) => {
    const ad = RewardedAd.createForAdRequest(unitId('rewarded'), { requestNonPersonalizedAdsOnly: !personalized });
    let earned = false;
    let settled = false;
    const done = (r: RewardedResult) => {
      if (settled) return;
      settled = true;
      unsubs.forEach((u) => u());
      resolve(r);
    };
    const timeout = setTimeout(() => done('unavailable'), 12_000);
    const unsubs = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        clearTimeout(timeout);
        ad.show().catch(() => done('unavailable'));
      }),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => done(earned ? 'earned' : 'closed')),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        clearTimeout(timeout);
        done('unavailable');
      }),
    ];
    ad.load();
  });
}

function maybeShowInterstitial(gamesSinceLast: number): Promise<boolean> {
  if (!gma || !ready || gamesSinceLast < INTERSTITIAL_EVERY) return Promise.resolve(false);
  const { InterstitialAd, AdEventType } = gma;
  return new Promise<boolean>((resolve) => {
    const ad = InterstitialAd.createForAdRequest(unitId('interstitial'), { requestNonPersonalizedAdsOnly: !personalized });
    let settled = false;
    const finish = (shown: boolean) => {
      if (settled) return;
      settled = true;
      unsubs.forEach((u) => u());
      resolve(shown);
    };
    const timeout = setTimeout(() => finish(false), 6_000);
    const unsubs = [
      ad.addAdEventListener(AdEventType.LOADED, () => {
        clearTimeout(timeout);
        ad.show().catch(() => finish(false));
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => finish(true)),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        clearTimeout(timeout);
        finish(false);
      }),
    ];
    ad.load();
  });
}

async function openPrivacyOptions(): Promise<void> {
  if (!gma) return;
  await gma.AdsConsent.showPrivacyOptionsForm().catch(() => undefined);
}

export const ads: AdsService = {
  init,
  showRewarded,
  maybeShowInterstitial,
  openPrivacyOptions,
  get available() {
    return Boolean(gma) && ready;
  },
};
