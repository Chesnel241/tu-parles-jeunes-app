import type { Question } from './types';

/**
 * Banque de questions. Chaque question est liée à une expression du Lexik (`lex`).
 * `good` est l'index de la bonne réponse : on varie sa position pour éviter les réflexes.
 */
export const QUESTIONS: readonly Question[] = [
  { id: 'q-enjailler', lex: 'enjailler', expr: "« On va s'enjailler ce soir »", answers: ["On va s'ennuyer", "On va bien s'amuser", 'On va se disputer', 'On va rentrer tôt'], good: 1, pct: 72, hint: 'ça se passe plutôt le soir, avec du son.' },
  { id: 'q-seum', lex: 'seum', expr: "« J'ai trop le seum »", answers: ["J'ai trop faim", 'Je suis fatigué', "J'ai de la chance", 'Je suis dégoûté'], good: 3, pct: 91, hint: 'on l’a souvent après une défaite.' },
  { id: 'q-degun', lex: 'degun', expr: '« Ce matin, y a dégun »', answers: ['Il y a du monde', 'Il fait beau', "Il n'y a personne", 'Il y a un souci'], good: 2, pct: 58, hint: 'parfait pour une plage tranquille.' },
  { id: 'q-ondit', lex: 'ondit', expr: '« On dit quoi ? »', answers: ["Répète, j'ai pas entendu", 'Salut, quoi de neuf ?', 'Tu parles de quoi ?', 'On se tait'], good: 1, pct: 64, hint: 'c’est comme ça qu’on démarre une discussion.' },
  { id: 'q-savoir', lex: 'savoir', expr: '« Tu sais venir demain ? »', answers: ['Tu connais le chemin ?', 'Tu veux venir ?', 'Tu as su pour demain ?', 'Tu peux venir demain ?'], good: 3, pct: 41, hint: 'en Belgique, savoir, c’est un peu pouvoir.' },
  { id: 'q-mbolo', lex: 'mbolo', expr: '« Mbolo ! »', answers: ['Bonjour !', 'Au revoir !', 'Merci !', 'Bonne nuit !'], good: 0, pct: 47, hint: 'on le dit en arrivant.' },
  { id: 'q-askip', lex: 'askip', expr: '« Askip il déménage »', answers: ['Il déménage à coup sûr', 'Il ne déménage plus', "Il paraît qu'il déménage", 'Il déménage vite'], good: 2, pct: 88, hint: 'c’est une rumeur.' },
  { id: 'q-chelou', lex: 'chelou', expr: '« Ce bruit est chelou »', answers: ['Il est cher', 'Il est bizarre', 'Il est chaud', 'Il est charmant'], good: 1, pct: 93, hint: 'lis-le à l’envers.' },
  { id: 'q-mbote', lex: 'mbote', expr: '« Mbote ! »', answers: ['Merci !', 'Viens !', 'Doucement !', 'Bonjour !'], good: 3, pct: 39, hint: 'même idée que « Mbolo ».' },
  { id: 'q-pls', lex: 'pls', expr: "« Après l'exam, je suis en PLS »", answers: ['Je suis au top', 'Je suis au plus mal', 'Je suis en vacances', 'Je suis en retard'], good: 1, pct: 84, hint: 'pense aux gestes de premiers secours.' },
  { id: 'q-wesh', lex: 'wesh', expr: '« Wesh, bien ou quoi ? »', answers: ['Salut, ça va ?', 'Tais-toi', 'Au revoir', 'Tu es sûr ?'], good: 0, pct: 97, hint: 'on l’entend dix fois par jour.' },
  { id: 'q-daron', lex: 'daron', expr: '« Mon daron arrive »', answers: ['Mon patron', 'Mon père', 'Mon voisin', 'Mon chien'], good: 1, pct: 95, hint: 'il est de la famille.' },
  { id: 'q-carre', lex: 'carre', expr: "« Pour samedi, c'est carré »", answers: ["C'est annulé", "C'est compliqué", "C'est réglé", "C'est trop tard"], good: 2, pct: 81, hint: 'tout est calé.' },
  { id: 'q-nangadef', lex: 'nangadef', expr: '« Nanga def ? »', answers: ["Tu viens d'où ?", 'Comment ça va ?', 'Tu as faim ?', 'Il est quelle heure ?'], good: 1, pct: 44, hint: 'on répond « Maa ngi fi ».' },
  { id: 'q-mbenguiste', lex: 'mbenguiste', expr: '« Mon cousin est mbenguiste »', answers: ['Il est musicien', 'Il vit en Europe', 'Il est très riche', 'Il est mécanicien'], good: 1, pct: 53, hint: 'le « mbeng », c’est loin du Cameroun.' },
  { id: 'q-cestcomment', lex: 'cestcomment', expr: "« Eh, c'est comment ? »", answers: ['Ça va ?', "C'est combien ?", "C'est où ?", "C'est quand ?"], good: 0, pct: 76, hint: 'une façon de saluer.' },
  { id: 'q-balle', lex: 'balle', expr: "« C'est de la balle ! »", answers: ["C'est du sport", "C'est dangereux", "C'est génial", "C'est tout rond"], good: 2, pct: 52, hint: 'tes parents le disaient quand ils kiffaient.' },
  { id: 'q-chanme', lex: 'chanme', expr: "« C'est chanmé »", answers: ["C'est génial", "C'est pas cher", "C'est mâché", "C'est la chance"], good: 0, pct: 61, hint: 'c’est du verlan.' },
  { id: 'q-ramasse', lex: 'ramasse', expr: '« Il est à la ramasse »', answers: ['Il fait le ménage', 'Il est très riche', 'Il est hyper organisé', 'Il est largué'], good: 3, pct: 55, hint: 'pas vraiment un compliment.' },
  { id: 'q-pied', lex: 'pied', expr: "« Ce concert, c'est le pied ! »", answers: ['Ça fait mal aux pieds', "C'est génial", "C'est trop loin", 'Il faut danser'], good: 1, pct: 68, hint: 'rien à voir avec les chaussures.' },
  { id: 'q-peche', lex: 'peche', expr: "« T'as la pêche ce matin ! »", answers: ['Tu es en forme', 'Tu as faim', 'Tu vas pêcher', 'Tu es en colère'], good: 0, pct: 77, hint: 'plein d’énergie.' },
];

export const QUESTIONS_BY_ID: Readonly<Record<string, Question>> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export const QUESTIONS_PER_GAME = 5;
export const SECONDS_PER_QUESTION = 10;
export const COINS_PER_GOOD_ANSWER = 20;
export const CITY_POINTS_PER_GOOD_ANSWER = 120;
