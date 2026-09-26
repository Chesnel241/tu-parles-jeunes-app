import { isSupabaseConfigured } from '../config';
import { localBackend } from './local';
import { supabaseBackend } from './supabase';
import type { Backend } from './types';

/** Backend actif : Supabase s'il est configuré, sinon le mode local de démonstration. */
export const backend: Backend = isSupabaseConfigured ? supabaseBackend : localBackend;

let initialization: Promise<void> | null = null;

/** Initialise l'authentification une seule fois et permet aux écrans profonds d'attendre sa disponibilité. */
export function initializeBackend(): Promise<void> {
  if (!initialization) {
    initialization = backend.init().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export type { Backend, CityStatus, ContentBank, DuelSummary, PlayerContext, VoteChoice } from './types';
