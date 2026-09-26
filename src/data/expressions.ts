import type { Expression } from './types';

/**
 * Contenu de départ du Lexik.
 * IMPORTANT avant publication : faire relire chaque définition par des jeunes de la ville concernée.
 * En production, ce contenu est aussi dans Supabase (supabase/seed.sql) et s'enrichit avec les propositions validées.
 */
export const EXPRESSIONS: readonly Expression[] = [
  { key: 'wesh', word: 'Wesh', place: 'France', lang: 'Argot', region: 'eu', mean: 'salut', def: "Salut ! Sert aussi à interpeller quelqu'un ou à marquer la surprise.", ex: '« Wesh, bien ou quoi ? »', by: '@kenza.lyon' },
  { key: 'enjailler', word: "S'enjailler", place: 'Abidjan', lang: 'Nouchi', region: 'af', mean: "s'amuser, faire la fête", def: "S'amuser, faire la fête. Né en Côte d'Ivoire, repris partout en France.", ex: "« Vendredi, on s'enjaille chez Awa. »", by: '@awa_225' },
  { key: 'seum', word: 'Le seum', place: 'Paris', lang: 'Argot', region: 'eu', mean: 'être dégoûté', def: 'Avoir le seum : être dégoûté, frustré, rageux.', ex: '« Il a raté son bus de 10 secondes, il a le seum. »', by: '@yanis93' },
  { key: 'degun', word: 'Dégun', place: 'Marseille', lang: 'Parler marseillais', region: 'eu', mean: 'personne', def: 'Personne. Typique de Marseille et du Sud.', ex: '« Plage à 7 h, y a dégun. »', by: '@lea.13' },
  { key: 'ondit', word: 'On dit quoi ?', place: 'Douala', lang: 'Camfranglais', region: 'af', mean: 'salut, quoi de neuf ?', def: 'Salut, ça va, quoi de neuf ? Salutation courante au Cameroun.', ex: '« Eh gars, on dit quoi ? »', by: '@franck.dla' },
  { key: 'savoir', word: 'Tu sais venir ?', place: 'Bruxelles', lang: 'Belgicisme', region: 'eu', mean: 'tu peux venir ?', def: 'En Belgique, « savoir » s’utilise souvent pour « pouvoir ».', ex: '« Tu sais me passer le sel ? »', by: '@manon.bxl' },
  { key: 'mbolo', word: 'Mbolo', place: 'Libreville', lang: 'Fang', region: 'af', mean: 'bonjour', def: 'Bonjour, salut. Vient du fang, utilisé partout au Gabon.', ex: '« Mbolo la famille ! »', by: '@ndong.lbv' },
  { key: 'askip', word: 'Askip', place: 'France', lang: 'Internet', region: 'web', mean: "à ce qu'il paraît", def: "À ce qu'il paraît. La contraction qui a conquis les messageries.", ex: '« Askip il déménage. »', by: '@ines.sms' },
  { key: 'chelou', word: 'Chelou', place: 'France', lang: 'Verlan', region: 'eu', mean: 'bizarre', def: '« Louche » à l’envers : bizarre, suspect.', ex: '« Ce bruit est chelou. »', by: '@theo.verlan' },
  { key: 'mbote', word: 'Mbote', place: 'Kinshasa', lang: 'Lingala', region: 'af', mean: 'bonjour', def: 'Bonjour, en lingala. On le dit à Kinshasa comme à Brazzaville.', ex: '« Mbote na bino ! »', by: '@grace.kin' },
  { key: 'pls', word: 'En PLS', place: 'France', lang: 'Internet', region: 'web', mean: 'au plus mal', def: 'Au plus mal, abattu. Vient de la « position latérale de sécurité ».', ex: "« Après l'exam, je suis en PLS. »", by: '@sarah.pls' },
  { key: 'daron', word: 'Daron', place: 'France', lang: 'Argot', region: 'eu', mean: 'le père', def: 'Le père. La daronne : la mère. Les darons : les parents.', ex: "« Mon daron m'appelle. »", by: 'l’équipe' },
  { key: 'carre', word: "C'est carré", place: 'France', lang: 'Argot', region: 'eu', mean: "c'est réglé, nickel", def: "C'est réglé, c'est nickel, rien à redire.", ex: "« Le plan pour samedi ? C'est carré. »", by: 'l’équipe' },
  { key: 'nangadef', word: 'Nanga def', place: 'Dakar', lang: 'Wolof', region: 'af', mean: 'comment ça va ?', def: 'Comment ça va ? La salutation de base en wolof.', ex: '« Nanga def ? Maa ngi fi. »', by: '@moussa.dkr' },
  { key: 'balle', word: 'De la balle', place: 'Darons', lang: 'Années 90', region: 'darons', mean: 'génial', def: 'Génial. Le « trop bien » des années 90.', ex: '« Ce jeu est de la balle ! »', by: 'l’équipe' },
  { key: 'chanme', word: 'Chanmé', place: 'Darons', lang: 'Verlan 2000', region: 'darons', mean: 'génial', def: '« Méchant » en verlan, qui veut dire… génial.', ex: '« Ton son est chanmé. »', by: 'l’équipe' },
  { key: 'ramasse', word: 'À la ramasse', place: 'Darons', lang: 'Argot', region: 'darons', mean: 'largué', def: 'Largué, à côté de la plaque.', ex: '« Le lundi matin, je suis à la ramasse. »', by: 'l’équipe' },
  { key: 'pied', word: "C'est le pied", place: 'Darons', lang: 'Expression', region: 'darons', mean: "c'est génial", def: "C'est génial, c'est le top.", ex: "« Des vacances à la mer, c'est le pied. »", by: 'l’équipe' },
  { key: 'peche', word: 'Avoir la pêche', place: 'Darons', lang: 'Expression', region: 'darons', mean: 'être en forme', def: "Être plein d'énergie.", ex: "« T'as la pêche ce matin ! »", by: 'l’équipe' },
  { key: 'mbenguiste', word: 'Mbenguiste', place: 'Douala', lang: 'Camfranglais', region: 'af', mean: 'qui vit en Europe', def: "Quelqu'un qui vit en Europe, le « mbeng ».", ex: '« Mon cousin est mbenguiste depuis 5 ans. »', by: '@franck.dla' },
  { key: 'cestcomment', word: "C'est comment ?", place: 'Abidjan', lang: 'Nouchi', region: 'af', mean: 'ça va ?', def: "Ça va ? Qu'est-ce qui se passe ? On l'entend partout en Afrique de l'Ouest.", ex: "« Eh, c'est comment ? »", by: '@awa_225' },
];

export const EXPRESSIONS_BY_KEY: Readonly<Record<string, Expression>> = Object.fromEntries(
  EXPRESSIONS.map((e) => [e.key, e]),
);

/** Expressions offertes à l'inscription, pour que le Lexik ne soit pas vide. */
export const STARTER_UNLOCKED: readonly string[] = ['wesh', 'daron', 'carre', 'nangadef'];

/** Objectif affiché dans le Lexik (catalogue visé à terme). */
export const LEXIK_TARGET = 500;

export function getExpression(key: string): Expression | undefined {
  return EXPRESSIONS_BY_KEY[key];
}
