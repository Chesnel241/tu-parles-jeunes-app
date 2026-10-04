# Finalisation externe avant publication

Le code refuse désormais un build `production` tant que la configuration critique est absente. Ces éléments dépendent des comptes et de l'identité du propriétaire ; ils ne doivent pas être inventés dans le dépôt.

## État vérifié au 28 septembre 2026

### Terminé

- Dépôt GitHub initialisé et branche `main` publiée.
- Projet EAS lié à `@chesnels-team/tu-parles-jeune` ; variables Supabase et AdMob enregistrées pour `preview` et `production`.
- Build Android interne EAS `1.0.0 (1)` réussi au commit `9b9ce2d` et disponible en APK.
- Projet Supabase `nrfseoncfxwxykzrggfa` lié, migrations et seed appliqués, connexion anonyme activée, RLS vérifiée et `supabase db lint` sans erreur.
- Fiches AdMob Android et iOS créées avec un bloc interstitiel et un bloc récompensé sur chaque plate-forme.
- AdMob limité au niveau **Adolescents** ; toutes les catégories sensibles, l'alcool et les jeux d'argent sont bloqués.
- Fiche Google Play créée pour `com.logiqueprod.tuparlesjeune`.

### Bloqué par des informations ou validations du propriétaire

- AdMob : compléter le profil de paiement. Tant qu'il ne l'est pas, Google n'examine pas les applications et ne diffuse pas les annonces.
- Google Play : configurer le compte marchand avant de créer l'abonnement mensuel `tpj_no_ads_monthly`. Un test fermé avec au moins 12 testeurs pendant 14 jours est ensuite obligatoire avant la demande d'accès à la production.
- RevenueCat : projet créé ; entitlement `no_ads` et offering Test Store configurés avec l'abonnement mensuel `tpj_no_ads_monthly`. Il reste à connecter les applications App Store et Google Play, puis à remplacer les clés Test Store par leurs clés publiques de production.
- Builds internes : `preview` utilise obligatoirement les identifiants AdMob de test et la clé RevenueCat Test Store ; le build `production` refuse ces identifiants de test.
- Test Android : le profil EAS `play-internal` produit un Android App Bundle signé pour le canal de test interne Google Play, tout en conservant les services de test du profil `preview`. Cette distribution Play Store évite les avertissements Play Protect propres aux APK installés manuellement.
- Apple : rétablir l'accès App Store Connect, créer la fiche et le produit intégré, puis configurer TestFlight.
- Juridique : fournir l'identité de l'éditeur, le domaine HTTPS et l'adresse de support afin de remplacer les placeholders et publier les pages légales.
- Supabase : le projet actuel est hébergé à Londres (`eu-west-2`). Valider ce choix de résidence ou recréer le projet dans une région UE avant la publication.
- Appareils : exécuter la recette finale sur de vrais appareils iOS et Android, notamment achats, restauration, consentement, accessibilité et réseau dégradé.

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
