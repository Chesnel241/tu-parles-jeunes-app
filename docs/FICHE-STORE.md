# Fiches App Store et Google Play

Textes prêts à copier. Les limites de caractères sont respectées.

## Textes communs

**Nom** (30 max) : `Tu parles jeune ?`

**Sous-titre App Store** (30 max) : `Le quiz de l'argot des villes`

**Description courte Google Play** (80 max) :
`Wesh, nouchi, verlan… Prouve que tu parles comme ta ville et défie tes potes !`

**Texte promotionnel App Store** (170 max, modifiable sans nouvelle version) :
`Nouveau : propose les expressions de ton quartier et fais entrer ta ville dans la Guerre des villes !`

**Mots-clés App Store** (100 max, séparés par des virgules, sans espace) :
`argot,expressions,quiz,jeunes,slang,nouchi,camfranglais,verlan,duel,villes,afrique,lyon,abidjan,jeu`

**Description complète** :

```
T'es chaud ? Prouve que tu parles jeune.

« On va s'enjailler », « c'est carré », « il a le seum », « wesh »… Chaque ville a son argot. Toi, tu captes combien d'expressions ?

5 QUESTIONS, 10 SECONDES CHACUNE
Une expression, quatre réponses, un chrono. Joker 50/50 ou indice si tu sèches.

LE DÉFI DU JOUR
Les mêmes 5 expressions pour tout le monde. Garde ta série de jours et compare-toi à tes potes.

LA GUERRE DES VILLES
Chaque bonne réponse fait gagner des points à ta ville. Lyon, Abidjan, Paris, Libreville, Dakar, Douala, Bruxelles… qui parle le mieux ? Et avec la Coupe des pays, ton pays de cœur compte aussi.

DÉFIE TES POTES
Envoie un duel en un lien. Partage ton score en story.

JEUNES VS DARONS
Fais jouer tes parents. Spoiler : ils vont galérer.

TON LEXIK
Chaque expression apprise rejoint ta collection, avec son sens et un exemple.

C'EST TOI QUI FAIS LE JEU
Ta ville n'est pas encore là ? Lance-la. Tu connais une expression ? Propose-la, la communauté vote, notre équipe relit, et elle entre dans le jeu avec ton pseudo.

Gratuit. Sans inscription : pas d'e-mail, pas de numéro. Pour les 13 ans et plus.
```

**Catégorie** : Jeux > Quiz (Trivia). Catégorie secondaire App Store : Jeux de mots.

**Adresses** : site, support et politique de confidentialité (voir PUBLICATION.md, étape 6).

## Captures d'écran

`assets/store/screenshots/01.png` à `06.png` (1290 × 2796, format iPhone 6,9 pouces, accepté aussi par Google Play). Ordre conseillé : accueil, question, Guerre des villes, duel/story, Lexik, proposer.

Les captures montrent le mode démo (« Salut Inès », 1 250 pièces). Pour la version finale, refais-les dans l'app en production, idéalement avec une vraie ville bien classée.

Google Play demande aussi une **image de présentation** 1024 × 500 : utilise `assets/brand/logo-lime.png` recadré sur fond Vert Validé.

## Classification d'âge

**Apple** (questionnaire App Store Connect) :
- Violence, sexe, drogue, jeux d'argent : Aucun.
- Humour grossier : Rare ou léger (argot).
- Contenu généré par les utilisateurs : Oui, **modéré** (filtre, vote, relecture humaine, signalement).
- Messagerie ou chat : Non.
- Publicités : Oui.
- Résultat attendu : **13+**.

**Google Play** (questionnaire IARC) : mêmes réponses. Le partage de contenu entre joueurs (expressions proposées) est à déclarer.
**Public cible** (Contenu de l'appli > Public cible) : 13-15 ans, 16-17 ans, 18 ans et plus. Ne coche **pas** les moins de 13 ans, sinon le programme Familles s'applique.

## Déclaration « Contient des annonces »

Google Play : Oui. App Store : rien à cocher, mais les annonces sont décrites dans les étiquettes de confidentialité ci-dessous.

## Google Play : Sécurité des données

| Catégorie | Donnée | Collectée | Partagée | Pourquoi |
| --- | --- | --- | --- | --- |
| Infos personnelles | ID utilisateur (anonyme) | Oui | Non | Fonctionnement de l'app |
| Activité dans l'appli | Interactions (parties, votes) | Oui | Non | Fonctionnement, anti-triche |
| Activité dans l'appli | Autre contenu généré (expressions proposées) | Oui | Non | Fonctionnement |
| Position | Position approximative (via l'IP, par AdMob) | Oui | Oui | Publicité |
| Appareil ou autres ID | Identifiant publicitaire | Oui | Oui | Publicité |
| Infos et performances | Diagnostics (AdMob) | Oui | Oui | Publicité, analyse |
| Infos financières | Historique d'achat | Oui | Non | Pack sans pub |

- Données chiffrées en transit : **Oui** (HTTPS partout).
- L'utilisateur peut demander la suppression : **Oui** (dans l'app + URL de la page de suppression).

Vérifie ces réponses avec le guide de Google : « Informations sur la sécurité des données pour le SDK Google Mobile Ads ».

## App Store : étiquettes de confidentialité

Données **liées à l'utilisateur** :
- Identifiants : ID utilisateur (fonctionnalités de l'app).
- Contenu utilisateur : autre contenu (expressions proposées).
- Achats : historique d'achats (fonctionnalités).
- Utilisation : interaction avec le produit (fonctionnalités).

Données **non liées à l'utilisateur** (collectées par AdMob) :
- Localisation approximative, identifiant de l'appareil, données publicitaires, diagnostics : publicité de tiers, analyse.

**Suivi (tracking)** : l'app ne demande pas l'autorisation de suivi (ATT) ; déclare « Non » et laisse AdMob en mode sans IDFA. Si un jour tu veux des pubs personnalisées sur iOS, il faudra ajouter la demande ATT et mettre à jour ces réponses.

Vérifie avec le guide de Google : « Préparer les détails de confidentialité de l'App Store pour le SDK Google Mobile Ads ».

## Notes pour la revue Apple

```
Les comptes sont anonymes : aucun identifiant n'est nécessaire, il suffit de choisir un pseudo.
Suppression du compte : Profil > Réglages > Supprimer mon compte.
Signaler un contenu : bouton « Signaler » sur chaque expression et proposition.
Le contenu proposé par les joueurs est filtré, voté puis validé par un modérateur avant publication.
Le pack sans pub est un achat non consommable, restaurable dans Profil.
```
