// Carnet de recettes (textes rédigés pour Duo).
// type "breakfast" et "main" : quantités PAR PERSONNE (l'app double pour deux).
// type "drink" (boisson) et "snack" (en-cas) : par personne, hors planning, à enregistrer avec « Cuisiné en plus ».
// type "sauce" et "batch" : quantités TOTALES pour la fournée ; portions = nombre de portions individuelles produites.
// fixed : "chirashi" (mardi soir), "ramen" (jeudi ou vendredi soir).
// manual : jamais proposée seule, ni complétée d'un accompagnement ; à mettre au menu soi-même.
// discard : quantités achetées mais non mangées (saumure, marinade), hors calories.
// yields : ce que la préparation ajoute au placard (ex. blancs et cuisses du poulet entier).
window.RECIPES = [];
function r(id, name, emoji, cuisine, type, time, ingredients, steps, o = {}) {
  window.RECIPES.push({
    id,
    name,
    emoji,
    cuisine,
    type,
    time,
    ingredients,
    steps,
    veg: !!o.veg,
    freezer: !!o.freezer,
    portions: o.portions || 0,
    unit: o.unit || "portions",
    meal: o.meal || (type === "breakfast" ? "breakfast" : "main"),
    fixed: o.fixed || null,
    yields: o.yields || null,
    snack: !!o.snack,
    retired: !!o.retired,
    manual: !!o.manual,
    discard: o.discard || null,
  });
}

// ─── Rituels de la semaine ───────────────────────────────────────────────
r("poulet_entier", "Poulet entier désossé + bouillon", "🐔", "Française", "batch", 200,
  { whole_chicken: 1, carrot: 100, onion: 150 },
  [
    "Désosser le poulet : lever les deux blancs, puis les cuisses entières ; désosser cuisses et hauts de cuisse.",
    "Ranger blancs et viande de cuisse au réfrigérateur (2 jours maximum) ou les congeler à plat. Garder 1 blanc pour le ramen du jeudi : le congeler et le sortir au réfrigérateur le mardi soir.",
    "Bouillon : carcasse + ailes + 1 carotte + 1 oignon dans environ 5 L d’eau froide. Porter à frémissement, laisser frémir 2 à 3 h en écumant, puis filtrer : environ 4,5 L. Ne pas saler, c’est le tare ou l’assiette qui assaisonne.",
    "Refroidir vite (bac d’eau froide) et congeler par portions de 1 L : le dimanche au jeudi fait 4 jours, trop long au réfrigérateur.",
  ], { portions: 1, unit: "poulet", yields: { chicken: 350, chicken_thigh: 400, broth: 4500 } });
r("ramen", "Ramen poulet croustillant, œuf tamago & tare", "🍜", "Japonaise", "main", 40,
  { noodles: 100, chicken: 88, egg: 2, spring_onion: 0.25, soy_sauce: 70, mirin: 43, kombu: 2.5, shiitake: 3, broth: 450, oil: 3 },
  [
    "LA VEILLE · Saumure : dissoudre 25 g de sel dans 500 ml d’eau, ajouter 30 ml de sauce soja et 1 blanc de poulet. Laisser au réfrigérateur jusqu’au lendemain.",
    "LA VEILLE · 4 œufs tamago : cuire 6 minutes 30 dans l’eau bouillante, plonger dans l’eau glacée, écaler. Les laisser dans 60 ml de sauce soja, 60 ml de mirin et 120 ml d’eau, au réfrigérateur jusqu’au lendemain.",
    "LA VEILLE · Sortir 1 L de bouillon du congélateur et le laisser décongeler au réfrigérateur.",
    "Tare : laisser infuser 30 minutes à froid 50 ml de sauce soja, 25 ml de mirin, 50 ml d’eau, 5 g de kombu et 2 shiitakés séchés. Chauffer doucement, retirer le kombu avant l’ébullition, laisser frémir 5 minutes et filtrer.",
    "Égoutter et sécher le blanc. Le pocher 12 à 15 minutes à petit frémissement, jusqu’à 74 °C à cœur. Le sécher de nouveau, puis le dorer 1 minute par face dans une poêle chaude avec un peu d’huile. Trancher.",
    "Faire chauffer 900 ml de bouillon. Cuire 200 g de nouilles selon le paquet, égoutter.",
    "Mettre 30 à 40 ml de tare au fond de chaque bol, verser 450 ml de bouillon, mélanger. Goûter et ajuster.",
    "Ajouter les nouilles, le poulet tranché, 2 œufs coupés en deux par bol et les oignons verts ciselés.",
  ], { fixed: "ramen", discard: { soy_sauce: 45, mirin: 30 } });
r("poule_au_pot", "Poule au pot tout con (bouillon & vermicelles)", "🍲", "Française", "main", 10,
  { vermicelli: 60, broth: 500 },
  [
    "Porter 1 L de bouillon à frémissement et le saler.",
    "Ajouter 120 g de vermicelles et les cuire selon le paquet.",
    "Servir aussitôt.",
  ], { manual: true });
r("chirashi", "Chirashi saumon & avocat", "🍣", "Japonaise", "main", 30,
  { salmon: 125, avocado: 0.5, sushi_rice: 100, rice_vinegar: 15, soy_sauce: 10 },
  [
    "Rincer le riz jusqu’à ce que l’eau soit claire, cuire avec 1,2 fois son volume d’eau, 12 minutes à couvert puis 10 minutes de repos.",
    "Assaisonner le riz encore chaud avec le vinaigre de riz (plus une pincée de sucre et de sel), laisser tiédir.",
    "Couper le saumon en dés ou tranches fines et l’avocat en lamelles.",
    "Dresser sur le riz, servir avec la sauce soja.",
    "Saumon cru : prendre un saumon qualité sashimi, ou le congeler 24 h à –20 °C avant usage. Le garder au froid jusqu’au dernier moment.",
  ], { fixed: "chirashi" });

// ─── Fournées de la semaine : pizzas & petit-déjeuner ─────────────────────
r("pizzas", "3 pizzas maison à congeler", "🍕", "Italienne", "batch", 120,
  { flour: 750, yeast: 7, oil: 30, sugar: 5, passata: 500, mozzarella: 375, ham: 200, mushroom: 200 },
  [
    "Pâte au robot batteur (crochet) : farine, levure, sucre, 2 c. à c. de sel, 450 ml d’eau tiède et l’huile. Pétrir 8 minutes, laisser lever 1 h 30 couvert.",
    "Diviser en 3, étaler finement. Garnir de passata salée, jambon, champignons émincés, mozzarella.",
    "Précuire 8 à 10 minutes à 250 °C, jusqu’à ce que la pâte soit juste dorée. Laisser refroidir complètement.",
    "Filmer chaque pizza et congeler (3 mois). Un soir de flemme : 12–15 minutes à 220 °C directement depuis le congélateur.",
  ], { freezer: true, portions: 3, unit: "pizzas" });
r("brioche", "Brioche moelleuse", "🍞", "Française", "batch", 180,
  { flour: 500, milk: 150, egg: 3, butter: 120, sugar: 60, yeast: 7 },
  [
    "Au robot batteur (crochet) : farine, sucre, levure, 1 c. à c. de sel, lait tiède et œufs. Pétrir 10 minutes.",
    "Incorporer le beurre mou en morceaux, pétrir encore 10 minutes jusqu’à une pâte lisse et souple.",
    "Laisser lever 1 h 30, façonner 3 boules dans un moule à cake, laisser lever encore 1 h.",
    "Dorer au jaune d’œuf ou au lait, cuire 30 minutes à 180 °C. Se congèle en tranches.",
  ], { veg: true, portions: 10, unit: "tranches", meal: "breakfast" });
r("gateau_yaourt", "Gâteau au yaourt tout simple", "🍰", "Française", "batch", 50,
  { yogurt: 125, sugar: 150, flour: 250, egg: 3, oil_sun: 100, baking_powder: 10 },
  [
    "Mélanger yaourt, sucre et œufs. Ajouter farine et levure chimique, puis l’huile.",
    "Verser dans un moule beurré, cuire 35 minutes à 180 °C : la lame doit ressortir sèche.",
    "Se garde 4 jours sous cloche, se congèle en parts.",
  ], { veg: true, portions: 8, unit: "parts", meal: "breakfast" });
// Matin sans cinnamon rolls (il n'en reste plus) : juste le café protéiné, compté dans les courses à part.
r("matin_cafe", "Café protéiné Lidl (plus de cinnamon rolls)", "☕", "Basiques", "breakfast", 1,
  {},
  ["Un café protéiné Lidl bien frais. Il est déjà sur la liste de courses : un par matin."]);
r("cinnamon_rolls", "Cinnamon rolls", "🌀", "Américaine", "batch", 180,
  { flour: 450, milk: 200, egg: 1, butter: 120, sugar: 130, yeast: 7, cinnamon: 10, cream_cheese: 100 },
  [
    "Pâte au robot batteur (crochet) : farine, 50 g de sucre, levure, pincée de sel, lait tiède, œuf, 60 g de beurre fondu. Pétrir 8 minutes, laisser lever 1 h.",
    "Étaler en rectangle, tartiner de 50 g de beurre mou mélangé à 60 g de sucre et la cannelle.",
    "Rouler serré, couper 12 tranches, laisser lever 45 minutes dans un plat.",
    "Cuire 22 minutes à 180 °C. Glaçage : fromage à tartiner + 20 g de sucre + 10 g de beurre. Se congèlent sans glaçage.",
  ], { veg: true, freezer: true, portions: 12, unit: "rolls", meal: "breakfast" });

// ─── Batch cooking pour le congélateur ────────────────────────────────────
r("gyoza", "Gyoza porc & chou (≈40 pièces)", "🥟", "Japonaise", "batch", 90,
  { flour: 300, pork_mince: 400, cabbage: 300, garlic: 15, ginger: 15, spring_onion: 1, soy_sauce: 30, sesame_oil: 10, oil_sun: 20 },
  [
    "Pâte : farine + 180 ml d’eau bouillante + pincée de sel. Pétrir, couvrir 30 minutes.",
    "Farce : chou haché fin, salé 10 minutes puis pressé. Mélanger avec porc, ail, gingembre râpés, oignon vert, soja, huile de sésame.",
    "Étaler la pâte très finement, découper des disques de 8 cm, garnir d’une cuillère de farce, plisser.",
    "Congeler à plat sur un plateau fariné 2 h, puis en sachet (3 mois).",
    "Cuisson depuis congelé : dorer le fond à la poêle huilée, ajouter 80 ml d’eau, couvrir 8 minutes jusqu’à cuisson complète de la farce.",
  ], { freezer: true, portions: 4 });
r("nems", "Nems porc & vermicelles (≈20 pièces)", "🌯", "Vietnamienne", "batch", 75,
  { rice_paper: 100, pork_mince: 400, rice_noodles: 50, carrot: 150, onion: 80, egg: 1, fish_sauce: 20, garlic: 10, oil_sun: 30 },
  [
    "Réhydrater les vermicelles 10 minutes, couper court. Râper la carotte, hacher oignon et ail.",
    "Mélanger avec le porc, l’œuf et la sauce poisson.",
    "Tremper une galette 2 secondes dans l’eau tiède, garnir, rouler serré en rabattant les côtés.",
    "Badigeonner d’huile, cuire 14 minutes à l’air fryer à 200 °C en retournant à mi-cuisson (farce cuite à cœur). Refroidir puis congeler.",
    "Depuis congelé : 10–12 minutes à l’air fryer à 190 °C. Servir avec salade et menthe si vous en avez.",
  ], { freezer: true, portions: 4 });
r("croque_mcdo", "Croque McDo maison (8 croques)", "🥪", "Française", "batch", 25,
  { sandwich_bread: 400, ham: 200, cheese_slices: 160, butter: 30 },
  [
    "Aplatir légèrement les tranches de pain au rouleau pour retrouver la finesse du croque.",
    "Garnir de cheddar, jambon, cheddar. Refermer, beurrer légèrement l’extérieur.",
    "Envelopper chaque croque dans du film, congeler à plat.",
    "Cuisson depuis congelé : 4 minutes par face à la poêle à feu moyen, ou 12 minutes au four à 200 °C.",
  ], { freezer: true, portions: 8, unit: "croques" });
r("ratatouille", "Ratatouille", "🍆", "Française", "batch", 75,
  { zucchini: 600, eggplant: 500, pepper: 400, fresh_tomato: 600, onion: 200, garlic: 15, oil: 50, provence_herbs: 3 },
  [
    "Couper tous les légumes en dés de 2 cm.",
    "Faire revenir séparément aubergines, courgettes et poivrons dans l’huile, 8 minutes chacun.",
    "Faire fondre l’oignon et l’ail, ajouter les tomates, puis tous les légumes et les herbes.",
    "Mijoter 40 minutes à couvert. Refroidir, portionner, congeler (3 mois).",
  ], { veg: true, freezer: true, portions: 6 });
r("french_tacos", "French tacos poulet sauce fromagère", "🌮", "Tex-Mex", "batch", 45,
  { tortilla: 4, chicken: 500, frozen_fries: 400, cream: 200, cheese_slices: 100, grated_cheese: 100, taco_spice: 15, onion: 100, oil_sun: 20 },
  [
    "Cuire les frites à l’air fryer. Faire sauter le poulet en lamelles avec l’oignon et les épices jusqu’à 74 °C à cœur.",
    "Sauce fromagère : chauffer la crème, fondre le cheddar dedans.",
    "Garnir chaque tortilla : sauce, poulet, frites, emmental. Plier en carré.",
    "Dorer 2 minutes par face à la poêle, refroidir, filmer, congeler.",
    "Réchauffer 20 minutes au four à 190 °C depuis congelé, puis 1 minute à la poêle pour le croustillant.",
  ], { freezer: true, portions: 4, unit: "tacos" });
r("pelmeni", "Pelmeni (raviolis russes, ≈60 pièces)", "🥟", "Russe", "batch", 90,
  { flour: 400, egg: 1, pork_mince: 500, onion: 150, sour_cream: 150 },
  [
    "Pâte : farine, œuf, 180 ml d’eau, sel. Pétrir, laisser reposer 30 minutes.",
    "Farce : viande + oignon râpé + 50 ml d’eau froide, sel, poivre.",
    "Étaler finement, découper des ronds de 6 cm, garnir, plier en demi-lune puis joindre les deux pointes.",
    "Congeler à plat puis en sachet. Cuire 8 minutes dans l’eau bouillante salée depuis congelé, servir avec la smântână.",
  ], { freezer: true, portions: 5 });
r("bolognaise", "Pâtes bolognaise (sauce à congeler)", "🍝", "Italienne", "batch", 120,
  { beef_mince: 500, passata: 500, tomato: 400, onion: 150, carrot: 150, garlic: 10, oil: 20, red_wine: 150 },
  [
    "Faire revenir oignon, carotte et ail hachés finement dans l’huile, 10 minutes.",
    "Ajouter la viande, faire dorer. Déglacer au vin rouge.",
    "Ajouter passata et tomates, mijoter 1 h 30 à feu très doux.",
    "Portionner et congeler. À servir avec des pâtes (non comptées dans la fournée).",
  ], { freezer: true, portions: 6 });
r("chili", "Chili con carne", "🌶️", "Tex-Mex", "batch", 75,
  { beef_mince: 500, beans: 480, tomato: 800, onion: 150, pepper: 200, taco_spice: 15, corn: 285, oil_sun: 20 },
  [
    "Faire revenir oignon et poivron dans l’huile, ajouter la viande et les épices.",
    "Ajouter tomates, haricots et maïs égouttés. Mijoter 45 minutes.",
    "Portionner et congeler. Servir avec du riz ou des tortillas.",
  ], { freezer: true, portions: 6 });
r("butter_chicken", "Butter chicken", "🍛", "Indienne", "batch", 60,
  { chicken_thigh: 600, yogurt: 100, curry_powder: 10, passata: 400, cream: 200, butter: 30, onion: 150, garlic: 15, ginger: 15 },
  [
    "Mariner le poulet en morceaux dans le yaourt et la moitié des épices, 30 minutes minimum.",
    "Le dorer à la poêle. Dans une cocotte, fondre beurre, oignon, ail, gingembre, reste d’épices.",
    "Ajouter la passata, mijoter 15 minutes, puis la crème et le poulet. Cuire jusqu’à 74 °C à cœur.",
    "Refroidir et congeler en portions. Servir avec du riz basmati.",
  ], { freezer: true, portions: 5 });
r("borscht", "Bortsch", "🥣", "Russe", "batch", 90,
  { beetroot: 500, cabbage: 400, potato: 300, carrot: 150, onion: 150, tomato_paste: 40, beef_stew: 300, garlic: 10, sour_cream: 150, herbs: 1 },
  [
    "Cuire le bœuf en dés dans 2,5 L d’eau salée 45 minutes en écumant.",
    "Faire revenir oignon, carotte et betterave râpées avec le concentré de tomate.",
    "Ajouter au bouillon avec pommes de terre et chou émincé, cuire 25 minutes. Finir avec l’ail.",
    "Servir avec smântână et aneth. Se congèle sans la crème.",
  ], { freezer: true, portions: 6 });
r("bourguignon", "Bœuf bourguignon", "🍷", "Française", "batch", 210,
  { beef_stew: 800, red_wine: 500, bacon: 150, mushroom: 250, carrot: 300, onion: 200, garlic: 10, flour: 20, oil_sun: 20, tomato_paste: 20 },
  [
    "Dorer le bœuf en gros cubes dans l’huile par petites quantités. Réserver.",
    "Faire revenir lardons, oignon, carottes. Saupoudrer de farine, ajouter le concentré.",
    "Remettre la viande, mouiller avec le vin et de l’eau à hauteur. Mijoter 2 h 30 à feu doux.",
    "Ajouter les champignons poêlés 20 minutes avant la fin. Meilleur réchauffé, se congèle.",
  ], { freezer: true, portions: 5 });
r("hachis", "Hachis parmentier", "🥔", "Française", "batch", 70,
  { beef_mince: 500, potato: 1200, milk: 200, butter: 40, onion: 150, carrot: 150, grated_cheese: 80, tomato_paste: 30 },
  [
    "Cuire les pommes de terre à l’eau, écraser avec lait chaud et beurre.",
    "Faire revenir oignon et carotte hachés, ajouter la viande et le concentré, cuire 10 minutes.",
    "Monter en plat : viande, purée, fromage. Gratiner 20 minutes à 200 °C.",
    "Ou monter en barquettes individuelles et congeler crues (réchauffer 40 minutes à 180 °C).",
  ], { freezer: true, portions: 5 });

// ─── Japon ────────────────────────────────────────────────────────────────
r("oyakodon", "Oyakodon (poulet & œuf sur riz)", "🍳", "Japonaise", "main", 25,
  { chicken_thigh: 150, egg: 2, onion: 60, rice: 90, soy_sauce: 20, sugar: 5, spring_onion: 0.25 },
  ["Cuire le riz.", "Mijoter l’oignon émincé 3 minutes dans 80 ml d’eau + soja + sucre. Ajouter le poulet en dés, cuire jusqu’à 74 °C.", "Verser les œufs battus, couvrir 1 à 2 minutes jusqu’à ce qu’ils soient pris. Servir sur le riz avec l’oignon vert."]);
r("katsu_curry", "Katsu curry", "🍛", "Japonaise", "main", 45,
  { chicken: 170, panko: 30, egg: 0.5, flour: 15, rice: 90, carrot: 70, potato: 120, onion: 60, curry_powder: 5, oil_sun: 10, honey: 5, stock_cube: 0.5 },
  ["Sauce : faire revenir oignon, carotte, pomme de terre, ajouter curry et 1 c. à s. de farine, mouiller de 300 ml de bouillon, mijoter 20 minutes, ajouter le miel.", "Paner le poulet aplati (farine, œuf, panko), vaporiser d’huile, 15 minutes à l’air fryer à 200 °C (74 °C à cœur).", "Trancher, servir sur le riz nappé de sauce."]);
r("teriyaki_bowl", "Bol poulet teriyaki & brocoli", "🍚", "Japonaise", "main", 25,
  { chicken_thigh: 160, rice: 90, broccoli: 150, soy_sauce: 25, honey: 10, garlic: 5, ginger: 5, sesame_seeds: 3, oil_sun: 8 },
  ["Cuire riz et brocoli.", "Dorer le poulet en morceaux, ajouter soja, miel, ail et gingembre râpés, laquer 3 minutes jusqu’à cuisson complète (74 °C).", "Dresser, parsemer de sésame."]);
r("yakisoba", "Yakisoba poulet & chou", "🍜", "Japonaise", "main", 20,
  { noodles: 110, chicken_thigh: 110, cabbage: 150, carrot: 60, onion: 50, soy_sauce: 15, oyster_sauce: 15, oil_sun: 10 },
  ["Cuire les nouilles, rincer.", "Sauter le poulet en lamelles jusqu’à 74 °C, puis les légumes émincés 4 minutes.", "Ajouter nouilles, soja et sauce huître, sauter 2 minutes."]);
r("okonomiyaki", "Okonomiyaki chou & lardons", "🥞", "Japonaise", "main", 25,
  { flour: 70, egg: 1.5, cabbage: 200, bacon: 50, spring_onion: 0.25, mayonnaise: 15, oyster_sauce: 10, oil_sun: 8 },
  ["Mélanger farine, œufs, 60 ml d’eau, chou haché fin et oignon vert.", "Cuire en galette épaisse, lardons dessus, 5 minutes par face à feu moyen.", "Napper de sauce huître et mayonnaise."]);
r("karaage", "Karaage (poulet frit japonais)", "🍗", "Japonaise", "main", 40,
  { chicken_thigh: 180, soy_sauce: 15, ginger: 5, garlic: 5, cornstarch: 25, oil_sun: 8, rice: 90, cucumber: 100 },
  ["Mariner le poulet en morceaux avec soja, ail et gingembre 20 minutes.", "Enrober de fécule, vaporiser d’huile, 14 minutes à l’air fryer à 200 °C en secouant à mi-cuisson (74 °C à cœur).", "Servir avec riz et concombre."]);
r("gyudon", "Gyudon (bœuf & oignon sur riz)", "🥩", "Japonaise", "main", 20,
  { beef_stew: 140, onion: 80, rice: 90, soy_sauce: 20, sugar: 6, ginger: 5 },
  ["Cuire le riz. Trancher le bœuf très finement (plus facile légèrement congelé).", "Mijoter l’oignon 5 minutes dans 100 ml d’eau + soja + sucre + gingembre.", "Ajouter le bœuf, cuire 2–3 minutes. Servir sur le riz."]);

// ─── Corée ────────────────────────────────────────────────────────────────
r("bibimbap", "Bibimbap", "🍲", "Coréenne", "main", 35,
  { rice: 90, beef_mince: 100, spinach: 100, carrot: 70, zucchini: 80, egg: 1, gochujang: 15, sesame_oil: 5, soy_sauce: 10, garlic: 5 },
  ["Cuire le riz. Sauter chaque légume séparément quelques minutes.", "Cuire le bœuf avec ail et soja jusqu’à cuisson complète.", "Dresser riz, légumes, bœuf, œuf au plat bien cuit. Mélanger avec gochujang et huile de sésame."]);
r("kimchi_rice", "Riz sauté au kimchi", "🍳", "Coréenne", "main", 15,
  { rice: 100, kimchi: 100, bacon: 50, egg: 1, gochujang: 10, spring_onion: 0.25, oil_sun: 8 },
  ["Utiliser du riz cuit froid de la veille.", "Dorer les lardons, ajouter kimchi haché et gochujang, puis le riz. Sauter 5 minutes.", "Servir avec un œuf au plat et l’oignon vert."]);
r("dakgangjeong", "Dakgangjeong (poulet croustillant sucré-épicé)", "🍗", "Coréenne", "main", 40,
  { chicken_thigh: 180, cornstarch: 30, gochujang: 20, honey: 15, soy_sauce: 10, garlic: 5, oil_sun: 8, rice: 90, sesame_seeds: 3 },
  ["Enrober le poulet de fécule, vaporiser d’huile, 14 minutes à l’air fryer à 200 °C (74 °C à cœur).", "Réduire gochujang, miel, soja, ail et 2 c. à s. d’eau 1 minute.", "Enrober le poulet de sauce, parsemer de sésame, servir avec le riz."]);
r("japchae", "Japchae (vermicelles sautés)", "🍝", "Coréenne", "main", 30,
  { rice_noodles: 80, beef_stew: 80, spinach: 80, carrot: 60, onion: 50, mushroom: 60, soy_sauce: 20, sesame_oil: 8, sugar: 5, garlic: 5 },
  ["Cuire les vermicelles, rincer.", "Sauter le bœuf en lanières, puis chaque légume.", "Tout mélanger avec soja, sucre, ail et huile de sésame."]);

// ─── Chine ────────────────────────────────────────────────────────────────
r("kung_pao", "Poulet kung pao", "🥜", "Chinoise", "main", 25,
  { chicken: 170, peanuts: 25, pepper: 100, spring_onion: 0.25, chili: 5, soy_sauce: 20, rice_vinegar: 10, sugar: 6, cornstarch: 8, garlic: 5, ginger: 5, rice: 90, oil_sun: 10 },
  ["Mariner le poulet en dés avec 1 c. à s. de soja et la fécule.", "Sauter le piment, puis le poulet jusqu’à 74 °C, ajouter poivron, ail, gingembre.", "Ajouter le reste de soja, vinaigre, sucre et 2 c. à s. d’eau, puis les cacahuètes. Servir avec le riz."]);
r("mapo_tofu", "Mapo tofu", "🌶️", "Chinoise", "main", 20,
  { tofu: 200, pork_mince: 70, chili: 5, garlic: 5, ginger: 5, soy_sauce: 15, gochujang: 10, cornstarch: 5, spring_onion: 0.25, rice: 90, oil_sun: 10 },
  ["Dorer le porc jusqu’à cuisson complète avec ail, gingembre, piment et la pâte pimentée.", "Ajouter 150 ml d’eau, soja et le tofu en cubes, mijoter 5 minutes.", "Lier avec la fécule délayée, servir avec le riz et l’oignon vert."]);
r("riz_cantonais", "Riz cantonais", "🍚", "Chinoise", "main", 15,
  { rice: 100, ham: 50, egg: 1.5, frozen_peas: 60, spring_onion: 0.25, soy_sauce: 10, oil_sun: 10 },
  ["Utiliser du riz cuit froid.", "Cuire les œufs brouillés, réserver. Sauter petits pois et jambon en dés.", "Ajouter le riz, le soja, les œufs et l’oignon vert, sauter 3 minutes."]);
r("chow_mein", "Chow mein poulet & légumes", "🍜", "Chinoise", "main", 20,
  { noodles: 110, chicken: 120, wok_veg: 200, soy_sauce: 15, oyster_sauce: 15, garlic: 5, oil_sun: 10 },
  ["Cuire les nouilles, rincer.", "Sauter le poulet en lamelles jusqu’à 74 °C, puis les légumes.", "Ajouter nouilles, ail, soja et sauce huître, sauter à feu vif 2 minutes."]);
r("porc_aigre_doux", "Poulet aigre-doux à l’air fryer", "🍍", "Chinoise", "main", 35,
  { chicken: 160, pepper: 100, onion: 60, tomato_paste: 15, rice_vinegar: 20, sugar: 15, soy_sauce: 10, cornstarch: 20, egg: 0.5, rice: 90, oil_sun: 10 },
  ["Enrober le poulet en dés d’œuf puis de fécule, vaporiser d’huile, 12 minutes à l’air fryer à 200 °C (74 °C à cœur).", "Sauce : concentré, vinaigre, sucre, soja, 80 ml d’eau, lier avec un peu de fécule.", "Sauter poivron et oignon, ajouter la sauce et le poulet. Riz au rice cooker."]);
r("boeuf_brocoli", "Bœuf brocoli", "🥦", "Chinoise", "main", 20,
  { beef_stew: 150, broccoli: 200, oyster_sauce: 20, soy_sauce: 10, garlic: 5, ginger: 5, cornstarch: 5, rice: 90, oil_sun: 10 },
  ["Trancher finement le bœuf, mariner avec soja et fécule.", "Saisir le bœuf à feu vif 2 minutes, réserver. Sauter le brocoli avec ail et gingembre.", "Remettre le bœuf, ajouter la sauce huître. Servir avec le riz."]);
r("dan_dan", "Nouilles dan dan", "🍜", "Chinoise", "main", 20,
  { noodles: 110, pork_mince: 100, peanut: 20, soy_sauce: 15, chili: 5, rice_vinegar: 5, garlic: 5, spinach: 80, sesame_oil: 5 },
  ["Dorer le porc jusqu’à cuisson complète avec un peu de soja.", "Sauce dans le bol : beurre de cacahuète, soja, vinaigre, ail, piment, huile de sésame, 3 c. à s. d’eau de cuisson.", "Cuire nouilles et épinards, les mettre sur la sauce, ajouter le porc, mélanger."]);

// ─── Vietnam ──────────────────────────────────────────────────────────────
r("bo_bun", "Bo bun bœuf citronné", "🥗", "Vietnamienne", "main", 30,
  { rice_noodles: 80, beef_stew: 130, lettuce: 0.25, carrot: 60, cucumber: 80, peanuts: 15, fish_sauce: 20, sugar: 10, lemon: 20, garlic: 5, herbs: 0.25, onion: 40, oil_sun: 8 },
  ["Sauce : sauce poisson, sucre, jus de citron, ail, 4 c. à s. d’eau.", "Cuire les vermicelles, rincer à l’eau froide. Saisir le bœuf émincé avec l’oignon.", "Dresser salade, carotte et concombre en julienne, vermicelles, bœuf, cacahuètes, herbes. Arroser de sauce. Parfait avec des nems du congélateur."]);
r("pho", "Phở au bœuf", "🍲", "Vietnamienne", "main", 45,
  { rice_noodles: 90, beef_stew: 120, onion: 80, ginger: 15, stock_cube: 1, fish_sauce: 15, herbs: 0.25, lemon: 20, chili: 3, cinnamon: 1 },
  ["Griller oignon et gingembre coupés en deux à sec, les plonger dans 600 ml d’eau par personne avec le cube et la cannelle, frémir 30 minutes.", "Assaisonner à la sauce poisson. Cuire les nouilles.", "Mettre nouilles et bœuf tranché très fin dans le bol, verser le bouillon bouillant. Herbes, citron, piment."]);
r("banh_mi", "Bánh mì poulet", "🥖", "Vietnamienne", "main", 30,
  { baguette: 0.5, chicken_thigh: 130, carrot: 60, cucumber: 60, rice_vinegar: 15, sugar: 5, mayonnaise: 15, soy_sauce: 10, herbs: 0.25, chili: 3 },
  ["Pickles rapides : carotte en julienne + vinaigre + sucre, 15 minutes.", "Mariner le poulet au soja, griller jusqu’à 74 °C, émincer.", "Garnir la baguette de mayonnaise, poulet, pickles, concombre, herbes et piment."]);

// ─── Thaïlande ────────────────────────────────────────────────────────────
r("pad_thai", "Pad thaï poulet", "🍜", "Thaïlandaise", "main", 25,
  { rice_noodles: 90, chicken: 120, egg: 1, peanuts: 15, fish_sauce: 15, sugar: 10, lemon: 20, spring_onion: 0.25, cabbage: 80, garlic: 5, oil_sun: 10 },
  ["Tremper les nouilles 20 minutes dans l’eau tiède.", "Sauter ail et poulet jusqu’à 74 °C, pousser sur le côté, brouiller l’œuf.", "Ajouter nouilles, sauce poisson, sucre, jus de citron et 3 c. à s. d’eau, puis chou et oignon vert. Cacahuètes concassées au service."]);
r("green_curry", "Curry vert poulet & coco", "🥥", "Thaïlandaise", "main", 25,
  { chicken_thigh: 150, coconut_milk: 200, curry_paste: 25, zucchini: 100, pepper: 80, fish_sauce: 10, sugar: 5, rice: 90, herbs: 0.25 },
  ["Faire revenir la pâte de curry 1 minute avec un peu de lait de coco.", "Ajouter le poulet, le reste du lait de coco, les légumes. Mijoter 12 minutes jusqu’à 74 °C.", "Assaisonner sauce poisson et sucre, servir avec le riz et les herbes."]);
r("kra_pao", "Pad kra pao (porc basilic)", "🌿", "Thaïlandaise", "main", 15,
  { pork_mince: 150, garlic: 8, chili: 5, oyster_sauce: 15, soy_sauce: 10, fish_sauce: 5, sugar: 4, egg: 1, rice: 90, herbs: 0.25, oil_sun: 15 },
  ["Piler ail et piment. Les sauter 30 secondes.", "Ajouter le porc, cuire à feu vif jusqu’à cuisson complète, puis sauces et sucre.", "Hors du feu, ajouter les herbes. Servir sur le riz avec un œuf au plat bien cuit."]);
r("tom_kha", "Tom kha kai (soupe coco-poulet)", "🍵", "Thaïlandaise", "main", 25,
  { chicken: 130, coconut_milk: 200, mushroom: 80, ginger: 15, lemon: 25, fish_sauce: 15, chili: 3, stock_cube: 0.5, rice: 70 },
  ["Chauffer lait de coco, 250 ml d’eau, cube et gingembre en lamelles 5 minutes.", "Ajouter poulet émincé et champignons, frémir 10 minutes jusqu’à 74 °C.", "Hors du feu : sauce poisson, citron, piment. Servir avec le riz."]);

// ─── Inde ─────────────────────────────────────────────────────────────────
r("keema", "Keema matar (bœuf haché & petits pois)", "🍛", "Indienne", "main", 30,
  { beef_mince: 130, frozen_peas: 80, onion: 70, tomato: 150, garlic: 5, ginger: 5, curry_powder: 6, rice: 90, yogurt: 50, oil_sun: 10 },
  ["Faire revenir oignon, ail, gingembre et épices.", "Ajouter la viande, cuire jusqu’à cuisson complète, puis tomates et petits pois, mijoter 15 minutes.", "Servir avec le riz et une cuillère de yaourt."]);

// ─── Russie & Europe de l'Est ─────────────────────────────────────────────
r("stroganoff", "Bœuf Stroganoff & sarrasin", "🍄", "Russe", "main", 30,
  { beef_stew: 150, mushroom: 100, onion: 70, sour_cream: 70, mustard: 5, butter: 10, buckwheat: 80, paprika: 1 },
  ["Cuire le sarrasin 15 minutes dans 2 fois son volume d’eau salée.", "Saisir le bœuf en lanières dans le beurre, réserver. Faire revenir oignon et champignons.", "Remettre le bœuf, ajouter smântână, moutarde et paprika, chauffer sans bouillir."]);
r("plov", "Plov (riz pilaf au poulet & carottes)", "🍚", "Russe", "main", 60,
  { rice: 90, chicken_thigh: 140, carrot: 120, onion: 80, garlic: 10, oil_sun: 20, curry_powder: 2 },
  ["Dorer la viande en dés dans l’huile, ajouter oignon puis carottes en bâtonnets, 10 minutes.", "Ajouter épices, riz rincé, une tête d’ail entière et de l’eau à 1 cm au-dessus.", "Cuire à couvert à feu très doux 25 minutes sans remuer."]);
r("grechka", "Sarrasin aux champignons & œuf", "🍳", "Russe", "main", 25,
  { buckwheat: 90, mushroom: 150, onion: 70, butter: 10, egg: 1, herbs: 0.25 },
  ["Cuire le sarrasin.", "Faire revenir oignon et champignons dans le beurre.", "Mélanger, servir avec un œuf au plat et de l’aneth."], { veg: true });
r("kotleti", "Kotleti & purée", "🥔", "Russe", "main", 40,
  { pork_mince: 150, onion: 40, egg: 0.5, bread: 30, milk: 80, potato: 300, butter: 15, oil_sun: 10 },
  ["Tremper le pain dans 30 ml de lait. Mélanger avec viande, oignon râpé, œuf, sel.", "Former des galettes ovales, cuire 5 minutes par face puis 5 minutes couvert, jusqu’à cuisson complète.", "Purée : pommes de terre cuites écrasées avec le reste du lait chaud et le beurre."]);
r("olivier", "Salade Olivier", "🥗", "Russe", "main", 40,
  { potato: 200, carrot: 80, egg: 1.5, ham: 80, frozen_peas: 60, pickles: 60, mayonnaise: 40, herbs: 0.25 },
  ["Cuire pommes de terre et carottes entières à l’eau, œufs 10 minutes. Refroidir.", "Tout couper en petits dés, ajouter petits pois cuits et cornichons.", "Lier à la mayonnaise, garder au frais et consommer dans les 24 h."]);
r("syrniki", "Syrniki (galettes de fromage blanc)", "🥞", "Russe", "breakfast", 20,
  { cheese: 200, egg: 1, flour: 35, sugar: 15, sour_cream: 40, oil_sun: 8 },
  ["Mélanger brânză de vaci, œuf, farine et sucre.", "Former des galettes farinées, cuire 3–4 minutes par face à feu moyen.", "Servir avec la smântână."], { veg: true });
r("blinis", "Blinis à la smântână", "🥞", "Russe", "breakfast", 25,
  { flour: 70, milk: 150, egg: 1, sugar: 8, butter: 10, sour_cream: 30 },
  ["Fouetter farine, sucre, œuf et lait en pâte fluide, ajouter le beurre fondu.", "Cuire de fines crêpes dans une poêle chaude légèrement graissée.", "Servir avec smântână (ou confiture, miel)."], { veg: true });

// ─── Roumanie ─────────────────────────────────────────────────────────────

// ─── France ───────────────────────────────────────────────────────────────
r("quiche", "Quiche lorraine & salade", "🥧", "Française", "main", 55,
  { flour: 60, butter: 30, egg: 1.5, cream: 60, milk: 40, bacon: 60, grated_cheese: 30, lettuce: 0.25 },
  ["Pâte : farine, beurre froid, pincée de sel, 2 c. à s. d’eau. Étaler dans un moule, piquer.", "Garnir de lardons dorés et de fromage, verser œufs battus + crème + lait.", "Cuire 35 minutes à 180 °C jusqu’à ce que l’appareil soit pris. Servir avec la salade."]);
r("gratin_jambon", "Gratin de pommes de terre au jambon", "🧀", "Française", "main", 70,
  { potato: 300, cream: 100, milk: 80, garlic: 3, grated_cheese: 25, ham: 70, lettuce: 0.25 },
  ["Trancher finement les pommes de terre. Frotter le plat d’ail.", "Alterner pommes de terre et jambon, couvrir de crème + lait salés, fromage dessus.", "Cuire 1 h à 180 °C. Servir avec la salade."]);
r("basquaise", "Poulet basquaise & riz", "🫑", "Française", "main", 45,
  { chicken_thigh: 170, pepper: 150, fresh_tomato: 150, onion: 60, garlic: 5, oil: 10, paprika: 2, rice: 80 },
  ["Dorer le poulet, réserver. Faire fondre oignon et poivrons en lanières.", "Ajouter tomates, ail, paprika et le poulet. Mijoter 25 minutes jusqu’à 74 °C.", "Servir avec le riz."]);
r("soupe_oignon", "Soupe à l’oignon gratinée", "🧅", "Française", "main", 60,
  { onion: 250, butter: 15, flour: 10, stock_cube: 1, baguette: 0.25, grated_cheese: 40 },
  ["Fondre les oignons émincés au beurre 30 minutes à feu doux jusqu’à caramélisation.", "Saupoudrer de farine, mouiller avec 400 ml de bouillon par personne, cuire 15 minutes.", "Verser en bols, couvrir de pain grillé et de fromage, gratiner."]);
r("poulet_moutarde", "Poulet à la moutarde & pâtes", "🍝", "Française", "main", 25,
  { chicken: 170, mustard: 20, cream: 70, onion: 40, pasta: 90, oil_sun: 8 },
  ["Cuire les pâtes. Dorer le poulet en morceaux avec l’oignon jusqu’à 74 °C.", "Ajouter crème et moutarde, réduire 3 minutes.", "Mélanger aux pâtes."]);

// ─── Italie ───────────────────────────────────────────────────────────────
r("carbonara", "Pâtes carbonara", "🍝", "Italienne", "main", 20,
  { pasta: 110, bacon: 70, egg: 1.5, parmesan: 20 },
  ["Cuire les pâtes. Dorer les lardons.", "Mélanger œufs et parmesan.", "Hors du feu, mêler pâtes, lardons, œufs et un peu d’eau de cuisson en remuant vite jusqu’à une sauce crémeuse et chaude."]);
r("risotto", "Risotto aux champignons", "🍄", "Italienne", "main", 35,
  { rice: 90, mushroom: 150, onion: 50, butter: 15, parmesan: 20, stock_cube: 1 },
  ["Faire revenir oignon et riz dans la moitié du beurre 2 minutes.", "Ajouter le bouillon chaud louche par louche en remuant, 18 minutes.", "Ajouter champignons poêlés, reste du beurre et parmesan."]);

// ─── Tex-Mex & Méditerranée ───────────────────────────────────────────────
r("fajitas", "Fajitas poulet", "🌯", "Tex-Mex", "main", 25,
  { tortilla: 2, chicken: 150, pepper: 120, onion: 60, taco_spice: 6, sour_cream: 30, oil_sun: 10 },
  ["Sauter poulet en lanières et épices jusqu’à 74 °C.", "Ajouter poivrons et oignon, 5 minutes.", "Garnir les tortillas chaudes, ajouter la crème."]);
r("quesadillas", "Quesadillas haricots & maïs", "🧀", "Tex-Mex", "main", 15,
  { tortilla: 2, beans: 120, corn: 60, grated_cheese: 50, pepper: 60, taco_spice: 3, oil_sun: 5 },
  ["Écraser grossièrement les haricots avec les épices.", "Garnir une moitié de tortilla : haricots, maïs, poivron, fromage. Plier.", "Dorer 2–3 minutes par face."], { veg: true });
r("burrito_bowl", "Burrito bowl poulet", "🥑", "Tex-Mex", "main", 30,
  { rice: 90, beans: 120, corn: 60, chicken: 120, avocado: 0.5, fresh_tomato: 80, taco_spice: 5, lemon: 15, sour_cream: 30 },
  ["Cuire le riz, l’arroser de citron.", "Cuire le poulet épicé jusqu’à 74 °C, réchauffer haricots et maïs.", "Dresser avec tomate, avocat et crème."]);
r("shakshuka", "Shakshuka & telemea", "🍳", "Méditerranéenne", "main", 25,
  { tomato: 250, pepper: 100, onion: 60, egg: 2, garlic: 5, paprika: 2, oil: 10, bread: 80, telemea: 40 },
  ["Faire fondre oignon et poivron, ajouter ail, paprika, tomates, mijoter 10 minutes.", "Creuser des puits, casser les œufs, couvrir jusqu’à ce que blancs et jaunes soient pris.", "Émietter la telemea, servir avec le pain."], { veg: true });
r("shawarma_bowl", "Bowl poulet façon shawarma", "🥙", "Méditerranéenne", "main", 35,
  { chicken_thigh: 160, yogurt: 60, garlic: 5, lemon: 15, curry_powder: 3, paprika: 2, rice: 80, cucumber: 80, fresh_tomato: 80, oil: 10 },
  ["Mariner le poulet avec épices, citron, huile et la moitié du yaourt.", "Griller jusqu’à 74 °C, trancher.", "Servir sur le riz avec concombre, tomate et sauce yaourt-ail."]);
r("houmous_bowl", "Bowl houmous, œuf & crudités", "🫓", "Méditerranéenne", "main", 15,
  { chickpea: 240, lemon: 20, garlic: 4, oil: 15, sesame_seeds: 10, cucumber: 80, fresh_tomato: 80, bread: 80, egg: 1 },
  ["Mixer pois chiches, citron, ail, huile, sésame et un peu d’eau.", "Cuire l’œuf 9 minutes.", "Servir le houmous avec crudités, œuf et pain."], { veg: true });

// ─── Basiques (recettes d'origine de l'app) ───────────────────────────────
r("porridge", "Porridge banane & cacahuète", "🥣", "Basiques", "breakfast", 8, { oats: 70, milk: 200, banana: 120, peanut: 15 }, ["Chauffer les flocons avec le lait 5 minutes en remuant.", "Ajouter la banane en rondelles et le beurre de cacahuète."], { veg: true });
r("yaourt_pomme", "Bol yaourt, avoine & pomme", "🍎", "Basiques", "breakfast", 5, { yogurt: 250, oats: 60, apple: 150, nuts: 15 }, ["Couper la pomme en dés.", "Mélanger au yaourt puis ajouter avoine et noix."], { veg: true });
r("oeufs_brouilles", "Tartines aux œufs brouillés", "🍳", "Basiques", "breakfast", 10, { egg: 3, bread: 100, tomato: 100, oil: 5 }, ["Faire griller le pain.", "Brouiller les œufs à feu doux dans l’huile, jusqu’à cuisson complète. Servir avec les tomates."], { veg: true });
r("overnight_oats", "Overnight oats au yaourt", "🥣", "Basiques", "breakfast", 5, { oats: 65, yogurt: 200, milk: 100, banana: 100 }, ["Mélanger avoine, lait et yaourt. Réfrigérer une nuit dans un récipient fermé.", "Ajouter la banane avant de servir."], { veg: true });
r("tartines_noix", "Tartines fromage frais & noix", "🍞", "Basiques", "breakfast", 5, { bread: 100, cheese: 180, nuts: 15, apple: 150 }, ["Griller le pain et le garnir de fromage frais.", "Ajouter les noix. Servir la pomme à côté."], { veg: true });
r("pancakes", "Pancakes avoine & banane", "🥞", "Basiques", "breakfast", 15, { oats: 70, egg: 2, banana: 100, milk: 70, oil: 4 }, ["Mixer les ingrédients sauf l’huile.", "Cuire de petites crêpes dans une poêle huilée, environ 2 minutes par face, jusqu’à ce que le centre soit cuit."], { veg: true });
r("poulet_riz_brocoli", "Poulet doré, riz & brocoli", "🥦", "Basiques", "main", 25, { chicken: 180, rice: 90, broccoli: 200, oil: 10 }, ["Cuire le riz.", "Cuire le brocoli à la vapeur.", "Dorer le poulet en morceaux dans l’huile jusqu’à cuisson complète à cœur (74 °C). Assaisonner à votre goût."]);
r("pates_thon", "Pâtes au thon & tomate", "🍝", "Basiques", "main", 20, { pasta: 100, tuna: 140, tomato: 200, onion: 50, oil: 8 }, ["Cuire les pâtes selon le paquet.", "Faire revenir l’oignon dans l’huile, ajouter les tomates et mijoter 8 minutes.", "Ajouter le thon égoutté et les pâtes, réchauffer."]);
r("dahl", "Dahl de lentilles & riz", "🍛", "Indienne", "main", 30, { lentil: 100, rice: 70, tomato: 150, onion: 70, spinach: 100, oil: 8 }, ["Rincer les lentilles. Faire revenir l’oignon dans l’huile.", "Ajouter lentilles, tomates et de l’eau à hauteur. Mijoter 20–25 minutes, ajouter de l’eau si besoin et les épinards en fin de cuisson.", "Cuire le riz séparément et servir."], { veg: true });
r("chili_veg", "Chili végétarien", "🫘", "Tex-Mex", "main", 25, { beans: 240, rice: 80, tomato: 200, pepper: 100, onion: 70, oil: 8 }, ["Cuire le riz. Faire revenir oignon et poivron dans l’huile.", "Ajouter tomates et haricots égouttés, assaisonner et mijoter 15 minutes."], { veg: true });
r("wok_tofu", "Wok tofu & légumes", "🥢", "Chinoise", "main", 20, { tofu: 200, rice: 90, broccoli: 150, carrot: 100, oil: 10 }, ["Cuire le riz. Couper le tofu et les légumes.", "Faire dorer le tofu dans l’huile, ajouter les légumes et un fond d’eau. Cuire 10–12 minutes et servir."], { veg: true });
r("curry_pois_chiches", "Curry de pois chiches", "🍛", "Indienne", "main", 25, { chickpea: 240, rice: 70, spinach: 150, tomato: 150, onion: 50, oil: 10 }, ["Faire revenir l’oignon, ajouter les épices de votre choix si vous en avez.", "Ajouter tomates, pois chiches égouttés et épinards. Mijoter 15 minutes. Servir avec le riz cuit."], { veg: true });
r("omelette", "Omelette épinards & pommes de terre", "🍳", "Basiques", "main", 25, { egg: 3, potato: 250, spinach: 150, cheese: 100, oil: 8 }, ["Précuire les pommes de terre coupées dans l’eau.", "Les faire dorer avec les épinards dans l’huile.", "Verser les œufs battus, ajouter le fromage frais et cuire jusqu’à ce que les œufs soient pris."], { veg: true });
r("riz_saute_oeufs", "Riz sauté aux œufs", "🍚", "Basiques", "main", 20, { rice: 100, egg: 3, carrot: 100, broccoli: 150, oil: 10 }, ["Cuire le riz. Faire sauter les légumes en petits morceaux.", "Ajouter le riz et les œufs battus. Remuer jusqu’à cuisson complète des œufs."], { veg: true });
r("lentilles_bolo", "Pâtes lentilles façon bolognaise", "🍝", "Basiques", "main", 30, { pasta: 90, lentil: 80, tomato: 200, carrot: 100, onion: 50, oil: 8 }, ["Faire revenir oignon et carotte dans l’huile.", "Ajouter lentilles rincées, tomates et eau. Mijoter jusqu’à ce que les lentilles soient tendres.", "Servir avec les pâtes cuites."], { veg: true });
r("soupe_lentilles", "Soupe de lentilles & tartines", "🍲", "Basiques", "main", 30, { lentil: 100, carrot: 200, onion: 80, bread: 100, oil: 8 }, ["Tout mettre dans le soup maker avec 1 L d’eau, programme velouté (ou mijoter 25 minutes et mixer au plongeur).", "Servir avec le pain."], { veg: true });
