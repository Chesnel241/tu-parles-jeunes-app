import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Expression, Proposal, ProposalStatus, Question, RankRow, Region, VoteCard } from '@/data/types';
import { config } from '../config';
import type { Backend, CityStatus, DuelStatus, DuelSummary } from './types';

/**
 * Backend Supabase (production).
 * - Connexion anonyme : aucun e-mail ni mot de passe demandé aux jeunes.
 * - Toutes les écritures passent par des fonctions SQL contrôlées (voir supabase/migrations).
 */

export class BackendError extends Error {}

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  if (!config.supabaseUrl || !config.supabaseAnonKey) throw new BackendError('Supabase n’est pas configuré.');
  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().rpc(fn, args);
  if (error) throw new BackendError(error.message);
  return data as T;
}

type CityRow = { city: string; country: string; players: number; expressions: number; pioneer: boolean; opened: boolean; founders: string[] };

function toCity(rows: CityRow[] | null): CityStatus | null {
  const r = rows?.[0];
  return r ? { city: r.city, country: r.country, players: r.players, expressions: r.expressions, pioneer: r.pioneer, opened: r.opened, founders: r.founders ?? [] } : null;
}

const STATUS_NOTES: Partial<Record<ProposalStatus, string>> = {
  vote: 'Votée par les joueurs de ta ville. Il faut assez de votes et 70 % de « Vrai ».',
  ok: 'Dans le jeu · +50 pièces',
  dup: 'Refusée.',
  mod: 'Retirée par la modération.',
};

const REGIONS = new Set<Region>(['eu', 'af', 'web', 'darons']);

export const supabaseBackend: Backend = {
  kind: 'supabase',
  isDemo: false,

  async init() {
    const { data } = await db().auth.getSession();
    if (!data.session) {
      const { error } = await db().auth.signInAnonymously();
      if (error) throw new BackendError(error.message);
    }
  },

  async syncProfile(ctx) {
    if (!ctx.ageRange || ctx.ageRange === 'under13' || !ctx.pseudo) return;
    await rpc('upsert_profile', {
      p_pseudo: ctx.pseudo,
      p_age_range: ctx.ageRange,
      p_heart: ctx.heart,
      p_terms_accepted: Boolean(ctx.termsAcceptedAt),
    });
    if (!ctx.customCity && ctx.city) await rpc('choose_city', { p_city: ctx.city });
  },

  async contentBank() {
    const [expressionResult, questionResult] = await Promise.all([
      db().from('expressions').select('key,word,place,lang,region,mean,def,ex,author_label').order('created_at'),
      db().from('questions').select('id,lex,expr,answers,good,hint').order('id'),
    ]);
    if (expressionResult.error) throw new BackendError(expressionResult.error.message);
    if (questionResult.error) throw new BackendError(questionResult.error.message);

    const expressions = (expressionResult.data ?? []).flatMap((row): Expression[] => {
      if (!REGIONS.has(row.region as Region)) return [];
      return [{
        key: row.key,
        word: row.word,
        place: row.place,
        lang: row.lang,
        region: row.region as Region,
        mean: row.mean,
        def: row.def,
        ex: row.ex,
        by: row.author_label,
      }];
    });
    const questions = (questionResult.data ?? []).flatMap((row): Question[] => {
      if (!Array.isArray(row.answers) || row.answers.length !== 4 || row.good < 0 || row.good > 3) return [];
      return [{
        id: row.id,
        lex: row.lex,
        expr: row.expr,
        answers: row.answers as [string, string, string, string],
        good: row.good as 0 | 1 | 2 | 3,
        pct: 50,
        hint: row.hint,
      }];
    });
    return { expressions, questions };
  },

  async cityRanking() {
    const rows = await rpc<{ name: string; pts: number; color: string | null; me: boolean }[]>('city_ranking');
    return rows.map((r): RankRow => ({ name: r.name, pts: Number(r.pts), me: r.me, color: r.color ?? undefined }));
  },

  async countryRanking() {
    const rows = await rpc<{ name: string; pts: number; me: boolean; heart: boolean }[]>('country_ranking');
    return rows.map((r) => ({ name: r.name, pts: Number(r.pts), me: r.me, heart: r.heart }));
  },

  async friendsRanking() {
    const rows = await rpc<{ name: string; pts: number; me: boolean }[]>('friends_ranking');
    return rows.map((r) => ({ name: r.me ? 'Toi' : r.name, pts: Number(r.pts), me: r.me }));
  },

  async submitGame(_ctx, game) {
    await rpc('submit_game', {
      p_mode: game.mode,
      p_question_ids: game.questionIds,
      p_answers: game.answers,
      p_duel_id: game.duelId ?? null,
    });
  },

  async listDuels() {
    const rows = await rpc<{ id: string; opponent: string; my_score: number | null; their_score: number | null; status: DuelStatus }[]>('list_my_duels');
    return rows.map((r): DuelSummary => ({ id: r.id, opponent: r.opponent, myScore: r.my_score, theirScore: r.their_score, status: r.status }));
  },

  async createDuelFromLastGame() {
    const id = await rpc<string>('create_duel_from_last_game');
    return { id };
  },

  async getDuel(id) {
    const rows = await rpc<{ id: string; question_ids: string[]; creator: string; creator_score: number | null }[]>('get_duel', { p_id: id });
    const r = rows[0];
    return r ? { id: r.id, questionIds: r.question_ids, creator: r.creator, creatorScore: r.creator_score } : null;
  },

  async cityStatus() {
    return toCity(await rpc<CityRow[]>('my_city_status'));
  },

  async requestCity(_ctx, city, country) {
    const status = toCity(await rpc<CityRow[]>('request_city', { p_city: city, p_country: country }));
    if (!status) throw new BackendError('Impossible de lancer cette ville.');
    return status;
  },

  async simulateInviteJoin(ctx) {
    // En production, un pote compte seulement quand il installe l'app et choisit la ville.
    return this.cityStatus(ctx);
  },

  async myProposals() {
    const rows = await rpc<{ id: string; word: string; mean: string; origin: string; example: string | null; status: ProposalStatus; votes: number; note: string | null; created_at: string }[]>('my_proposals');
    return rows.map(
      (r): Proposal => ({
        id: r.id,
        word: `« ${r.word} »`,
        mean: r.mean,
        origin: r.origin,
        example: r.example ?? undefined,
        status: r.status,
        votes: r.votes,
        note: r.note ?? STATUS_NOTES[r.status],
        createdAt: r.created_at,
      }),
    );
  },

  async submitProposal(_ctx, p) {
    const r = await rpc<{ id: string; word: string; mean: string; origin: string; example: string | null; created_at: string }>('propose_expression', {
      p_word: p.word,
      p_mean: p.mean,
      p_origin: p.origin,
      p_example: p.example ?? null,
    });
    return { id: r.id, word: `« ${r.word} »`, mean: r.mean, origin: r.origin, example: r.example ?? undefined, status: 'vote', votes: 0, createdAt: r.created_at };
  },

  async voteQueue() {
    const rows = await rpc<{ id: string; word: string; place: string; mean: string; pct: number }[]>('vote_queue', { p_limit: 10 });
    return rows.map((r): VoteCard => ({ id: r.id, word: `« ${r.word} »`, place: r.place, mean: r.mean, pct: r.pct }));
  },

  async vote(_ctx, proposalId, choice) {
    const pct = await rpc<number>('vote_proposal', { p_id: proposalId, p_choice: choice });
    return { pct };
  },

  async report(_ctx, target, reason) {
    await rpc('report_content', { p_type: target.type, p_id: target.id, p_reason: reason });
  },

  async blockProposalAuthor(_ctx, proposalId) {
    await rpc('block_proposal_author', { p_id: proposalId });
  },

  async blockExpressionAuthor(_ctx, expressionKey) {
    await rpc('block_expression_author', { p_key: expressionKey });
  },

  async deleteAccount() {
    await rpc('delete_my_account');
    await db().auth.signOut().catch(() => undefined);
  },
};
