import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuration Expo de « Tu parles jeune ? ».
 *
 * Les identifiants sensibles ou propres à ton compte (AdMob, EAS) viennent des
 * variables d'environnement EAS (voir docs/PUBLICATION.md). Sans elles, l'app
 * utilise les identifiants de TEST officiels de Google : aucune vraie pub ne
 * s'affiche et aucun revenu n'est généré, ce qui évite tout risque de ban AdMob
 * pendant le développement.
 */

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PRODUCTION_BUILD = process.env.EAS_BUILD_PROFILE === 'production';

// Identifiants d'application AdMob de test publiés par Google.
const ADMOB_ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

const BUNDLE_ID = process.env.APP_BUNDLE_ID ?? 'com.logiqueprod.tuparlesjeune';
const EAS_PROJECT_ID = 'fd2c392c-65ce-4ded-bc08-891455c43f89';
const SHARE_BASE_URL = process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? 'https://tuparlesjeune.app';
const SHARE_HOST = new URL(SHARE_BASE_URL).hostname;

if (IS_PRODUCTION_BUILD) {
  const required = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'ADMOB_ANDROID_APP_ID',
    'ADMOB_IOS_APP_ID',
    'EXPO_PUBLIC_ADMOB_REWARDED_ANDROID',
    'EXPO_PUBLIC_ADMOB_REWARDED_IOS',
    'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID',
    'EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS',
    'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
    'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
    'EXPO_PUBLIC_PRIVACY_URL',
    'EXPO_PUBLIC_TERMS_URL',
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
    'EXPO_PUBLIC_SHARE_BASE_URL',
    'EXPO_PUBLIC_SUPPORT_EMAIL',
  ].filter((key) => !process.env[key]?.trim());
  if (process.env.EXPO_PUBLIC_BACKEND !== 'supabase') required.push('EXPO_PUBLIC_BACKEND=supabase');
  if (required.length) {
    throw new Error(`Build de production refusé : configuration manquante (${required.join(', ')}).`);
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'TPJ (dev)' : 'Tu parles jeune ?',
  slug: 'tu-parles-jeune',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'tuparlesjeune',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#FFF4E0',
  ...(EAS_PROJECT_ID
    ? {
        runtimeVersion: { policy: 'appVersion' as const },
        updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
      }
    : {}),
  ios: {
    bundleIdentifier: IS_DEV ? `${BUNDLE_ID}.dev` : BUNDLE_ID,
    supportsTablet: false,
    icon: './assets/icon.png',
    associatedDomains: [`applinks:${SHARE_HOST}`],
    infoPlist: {
      // L'app n'utilise que le chiffrement standard (HTTPS) : pas de déclaration d'export.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: IS_DEV ? `${BUNDLE_ID}.dev` : BUNDLE_ID,
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#C8F53C',
    },
    // Permissions inutiles retirées pour une fiche Play Store propre.
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          { scheme: 'https', host: SHARE_HOST, pathPrefix: '/duel' },
        ],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-sharing',
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#C8F53C',
        image: './assets/splash-icon.png',
        imageWidth: 240,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_ANDROID_APP_ID ?? ADMOB_ANDROID_TEST_APP_ID,
        iosAppId: process.env.ADMOB_IOS_APP_ID ?? ADMOB_IOS_TEST_APP_ID,
        // On attend le consentement RGPD avant toute mesure publicitaire.
        // L'app ne demande pas le suivi publicitaire iOS (ATT) : public jeune, pubs non ciblées par défaut.
        delayAppMeasurementInit: true,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
});
