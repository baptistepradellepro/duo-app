# Duo — votre semaine à table

App web sans serveur ni build : HTML, CSS et JavaScript. Les données restent sur l'appareil (localStorage). Pensez à « Exporter » une sauvegarde de temps en temps.

## Fichiers

- `index.html`, `style.css`, `app.js` : l'app
- `data/ingredients.js` : catalogue (106 ingrédients, noms FR · RO, mots-clés de recherche magasin)
- `data/recipes.js` : carnet de recettes (rituels, fournées, congélation, cuisines du monde)
- `data/prices.js` : prix Auchan, Carrefour et promos Kaufland, **généré** par le script ci-dessous
- `tools/fetch-prices.mjs` : récupère les prix en ligne
- `vendor/zxing.min.js` : lecteur de codes-barres (hors ligne)
- `manifest.webmanifest`, `sw.js`, `icons/` : installation sur l'écran d'accueil de l'iPhone et usage hors ligne

## Lancer sur le Mac

```bash
python3 -m http.server 8765
```

Puis ouvrir http://localhost:8765.

## Les prix

Chaque dimanche à 05:00 UTC (08:00 à Bucarest en été), le workflow GitHub « Publier Duo » lance `tools/fetch-prices.mjs`, enregistre `data/prices.js` et republie l'app. Pour forcer une mise à jour : onglet **Actions** du dépôt › « Publier Duo » › **Run workflow**, ou sur le Mac :

```bash
node tools/fetch-prices.mjs
```

Auchan et Carrefour : prix du site en ligne. Lidl : produits en magasin cette semaine (prix normal et Lidl Plus). Kaufland : offres de la semaine (prix normal et Kaufland Card). METRO n'a pas de prix publics : saisissez-les dans « Mes courses › Prix ↗ ».

## Sur l'iPhone (recommandé : app installée, 100 % hors ligne)

1. L'app est en ligne sur **https://baptistepradellepro.github.io/duo-app/** (GitHub Pages, republiée à chaque modification). Le site ne contient que l'app : vos données restent dans l'iPhone.
2. Ouvrir cette adresse dans **Safari** › Partager › **Sur l'écran d'accueil**.
3. Ouvrir l'app une fois en ligne : ensuite elle fonctionne **sans réseau** (planning, liste de courses, placard, recettes). Seuls le scan (fiche Open Food Facts) et le rafraîchissement des prix demandent internet.

Sans hébergement, l'iPhone peut ouvrir l'app servie par le Mac sur le même Wi-Fi (`python3 -m http.server 8765 --bind 0.0.0.0`, puis `http://<IP-du-Mac>:8765`), mais sans mode hors ligne ni caméra en direct.

## Le dimanche matin, automatiquement

Raccourcis › Automatisation › **Heure de la journée** › dimanche 9:00 › action **Ouvrir les URL** : `https://baptistepradellepro.github.io/duo-app/#dimanche`, et désactiver « Demander avant d'exécuter ».

À l'ouverture du dimanche (ou via `#dimanche`), Duo prépare la semaine suivante si ce n'est pas déjà fait, ouvre le panneau « Dimanche : batch cooking & courses », et le bouton **📤 Envoyer le programme & la liste** l'envoie par WhatsApp, Messages ou e-mail.
