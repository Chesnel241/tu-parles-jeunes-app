import AsyncStorage from '@react-native-async-storage/async-storage';
import { CITIES } from '@/data/places';
import { EXPRESSIONS } from '@/data/expressions';
import { QUESTIONS } from '@/data/questions';
import type { Proposal, RankRow, VoteCard } from '@/data/types';
import { isReadyToOpen } from '@/logic/cities';
import { shortId } from '@/logic/random';
import { colors } from '@/theme';
import type { Backend, CityStatus, DuelSummary } from './types';

/**
 * Backend LOCAL (démo) : tout tourne sur le téléphone, sans serveur.
 * Les classements et duels sont des données de démonstration : ce mode sert au
 * développement et aux présentations. Pour la sortie publique, utiliser Supabase.
 */

const KEY = 'tpj.local-backend.v1';

type LocalState = {
  proposals: Proposal[];
  chantier: CityStatus | null;
  voteIdx: number;
};

const DEMO_CITY_POINTS: Record<string, number> = {
  Marseille: 48210, Libreville: 45900, Paris: 44120, Abidjan: 41800, Lyon: 40600,
  Bruxelles: 37150, Douala: 35200, Dakar: 33900, Lille: 31050, Kinshasa: 30400,
};

const DEMO_COUNTRY_POINTS: Record<string, number> = {
  Cameroun: 96200, France: 95800, "Côte d'Ivoire": 91300, Gabon: 64500, 'Sénégal': 61200, 'RD Congo': 58900,
  Belgique: 44700, Congo: 21400, 'Bénin': 18800, Togo: 16300, Mali: 12900, 'Burkina Faso': 11200, 'Guinée': 9800,
  Maroc: 8700, 'Algérie': 8100, Madagascar: 7400, 'Haïti': 6100, Tunisie: 5600, Niger: 5200, Canada: 4900,
  Suisse: 4500, Tchad: 3900, Centrafrique: 2600,
};

const DEMO_FRIENDS: [string, number][] = [['Moussa', 1840], ['Léa', 1510], ['Yann', 1320], ['Aïcha', 1190], ['Kenza', 980]];

const DEMO_PROPOSALS: Proposal[] = [
  { id: 'demo-1', word: '« Ça passe crème »', mean: 'ça passe facilement', origin: 'France', status: 'ok', votes: 20, note: 'Dans le jeu depuis le 3 septembre · +50 pièces', createdAt: '2026-09-03' },
  { id: 'demo-2', word: '« Il est en roue libre »', mean: "il fait n'importe quoi", origin: 'France', status: 'ok', votes: 20, note: 'Dans le jeu depuis le 12 septembre · +50 pièces', createdAt: '2026-09-12' },
  { id: 'demo-3', word: '« Wesh alors »', mean: 'eh bien alors', origin: 'France', status: 'dup', votes: 0, note: 'Refusée : trop proche de « Wesh », déjà dans le jeu.', createdAt: '2026-09-14' },
  { id: 'demo-4', word: '« ••• »', mean: 'masquée', origin: 'France', status: 'mod', votes: 0, note: 'Retirée par la modération : elle citait une vraie personne.', createdAt: '2026-09-16' },
];

const DEMO_VOTES: VoteCard[] = [
  { id: 'v1', word: "« C'est giga »", place: 'Internet', mean: 'énorme, immense', pct: 81 },
  { id: 'v2', word: '« Il a pris cher »', place: 'France', mean: 'il a passé un sale moment', pct: 74 },
  { id: 'v3', word: '« Être en mode avion »', place: 'France', mean: 'être déconnecté, ailleurs', pct: 66 },
];

let cache: LocalState | null = null;

async function load(): Promise<LocalState> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as LocalState) : { proposals: [], chantier: null, voteIdx: 0 };
  } catch {
    cache = { proposals: [], chantier: null, voteIdx: 0 };
  }
  return cache;
}

async function save(next: LocalState): Promise<void> {
  cache = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
}

function openCity(status: CityStatus): CityStatus {
  return isReadyToOpen(status) ? { ...status, opened: true } : status;
}

export const localBackend: Backend = {
  kind: 'local',
  isDemo: true,

  async init() {
    await load();
  },

  async syncProfile() {
    /* rien à synchroniser en local */
  },

  async contentBank() {
    return { expressions: [...EXPRESSIONS], questions: [...QUESTIONS] };
  },

  async cityRanking(ctx) {
    const rows: RankRow[] = CITIES.map((c) => ({
      name: c.name,
      pts: (DEMO_CITY_POINTS[c.name] ?? 20000) + (!ctx.customCity && c.name === ctx.city ? ctx.weeklyPoints : 0),
      me: !ctx.customCity && c.name === ctx.city,
      color: c.color,
    }));
    const s = await load();
    if (ctx.customCity && s.chantier?.opened && s.chantier.city === ctx.city) {
      rows.push({ name: ctx.city, pts: 1250 + ctx.weeklyPoints, me: true, color: colors.orange });
    }
    return rows;
  },

  async countryRanking(ctx) {
    const heart = ctx.heart && ctx.heart !== ctx.country ? ctx.heart : null;
    const names = new Set(Object.keys(DEMO_COUNTRY_POINTS));
    names.add(ctx.country);
    if (heart) names.add(heart);
    return Array.from(names).map((name) => ({
      name,
      pts: (DEMO_COUNTRY_POINTS[name] ?? 1500) + (name === ctx.country ? ctx.weeklyPoints : 0) + (heart && name === heart ? ctx.weeklyPoints : 0),
      me: name === ctx.country,
      heart: Boolean(heart && name === heart),
    }));
  },

  async friendsRanking(ctx) {
    const rows: RankRow[] = DEMO_FRIENDS.map(([name, pts]) => ({ name, pts, color: colors.blue }));
    rows.push({ name: 'Toi', pts: 1450 + Math.round(ctx.weeklyPoints / 2), color: colors.pink, me: true });
    return rows;
  },

  async submitGame() {
    /* en local, les points sont déjà comptés dans le store */
  },

  async listDuels(): Promise<DuelSummary[]> {
    return [
      { id: 'demo-moussa', opponent: 'Moussa', myScore: 6, theirScore: 8, status: 'lost' },
      { id: 'demo-lea', opponent: 'Léa', myScore: null, theirScore: 3, status: 'my_turn' },
      { id: 'demo-yann', opponent: 'Yann', myScore: 4, theirScore: null, status: 'their_turn' },
      { id: 'demo-aicha', opponent: 'Aïcha', myScore: null, theirScore: 4, status: 'my_turn' },
      { id: 'demo-kenza', opponent: 'Kenza', myScore: 7, theirScore: 5, status: 'won' },
    ];
  },

  async createDuelFromLastGame() {
    return { id: shortId() };
  },

  async getDuel(id) {
    return { id, questionIds: [], creator: 'Un pote', creatorScore: null };
  },

  async cityStatus(ctx) {
    if (!ctx.customCity) return null;
    const s = await load();
    return s.chantier && s.chantier.city === ctx.city ? s.chantier : null;
  },

  async requestCity(ctx, city, country) {
    const s = await load();
    const pioneer = !CITIES.some((c) => c.country === country);
    // Démo : on part d'une ville déjà bien lancée par d'autres joueurs, comme dans la maquette.
    const chantier: CityStatus = {
      city,
      country,
      players: 8,
      expressions: 18,
      pioneer,
      opened: false,
      founders: [ctx.pseudo || 'Toi', '@abakar.td', '@hawa_235', '@moussa.ndj'],
    };
    await save({ ...s, chantier });
    return chantier;
  },

  async simulateInviteJoin(ctx) {
    const s = await load();
    if (!s.chantier || s.chantier.city !== ctx.city || s.chantier.opened) return s.chantier;
    const chantier = openCity({ ...s.chantier, players: s.chantier.players + 1 });
    await save({ ...s, chantier });
    return chantier;
  },

  async myProposals() {
    const s = await load();
    return s.proposals.concat(DEMO_PROPOSALS);
  },

  async submitProposal(ctx, p) {
    const s = await load();
    const proposal: Proposal = {
      id: `local-${shortId()}`,
      word: `« ${p.word.trim()} »`,
      mean: p.mean.trim(),
      origin: p.origin,
      example: p.example?.trim() || undefined,
      status: 'vote',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    let chantier = s.chantier;
    // Démo : en ville pionnière, le jury élargi valide vite.
    if (ctx.customCity && chantier && chantier.city === ctx.city && !chantier.opened) {
      chantier = openCity({ ...chantier, expressions: chantier.expressions + 1 });
    }
    await save({ ...s, proposals: [proposal, ...s.proposals], chantier });
    return proposal;
  },

  async voteQueue() {
    const s = await load();
    return DEMO_VOTES.slice(s.voteIdx);
  },

  async vote(_ctx, proposalId) {
    const s = await load();
    await save({ ...s, voteIdx: s.voteIdx + 1 });
    return { pct: DEMO_VOTES.find((v) => v.id === proposalId)?.pct ?? 70 };
  },

  async report() {
    const s = await load();
    await save({ ...s, voteIdx: s.voteIdx + 1 });
  },

  async blockProposalAuthor() {
    const s = await load();
    await save({ ...s, voteIdx: s.voteIdx + 1 });
  },

  async blockExpressionAuthor() {
    /* les expressions de démonstration n'ont pas de compte auteur */
  },

  async deleteAccount() {
    cache = null;
    await AsyncStorage.removeItem(KEY).catch(() => undefined);
  },
};
