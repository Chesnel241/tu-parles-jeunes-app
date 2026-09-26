# Liens de duel iOS et Android

L'app est configurée pour ouvrir `https://VOTRE-DOMAINE/duel/<id>`. Le domaine doit répondre en HTTPS et publier **sans redirection** les deux fichiers ci-dessous avec `Content-Type: application/json`.

## iOS

Publier `https://VOTRE-DOMAINE/.well-known/apple-app-site-association` (sans extension) :

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["APPLE_TEAM_ID.com.logiqueprod.tuparlesjeune"],
        "components": [{ "/": "/duel/*", "comment": "Duels Tu parles jeune" }]
      }
    ]
  }
}
```

`APPLE_TEAM_ID` est visible dans le compte Apple Developer. Si `APP_BUNDLE_ID` change, remplacer aussi le bundle ID ici.

## Android

Publier `https://VOTRE-DOMAINE/.well-known/assetlinks.json` :

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.logiqueprod.tuparlesjeune",
      "sha256_cert_fingerprints": ["EMPREINTE_SHA256_DE_LA_CLE_PLAY_APP_SIGNING"]
    }
  }
]
```

L'empreinte à utiliser est celle de **Play App Signing** dans Google Play Console, pas celle d'un keystore local.

## Validation

- iOS : supprimer puis réinstaller le build, envoyer un lien par Messages/Notes et vérifier l'ouverture directe.
- Android : installer le build Play, puis contrôler les liens d'application dans les réglages système et ouvrir le lien depuis Chrome.
- Tester aussi un duel expiré et un nouveau joueur qui doit terminer l'onboarding avant de reprendre le duel.
