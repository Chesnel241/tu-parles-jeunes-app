import { QUESTIONS, QUESTIONS_PER_GAME } from '@/data/questions';
import { EXPRESSIONS, EXPRESSIONS_BY_KEY } from '@/data/expressions';
import type { RankRow } from '@/data/types';
import { isReadyToOpen, missing } from '../cities';
import { dayKey, daysBetween, isoWeek } from '../dates';
import { formatNumber, ordinal } from '../format';
import { endLook, fiftyFifty, pickQuestions, questionsFromIds, rewardFor } from '../game';
import { chaseMessage, myRank, toDisplayRows } from '../leaderboard';
import { checkPseudo, checkProposal } from '../moderation';
import { hashString, seededRandom, shuffle } from '../random';
import { nextStreak, visibleStreak } from '../streak';

describe('contenu', () => {
  it('chaque question pointe vers une expression existante', () => {
    QUESTIONS.forEach((q) => expect(EXPRESSIONS_BY_KEY[q.lex]).toBeDefined());
  });
  it('chaque expression a sa question', () => {
    EXPRESSIONS.forEach((e) => expect(QUESTIONS.some((q) => q.lex === e.key)).toBe(true));
  });
  it('les réponses sont uniques et la bonne réponse existe', () => {
    QUESTIONS.forEach((q) => {
      expect(new Set(q.answers).size).toBe(4);
      expect(q.answers[q.good]).toBeTruthy();
    });
  });
  it('les ids sont uniques', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(new Set(EXPRESSIONS.map((e) => e.key)).size).toBe(EXPRESSIONS.length);
  });
});

describe('hasard', () => {
  it('est déterministe avec une graine', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], seededRandom(42));
    const b = shuffle([1, 2, 3, 4, 5, 6], seededRandom(42));
    expect(a).toEqual(b);
  });
  it('hash stable', () => {
    expect(hashString('daily:2026-09-26')).toBe(hashString('daily:2026-09-26'));
  });
});

describe('choix des questions', () => {
  it('donne 5 questions sans doublon', () => {
    (['quick', 'daily', 'darons', 'duel'] as const).forEach((mode) => {
      const qs = pickQuestions(mode, { seed: 7, date: new Date(2026, 8, 26) });
      expect(qs).toHaveLength(QUESTIONS_PER_GAME);
      expect(new Set(qs.map((q) => q.id)).size).toBe(QUESTIONS_PER_GAME);
    });
  });
  it('le défi du jour est le même pour tout le monde le même jour', () => {
    const d = new Date(2026, 8, 26, 10);
    const a = pickQuestions('daily', { date: d }).map((q) => q.id);
    const b = pickQuestions('daily', { date: new Date(2026, 8, 26, 22) }).map((q) => q.id);
    expect(a).toEqual(b);
  });
  it('Jeunes vs Darons ne pose que des expressions de parents', () => {
    pickQuestions('darons', { seed: 3 }).forEach((q) => expect(EXPRESSIONS_BY_KEY[q.lex]?.region).toBe('darons'));
  });
  it('la partie rapide ne pose jamais de question Darons', () => {
    for (let s = 0; s < 30; s += 1) {
      pickQuestions('quick', { seed: s, univers: ['eu', 'af', 'web', 'darons'] }).forEach((q) =>
        expect(EXPRESSIONS_BY_KEY[q.lex]?.region).not.toBe('darons'),
      );
    }
  });
  it('le 50/50 ne masque jamais la bonne réponse', () => {
    QUESTIONS.forEach((q) => {
      const hidden = fiftyFifty(q);
      expect(hidden).toHaveLength(2);
      expect(hidden).not.toContain(q.good);
    });
  });
  it('utilise les questions communautaires synchronisées', () => {
    const remote = QUESTIONS.slice(0, 5).map((q, index) => ({ ...q, id: `remote-${index}`, lex: `community-${index}` }));
    const expressionsByKey = Object.fromEntries(remote.map((q) => [q.lex, { region: 'af' as const }]));
    expect(pickQuestions('quick', { seed: 4, questions: remote, expressionsByKey }).every((q) => q.id.startsWith('remote-'))).toBe(true);
    expect(questionsFromIds(['remote-3'], remote)).toEqual([remote[3]]);
  });
});

describe('récompenses et fin de partie', () => {
  it('calcule pièces et points', () => {
    expect(rewardFor(4)).toEqual({ coins: 80, cityPoints: 480 });
  });
  it('adapte le titre au score', () => {
    expect(endLook(5).title).toBe('LÉGENDE DU QUARTIER');
    expect(endLook(4).title).toBe("C'EST CARRÉ !");
    expect(endLook(1).mood).toBe('seum');
  });
});

describe('série de jours', () => {
  it('augmente le lendemain', () => expect(nextStreak(3, '2026-09-25', '2026-09-26')).toBe(4));
  it('ne bouge pas le même jour', () => expect(nextStreak(3, '2026-09-26', '2026-09-26')).toBe(3));
  it('repart à 1 après un trou', () => expect(nextStreak(9, '2026-09-20', '2026-09-26')).toBe(1));
  it('affiche 0 si la série est cassée', () => expect(visibleStreak(9, '2026-09-20', '2026-09-26')).toBe(0));
  it('gère le passage de mois', () => expect(daysBetween('2026-09-30', '2026-10-01')).toBe(1));
});

describe('villes en chantier', () => {
  it('quota pionnier', () => {
    expect(isReadyToOpen({ players: 10, expressions: 20, pioneer: true })).toBe(true);
    expect(isReadyToOpen({ players: 10, expressions: 20, pioneer: false })).toBe(false);
    expect(missing({ players: 8, expressions: 18, pioneer: true })).toEqual({ players: 2, expressions: 2 });
  });
});

describe('classements', () => {
  const rows = [
    { name: 'Marseille', pts: 48210 },
    { name: 'Lyon', pts: 40600, me: true },
    { name: 'Abidjan', pts: 41800 },
  ];
  it('trie et trouve mon rang', () => expect(myRank(rows)).toBe(3));
  it('calcule l’écart', () => expect(chaseMessage(rows)?.body).toContain('1 210'));
  it('ajoute ma ligne sous le top', () => {
    const long: RankRow[] = [...Array.from({ length: 15 }, (_, i) => ({ name: `P${i}`, pts: 1000 - i })), { name: 'Tchad', pts: 5, me: true }];
    const d = toDisplayRows(long, 8);
    expect(d[8]?.separator).toBe(true);
    expect(d[9]?.name).toBe('Tchad');
    expect(d[9]?.rank).toBe(16);
  });
});

describe('formatage', () => {
  it('espace les milliers', () => expect(formatNumber(48210)).toBe('48 210'));
  it('ordinal', () => {
    expect(ordinal(1)).toBe('1re');
    expect(ordinal(5)).toBe('5e');
  });
  it('dates', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(isoWeek(new Date(2026, 8, 25))).toBe(39);
  });
});

describe('modération', () => {
  it('accepte une expression normale', () => expect(checkProposal("C'est giga", 'énorme').ok).toBe(true));
  it('refuse les insultes', () => expect(checkProposal('espèce de connard', 'insulte').ok).toBe(false));
  it('refuse de citer quelqu’un', () => expect(checkProposal('@kevin_du_93 est nul', 'moquerie').ok).toBe(false));
  it('refuse les liens', () => expect(checkProposal('va sur www.site.com', 'pub').ok).toBe(false));
  it('ne bloque pas un mot qui contient un mot interdit', () => expect(checkProposal('Le violon', 'instrument').ok).toBe(true));
  it('valide les pseudos', () => {
    expect(checkPseudo('Inès').ok).toBe(true);
    expect(checkPseudo('a').ok).toBe(false);
    expect(checkPseudo('<script>').ok).toBe(false);
  });
});
