# Tu parles jeune ?

Le jeu qui prouve que tu parles comme ton quartier. Application mobile iOS et Android (Expo, React Native, TypeScript), fidèle à la maquette et à l'identité visuelle validées.

![Icône](assets/store/play-icon-512.png)

## En bref

| | |
| --- | --- |
| Plateformes | iOS 16.4+ et Android 7+ (un seul code) |
| Technologie | Expo SDK 57, React Native 0.86, Expo Router, TypeScript strict |
| Données du joueur | Sur le téléphone (AsyncStorage) + serveur Supabase en production |
| Monétisation | AdMob (pub récompensée + interstitiel plafonné) et abonnement « sans pub » via RevenueCat |
| Qualité | Typecheck strict, ESLint, tests unitaires, API SQL testée (sécurité RLS) |

## Démarrer en 5 minutes

Prérequis : Node.js 20 ou plus, un compte Expo (gratuit).

```bash
npm install
cp .env.example .env          # mode local de démo par défaut
npm run check                 # typecheck + lint + tests
npx expo start --web          # aperçu rapide dans le navigateur
```

Pour tester sur ton téléphone avec les vraies pubs de test et les achats, il faut un **build de développement** (AdMob et RevenueCat n'existent pas dans Expo Go) :

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami      # vérifie le compte Expo utilisé
npm run build:dev              # build de dev iOS/Android dans le cloud, sans Mac
npm start                      # puis scanne le QR code avec l'app installée
```

Le guide complet, étape par étape jusqu'à la publication, est dans [docs/PUBLICATION.md](docs/PUBLICATION.md).

## Les deux modes de fonctionnement

- **Local (démo)** : `EXPO_PUBLIC_BACKEND=local`. Tout marche sur le téléphone, sans serveur. Les classements et duels sont des données de démonstration (une pastille « Démo » l'indique). Parfait pour développer, tester et faire des présentations.
- **Supabase (production)** : `EXPO_PUBLIC_BACKEND=supabase`. Vrais classements de la semaine, duels par lien, propositions et votes, modération, ouverture des villes. **Obligatoire pour la sortie publique.** Mise en place : [supabase/README.md](supabase/README.md).

## Ce que contient l'app

Tous les écrans de la maquette, avec l'identité visuelle (palette, Dela Gothic One, Bricolage Grotesque, Permanent Marker, contours épais, ombres dures, stickers, motif wax, grain papier, Bulle et ses 5 humeurs et 5 looks) :

- Accueil et onboarding (pseudo, **tranche d'âge**, team, univers)
- « Ma ville n'est pas dans la liste », ville en chantier, ouverture de ville avec badge Fondateur
- Partie rapide, Défi du jour (le même pour tous), Jeunes vs Darons, duels
- Question avec chrono de 10 s, joker 50/50, indice ; écrans de bonne et mauvaise réponse
- Fin de partie, pub récompensée « Doubler mes gains », story à partager (image), défier un pote
- Guerre des villes, Coupe des pays (avec pays de cœur), classement entre potes
- Mon Lexik synchronisé et disponible hors ligne, fiche expression, proposer une expression, voter, signaler, bloquer un auteur, mes propositions, rôle d'ambassadeur
- Profil : looks de Bulle, badges, pays de cœur, abonnement sans pub, restauration d'abonnement, réglages de confidentialité, suppression du compte

Ajouts par rapport à la maquette, nécessaires pour publier en sécurité : tranche d'âge (moins de 13 ans refusés), consentement pub RGPD, suppression de compte, restauration d'achat, liens légaux, liste officielle des villes. Le bouton « J'ai déjà un compte » de la maquette est remplacé par « Règles et confidentialité », car les comptes sont anonymes (aucun e-mail demandé aux jeunes).

## Organisation du code

```
src/
  app/            écrans (Expo Router : un fichier = un écran)
  components/     design system (ui/) et identité (brand/ : Bulle, logo, wax, grain, animations)
  data/           expressions, questions, villes, pays, boutique
  logic/          règles du jeu, testées (tirage des questions, séries, classements, modération)
  store/          état persistant du joueur (zustand) et partie en cours
  services/       backend (local / Supabase), pubs, achats, partage, vibrations
  theme/          couleurs, polices, épaisseurs : la source unique de l'identité
supabase/         schéma SQL sécurisé, données de départ, tests de l'API
docs/             publication, sécurité, confidentialité, fiches store, identité, modération
assets/           icônes, splash, logo, visuels store
```

Détails : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm run check` | Typecheck + lint + tests (à lancer avant chaque build) |
| `npm run doctor` | Vérifie la cohérence du projet Expo et des dépendances |
| `npm run preflight:release` | Refuse une publication si une clé, une URL ou un texte légal manque |
| `npm run seed:generate` | Régénère `supabase/seed.sql` depuis `src/data` |
| `npm run build:dev` | Build de développement (téléphone) |
| `npm run build:preview` | Build de test à partager (APK Android, TestFlight interne iOS) |
| `npm run build:prod` | Builds de production iOS + Android |
| `npm run submit:prod` | Envoi aux stores |
| `npm run update:preview` | Mise à jour OTA du canal de validation |
| `npm run update:prod` | Mise à jour OTA du canal de production |

## Documentation

- [docs/PUBLICATION.md](docs/PUBLICATION.md) : de zéro aux stores, pas à pas
- [docs/FINALISATION-EXTERNE.md](docs/FINALISATION-EXTERNE.md) : les valeurs et validations restant à fournir par le propriétaire
- [docs/CHECKLIST.md](docs/CHECKLIST.md) : à cocher avant chaque sortie
- [docs/SECURITE.md](docs/SECURITE.md) : ce qui protège l'app et les joueurs
- [docs/CONFIDENTIALITE.md](docs/CONFIDENTIALITE.md) : modèle de politique de confidentialité
- [docs/CGU.md](docs/CGU.md) : modèle de conditions d'utilisation
- [docs/FICHE-STORE.md](docs/FICHE-STORE.md) : textes App Store et Play Store, classification, formulaires
- [docs/COMMUNAUTE.md](docs/COMMUNAUTE.md) : villes, votes, modération au quotidien
- [docs/IDENTITE-VISUELLE.md](docs/IDENTITE-VISUELLE.md) : règles de l'identité dans le code
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : comment le code est organisé
