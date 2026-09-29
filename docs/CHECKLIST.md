# Checklist avant publication

## Technique

- [ ] `npm run check` est vert (typecheck, lint, tests)
- [ ] `npx expo-doctor` ne signale aucun problème
- [ ] `EXPO_PUBLIC_BACKEND=supabase` en production, la pastille « Démo » n'apparaît plus dans les classements
- [ ] Les identifiants AdMob **réels** sont réglés dans EAS (production uniquement)
- [ ] L'app a été testée avec les pubs de test sur iOS et Android (pub récompensée + interstitiel)
- [ ] Le formulaire de consentement RGPD s'affiche depuis la France (ou avec `debugGeography` EEA en test)
- [ ] L'abonnement sans pub s'achète, se **restaure** et se **résilie** depuis le lien de gestion (compte sandbox Apple, testeur de licence Google)
- [ ] Hors connexion : l'app s'ouvre, on peut jouer une partie rapide, pas de plantage
- [ ] Liens de duel : un lien envoyé ouvre bien l'écran « … te défie ! »
- [ ] Les fichiers AASA et `assetlinks.json` sont publiés et validés (voir `LIENS-UNIVERSELS.md`)
- [ ] Testé sur un petit écran (iPhone SE 2e génération / Android 5,5 pouces) et un grand
- [ ] Texte agrandi dans les réglages d'accessibilité : rien n'est coupé d'important
- [ ] « Réduire les animations » activé : pas d'animation gênante

## Contenu

- [ ] Chaque expression relue par au moins 2 jeunes de la ville concernée
- [ ] Aucune expression vulgaire, insultante ou discriminante
- [ ] Les réponses fausses ne se moquent d'aucune ville ni d'aucun groupe
- [ ] La liste officielle des villes (`allowed_cities`) couvre les pays visés

## Sécurité et communauté

- [ ] Migration SQL appliquée, RLS actif sur toutes les tables (voir supabase/README.md)
- [ ] Connexion anonyme activée dans Supabase, CAPTCHA activé
- [ ] Au moins 1 compte modérateur créé ; routine de modération quotidienne prévue
- [ ] Adresse de contact et de signalement surveillée
- [ ] Blocage d'un auteur testé ; son contenu publié et futur n'apparaît plus
- [ ] Trois signalements de comptes distincts masquent le contenu, un doublon du même compte ne compte pas

## Légal et stores

- [ ] Politique de confidentialité publiée (URL dans EAS et sur les fiches)
- [ ] CGU publiées
- [ ] Page web de suppression de compte (exigée par Google)
- [ ] `npm run preflight:release` passe avec l'environnement de production
- [ ] Classification d'âge : 13+ (Apple), questionnaire IARC rempli (Google), public cible 13 ans et plus
- [ ] Google Play : section « Sécurité des données » remplie, déclaration « contient des annonces »
- [ ] Apple : « Étiquettes de confidentialité » remplies, pas de suivi (ATT) déclaré
- [ ] Nom et logo vérifiés (INPI / EUIPO) avant de communiquer
