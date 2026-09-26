/**
 * Configuration publique lue au build (variables EXPO_PUBLIC_*).
 * Rien de secret ici : tout ce qui est dans l'app peut être lu par un curieux.
 */
function env(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export const config = {
  backend: (env(process.env.EXPO_PUBLIC_BACKEND) === 'supabase' ? 'supabase' : 'local') as 'local' | 'supabase',
  supabaseUrl: env(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: env(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  admob: {
    rewardedAndroid: env(process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID),
    rewardedIos: env(process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS),
    interstitialAndroid: env(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID),
    interstitialIos: env(process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS),
  },
  revenueCat: {
    ios: env(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY),
    android: env(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY),
  },
  privacyUrl: env(process.env.EXPO_PUBLIC_PRIVACY_URL) ?? 'https://tuparlesjeune.app/confidentialite',
  termsUrl: env(process.env.EXPO_PUBLIC_TERMS_URL) ?? 'https://tuparlesjeune.app/cgu',
  accountDeletionUrl: env(process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL) ?? 'https://tuparlesjeune.app/supprimer-mon-compte',
  shareBaseUrl: env(process.env.EXPO_PUBLIC_SHARE_BASE_URL) ?? 'https://tuparlesjeune.app',
  supportEmail: env(process.env.EXPO_PUBLIC_SUPPORT_EMAIL) ?? 'contact@tuparlesjeune.app',
} as const;

export const isSupabaseConfigured = config.backend === 'supabase' && Boolean(config.supabaseUrl && config.supabaseAnonKey);
