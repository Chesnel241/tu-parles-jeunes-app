export type Region = 'eu' | 'af' | 'web' | 'darons';

export type Expression = {
  key: string;
  word: string;
  place: string;
  lang: string;
  region: Region;
  /** Sens très court, pour les cartes à partager. */
  mean: string;
  def: string;
  ex: string;
  by: string;
};

export type Question = {
  id: string;
  lex: string;
  expr: string;
  answers: readonly [string, string, string, string];
  good: 0 | 1 | 2 | 3;
  /** Pourcentage de réussite affiché (sera calculé par le backend en production). */
  pct: number;
  hint: string;
};

export type GameMode = 'quick' | 'daily' | 'darons' | 'duel';

export type Look = 'none' | 'cap' | 'shades' | 'phones' | 'bob' | 'crown';

export type Mood = 'happy' | 'shock' | 'seum' | 'proud' | 'think';

export type City = { name: string; country: string; color: string };

export type AgeRange = 'under13' | '13-15' | '16-17' | '18+';

export type ProposalStatus = 'vote' | 'ok' | 'dup' | 'mod';

export type Proposal = {
  id: string;
  word: string;
  mean: string;
  origin: string;
  example?: string;
  status: ProposalStatus;
  votes: number;
  note?: string;
  createdAt: string;
};

export type VoteCard = { id: string; word: string; place: string; mean: string; pct: number };

export type RankRow = { name: string; pts: number; me?: boolean; heart?: boolean; color?: string };
