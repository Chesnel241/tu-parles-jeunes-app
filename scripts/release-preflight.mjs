import { readFileSync } from 'node:fs';
import process from 'node:process';

const required = [
  'EAS_PROJECT_ID',
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
];

const errors = required.filter((key) => !process.env[key]?.trim()).map((key) => `${key} manque`);
if (process.env.EXPO_PUBLIC_BACKEND !== 'supabase') errors.push('EXPO_PUBLIC_BACKEND doit valoir supabase');

for (const key of ['EXPO_PUBLIC_PRIVACY_URL', 'EXPO_PUBLIC_TERMS_URL', 'EXPO_PUBLIC_ACCOUNT_DELETION_URL', 'EXPO_PUBLIC_SHARE_BASE_URL']) {
  const value = process.env[key];
  if (value) {
    try {
      if (new URL(value).protocol !== 'https:') errors.push(`${key} doit utiliser HTTPS`);
    } catch {
      errors.push(`${key} n’est pas une URL valide`);
    }
  }
}

if (process.env.EXPO_PUBLIC_SUPPORT_EMAIL && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(process.env.EXPO_PUBLIC_SUPPORT_EMAIL)) {
  errors.push('EXPO_PUBLIC_SUPPORT_EMAIL n’est pas une adresse valide');
}

const legalFiles = ['docs/CONFIDENTIALITE.md', 'docs/CGU.md'];
for (const file of legalFiles) {
  const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  if (/\[(DATE|NOM DE LA STRUCTURE|STRUCTURE|ADRESSE E-MAIL|RÉGION)/.test(content)) {
    errors.push(`${file} contient encore des champs juridiques à compléter`);
  }
}

if (errors.length) {
  console.error('Préflight de publication refusé :');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Préflight de publication validé. Lance ensuite npm run check et npm run doctor.');
