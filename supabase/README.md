# Serveur Supabase

## Mise en place (15 minutes)

1. Crée un projet sur [supabase.com](https://supabase.com). Région : **Europe (Paris ou Francfort)** pour le RGPD.
2. **Authentication > Sign In / Providers** : active **« Allow anonymous sign-ins »**.
3. **Authentication > Attack Protection** : active le CAPTCHA (Turnstile ou hCaptcha) dès que tu peux.
4. **SQL Editor** : colle et exécute `migrations/20260926000000_init.sql`, puis `seed.sql`.
5. **Project Settings > API** : copie l'URL du projet et la clé **anon (publique)** dans ton `.env` et dans EAS :
   ```
   EXPO_PUBLIC_BACKEND=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
6. Crée ton compte modérateur : lance l'app une fois, choisis un pseudo, puis :
   ```sql
   update profiles set is_moderator = true where pseudo = 'TonPseudo';
   ```

Avec la [CLI Supabase](https://supabase.com/docs/guides/cli), c'est encore plus simple : `supabase link` puis `supabase db push`.

**Ne mets jamais la clé `service_role` dans l'app, dans `.env` ou sur GitHub.**

## Contenu

| Fichier | Rôle |
| --- | --- |
| `migrations/…_init.sql` | Tables, RLS, fonctions RPC, droits |
| `seed.sql` | Pays, villes autorisées, villes ouvertes, expressions et questions de départ. Généré par `npm run seed:generate` |
| `tests/00_auth_stub.sql` | Simule l'authentification Supabase sur un Postgres local |
| `tests/01_api_tests.sql` | Scénario complet de 12 joueurs, avec vérifications de sécurité |

## Lancer les tests de l'API

Sur un Postgres 15+ local vide :

```bash
createdb tpj_test
psql -d tpj_test -v ON_ERROR_STOP=1 -f supabase/tests/00_auth_stub.sql \
  -f supabase/migrations/20260926000000_init.sql -f supabase/seed.sql \
  -f supabase/tests/01_api_tests.sql
```

Chaque vérification affiche `OK …`. Une ligne `ERREUR` arrête le script.

## Fonctions disponibles

Profil : `upsert_profile`, `choose_city`, `delete_my_account`.
Villes : `city_status`, `my_city_status`, `request_city`.
Parties : `submit_game`.
Classements : `city_ranking`, `country_ranking`, `friends_ranking`.
Duels : `create_duel`, `create_duel_from_last_game`, `get_duel`, `list_my_duels`.
Communauté : `propose_expression`, `vote_queue`, `vote_proposal`, `report_content`, `block_proposal_author`, `block_expression_author`, `my_proposals`, `moderate_proposal` (modérateurs).

Une validation `ok` crée à la fois l'expression et sa question. L'app synchronise ce catalogue au démarrage et avant une partie, tout en conservant une copie hors ligne.
