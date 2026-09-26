import type { AgeRange, Expression, GameMode, Proposal, Question, RankRow, VoteCard } from '@/data/types';

export type ContentBank = { expressions: Expression[]; questions: Question[] };

/** Ce que le backend doit savoir du joueur pour répondre (ville, pays, pays de cœur…). */
export type PlayerContext = {
  pseudo: string;
  ageRange: AgeRange | null;
  termsAcceptedAt: string | null;
  city: string;
  country: string;
  customCity: boolean;
  heart: string | null;
  weeklyPoints: number;
};

export type DuelStatus = 'my_turn' | 'their_turn' | 'won' | 'lost' | 'draw';

export type DuelSummary = {
  id: string;
  opponent: string;
  myScore: number | null;
  theirScore: number | null;
  status: DuelStatus;
};

export type Duel = {
  id: string;
  questionIds: string[];
  creator: string;
  creatorScore: number | null;
};

export type CityStatus = {
  city: string;
  country: string;
  players: number;
  expressions: number;
  pioneer: boolean;
  opened: boolean;
  founders: string[];
};

export type GameSubmission = {
  mode: GameMode;
  questionIds: string[];
  /** Index choisi pour chaque question, -1 si le temps est écoulé. */
  answers: number[];
  duelId?: string;
};

export type VoteChoice = 'yes' | 'no' | 'other';

export type ReportTarget = { type: 'proposal' | 'expression' | 'player'; id: string };

export interface Backend {
  readonly kind: 'local' | 'supabase';
  /** true = classements et duels de démonstration (jamais en production). */
  readonly isDemo: boolean;
  init(): Promise<void>;
  syncProfile(ctx: PlayerContext): Promise<void>;
  /** Catalogue jouable publié, avec cache local côté application. */
  contentBank(): Promise<ContentBank>;

  cityRanking(ctx: PlayerContext): Promise<RankRow[]>;
  countryRanking(ctx: PlayerContext): Promise<RankRow[]>;
  friendsRanking(ctx: PlayerContext): Promise<RankRow[]>;
  submitGame(ctx: PlayerContext, game: GameSubmission): Promise<void>;

  listDuels(ctx: PlayerContext): Promise<DuelSummary[]>;
  /** Nouveau duel à partir de la partie qu'on vient de jouer (score repris côté serveur). */
  createDuelFromLastGame(ctx: PlayerContext): Promise<{ id: string }>;
  getDuel(id: string): Promise<Duel | null>;

  cityStatus(ctx: PlayerContext): Promise<CityStatus | null>;
  requestCity(ctx: PlayerContext, city: string, country: string): Promise<CityStatus>;
  /** Démo locale uniquement : simule l'arrivée d'un pote invité. */
  simulateInviteJoin(ctx: PlayerContext): Promise<CityStatus | null>;

  myProposals(ctx: PlayerContext): Promise<Proposal[]>;
  submitProposal(ctx: PlayerContext, p: { word: string; mean: string; origin: string; example?: string }): Promise<Proposal>;
  voteQueue(ctx: PlayerContext): Promise<VoteCard[]>;
  vote(ctx: PlayerContext, proposalId: string, choice: VoteChoice): Promise<{ pct: number }>;
  report(ctx: PlayerContext, target: ReportTarget, reason: string): Promise<void>;
  /** Masque les futures propositions de l'auteur ciblé. */
  blockProposalAuthor(ctx: PlayerContext, proposalId: string): Promise<void>;
  /** Masque le contenu publié et futur de l'auteur communautaire ciblé. */
  blockExpressionAuthor(ctx: PlayerContext, expressionKey: string): Promise<void>;

  /** Suppression définitive du compte et des données (exigée par les stores). */
  deleteAccount(): Promise<void>;
}
