# Communauté : villes, propositions, votes et modération

## Le parcours d'une expression

```
Proposée ──► En vote ──► À relire (humain) ──► Validée, entre dans le jeu
                │                  │
                └─► Refusée         └─► Doublon / À reformuler / Refusée
```

1. Un joueur propose une expression (5 par jour maximum). Le filtre automatique bloque insultes, liens, @pseudos, numéros, noms de vraies personnes évidents.
2. Les joueurs votent « Oui, on dit ça », « Jamais entendu » ou « On dit autrement ». Poids d'un vote : 1 ; 0,5 pour un compte de moins de 7 jours ; 2 pour un ambassadeur.
3. Seuil : 20 points de vote (8 pour une ville pionnière en chantier). Au moins 70 % de oui : la proposition passe **« À relire »**. Au moins 60 % de non : refusée.
4. **Un humain valide toujours** avant l'entrée dans le jeu. C'est ce qui protège de la blague qui vise quelqu'un.
5. 3 signalements masquent une proposition automatiquement, en attente de décision.

## Modérer au quotidien

Dans le tableau de bord Supabase, onglet **SQL Editor** :

```sql
-- Ce qui attend une relecture
select id, word, mean, origin, example, yes_weight, no_weight
from proposals where status = 'review' order by created_at;

-- Ce qui a été signalé
select target_type, target_id, reason, count(*) from reports
where not handled group by 1, 2, 3 order by 4 desc;
```

Décider : on agit **au nom de ton compte modérateur** (la décision est tracée), dans une seule exécution :

```sql
begin;
select set_config('request.jwt.claim.sub', (select id::text from profiles where pseudo = 'TonPseudo'), true);
select moderate_proposal('<id>', 'ok');   -- validée : entre dans le jeu et crée une question
-- ou : moderate_proposal('<id>', 'dup')                                   doublon
-- ou : moderate_proposal('<id>', 'mod', 'Reformule, c''est trop vague')   à reformuler
-- ou : moderate_proposal('<id>', 'rejected', 'Vise une personne')         refusée
commit;
```

Quand le volume grandit, une petite page d'administration pourra remplacer ces requêtes.

Le joueur voit le résultat et la note dans « Mes propositions ».

Règle d'or : **au moindre doute, refuse**. Une expression refusée à tort revient vite ; une moquerie publiée peut faire très mal à un ado.

## Donner un rôle

```sql
update profiles set is_moderator = true where pseudo = 'Chesnel';
update profiles set is_ambassador = true where pseudo = 'Awa225';
```

Choisis les ambassadeurs parmi les joueurs actifs, qui proposent des expressions justes, un ou deux par ville.

## Les villes

- **Ville ouverte** : visible dans le classement de la Guerre des villes.
- **Ville en chantier** : créée par « Ma ville n'est pas dans la liste ». Ses joueurs jouent normalement, leurs points comptent déjà, et comptent tout de suite pour leur **pays** et leur **pays de cœur**.
- **Ouverture automatique** quand le quota est atteint : 30 joueurs et 50 expressions validées ; **10 et 20 pour une ville pionnière** (la première de son pays, par exemple N'Djamena pour le Tchad). Les premiers joueurs reçoivent le badge Fondateur.

Un joueur ne peut choisir qu'une ville de la **liste officielle** (`allowed_cities`), pour éviter les noms inventés ou insultants.

### Ajouter des villes à la liste officielle

Pour quelques villes :

```sql
insert into countries (name) values ('Burundi') on conflict do nothing;
insert into allowed_cities (name, country) values ('Bujumbura', 'Burundi'), ('Gitega', 'Burundi');
```

Pour couvrir un pays entier, pars de [GeoNames](https://download.geonames.org/export/dump/) (fichier `cities15000.txt`, villes de plus de 15 000 habitants), filtre par code pays, puis importe en CSV dans la table `allowed_cities`. Pense à ajouter les mêmes villes dans `src/data/allowedCities.ts` pour le mode local.

## Mettre à jour le contenu de départ

Les expressions et questions de départ vivent dans `src/data`. Après modification :

```bash
npm run seed:generate      # régénère supabase/seed.sql
```

puis exécute `supabase/seed.sql` (sans risque : les insertions ignorent ce qui existe déjà).
