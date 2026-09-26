# Architecture

## Vue d'ensemble

```
Écrans (src/app)            ─ Expo Router, un fichier = un écran
   │ utilisent
Composants (src/components) ─ design system + identité
   │
État (src/store)            ─ zustand persistant (profil, pièces, séries, Lexik) + partie en cours
   │
Logique pure (src/logic)    ─ règles testées, sans React ni réseau
   │
Services (src/services)     ─ backend, pubs, achats, partage, vibrations
   │
Supabase (supabase/)        ─ Postgres + RLS + fonctions RPC
```

## Choix techniques

| Sujet | Choix | Raison |
| --- | --- | --- |
| Framework | Expo SDK 57 + React Native 0.86 | Un seul code iOS/Android, builds cloud (pas besoin de Mac) |
| Navigation | Expo Router (Stack + onglets personnalisés) | Liens profonds natifs (`/duel/ID`) |
| État | zustand + AsyncStorage | Léger, fonctionne hors connexion |
| Serveur | Supabase (Postgres) | Classements en SQL, sécurité par RLS, offre gratuite suffisante au lancement |
| Comptes | Connexion anonyme Supabase | Aucune donnée personnelle demandée aux mineurs |
| Pubs | react-native-google-mobile-ads + UMP | Standard, consentement RGPD intégré |
| Achats | RevenueCat | Gère App Store, Play, restauration et reçus |

## Fichiers par plateforme

`src/services/ads/index.native.ts` et `src/services/purchases/index.native.ts` contiennent le vrai code natif. Les fichiers `index.ts` voisins sont des versions vides pour le web (aperçu navigateur et tests). Metro choisit automatiquement le bon.

## Le backend interchangeable

`src/services/backend/types.ts` définit un contrat unique. Deux implémentations :

- `local.ts` : tout sur le téléphone, données de démo pour les classements (`isDemo = true`).
- `supabase.ts` : appels RPC vers le serveur.

`EXPO_PUBLIC_BACKEND` choisit laquelle. Les écrans ne savent pas lequel est actif.

## Le déroulé d'une partie

1. `features/game.ts > startGame` tire 5 questions (le Défi du jour utilise une graine fixe par date : tout le monde a les mêmes).
2. `store/game.ts` suit la partie (réponses, jokers, chrono).
3. À la fin, `store/app.ts > recordGame` met à jour pièces, série, Lexik ; le backend enregistre la partie et **recalcule le score** côté serveur.
4. Écran de résultat, puis pub récompensée optionnelle, story, duel.

## Qualité

- TypeScript strict (`noUncheckedIndexedAccess`), ESLint Expo, Jest (`__tests__/`).
- Tests SQL de l'API : `supabase/tests/` (voir supabase/README.md).
- `npm run check` avant chaque build.

## Ajouter un écran

1. Crée `src/app/mon-ecran.tsx`.
2. Utilise `Screen`, `Header`, `Txt`, `Button`, `Brutal` : l'identité suit automatiquement.
3. Navigue avec `router.push('/mon-ecran')`.
