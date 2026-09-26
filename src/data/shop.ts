import { colors } from '@/theme';
import type { Look } from './types';

export type LookItem = {
  id: Look;
  name: string;
  price: number;
  color: string;
  /** Look non achetable, gagné par un exploit. */
  lockedLabel?: string;
};

export const LOOKS: readonly LookItem[] = [
  { id: 'none', name: 'Au naturel', price: 0, color: colors.pink },
  { id: 'cap', name: 'Casquette', price: 0, color: colors.lime },
  { id: 'shades', name: 'Lunettes', price: 300, color: colors.pink },
  { id: 'phones', name: 'Casque', price: 500, color: colors.blue },
  { id: 'bob', name: 'Bob wax', price: 800, color: colors.lime },
  { id: 'crown', name: 'Roi du quartier', price: 0, color: colors.pink, lockedLabel: 'Top 3 ville' },
];

export const STARTER_COINS = 200;

/** Identifiant de l'entitlement RevenueCat du pack sans pub. */
export const NO_ADS_ENTITLEMENT = 'no_ads';
