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

## Rafraîchir les prix (≈ 3 minutes)

```bash
node tools/fetch-prices.mjs
```

Auchan et Carrefour : prix du site en ligne. Kaufland : seulement les offres de la semaine. Lidl et METRO n'ont pas de prix en ligne : saisissez-les dans « Mes courses › Prix ↗ » depuis vos tickets.

## Sur l'iPhone (recommandé : app installée, 100 % hors ligne)

1. Mettre le dossier `duo-app` en ligne une fois en **https** (GitHub Pages, Netlify ou Cloudflare Pages, gratuits). Le site ne contient que l'app : vos données restent dans l'iPhone.
2. Ouvrir l'adresse dans **Safari** › Partager › **Sur l'écran d'accueil**.
3. Ouvrir l'app une fois en ligne : ensuite elle fonctionne **sans réseau** (planning, liste de courses, placard, recettes). Seuls le scan (fiche Open Food Facts) et le rafraîchissement des prix demandent internet.
4. Pour mettre à jour les prix : `node tools/fetch-prices.mjs` sur le Mac, puis republier le dossier.

Sans hébergement, l'iPhone peut ouvrir l'app servie par le Mac sur le même Wi-Fi (`python3 -m http.server 8765 --bind 0.0.0.0`, puis `http://<IP-du-Mac>:8765`), mais sans mode hors ligne ni caméra en direct.

## Le dimanche matin, automatiquement

Raccourcis › Automatisation › **Heure de la journée** › dimanche 9:00 › action **Ouvrir les URL** : `https://<votre-adresse>/#dimanche`, et désactiver « Demander avant d'exécuter ».

À l'ouverture du dimanche (ou via `#dimanche`), Duo prépare la semaine suivante si ce n'est pas déjà fait, ouvre le panneau « Dimanche : batch cooking & courses », et le bouton **📤 Envoyer le programme & la liste** l'envoie par WhatsApp, Messages ou e-mail.
