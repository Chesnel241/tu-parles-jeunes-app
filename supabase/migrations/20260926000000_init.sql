-- =====================================================================
-- Tu parles jeune ? · Schéma Supabase (PostgreSQL)
-- Principe de sécurité : le client ne peut RIEN écrire directement.
-- Toutes les écritures passent par des fonctions contrôlées (RPC)
-- qui vérifient l'identité, les limites et le contenu.
-- La clé "anon" peut donc être publique : les règles RLS protègent les données.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Référentiel géographique
-- ---------------------------------------------------------------------
create table public.countries (
  name text primary key check (char_length(name) between 2 and 40)
);

-- Liste officielle des villes qu'un joueur peut « ouvrir » (pas de nom inventé).
create table public.allowed_cities (
  name text not null check (char_length(name) between 2 and 40),
  country text not null references public.countries(name) on update cascade,
  primary key (name, country)
);

create table public.cities (
  id bigint generated always as identity primary key,
  name text not null,
  country text not null references public.countries(name) on update cascade,
  status text not null default 'building' check (status in ('open', 'building')),
  pioneer boolean not null default false,
  color text check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  unique (name, country)
);

-- ---------------------------------------------------------------------
-- Joueurs
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 16),
  age_range text not null check (age_range in ('13-15', '16-17', '18+')),
  terms_accepted_at timestamptz,
  city_id bigint references public.cities(id) on delete set null,
  country text references public.countries(name) on update cascade,
  heart text references public.countries(name) on update cascade,
  is_ambassador boolean not null default false,
  is_moderator boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);
create index profiles_city_idx on public.profiles (city_id);

-- ---------------------------------------------------------------------
-- Contenu du jeu
-- ---------------------------------------------------------------------
create table public.expressions (
  key text primary key check (key ~ '^[a-z0-9_-]{2,40}$'),
  word text not null check (char_length(word) between 1 and 60),
  place text not null,
  lang text not null,
  region text not null check (region in ('eu', 'af', 'web', 'darons')),
  mean text not null,
  def text not null,
  ex text not null,
  author_id uuid references public.profiles(id) on delete set null,
  author_label text not null default 'l''équipe',
  city_id bigint references public.cities(id) on delete set null,
  reports integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.questions (
  id text primary key,
  lex text not null references public.expressions(key) on delete cascade,
  expr text not null,
  answers text[] not null check (array_length(answers, 1) = 4),
  good smallint not null check (good between 0 and 3),
  hint text not null default '',
  active boolean not null default true
);

-- ---------------------------------------------------------------------
-- Parties, duels
-- ---------------------------------------------------------------------
create table public.games (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('quick', 'daily', 'darons', 'duel')),
  question_ids text[] not null,
  answers smallint[] not null,
  score smallint not null check (score between 0 and 5),
  city_id bigint references public.cities(id) on delete set null,
  country text,
  heart text,
  duel_id text,
  created_at timestamptz not null default now()
);
create index games_week_idx on public.games (created_at);
create index games_user_idx on public.games (user_id, created_at);

create table public.duels (
  id text primary key default encode(extensions.gen_random_bytes(6), 'hex'),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id uuid references public.profiles(id) on delete cascade,
  question_ids text[] not null check (array_length(question_ids, 1) = 5),
  creator_score smallint,
  opponent_score smallint,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);
create index duels_creator_idx on public.duels (creator_id);
create index duels_opponent_idx on public.duels (opponent_id);

-- ---------------------------------------------------------------------
-- Communauté : propositions, votes, signalements
-- ---------------------------------------------------------------------
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null check (char_length(word) between 2 and 60),
  mean text not null check (char_length(mean) between 2 and 120),
  origin text not null check (char_length(origin) between 2 and 40),
  example text check (example is null or char_length(example) <= 160),
  city_id bigint references public.cities(id) on delete set null,
  -- vote : en cours de vote · review : validée par la communauté, en attente de modération humaine
  -- ok : publiée · dup : doublon · mod : retirée par la modération · rejected : refusée par les votes
  status text not null default 'vote' check (status in ('vote', 'review', 'ok', 'dup', 'mod', 'rejected')),
  yes_weight numeric not null default 0,
  no_weight numeric not null default 0,
  votes integer not null default 0,
  reports integer not null default 0,
  note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index proposals_status_idx on public.proposals (status, created_at);
create index proposals_user_idx on public.proposals (user_id);

create table public.proposal_votes (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  choice text not null check (choice in ('yes', 'no', 'other')),
  weight numeric not null,
  created_at timestamptz not null default now(),
  primary key (proposal_id, user_id)
);

create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('proposal', 'expression', 'player')),
  target_id text not null check (char_length(target_id) <= 80),
  reason text not null check (char_length(reason) between 1 and 300),
  handled boolean not null default false,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

-- Un joueur peut masquer les futures contributions d'un auteur abusif.
create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- =====================================================================
-- Sécurité : RLS partout, aucune écriture directe
-- =====================================================================
alter table public.countries enable row level security;
alter table public.allowed_cities enable row level security;
alter table public.cities enable row level security;
alter table public.profiles enable row level security;
alter table public.expressions enable row level security;
alter table public.questions enable row level security;
alter table public.games enable row level security;
alter table public.duels enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_votes enable row level security;
alter table public.reports enable row level security;
alter table public.user_blocks enable row level security;

-- Lecture personnalisée du catalogue : un blocage retire aussi le contenu déjà publié.
create or replace function public._can_read_expression(p_key text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.expressions e
    where e.key = p_key and e.published
      and (e.author_id is null or auth.uid() is null or not exists (
        select 1 from public.user_blocks b where b.blocker_id = auth.uid() and b.blocked_id = e.author_id
      ))
  );
$$;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.countries, public.allowed_cities, public.cities, public.expressions, public.questions to anon, authenticated;
grant select on public.profiles, public.games, public.duels, public.proposals to authenticated;

create policy "référentiel lisible" on public.countries for select using (true);
create policy "villes autorisées lisibles" on public.allowed_cities for select using (true);
create policy "villes lisibles" on public.cities for select using (true);
create policy "expressions publiées" on public.expressions for select using (public._can_read_expression(key));
create policy "questions actives" on public.questions for select using (active and public._can_read_expression(lex));
create policy "mon profil" on public.profiles for select to authenticated using (id = auth.uid());
create policy "mes parties" on public.games for select to authenticated using (user_id = auth.uid());
create policy "mes duels" on public.duels for select to authenticated using (auth.uid() in (creator_id, opponent_id));
create policy "mes propositions" on public.proposals for select to authenticated using (user_id = auth.uid());
-- proposal_votes et reports : aucune lecture ni écriture directe.

-- =====================================================================
-- Fonctions utilitaires (internes)
-- =====================================================================
create or replace function public._me()
returns public.profiles
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then raise exception 'profil introuvable' using errcode = 'P0002'; end if;
  if p.terms_accepted_at is null then raise exception 'conditions non acceptées' using errcode = '42501'; end if;
  if p.is_banned then raise exception 'compte suspendu' using errcode = '42501'; end if;
  return p;
end $$;

create or replace function public._clean_text(t text)
returns text language sql immutable as $$ select btrim(regexp_replace(coalesce(t, ''), '\s+', ' ', 'g')) $$;

-- Refuse liens, pseudos (@), numéros et mots interdits. Le filtre complet est côté modération humaine.
create or replace function public._is_acceptable(t text)
returns boolean language plpgsql immutable as $$
declare n text := ' ' || lower(public._clean_text(t)) || ' ';
begin
  if n ~* '(https?://|www\.|\.(com|fr|net|org)\M)' then return false; end if;
  if n ~ '@[a-z0-9_.]{2,}' then return false; end if;
  if regexp_replace(n, '\s', '', 'g') ~ '[0-9]{6,}' then return false; end if;
  if n ~* '\m(connard|connasse|salope|pute|encule|enculé|batard|bâtard|fdp|ntm|pd|pédé|tapette|negro|nègre|bougnoul|youpin|bicot|porno|viol|suicide)\M' then return false; end if;
  return true;
end $$;

create or replace function public._week_start()
returns timestamptz language sql stable as $$ select date_trunc('week', now()) $$;

-- Ouvre une ville en chantier quand son quota est atteint.
create or replace function public._maybe_open_city(p_city_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare c public.cities; n_players int; n_expr int; q_players int; q_expr int;
begin
  select * into c from public.cities where id = p_city_id for update;
  if c.id is null or c.status = 'open' then return; end if;
  select count(*) into n_players from public.profiles where city_id = p_city_id;
  select count(*) into n_expr from public.proposals where city_id = p_city_id and status = 'ok';
  q_players := case when c.pioneer then 10 else 30 end;
  q_expr := case when c.pioneer then 20 else 50 end;
  if n_players >= q_players and n_expr >= q_expr then
    update public.cities set status = 'open', opened_at = now() where id = p_city_id;
  end if;
end $$;

-- =====================================================================
-- API publique (RPC appelées par l'app)
-- =====================================================================

-- Création / mise à jour du profil (après connexion anonyme).
create or replace function public.upsert_profile(p_pseudo text, p_age_range text, p_heart text, p_terms_accepted boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_pseudo text := public._clean_text(p_pseudo);
begin
  if auth.uid() is null then raise exception 'non connecté' using errcode = '42501'; end if;
  if p_age_range not in ('13-15', '16-17', '18+') then raise exception 'âge non autorisé' using errcode = '22023'; end if;
  if char_length(v_pseudo) not between 2 and 16 or v_pseudo !~ '^[[:alnum:] ._-]+$' or not public._is_acceptable(v_pseudo) then
    raise exception 'pseudo refusé' using errcode = '22023';
  end if;
  if p_heart is not null and not exists (select 1 from public.countries where name = p_heart) then
    raise exception 'pays inconnu' using errcode = '22023';
  end if;
  insert into public.profiles (id, pseudo, age_range, heart, terms_accepted_at)
  values (auth.uid(), v_pseudo, p_age_range, p_heart, case when p_terms_accepted then now() end)
  on conflict (id) do update set
    pseudo = excluded.pseudo,
    age_range = excluded.age_range,
    heart = excluded.heart,
    terms_accepted_at = case
      when p_terms_accepted then coalesce(public.profiles.terms_accepted_at, now())
      else public.profiles.terms_accepted_at
    end;
end $$;

-- Rejoindre une ville ouverte.
create or replace function public.choose_city(p_city text)
returns void language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); c public.cities;
begin
  select * into c from public.cities where name = p_city and status = 'open' limit 1;
  if c.id is null then raise exception 'ville fermée ou inconnue' using errcode = '22023'; end if;
  update public.profiles set city_id = c.id, country = c.country where id = me.id;
end $$;

-- Statut d'une ville (jauges du chantier).
create or replace function public.city_status(p_city_id bigint)
returns table (city text, country text, players int, expressions int, pioneer boolean, opened boolean, founders text[])
language sql stable security definer set search_path = public as $$
  select c.name, c.country,
    (select count(*)::int from public.profiles p where p.city_id = c.id),
    (select count(*)::int from public.proposals pr where pr.city_id = c.id and pr.status = 'ok'),
    c.pioneer, c.status = 'open',
    array(select p.pseudo from public.profiles p where p.city_id = c.id order by p.created_at limit 12)
  from public.cities c where c.id = p_city_id;
$$;

-- Statut de la ville du joueur connecté (null si aucune).
create or replace function public.my_city_status()
returns table (city text, country text, players int, expressions int, pioneer boolean, opened boolean, founders text[])
language sql stable security definer set search_path = public as $$
  select s.* from public.profiles p, lateral public.city_status(p.city_id) s where p.id = auth.uid();
$$;

-- « Ma ville n'est pas dans la liste » : lance (ou rejoint) une ville en chantier.
create or replace function public.request_city(p_city text, p_country text)
returns table (city text, country text, players int, expressions int, pioneer boolean, opened boolean, founders text[])
language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); v_id bigint; v_pioneer boolean;
begin
  if not exists (select 1 from public.allowed_cities a where a.name = p_city and a.country = p_country) then
    raise exception 'ville hors de la liste officielle' using errcode = '22023';
  end if;
  select id into v_id from public.cities c where c.name = p_city and c.country = p_country;
  if v_id is null then
    v_pioneer := not exists (select 1 from public.cities c where c.country = p_country and c.status = 'open');
    insert into public.cities (name, country, status, pioneer, color, created_by)
    values (p_city, p_country, 'building', v_pioneer, '#FF7A1F', me.id) returning id into v_id;
  end if;
  update public.profiles set city_id = v_id, country = p_country where id = me.id;
  perform public._maybe_open_city(v_id);
  return query select * from public.city_status(v_id);
end $$;

-- Fin de partie : le SERVEUR recalcule le score (impossible de tricher en envoyant « 5/5 »).
create or replace function public.submit_game(p_mode text, p_question_ids text[], p_answers smallint[], p_duel_id text default null)
returns smallint language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); v_score smallint := 0; q public.questions; d public.duels;
begin
  if p_mode not in ('quick', 'daily', 'darons', 'duel') then raise exception 'mode inconnu' using errcode = '22023'; end if;
  if array_length(p_question_ids, 1) is distinct from 5 or array_length(p_answers, 1) is distinct from 5 then
    raise exception 'partie invalide' using errcode = '22023';
  end if;
  if (select count(*) from public.games where user_id = me.id and created_at > now() - interval '1 day') >= 60 then
    raise exception 'trop de parties aujourd''hui' using errcode = '53400';
  end if;
  if p_mode = 'daily' and exists (
    select 1 from public.games where user_id = me.id and mode = 'daily' and created_at >= date_trunc('day', now())
  ) then
    raise exception 'défi du jour déjà joué' using errcode = '23505';
  end if;
  for i in 1..5 loop
    select * into q from public.questions where id = p_question_ids[i] and active;
    if q.id is null then raise exception 'question inconnue' using errcode = '22023'; end if;
    if p_answers[i] < -1 or p_answers[i] > 3 then raise exception 'réponse invalide' using errcode = '22023'; end if;
    if p_answers[i] = q.good then v_score := v_score + 1; end if;
  end loop;

  if p_duel_id is not null then
    select * into d from public.duels where id = p_duel_id for update;
    if d.id is null or d.expires_at < now() then raise exception 'duel expiré' using errcode = '22023'; end if;
    if d.question_ids <> p_question_ids then raise exception 'questions du duel modifiées' using errcode = '22023'; end if;
    if d.creator_id = me.id then
      if d.creator_score is not null then raise exception 'déjà joué' using errcode = '23505'; end if;
      update public.duels set creator_score = v_score where id = d.id;
    elsif d.opponent_id is null or d.opponent_id = me.id then
      if d.opponent_score is not null then raise exception 'déjà joué' using errcode = '23505'; end if;
      update public.duels set opponent_id = me.id, opponent_score = v_score where id = d.id;
    else
      raise exception 'duel complet' using errcode = '42501';
    end if;
  end if;

  insert into public.games (user_id, mode, question_ids, answers, score, city_id, country, heart, duel_id)
  values (me.id, p_mode, p_question_ids, p_answers, v_score, me.city_id, me.country, me.heart, p_duel_id);
  return v_score;
end $$;

-- Classement hebdomadaire des villes ouvertes (120 pts par bonne réponse).
create or replace function public.city_ranking()
returns table (name text, pts bigint, color text, me boolean)
language sql stable security definer set search_path = public as $$
  select c.name, coalesce(sum(g.score), 0)::bigint * 120, c.color,
         c.id = (select city_id from public.profiles where id = auth.uid())
  from public.cities c
  left join public.games g on g.city_id = c.id and g.created_at >= public._week_start()
  where c.status = 'open'
  group by c.id order by 2 desc, c.name;
$$;

-- Coupe des pays : points du pays de résidence + pays de cœur.
create or replace function public.country_ranking()
returns table (name text, pts bigint, me boolean, heart boolean)
language sql stable security definer set search_path = public as $$
  with week as (select * from public.games where created_at >= public._week_start()),
  pts as (
    select country as name, score from week where country is not null
    union all
    select heart as name, score from week where heart is not null and heart is distinct from country
  ),
  me as (select country, heart from public.profiles where id = auth.uid())
  select k.name, coalesce(sum(p.score), 0)::bigint * 120,
         k.name = (select country from me),
         k.name = (select heart from me) and k.name is distinct from (select country from me)
  from public.countries k left join pts p on p.name = k.name
  group by k.name order by 2 desc, k.name;
$$;

-- Classement entre potes : les adversaires de duel.
create or replace function public.friends_ranking()
returns table (name text, pts bigint, me boolean)
language sql stable security definer set search_path = public as $$
  with friends as (
    select auth.uid() as id
    union
    select case when creator_id = auth.uid() then opponent_id else creator_id end
    from public.duels where auth.uid() in (creator_id, opponent_id) and opponent_id is not null
  )
  select p.pseudo, coalesce(sum(g.score), 0)::bigint * 120, p.id = auth.uid()
  from friends f join public.profiles p on p.id = f.id
  left join public.games g on g.user_id = p.id and g.created_at >= public._week_start()
  group by p.id order by 2 desc limit 50;
$$;

create or replace function public.create_duel(p_question_ids text[])
returns text language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); v_id text;
begin
  if (select count(*) from public.duels where creator_id = me.id and created_at > now() - interval '1 day') >= 30 then
    raise exception 'trop de duels aujourd''hui' using errcode = '53400';
  end if;
  if (select count(*) from public.questions where id = any(p_question_ids) and active) <> 5 then
    raise exception 'questions invalides' using errcode = '22023';
  end if;
  insert into public.duels (creator_id, question_ids) values (me.id, p_question_ids) returning id into v_id;
  return v_id;
end $$;

-- Défier un pote sur les questions qu'on vient de jouer : le score du créateur vient
-- de SA dernière partie enregistrée côté serveur (jamais d'un chiffre envoyé par l'app).
create or replace function public.create_duel_from_last_game()
returns text language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); g public.games; v_id text;
begin
  if (select count(*) from public.duels where creator_id = me.id and created_at > now() - interval '1 day') >= 30 then
    raise exception 'trop de duels aujourd''hui' using errcode = '53400';
  end if;
  select * into g from public.games
  where user_id = me.id and duel_id is null and created_at > now() - interval '15 minutes'
  order by created_at desc limit 1;
  if g.id is null then raise exception 'joue une partie avant de défier' using errcode = '22023'; end if;
  insert into public.duels (creator_id, question_ids, creator_score) values (me.id, g.question_ids, g.score) returning id into v_id;
  return v_id;
end $$;

-- Lecture d'un duel reçu par lien (sans exposer l'identifiant du créateur).
create or replace function public.get_duel(p_id text)
returns table (id text, question_ids text[], creator text, creator_score smallint)
language sql stable security definer set search_path = public as $$
  select d.id, d.question_ids, p.pseudo, d.creator_score
  from public.duels d join public.profiles p on p.id = d.creator_id
  where d.id = p_id and d.expires_at > now();
$$;

create or replace function public.list_my_duels()
returns table (id text, opponent text, my_score smallint, their_score smallint, status text)
language sql stable security definer set search_path = public as $$
  select d.id,
    coalesce(o.pseudo, 'En attente'),
    case when d.creator_id = auth.uid() then d.creator_score else d.opponent_score end,
    case when d.creator_id = auth.uid() then d.opponent_score else d.creator_score end,
    case
      when (case when d.creator_id = auth.uid() then d.creator_score else d.opponent_score end) is null then 'my_turn'
      when (case when d.creator_id = auth.uid() then d.opponent_score else d.creator_score end) is null then 'their_turn'
      when (case when d.creator_id = auth.uid() then d.creator_score else d.opponent_score end)
         > (case when d.creator_id = auth.uid() then d.opponent_score else d.creator_score end) then 'won'
      when (case when d.creator_id = auth.uid() then d.creator_score else d.opponent_score end)
         < (case when d.creator_id = auth.uid() then d.opponent_score else d.creator_score end) then 'lost'
      else 'draw'
    end
  from public.duels d
  left join public.profiles o on o.id = case when d.creator_id = auth.uid() then d.opponent_id else d.creator_id end
  where auth.uid() in (d.creator_id, d.opponent_id)
  order by d.created_at desc limit 30;
$$;

-- Proposer une expression (5 par jour maximum).
create or replace function public.propose_expression(p_word text, p_mean text, p_origin text, p_example text default null)
returns public.proposals language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); r public.proposals;
  v_word text := public._clean_text(p_word); v_mean text := public._clean_text(p_mean);
  v_origin text := public._clean_text(p_origin); v_example text := nullif(public._clean_text(p_example), '');
begin
  if (select count(*) from public.proposals where user_id = me.id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'limite de 5 propositions par jour' using errcode = '53400';
  end if;
  if not (public._is_acceptable(v_word) and public._is_acceptable(v_mean) and public._is_acceptable(coalesce(v_example, ''))) then
    raise exception 'contenu refusé' using errcode = '22023';
  end if;
  insert into public.proposals (user_id, word, mean, origin, example, city_id)
  values (me.id, v_word, v_mean, v_origin, v_example, me.city_id) returning * into r;
  return r;
end $$;

-- File de vote : d'abord ma ville, puis mon pays, puis les villes pionnières (jury élargi).
create or replace function public.vote_queue(p_limit int default 10)
returns table (id uuid, word text, place text, mean text, pct int)
language sql stable security definer set search_path = public as $$
  with me as (select * from public.profiles where id = auth.uid())
  select pr.id, pr.word, coalesce(c.name, pr.origin), pr.mean,
         case when pr.yes_weight + pr.no_weight = 0 then 50
              else round(100 * pr.yes_weight / (pr.yes_weight + pr.no_weight))::int end
  from public.proposals pr
  left join public.cities c on c.id = pr.city_id
  where pr.status = 'vote'
    and pr.user_id <> (select id from me)
    and not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = (select id from me) and b.blocked_id = pr.user_id
    )
    and not exists (select 1 from public.proposal_votes v where v.proposal_id = pr.id and v.user_id = (select id from me))
  order by
    (pr.city_id is not distinct from (select city_id from me)) desc,
    (c.country is not distinct from (select country from me)) desc,
    (c.status = 'building' and c.pioneer) desc,
    pr.created_at
  limit least(greatest(p_limit, 1), 30);
$$;

create or replace function public.vote_proposal(p_id uuid, p_choice text)
returns int language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); pr public.proposals; c public.cities; w numeric; total numeric; threshold numeric; agree int;
begin
  if p_choice not in ('yes', 'no', 'other') then raise exception 'vote invalide' using errcode = '22023'; end if;
  select * into pr from public.proposals where id = p_id for update;
  if pr.id is null or pr.status <> 'vote' then raise exception 'vote fermé' using errcode = '22023'; end if;
  if pr.user_id = me.id then raise exception 'pas de vote sur sa propre proposition' using errcode = '42501'; end if;
  w := case when me.is_ambassador then 2 when me.created_at > now() - interval '7 days' then 0.5 else 1 end;
  insert into public.proposal_votes (proposal_id, user_id, choice, weight) values (p_id, me.id, p_choice, w);
  update public.proposals set
    yes_weight = yes_weight + case when p_choice = 'yes' then w else 0 end,
    no_weight = no_weight + case when p_choice = 'no' then w else 0 end,
    votes = votes + 1
  where id = p_id returning * into pr;

  select * into c from public.cities where id = pr.city_id;
  threshold := case when c.status = 'building' and c.pioneer then 8 else 20 end;
  total := pr.yes_weight + pr.no_weight;
  if total >= threshold then
    if pr.yes_weight / total >= 0.7 then
      update public.proposals set status = 'review' where id = p_id; -- validation humaine ensuite
    elsif pr.no_weight / total >= 0.6 then
      update public.proposals set status = 'rejected', note = 'Refusée par les votes.' where id = p_id;
    end if;
  end if;
  agree := case when total = 0 then 50
                when p_choice = 'yes' then round(100 * pr.yes_weight / total)
                when p_choice = 'no' then round(100 * pr.no_weight / total)
                else 0 end;
  return agree;
end $$;

create or replace function public.report_content(p_type text, p_id text, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me();
begin
  if (select count(*) from public.reports where reporter_id = me.id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'trop de signalements aujourd''hui' using errcode = '53400';
  end if;
  insert into public.reports (reporter_id, target_type, target_id, reason)
  values (me.id, p_type, p_id, left(p_reason, 300))
  on conflict (reporter_id, target_type, target_id) do nothing;
  -- Un même compte ne peut pas gonfler artificiellement le nombre de signalements.
  if not found then return; end if;
  if p_type = 'proposal' then
    update public.proposals set reports = reports + 1,
      status = case when reports + 1 >= 3 and status = 'vote' then 'mod' else status end,
      note = case when reports + 1 >= 3 and status = 'vote' then 'Masquée après plusieurs signalements, en attente de modération.' else note end
    where id::text = p_id;
  elsif p_type = 'expression' then
    update public.expressions set reports = reports + 1,
      published = case when reports + 1 >= 3 then false else published end
    where key = p_id;
    if (select not published from public.expressions where key = p_id) then
      update public.questions set active = false where lex = p_id;
    end if;
  end if;
end $$;

-- Bloque l'auteur d'une proposition et retire ses contenus de la file de vote du joueur.
create or replace function public.block_proposal_author(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); v_author uuid;
begin
  select user_id into v_author from public.proposals where id = p_id;
  if v_author is null then raise exception 'proposition introuvable' using errcode = 'P0002'; end if;
  if v_author = me.id then raise exception 'impossible de se bloquer soi-même' using errcode = '22023'; end if;
  insert into public.user_blocks (blocker_id, blocked_id)
  values (me.id, v_author)
  on conflict do nothing;
end $$;

create or replace function public.block_expression_author(p_key text)
returns void language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); v_author uuid;
begin
  select author_id into v_author from public.expressions where key = p_key and published;
  if v_author is null then raise exception 'auteur communautaire introuvable' using errcode = 'P0002'; end if;
  if v_author = me.id then raise exception 'impossible de se bloquer soi-même' using errcode = '22023'; end if;
  insert into public.user_blocks (blocker_id, blocked_id)
  values (me.id, v_author)
  on conflict do nothing;
end $$;

-- Modération humaine (réservée aux comptes modérateurs).
create or replace function public.moderate_proposal(p_id uuid, p_decision text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare me public.profiles := public._me(); pr public.proposals; v_key text; v_region text;
  v_distractors text[]; v_good smallint; v_answers text[];
begin
  if not me.is_moderator then raise exception 'réservé aux modérateurs' using errcode = '42501'; end if;
  if p_decision not in ('ok', 'dup', 'mod', 'rejected') then raise exception 'décision invalide' using errcode = '22023'; end if;
  update public.proposals set status = p_decision, note = p_note, reviewed_by = me.id, reviewed_at = now()
  where id = p_id returning * into pr;
  if pr.id is null then raise exception 'proposition introuvable' using errcode = 'P0002'; end if;
  if p_decision = 'ok' then
    v_key := 'u-' || left(replace(pr.id::text, '-', ''), 12);
    select case
      when pr.origin = 'Internet' then 'web'
      when c.country in ('France', 'Belgique', 'Luxembourg', 'Suisse', 'Canada') then 'eu'
      else 'af'
    end into v_region
    from public.cities c where c.id = pr.city_id;
    v_region := coalesce(v_region, case when pr.origin = 'Internet' then 'web' else 'af' end);
    insert into public.expressions (key, word, place, lang, region, mean, def, ex, author_id, author_label, city_id)
    values (v_key, pr.word, pr.origin, 'Communauté', v_region, pr.mean, pr.mean,
            coalesce(pr.example, '« ' || pr.word || ' »'), pr.user_id,
            '@' || (select pseudo from public.profiles where id = pr.user_id), pr.city_id)
    on conflict (key) do nothing;

    -- Une expression publiée doit être immédiatement jouable. Les distracteurs
    -- proviennent du catalogue déjà modéré et leur ordre reste stable.
    select array_agg(mean order by sort_key) into v_distractors
    from (
      select mean, min(md5(key || p_id::text)) as sort_key
      from public.expressions
      where key <> v_key and published and mean <> pr.mean
      group by mean
      order by min(md5(key || p_id::text))
      limit 3
    ) d;
    if coalesce(array_length(v_distractors, 1), 0) = 3 then
      v_good := mod(hashtext(v_key)::bigint + 2147483648, 4)::smallint;
      v_answers := case v_good
        when 0 then array[pr.mean, v_distractors[1], v_distractors[2], v_distractors[3]]
        when 1 then array[v_distractors[1], pr.mean, v_distractors[2], v_distractors[3]]
        when 2 then array[v_distractors[1], v_distractors[2], pr.mean, v_distractors[3]]
        else array[v_distractors[1], v_distractors[2], v_distractors[3], pr.mean]
      end;
      insert into public.questions (id, lex, expr, answers, good, hint)
      values ('q-' || v_key, v_key, coalesce(pr.example, '« ' || pr.word || ' »'), v_answers, v_good,
              'Cette expression vient de ' || pr.origin || '.')
      on conflict (id) do update set expr = excluded.expr, answers = excluded.answers,
        good = excluded.good, hint = excluded.hint, active = true;
    end if;
    if pr.city_id is not null then perform public._maybe_open_city(pr.city_id); end if;
  end if;
end $$;

-- Mes propositions et leur statut.
create or replace function public.my_proposals()
returns table (id uuid, word text, mean text, origin text, example text, status text, votes int, note text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, word, mean, origin, example,
         case when status = 'review' then 'vote' when status = 'rejected' then 'dup' else status end,
         votes, note, created_at
  from public.proposals where user_id = auth.uid() order by created_at desc limit 100;
$$;

-- Suppression définitive du compte (exigence App Store / Play Store).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'non connecté' using errcode = '42501'; end if;
  -- Les contributions publiées sont supprimées avec le compte, y compris le pseudo copié.
  delete from public.expressions where author_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;

-- Droits d'exécution : uniquement les joueurs connectés (connexion anonyme comprise).
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.upsert_profile(text, text, text, boolean), public.choose_city(text), public.city_status(bigint),
  public.request_city(text, text), public.my_city_status(), public.submit_game(text, text[], smallint[], text),
  public.city_ranking(), public.country_ranking(), public.friends_ranking(),
  public.create_duel(text[]), public.create_duel_from_last_game(), public.get_duel(text), public.list_my_duels(),
  public.propose_expression(text, text, text, text), public.vote_queue(int), public.vote_proposal(uuid, text),
  public.report_content(text, text, text), public.block_proposal_author(uuid), public.block_expression_author(text), public.moderate_proposal(uuid, text, text),
  public.my_proposals(), public.delete_my_account()
to authenticated;

-- Un lien de duel peut être prévisualisé avant la création du profil.
grant execute on function public.get_duel(text) to anon;
grant execute on function public._can_read_expression(text) to anon, authenticated;
