\set ON_ERROR_STOP 1
-- 12 joueurs
insert into auth.users (id) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid from generate_series(1, 12) i;
create or replace function pg_temp.as_user(n int) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000' || lpad(n::text, 2, '0'), false);
end $$;

-- Joueur 1 : profil, ville absente (Tchad)
select pg_temp.as_user(1);
set role authenticated;
select public.upsert_profile('Abakar', '16-17', null, true);
select city, country, players, expressions, pioneer, opened from public.request_city('N''Djamena', 'Tchad');
reset role;

-- Refus attendus
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
  set local role authenticated;
  begin perform public.upsert_profile('@kevin', '18+', null, true); raise exception 'ERREUR: pseudo aurait dû être refusé'; exception when sqlstate '22023' then raise notice 'OK pseudo refusé'; end;
  begin perform public.upsert_profile('Toto', 'under13', null, true); raise exception 'ERREUR: âge'; exception when sqlstate '22023' then raise notice 'OK moins de 13 ans refusé'; end;
  begin perform public.request_city('Ville-Blague', 'Tchad'); raise exception 'ERREUR ville'; exception when others then raise notice 'OK ville hors liste refusée (%)', sqlerrm; end;
end $$;

-- Joueurs 2 à 10 rejoignent N'Djamena, 11 est à Lyon avec le Tchad en pays de cœur, 12 modérateur à Paris
do $$ declare i int; begin
  for i in 2..10 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'), false);
    perform public.upsert_profile('Joueur' || i, '18+', null, true);
    perform public.request_city('N''Djamena', 'Tchad');
  end loop;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', false);
  perform public.upsert_profile('Hawa', '18+', 'Tchad', true);
  perform public.choose_city('Lyon');
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000012', false);
  perform public.upsert_profile('Modo', '18+', null, true);
  perform public.choose_city('Paris');
end $$;
update public.profiles set is_moderator = true where pseudo = 'Modo';

-- Partie : le serveur recalcule le score
select pg_temp.as_user(11);
set role authenticated;
select public.submit_game('quick', array['q-wesh','q-daron','q-carre','q-seum','q-degun'], array[0,1,2,0,-1]::smallint[]) as score_attendu_3;
select public.submit_game('daily', array['q-wesh','q-daron','q-carre','q-seum','q-degun'], array[0,1,2,3,2]::smallint[]) as score_attendu_5;
reset role;
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', false);
  begin perform public.submit_game('daily', array['q-wesh','q-daron','q-carre','q-seum','q-degun'], array[0,1,2,3,2]::smallint[]); raise exception 'ERREUR daily x2';
  exception when sqlstate '23505' then raise notice 'OK défi du jour une seule fois'; end;
end $$;

select pg_temp.as_user(11);
set role authenticated;
select name, pts, me from public.city_ranking() limit 4;
select name, pts, me, heart from public.country_ranking() where name in ('France', 'Tchad');
-- Accès direct interdit
do $$ begin
  begin insert into public.games (user_id, mode, question_ids, answers, score) values (auth.uid(), 'quick', '{}', '{}', 5); raise exception 'ERREUR insert direct';
  exception when insufficient_privilege then raise notice 'OK écriture directe interdite'; end;
end $$;
select count(*) as profils_visibles_attendu_1 from public.profiles;

-- Duel
select public.create_duel(array['q-wesh','q-daron','q-carre','q-seum','q-degun']) as duel_id \gset
reset role;
select pg_temp.as_user(1);
set role authenticated;
select creator, creator_score from public.get_duel(:'duel_id');
select public.submit_game('duel', array['q-wesh','q-daron','q-carre','q-seum','q-degun'], array[0,1,1,1,1]::smallint[], :'duel_id') as score_duel_2;
reset role;
select pg_temp.as_user(11);
set role authenticated;
select public.submit_game('duel', array['q-wesh','q-daron','q-carre','q-seum','q-degun'], array[0,1,2,3,0]::smallint[], :'duel_id') as score_createur_4;
select opponent, my_score, their_score, status from public.list_my_duels();
select name, pts, me from public.friends_ranking();

-- Propositions + votes (ville pionnière : seuil 8)
reset role;
select pg_temp.as_user(1);
set role authenticated;
select id as prop_id from public.propose_expression('C''est giga', 'énorme', 'N''Djamena', null) \gset
reset role;
do $$ begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
  begin perform public.propose_expression('@kevin est nul', 'moquerie', 'N''Djamena', null); raise exception 'ERREUR moquerie';
  exception when sqlstate '22023' then raise notice 'OK citation d''une personne refusée'; end;
  begin perform public.vote_proposal((select id from public.proposals limit 1), 'yes'); raise exception 'ERREUR auto-vote';
  exception when insufficient_privilege then raise notice 'OK pas de vote sur sa propre proposition'; end;
end $$;
-- les votes des comptes récents comptent 0,5 : on vieillit les comptes pour le test
update public.profiles set created_at = now() - interval '30 days';
do $$ declare i int; pct int; begin
  for i in 2..9 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'), false);
    pct := public.vote_proposal((select id from public.proposals where word = 'C''est giga'), case when i = 10 then 'no' else 'yes' end);
  end loop;
end $$;
select word, status, yes_weight, no_weight, votes from public.proposals where word = 'C''est giga';

-- Modération humaine -> publication
select pg_temp.as_user(12);
set role authenticated;
select public.moderate_proposal(:'prop_id', 'ok', null);
reset role;
select key, word, author_label from public.expressions where key like 'u-%';
select id, lex, array_length(answers, 1) as quatre_reponses from public.questions where lex like 'u-%';

-- Blocage : le contenu publié de cet auteur disparaît aussi du catalogue du joueur.
select pg_temp.as_user(2);
set role authenticated;
select public.block_expression_author((select key from public.expressions where key like 'u-%' limit 1));
select count(*) as contenu_auteur_bloque_attendu_0 from public.expressions where key like 'u-%';
reset role;

-- Ouverture de la ville : 10 joueurs + 20 expressions validées
insert into public.proposals (user_id, word, mean, origin, city_id, status, created_at)
select '00000000-0000-0000-0000-000000000001', 'Expr ' || i, 'sens ' || i, 'N''Djamena', (select id from public.cities where name = 'N''Djamena'), 'ok', now() - interval '3 days' from generate_series(1, 19) i;
select public._maybe_open_city((select id from public.cities where name = 'N''Djamena'));
select name, status, pioneer from public.cities where name = 'N''Djamena';

-- Signalements : un doublon du même joueur ne compte pas, 3 joueurs uniques -> masquée
select pg_temp.as_user(1);
set role authenticated;
select id as p2 from public.propose_expression('Ça passe crème', 'facile', 'N''Djamena', null) \gset
reset role;
do $$ declare i int; begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
  perform public.report_content('proposal', (select id::text from public.proposals where word = 'Ça passe crème'), 'test');
  perform public.report_content('proposal', (select id::text from public.proposals where word = 'Ça passe crème'), 'doublon ignoré');
  for i in 3..4 loop
    perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'), false);
    perform public.report_content('proposal', (select id::text from public.proposals where word = 'Ça passe crème'), 'test');
  end loop;
end $$;
select word, status, reports from public.proposals where word = 'Ça passe crème';

-- Mes propositions, statut de ma ville, suppression de compte
select pg_temp.as_user(1);
set role authenticated;
select word, status from public.my_proposals() limit 3;
select city, players, expressions, opened from public.my_city_status();
select public.delete_my_account();
reset role;
select count(*) as profil_1_supprime_attendu_0 from public.profiles where pseudo = 'Abakar';
select count(*) as anon_ne_peut_rien_executer from information_schema.role_routine_grants where grantee = 'anon' and routine_schema = 'public';
-- Duel depuis la dernière partie
reset role;
select pg_temp.as_user(11);
set role authenticated;
select public.submit_game('quick', array['q-wesh','q-daron','q-carre','q-seum','q-mbolo'], array[0,1,2,3,0]::smallint[]) as score_5;
select public.create_duel_from_last_game() as new_duel \gset
select creator_score as score_repris_5 from public.duels where id = :'new_duel';
reset role;
