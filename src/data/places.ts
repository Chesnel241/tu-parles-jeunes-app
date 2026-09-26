import { colors } from '@/theme';
import type { City } from './types';

/** Villes ouvertes au lancement (une couleur par équipe). */
export const CITIES: readonly City[] = [
  { name: 'Paris', country: 'France', color: colors.pink },
  { name: 'Marseille', country: 'France', color: colors.orange },
  { name: 'Lyon', country: 'France', color: colors.lime },
  { name: 'Lille', country: 'France', color: colors.violet },
  { name: 'Bruxelles', country: 'Belgique', color: colors.blue },
  { name: 'Abidjan', country: "Côte d'Ivoire", color: colors.orange },
  { name: 'Libreville', country: 'Gabon', color: colors.lime },
  { name: 'Douala', country: 'Cameroun', color: colors.pink },
  { name: 'Dakar', country: 'Sénégal', color: colors.violet },
  { name: 'Kinshasa', country: 'RD Congo', color: colors.blue },
];

/**
 * Tous les pays jouables dès le premier jour (Coupe des pays).
 * Un joueur n'est jamais bloqué : si sa ville n'existe pas, il joue pour son pays.
 */
export const COUNTRIES: readonly string[] = [
  'Algérie', 'Belgique', 'Bénin', 'Burkina Faso', 'Burundi', 'Cameroun', 'Canada', 'Centrafrique', 'Comores',
  'Congo', "Côte d'Ivoire", 'Djibouti', 'France', 'Gabon', 'Guinée', 'Guinée équatoriale', 'Haïti', 'Luxembourg',
  'Madagascar', 'Mali', 'Maroc', 'Maurice', 'Mauritanie', 'Niger', 'RD Congo', 'Rwanda', 'Sénégal', 'Seychelles',
  'Suisse', 'Tchad', 'Togo', 'Tunisie',
];

/** Pays proposés en premier dans l'écran « Ma ville n'est pas là ». */
export const FEATURED_NEW_COUNTRIES: readonly string[] = [
  'Tchad', 'Centrafrique', 'Congo', 'Bénin', 'Togo', 'Mali', 'Burkina Faso', 'Niger',
  'Guinée', 'Madagascar', 'Haïti', 'Cameroun', 'Gabon', 'France', 'Belgique', 'Canada',
];

/**
 * Quota d'ouverture d'une ville. La première ville d'un pays est « pionnière » :
 * son quota est plus bas pour que les petits pays ne restent pas bloqués.
 */
export const CITY_QUOTA = { players: 30, expressions: 50 } as const;
export const PIONEER_QUOTA = { players: 10, expressions: 20 } as const;

export function getCity(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}

export function countryOfCity(name: string): string | undefined {
  return getCity(name)?.country;
}

export function cityColor(name: string): string {
  return getCity(name)?.color ?? colors.orange;
}
