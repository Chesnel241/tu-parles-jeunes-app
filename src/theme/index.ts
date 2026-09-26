/**
 * Identité visuelle de « Tu parles jeune ? ».
 * Chaque couleur porte le nom d'une expression (voir docs/IDENTITE-VISUELLE.md).
 * Ne jamais écrire une couleur en dur dans un écran : toujours passer par `colors`.
 */

export const colors = {
  /** Vert Validé : couleur principale, icône, succès. */
  lime: '#C8F53C',
  /** Rose Askip : le « ? », notifications, accents. */
  pink: '#FF5CA8',
  /** Bleu Wesh : duels, liens, profondeur. */
  blue: '#2F4BFF',
  /** Orange Enjaillé : énergie, bonus, Guerre des villes. */
  orange: '#FF7A1F',
  /** Violet Seum : erreurs gentilles, défaites. */
  violet: '#9B6BFF',
  /** Noir Carré : contours, textes, ombres. */
  ink: '#121212',
  /** Crème Daron : fonds, respiration. */
  cream: '#FFF4E0',
  white: '#FFFFFF',
  /** Pièces. */
  gold: '#FFD23F',
  /** Cases verrouillées, éléments inactifs. */
  paper: '#EDE3CF',
  inkSoft: 'rgba(18,18,18,0.55)',
  overlay: 'rgba(18,18,18,0.55)',
  chatBg: '#1F2C34',
  chatBubble: '#005C4B',
  chatText: '#E9EDEF',
  chatLink: '#53BDEB',
} as const;

export type ColorName = keyof typeof colors;

/** Texte lisible posé sur une couleur de la palette (contraste AA). */
export function onColor(bg: string): string {
  return bg === colors.blue || bg === colors.ink || bg === colors.chatBg ? colors.white : colors.ink;
}

export const fonts = {
  display: 'DelaGothicOne_400Regular',
  body: 'BricolageGrotesque_400Regular',
  bodySemi: 'BricolageGrotesque_600SemiBold',
  bodyBold: 'BricolageGrotesque_800ExtraBold',
  marker: 'PermanentMarker_400Regular',
} as const;

/** Épaisseurs de contour et ombres dures (signature néo-brutaliste). */
export const stroke = {
  thick: 4,
  medium: 3,
  thin: 2,
} as const;

export const shadow = {
  lg: 6,
  md: 5,
  sm: 3,
} as const;

export const radius = {
  pill: 999,
  xl: 30,
  lg: 24,
  md: 18,
  sm: 14,
  xs: 10,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

/** Couleurs cycliques des stickers (Lexik, badges…). */
export const stickerCycle = [
  colors.orange,
  colors.lime,
  colors.pink,
  colors.violet,
  colors.blue,
  colors.lime,
  colors.pink,
  colors.orange,
  colors.lime,
  colors.violet,
  colors.pink,
  colors.orange,
] as const;

/** Petites rotations « collé à la main ». */
export const stickerTilt = [-3, 2, -1, 3, -2, 1, 2, -3, 1, -2, 3, -1] as const;

export function cycle<T>(list: readonly T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length] as T;
}
