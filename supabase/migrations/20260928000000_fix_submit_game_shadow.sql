-- PL/pgSQL declares the integer iterator of a FOR range automatically.
-- Omitting a second declaration keeps schema linting clean without changing behavior.
create or replace function public.submit_game(
  p_mode text,
  p_question_ids text[],
  p_answers smallint[],
  p_duel_id text default null
)
returns smallint
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles := public._me();
  v_score smallint := 0;
  q public.questions;
  d public.duels;
begin
  if p_mode not in ('quick', 'daily', 'darons', 'duel') then
    raise exception 'mode inconnu' using errcode = '22023';
  end if;
  if array_length(p_question_ids, 1) is distinct from 5
     or array_length(p_answers, 1) is distinct from 5 then
    raise exception 'partie invalide' using errcode = '22023';
  end if;
  if (
    select count(*)
    from public.games
    where user_id = me.id
      and created_at > now() - interval '1 day'
  ) >= 60 then
    raise exception 'trop de parties aujourd''hui' using errcode = '53400';
  end if;
  if p_mode = 'daily' and exists (
    select 1
    from public.games
    where user_id = me.id
      and mode = 'daily'
      and created_at >= date_trunc('day', now())
  ) then
    raise exception 'défi du jour déjà joué' using errcode = '23505';
  end if;

  for i in 1..5 loop
    select * into q
    from public.questions
    where id = p_question_ids[i]
      and active;
    if q.id is null then
      raise exception 'question inconnue' using errcode = '22023';
    end if;
    if p_answers[i] < -1 or p_answers[i] > 3 then
      raise exception 'réponse invalide' using errcode = '22023';
    end if;
    if p_answers[i] = q.good then
      v_score := v_score + 1;
    end if;
  end loop;

  if p_duel_id is not null then
    select * into d
    from public.duels
    where id = p_duel_id
    for update;
    if d.id is null or d.expires_at < now() then
      raise exception 'duel expiré' using errcode = '22023';
    end if;
    if d.question_ids <> p_question_ids then
      raise exception 'questions du duel modifiées' using errcode = '22023';
    end if;
    if d.creator_id = me.id then
      if d.creator_score is not null then
        raise exception 'déjà joué' using errcode = '23505';
      end if;
      update public.duels set creator_score = v_score where id = d.id;
    elsif d.opponent_id is null or d.opponent_id = me.id then
      if d.opponent_score is not null then
        raise exception 'déjà joué' using errcode = '23505';
      end if;
      update public.duels
      set opponent_id = me.id, opponent_score = v_score
      where id = d.id;
    else
      raise exception 'duel complet' using errcode = '42501';
    end if;
  end if;

  insert into public.games (
    user_id, mode, question_ids, answers, score, city_id, country, heart, duel_id
  ) values (
    me.id, p_mode, p_question_ids, p_answers, v_score,
    me.city_id, me.country, me.heart, p_duel_id
  );
  return v_score;
end
$$;
