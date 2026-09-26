# Identité visuelle dans le code

Référence : la présentation PDF validée et la maquette interactive. Tout est centralisé dans `src/theme/index.ts` : **aucune couleur ni police en dur dans les écrans.**

## Palette (chaque couleur porte le nom d'une expression)

| Nom | Hex | Rôle |
| --- | --- | --- |
| Vert Validé | `#C8F53C` | Couleur principale, icône, succès |
| Rose Askip | `#FF5CA8` | Le « ? », accents, notifications |
| Bleu Wesh | `#2F4BFF` | Duels, liens, profondeur (texte blanc dessus) |
| Orange Enjaillé | `#FF7A1F` | Énergie, bonus, Guerre des villes |
| Violet Seum | `#9B6BFF` | Erreurs gentilles, défaites |
| Noir Carré | `#121212` | Contours, textes, ombres |
| Crème Daron | `#FFF4E0` | Fonds, respiration |

`onColor(fond)` donne automatiquement la couleur de texte lisible.

## Typographies

| Usage | Police | Clé |
| --- | --- | --- |
| Titres, chiffres, boutons | Dela Gothic One | `fonts.display` |
| Texte courant | Bricolage Grotesque 400 / 600 / 800 | `fonts.body`, `bodySemi`, `bodyBold` |
| Annotations manuscrites (« ça veut dire quoi ? ») | Permanent Marker | `fonts.marker` |

Toutes sous licence SIL Open Font, embarquées dans l'app (aucun appel réseau).

## Signature néo-brutaliste

- Contours noirs épais : `stroke.thick` (4), `medium` (3), `thin` (2).
- **Ombres dures** décalées, jamais floues : `shadow.lg` (6), `md` (5), `sm` (3). Composant `Brutal`.
- Boutons qui « s'enfoncent » dans leur ombre quand on appuie (`Button`).
- Stickers légèrement penchés : `stickerTilt` et `stickerCycle`.
- Grain papier sur les fonds (`Grain`) et motif wax discret (`Wax`).

## Bulle, la mascotte

Composant `Bulle` (SVG) : 5 humeurs (`happy`, `shock`, `seum`, `proud`, `think`) et des looks à débloquer dans le Profil (`cap`, `shades`, `phones`, `bob`, `crown`). Animations : `Bob` (flotte), `Pop` (apparition), `FadeIn`. Toutes respectent le réglage système « Réduire les animations ».

## Logo et icônes de l'app

| Fichier | Usage |
| --- | --- |
| `assets/icon.png` | Icône iOS (1024, sans transparence) |
| `assets/android-icon-*.png` | Icône adaptative Android (avant-plan, fond, monochrome) |
| `assets/splash-icon.png` | Écran de lancement (fond Vert Validé) |
| `assets/brand/logo*.png` | Logo complet (noir, sur vert, sur crème) |
| `assets/store/` | Icône 1024 App Store, icône 512 Play Store, captures d'écran 1290 × 2796 |

## Ton des textes

Tutoiement, phrases courtes, argot bienveillant (« T'es chaud ? », « Carré ! », « Pas grave, t'apprends »). Jamais de moquerie d'une ville, d'un pays ou d'une génération : les Darons sont des adversaires respectés.
