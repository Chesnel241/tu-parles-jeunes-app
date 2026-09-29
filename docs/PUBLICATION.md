# Publier « Tu parles jeune ? » sur l'App Store et Google Play

Ce guide suit l'ordre réel des opérations. Compte 2 à 3 semaines entre le premier build et la mise en ligne (validation des comptes développeur, tests, revue Apple).

## Étape 0 : les comptes à créer

| Compte | Coût | Pourquoi |
| --- | --- | --- |
| [Expo](https://expo.dev) | Gratuit (offre payante optionnelle) | Builds dans le cloud, sans Mac |
| [Apple Developer](https://developer.apple.com/programs/) | 99 $ par an | Publier sur l'App Store |
| [Google Play Console](https://play.google.com/console) | 25 $ une fois | Publier sur Google Play |
| [Supabase](https://supabase.com) | Gratuit au lancement | Classements, duels, votes, modération |
| [AdMob](https://admob.google.com) | Gratuit | Publicités |
| [RevenueCat](https://www.revenuecat.com) | Gratuit jusqu'à un certain revenu | Abonnement sans pub |

Conseil : crée les comptes Apple et Google au nom de ta structure (Logique Prod) si tu veux que le nom affiché sur les stores soit celui de l'entreprise. Apple demande alors un numéro D-U-N-S (gratuit, quelques jours).

## Étape 1 : identité de l'app

1. Choisis l'identifiant définitif de l'app. Par défaut : `com.logiqueprod.tuparlesjeune`. Il ne pourra plus changer après la première publication. Si tu veux un autre identifiant, modifie `APP_BUNDLE_ID`.
2. Vérifie que le nom « Tu parles jeune ? » est libre sur les deux stores et à l'INPI / l'EUIPO.
3. Réserve le domaine `tuparlesjeune.app` (ou un autre) : il sert aux liens de duel, à la politique de confidentialité et au support.

## Étape 2 : le serveur Supabase

Suis [supabase/README.md](../supabase/README.md). À la fin, tu as `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Étape 3 : AdMob

1. Crée l'app deux fois dans AdMob (une iOS, une Android). Note les **identifiants d'application** (`ca-app-pub-…~…`).
2. Pour chaque app, crée deux blocs d'annonces : **Récompensé** (« Doubler mes gains ») et **Interstitiel**. Note leurs identifiants (`ca-app-pub-…/…`).
3. Dans AdMob > Confidentialité et messages, crée le message **RGPD** (consentement européen). L'app l'affiche automatiquement.
4. Dans AdMob > Paramètres de l'app > Contenu : classe les annonces **« T » (ados)** au maximum et bloque les catégories sensibles (rencontres, jeux d'argent, alcool…).
5. Tant que tu développes, l'app utilise **toujours** les annonces de test de Google (voir `src/services/ads/index.native.ts`). Ne clique jamais sur tes propres vraies pubs : c'est la cause n°1 de suspension AdMob.

## Étape 4 : RevenueCat (abonnement sans pub)

1. Dans App Store Connect et Google Play Console, crée un abonnement **auto-renouvelable mensuel** « Sans pub » (par exemple `tpj_no_ads_monthly`). Le prix est défini dans chaque store ; il doit être affiché à l'utilisateur avant l'achat. Une formule annuelle peut être ajoutée plus tard.
2. Dans RevenueCat : crée le projet, connecte les deux stores, crée l'**entitlement** `no_ads`, attache les abonnements équivalents iOS et Android, puis crée une **offering** par défaut avec un package « Monthly » (et éventuellement « Annual »).
3. Récupère les clés publiques iOS et Android (`appl_…` et `goog_…`).
4. Sans clé, l'abonnement sans pub est simplement masqué dans l'app : tu peux publier sans, et l'ajouter plus tard.

## Étape 5 : les variables d'environnement dans EAS

Les valeurs ne vont pas dans le code. On les enregistre dans EAS, par environnement :

```bash
npx eas-cli@latest env:set production --name EXPO_PUBLIC_BACKEND --value supabase --visibility plaintext --non-interactive
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co --visibility plaintext --non-interactive
npx eas-cli@latest env:set production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value sb_publishable_... --visibility plaintext --non-interactive
npx eas-cli@latest env:set production --name ADMOB_ANDROID_APP_ID --value ca-app-pub-XXX~YYY --visibility sensitive --non-interactive
npx eas-cli@latest env:set production --name ADMOB_IOS_APP_ID --value ca-app-pub-XXX~ZZZ --visibility sensitive --non-interactive
# idem pour EXPO_PUBLIC_ADMOB_REWARDED_ANDROID, _IOS, EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID, _IOS,
# EXPO_PUBLIC_REVENUECAT_IOS_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
# EXPO_PUBLIC_PRIVACY_URL, EXPO_PUBLIC_TERMS_URL, EXPO_PUBLIC_ACCOUNT_DELETION_URL,
# EXPO_PUBLIC_SUPPORT_EMAIL et EXPO_PUBLIC_SHARE_BASE_URL
```

L'identifiant du projet EAS est déjà relié dans `app.config.ts` ; il ne doit pas être
dupliqué dans les variables d'environnement.

Rappel : tout ce qui commence par `EXPO_PUBLIC_` est lisible dans l'app. C'est normal pour ces valeurs (la clé Supabase « anon » est publique par conception). N'y mets jamais de clé « service_role » ni de mot de passe.

## Étape 6 : les pages web obligatoires

Les deux stores exigent une URL publique pour :

- la **politique de confidentialité** : adapte [CONFIDENTIALITE.md](CONFIDENTIALITE.md) et publie-la ;
- les **conditions d'utilisation** : adapte [CGU.md](CGU.md) ;
- la **suppression de compte** (Google l'exige aussi hors de l'app) : une page qui explique « Profil > Réglages > Supprimer mon compte » et donne l'e-mail de contact ;
- le **support** : une page ou une adresse e-mail.

Ces pages peuvent vivre sur un site très simple (tu as déjà l'habitude avec Logique Prod).

Le même domaine doit aussi servir les deux fichiers d'association décrits dans
[LIENS-UNIVERSELS.md](LIENS-UNIVERSELS.md), sans redirection. Sans eux, les liens de duel
s'ouvrent dans le navigateur au lieu d'ouvrir directement l'app.

## Étape 7 : tester avant de publier

Crée d'abord les mêmes variables pour l'environnement `preview` (étape 5, avec `--environment preview`), en gardant les identifiants AdMob **de test**.

```bash
npm run check                                    # doit être vert
npm run doctor                                   # 21/21 attendu
npm run preflight:release                        # avec l'environnement production chargé
npx eas-cli@latest build --profile preview --platform android   # APK à installer directement
```

- **Android** : envoie le lien de l'APK aux testeurs, installe-le sur 2 ou 3 téléphones différents, dont un d'entrée de gamme.
- **iOS** : le plus simple est **TestFlight**. Fais un build de production (étape 8) puis `npx eas-cli@latest submit --platform ios --latest`. Ajoute tes testeurs dans App Store Connect > TestFlight. Les pubs restent en mode test tant que les identifiants AdMob réels ne sont pas réglés en production.
- Fais jouer 10 à 20 jeunes pendant une semaine (GEH, DLWM, BDE). Coche [CHECKLIST.md](CHECKLIST.md).

## Étape 8 : les builds de production

```bash
npm run build:prod        # iOS (.ipa) + Android (.aab), numéros de build incrémentés automatiquement
npm run submit:prod       # envoi vers App Store Connect et Google Play (piste interne)
```

La première fois, EAS te guide pour créer les certificats Apple et la clé de signature Android. **Laisse EAS gérer la clé Android** : si tu la perds, tu ne peux plus mettre l'app à jour.

## Étape 9 : remplir les fiches

Tout le texte est prêt dans [FICHE-STORE.md](FICHE-STORE.md) : description, mots-clés, classification d'âge, questionnaire de confidentialité (Apple), section « Sécurité des données » (Google), déclaration publicitaire.

Captures d'écran : génère-les depuis l'app (simulateur iPhone 6,9 pouces et téléphone Android) ou utilise celles de `assets/store/screenshots` comme base.

## Étape 10 : envoyer en revue

- **Google Play** : piste interne > test fermé (12 testeurs pendant 14 jours obligatoires pour les nouveaux comptes personnels) > production.
- **App Store** : soumettre la version. Dans les notes pour la revue, indique que les comptes sont anonymes (pas d'identifiant de test à fournir) et où se trouvent « Supprimer mon compte » et « Signaler ».

## Après la sortie

- Mises à jour de contenu (expressions, questions) : directement dans Supabase, sans nouvelle version.
- Corrections JavaScript : `npx eas-cli@latest update` (mise à jour « over the air », après avoir configuré EAS Update).
- Corrections JavaScript validées : `npm run update:preview`, puis `npm run update:prod`. Les canaux et la politique `appVersion` sont déjà configurés.
- Nouvelles fonctions natives : nouveau build + nouvelle revue.
