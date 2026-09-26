# Finalisation externe avant publication

Le code refuse désormais un build `production` tant que la configuration critique est absente. Ces éléments dépendent des comptes et de l'identité du propriétaire ; ils ne doivent pas être inventés dans le dépôt.

## À fournir

1. **Identité juridique** : raison sociale, forme, adresse, SIREN, e-mail surveillé, date et région Supabase. Remplacer tous les crochets dans `CONFIDENTIALITE.md` et `CGU.md`, puis faire valider les textes.
2. **Domaine HTTPS** : publier confidentialité, CGU, support, suppression de compte et page d'accueil avec liens stores. Régler les quatre URL `EXPO_PUBLIC_*` correspondantes.
3. **Liens universels** : publier AASA et `assetlinks.json` selon `LIENS-UNIVERSELS.md` avec l'Apple Team ID et l'empreinte Play réels.
4. **Backend** : créer Supabase en région UE, appliquer migration + seed, activer connexion anonyme et CAPTCHA, créer un modérateur puis exécuter les tests SQL sur une base jetable.
5. **Comptes commerciaux** : renseigner EAS, AdMob et RevenueCat avec les identifiants réels ; tester achats/restauration et consentement sur sandbox.
6. **Stores** : confirmer bundle ID, certificats, questionnaires de confidentialité/âge, fiches, captures, test fermé Google et TestFlight.
7. **Validation appareils** : petit/grand écran, taille de texte ×2, VoiceOver/TalkBack, hors ligne, faible réseau, duel froid et suppression de compte.

## Barrières automatiques

Avec l'environnement production chargé :

```bash
npm run preflight:release
npm run check
npm run doctor
EAS_BUILD_PROFILE=production npx expo config --type public
```

Le premier contrôle échoue volontairement si une variable ou un texte juridique manque. Le dernier déclenche en plus la validation stricte de `app.config.ts`.
