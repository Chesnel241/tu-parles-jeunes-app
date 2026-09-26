# Sécurité

L'app vise des mineurs (13 ans et plus) et laisse les joueurs publier du contenu. La sécurité repose sur quatre principes.

## 1. Le serveur ne fait pas confiance à l'app

- **Aucune écriture directe** dans la base. Les droits `insert`, `update`, `delete` sont retirés aux rôles `anon` et `authenticated`. Tout passe par des fonctions SQL contrôlées (`security definer`, `search_path` fixé).
- **Le score est recalculé par le serveur** (`submit_game`) à partir des réponses : envoyer « 5/5 » ne sert à rien.
- **Un duel reprend le score enregistré côté serveur** (`create_duel_from_last_game`), jamais un chiffre envoyé par l'app.
- **Limites anti-abus** : 60 parties, 5 propositions, 20 signalements, 30 duels par jour et par joueur ; un seul Défi du jour.
- **RLS partout** : un joueur ne lit que son profil, ses parties, ses duels et ses propositions. Les classements passent par des fonctions qui n'exposent que des pseudos et des totaux.
- **La clé « anon » est publique par conception**. La clé « service_role » ne doit jamais sortir du tableau de bord Supabase.

L'API est couverte par des tests SQL (`supabase/tests/`) : pseudo refusé, moins de 13 ans refusé, ville hors liste refusée, score recalculé, Défi du jour unique, écriture directe interdite, isolation des profils, vote sur sa propre proposition interdit, masquage après 3 signalements, suppression de compte en cascade.

## 2. Pas de données personnelles inutiles

- Connexion **anonyme** : ni e-mail, ni téléphone, ni nom réel.
- On garde une **tranche d'âge**, pas une date de naissance.
- Pas de géolocalisation : la ville est choisie dans une liste.
- Pas de suivi publicitaire iOS (ATT non demandé), pubs non personnalisées pour les moins de 16 ans.
- **Suppression de compte** dans l'app (Profil > Réglages), qui efface tout en cascade côté serveur.

## 3. Le contenu des joueurs est filtré, voté puis relu

1. Filtre immédiat dans l'app (`src/logic/moderation.ts`) : insultes, liens, pseudos (@), numéros.
2. Même filtre côté serveur (`_is_acceptable`), impossible à contourner.
3. Vote de la communauté, avec poids réduit pour les comptes de moins de 7 jours.
4. **Validation humaine** avant publication : une proposition qui passe le vote attend en statut `review`.
5. Signalement possible partout (propositions, expressions). Seul le premier signalement d'un compte est compté ; 3 comptes distincts masquent automatiquement le contenu.
6. Blocage d'un auteur depuis la file de vote ou une expression communautaire : ses contenus publiés et futurs disparaissent pour le joueur.
7. Une expression approuvée génère une question jouable et rejoint le catalogue synchronisé ; le dernier catalogue reste disponible hors ligne.
8. Pas de chat libre : aucune messagerie entre joueurs, donc pas de contact direct avec des inconnus.

## 4. Les pubs sont encadrées

- Annonces de **test** forcées en développement.
- Consentement RGPD (Google UMP) **avant** l'initialisation du SDK.
- Contenu publicitaire classé « T » (ados) au maximum.
- Pub récompensée **toujours au choix du joueur**, interstitiel limité à 1 toutes les 3 parties, jamais pendant une partie ni après le Défi du jour.

## Bonnes pratiques d'exploitation

- Active le **CAPTCHA** sur l'authentification Supabase (hCaptcha ou Turnstile) pour limiter les comptes anonymes en masse.
- Active les **sauvegardes** automatiques (offre Pro Supabase) avant d'avoir beaucoup de joueurs.
- Donne le rôle modérateur à peu de personnes, avec `update profiles set is_moderator = true where id = '…'` depuis le tableau de bord.
- Surveille la table `reports` tous les jours au lancement.
- Mets à jour les dépendances à chaque nouvelle version d'Expo (`npx expo install --fix`).
