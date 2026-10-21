// Recettes en plus : simples & économiques, plats tendance des réseaux (versions maison),
// canard et bœuf (cuisinés seulement s'il y en a au placard / congélateur).
// Mêmes conventions que data/recipes.js (main/breakfast : par personne ; batch : total).

// ─── Simples & économiques ────────────────────────────────────────────────
r("couscous_legumes", "Couscous aux légumes & pois chiches", "🥘", "Maghrébine", "main", 20,
  { couscous: 80, chickpea: 120, carrot: 80, zucchini: 100, onion: 40, oil: 8, curry_powder: 2 },
  ["Faire revenir oignon, carotte et courgette en dés 8 minutes avec les épices.", "Ajouter les pois chiches et un fond d’eau, 5 minutes.", "Couscous : même volume d’eau bouillante salée, couvrir 5 minutes, égrainer à la fourchette avec l’huile."], { veg: true });
r("couscous_poulet", "Couscous express au poulet", "🍗", "Maghrébine", "main", 30,
  { couscous: 80, chicken_thigh: 130, zucchini: 100, carrot: 80, chickpea: 80, tomato: 100, stock_cube: 0.5 },
  ["Dorer le poulet en morceaux.", "Ajouter légumes, tomates, pois chiches et 300 ml de bouillon, mijoter 20 minutes (74 °C à cœur).", "Servir sur le couscous gonflé à l’eau bouillante."]);
r("semoule_lait", "Semoule au lait & cannelle", "🥣", "Française", "breakfast", 10,
  { semolina: 50, milk: 250, sugar: 15, cinnamon: 1 },
  ["Chauffer le lait avec le sucre.", "Verser la semoule en pluie en remuant, cuire 5 minutes à feu doux.", "Cannelle dessus. Se mange chaude ou froide."], { veg: true });
r("pates_beurre_parmesan", "Pâtes beurre, parmesan & œuf au plat", "🍝", "Italienne", "main", 15,
  { pasta: 110, butter: 10, parmesan: 15, egg: 1 },
  ["Cuire les pâtes, garder un peu d’eau de cuisson.", "Mélanger avec beurre, parmesan et 2 c. à s. d’eau de cuisson.", "Servir avec un œuf au plat bien cuit et du poivre."], { veg: true });
r("riz_oeuf_soja", "Bol riz, œufs & sauce soja", "🍚", "Japonaise", "main", 15,
  { rice: 90, egg: 2, soy_sauce: 10, spring_onion: 0.25, sesame_oil: 3 },
  ["Riz au rice cooker.", "Œufs au plat ou mollets (6 minutes 30 dans l’eau bouillante).", "Soja, huile de sésame, oignon vert. Le plus simple des dîners."], { veg: true });
r("omelette_fromage", "Omelette au fromage & salade", "🍳", "Française", "main", 10,
  { egg: 3, grated_cheese: 30, lettuce: 0.25, butter: 5 },
  ["Battre les œufs, saler.", "Cuire dans le beurre à feu moyen, ajouter le fromage, plier quand c’est pris.", "Servir avec la salade."], { veg: true });
r("soupe_legumes", "Soupe de légumes au soup maker", "🥕", "Française", "main", 30,
  { potato: 150, carrot: 100, zucchini: 100, onion: 50, stock_cube: 0.5, bread: 60, grated_cheese: 20 },
  ["Éplucher et couper grossièrement les légumes.", "Soup maker, programme velouté, avec 450 ml d’eau par personne et le cube.", "Servir avec pain grillé et fromage râpé."]);
r("tortilla_espagnole", "Tortilla espagnole", "🥔", "Espagnole", "main", 30,
  { egg: 3, potato: 200, onion: 50, oil: 15 },
  ["Pommes de terre et oignon en fines tranches, cuits doucement 15 minutes dans l’huile.", "Mélanger aux œufs battus salés.", "Cuire à la poêle couverte 8 minutes, retourner sur une assiette et finir 3 minutes."], { veg: true });
r("gnocchi_tomate", "Gnocchis poêlés tomate & mozzarella", "🍅", "Italienne", "main", 15,
  { gnocchi: 250, passata: 120, mozzarella: 60, garlic: 3, oil: 5 },
  ["Dorer les gnocchis crus à la poêle huilée 6 minutes.", "Ajouter ail et passata, 3 minutes.", "Mozzarella dessus, couvrir jusqu’à ce qu’elle fonde."], { veg: true });
r("boulgour_pilaf", "Boulgour pilaf au poulet haché", "🌶️", "Turque", "main", 25,
  { bulgur: 80, chicken_mince: 120, onion: 50, tomato_paste: 15, pepper: 80, oil: 8 },
  ["Dorer oignon, poivron et poulet haché (74 °C).", "Ajouter concentré, boulgour et 2 fois son volume d’eau salée.", "Couvrir 15 minutes à feu doux."]);
r("dinde_puree", "Escalope de dinde moutarde & purée", "🦃", "Française", "main", 25,
  { turkey: 150, potato: 250, milk: 50, butter: 10, mustard: 10 },
  ["Pommes de terre à l’eau, écrasées avec lait chaud et beurre.", "Saisir la dinde 3–4 minutes par face (74 °C).", "Déglacer avec la moutarde et 2 c. à s. d’eau."]);
r("dinde_curry", "Curry de dinde coco express", "🍛", "Indienne", "main", 25,
  { turkey: 150, coconut_milk: 100, curry_powder: 4, onion: 50, rice: 80, spinach: 80 },
  ["Riz au rice cooker.", "Dorer oignon et dinde en dés avec le curry.", "Ajouter lait de coco et épinards, mijoter 8 minutes (74 °C à cœur)."]);
r("poulet_patate_douce", "Hauts de cuisse & patates douces à l’air fryer", "🍠", "Basiques", "main", 30,
  { chicken_thigh: 170, sweet_potato: 250, paprika: 2, oil_sun: 5, green_beans: 120 },
  ["Patates douces en cubes, huile, sel : 10 minutes à l’air fryer à 200 °C.", "Ajouter le poulet au paprika, 15 minutes de plus (74 °C à cœur).", "Haricots verts à la poêle ou à la vapeur."]);
r("chou_fleur_curry", "Chou-fleur rôti au curry & pois chiches", "🥦", "Indienne", "main", 30,
  { cauliflower: 250, chickpea: 120, curry_powder: 3, oil: 10, yogurt: 60, rice: 60 },
  ["Chou-fleur en bouquets et pois chiches enrobés d’huile et de curry.", "Four 220 °C 25 minutes (ou air fryer 18 minutes).", "Servir avec riz et yaourt."], { veg: true });
r("wrap_poulet", "Wraps poulet croustillant & crudités", "🌯", "Basiques", "main", 20,
  { tortilla: 2, chicken: 130, lettuce: 0.25, fresh_tomato: 60, yogurt: 40, garlic: 3, paprika: 1 },
  ["Poulet en lanières au paprika, 12 minutes à l’air fryer à 200 °C (74 °C à cœur).", "Sauce : yaourt + ail râpé + sel.", "Garnir les tortillas et rouler."]);
r("soupe_miso", "Soupe miso, tofu & nouilles", "🍜", "Japonaise", "main", 15,
  { miso: 20, tofu: 80, spring_onion: 0.25, noodles: 50, spinach: 50 },
  ["Chauffer 400 ml d’eau par personne sans bouillir.", "Délayer le miso hors du feu, ajouter tofu en cubes et épinards.", "Ajouter les nouilles cuites et l’oignon vert."], { veg: true });
r("riz_poulet_rice_cooker", "Riz au poulet tout-en-un au rice cooker", "🍚", "Chinoise", "main", 45,
  { rice: 90, chicken_thigh: 140, carrot: 60, frozen_peas: 50, soy_sauce: 15, ginger: 4, garlic: 3 },
  ["Mettre riz rincé et eau (graduation du rice cooker).", "Poser dessus poulet mariné au soja, ail, gingembre, carotte en dés et petits pois.", "Lancer la cuisson, laisser reposer 10 minutes, vérifier 74 °C à cœur, mélanger."]);
r("soupe_poulet_vermicelles", "Soupe de poulet aux petites pâtes", "🍲", "Roumaine", "main", 30,
  { chicken: 100, pasta: 40, carrot: 60, onion: 40, stock_cube: 0.5, herbs: 0.25 },
  ["Mijoter poulet, carotte et oignon dans 500 ml d’eau par personne avec le cube, 20 minutes.", "Effilocher le poulet (74 °C), ajouter les pâtes 8 minutes.", "Persil ou aneth au service."]);
r("gratin_chou_fleur", "Gratin de chou-fleur au jambon de volaille", "🧀", "Française", "main", 40,
  { cauliflower: 300, milk: 120, butter: 10, flour: 10, grated_cheese: 40, ham: 60 },
  ["Cuire le chou-fleur 8 minutes à l’eau salée.", "Béchamel : beurre + farine, puis lait en fouettant.", "Plat : chou-fleur, jambon, béchamel, fromage. Four 200 °C 20 minutes."]);
r("quiche_sans_pate", "Quiche sans pâte courgette & jambon de volaille", "🥧", "Française", "main", 40,
  { egg: 2, milk: 80, zucchini: 100, grated_cheese: 30, ham: 50, flour: 15 },
  ["Fouetter œufs, farine, lait, sel.", "Ajouter courgette râpée pressée, jambon et fromage.", "Moule huilé, four 180 °C 30 minutes."]);
r("pizza_wrap", "Pizza tortilla à l’air fryer", "🍕", "Italienne", "main", 12,
  { tortilla: 1, passata: 50, mozzarella: 50, ham: 40, mushroom: 40, provence_herbs: 0.5 },
  ["Garnir la tortilla : passata, jambon, champignons, mozzarella, herbes.", "8 minutes à l’air fryer à 190 °C.", "Une par personne, prête en 12 minutes."]);
r("galettes_courgette", "Galettes de courgette & telemea", "🥒", "Méditerranéenne", "main", 25,
  { zucchini: 200, egg: 1, flour: 25, telemea: 40, yogurt: 50 },
  ["Râper la courgette, saler, presser fort.", "Mélanger avec œuf, farine et telemea émiettée.", "Galettes huilées : 12 minutes à l’air fryer à 200 °C. Sauce yaourt."], { veg: true });
r("boulettes_poulet", "Boulettes de poulet sauce tomate & couscous", "🧆", "Méditerranéenne", "main", 30,
  { chicken_mince: 150, egg: 0.3, panko: 15, passata: 150, onion: 30, couscous: 70 },
  ["Hacher soi-même des hauts de cuisse au hachoir si vous en avez, sinon poulet haché.", "Former des boulettes avec œuf, panko, sel. Les dorer puis mijoter 12 minutes dans la passata (74 °C).", "Servir sur le couscous."]);
r("tartines_cottage", "Tartines cottage cheese & concombre", "🥒", "Basiques", "breakfast", 5,
  { cottage: 150, bread: 80, cucumber: 60, herbs: 0.1 },
  ["Griller le pain.", "Garnir de cottage cheese, concombre en rondelles, herbes, poivre."], { veg: true });
r("yaourt_fruits_rouges", "Bol yaourt protéiné & fruits rouges", "🫐", "Basiques", "breakfast", 5,
  { yogurt: 200, berries: 80, oats: 30, honey: 8 },
  ["Décongeler les fruits rouges la veille au frigo (ou 1 minute au micro-ondes).", "Mélanger au yaourt, avoine et miel."], { veg: true });

// ─── Plats tendance des réseaux (versions maison) ──────────────────────────
r("baked_oats", "Baked oats chocolat-banane", "🍫", "Tendance", "breakfast", 25,
  { oats: 60, egg: 1, banana: 80, milk: 80, baking_powder: 2, cocoa: 5 },
  ["Mixer tous les ingrédients au blender.", "Verser dans un ramequin, 12 minutes à l’air fryer à 170 °C (ou 20 minutes au four à 180 °C).", "Cœur fondant, se prépare la veille."], { veg: true });
r("protein_pancakes", "Pancakes protéinés cottage & avoine", "🥞", "Tendance", "breakfast", 15,
  { oats: 50, cottage: 100, egg: 1, banana: 60, baking_powder: 2 },
  ["Mixer au blender jusqu’à une pâte lisse.", "Petits pancakes à la poêle, 2 minutes par face à feu moyen.", "Environ 25 g de protéines par personne."], { veg: true });
r("cottage_flatbread", "Galette cottage cheese façon wrap", "🫓", "Tendance", "main", 35,
  { cottage: 150, egg: 1.5, chicken: 100, lettuce: 0.25, paprika: 1 },
  ["Mixer cottage cheese et œufs, étaler finement sur une plaque avec papier cuisson.", "Four 200 °C 25 minutes jusqu’à ce que ce soit doré et ferme.", "Garnir de poulet grillé (74 °C) et salade, rouler."]);
r("feta_pasta", "Pâtes à la telemea rôtie & tomates", "🍅", "Tendance", "main", 30,
  { pasta: 100, telemea: 70, fresh_tomato: 200, garlic: 4, oil: 10 },
  ["Plat : tomates entières, bloc de telemea au milieu, ail, huile.", "Four 200 °C 25 minutes.", "Écraser le tout, mélanger aux pâtes cuites."], { veg: true });
r("marry_me_chicken", "Poulet crémeux tomate & parmesan", "💍", "Tendance", "main", 30,
  { chicken: 160, cream: 70, parmesan: 15, garlic: 4, tomato_paste: 15, spinach: 60, pasta: 80 },
  ["Dorer le poulet 5 minutes par face (74 °C), réserver.", "Ail, concentré, crème, parmesan, épinards : 3 minutes.", "Remettre le poulet, servir avec les pâtes."]);
r("smashed_cucumber", "Bol concombre écrasé & poulet sésame", "🥒", "Tendance", "main", 25,
  { cucumber: 150, chicken: 140, rice: 80, soy_sauce: 10, rice_vinegar: 10, garlic: 3, sesame_oil: 4, sesame_seeds: 3, chili: 2 },
  ["Écraser le concombre au plat du couteau, saler 10 minutes, égoutter.", "Assaisonner : soja, vinaigre, ail, huile de sésame, piment.", "Riz au rice cooker, poulet à la poêle (74 °C), sésame."]);
r("chili_oil_noodles", "Nouilles à l’huile pimentée & œuf", "🌶️", "Tendance", "main", 15,
  { noodles: 100, chili: 4, garlic: 5, soy_sauce: 15, rice_vinegar: 5, sugar: 3, oil_sun: 15, egg: 1, spring_onion: 0.25, sesame_seeds: 3 },
  ["Dans le bol : ail, piment, sésame, oignon vert. Verser l’huile fumante dessus.", "Ajouter soja, vinaigre, sucre.", "Mélanger aux nouilles cuites, œuf au plat bien cuit."], { veg: true });
r("onigiri", "Onigiri thon-mayo", "🍙", "Tendance", "main", 30,
  { sushi_rice: 100, tuna: 70, mayonnaise: 15, soy_sauce: 5, sesame_seeds: 2, cucumber: 80 },
  ["Riz rond au rice cooker, saler légèrement.", "Mains mouillées : former des triangles avec un cœur thon-mayo-soja.", "Sésame, concombre à côté. Se gardent 1 jour au frais, filmés."]);
r("nuggets", "Nuggets maison & frites à l’air fryer", "🍗", "Tendance", "main", 30,
  { chicken: 160, panko: 30, egg: 0.5, flour: 10, paprika: 1, frozen_fries: 150 },
  ["Poulet en morceaux : farine, œuf, panko au paprika.", "Frites 10 minutes à l’air fryer à 200 °C, puis nuggets 12 minutes (74 °C à cœur).", "Se congèlent crus panés sur plaque."]);

// ─── Bœuf & canard du congélateur ─────────────────────────────────────────
r("birria_tacos", "Tacos façon birria (bœuf fondant)", "🌮", "Tendance", "main", 180,
  { beef_stew: 150, tortilla: 2, onion: 50, garlic: 5, chili: 5, tomato_paste: 15, grated_cheese: 40, herbs: 0.25, stock_cube: 0.5 },
  ["Mijoter le bœuf 2 h 30 avec oignon, ail, piment, concentré et bouillon jusqu’à ce qu’il s’effiloche.", "Tremper les tortillas dans le jus, garnir de bœuf et fromage, dorer à la poêle.", "Servir avec le jus en trempette."]);
r("smash_tacos", "Smash burger tacos", "🍔", "Tendance", "main", 15,
  { beef_mince: 120, tortilla: 2, cheese_slices: 30, lettuce: 0.25, pickles: 20, mayonnaise: 10, mustard: 5 },
  ["Étaler une fine couche de bœuf haché sur chaque tortilla.", "Côté viande à la poêle très chaude 3 minutes (bien cuit), retourner, cheddar.", "Salade, cornichons, sauce mayo-moutarde, plier."]);
r("magret_patate_douce", "Magret de canard & purée de patate douce", "🦆", "Française", "main", 35,
  { duck: 180, sweet_potato: 250, honey: 8, butter: 5 },
  ["Décongeler au réfrigérateur la veille. Quadriller la peau.", "Cuire côté peau 8 minutes à feu moyen, retourner 4 minutes, laquer au miel, reposer 5 minutes.", "Purée de patate douce au beurre."]);
r("canard_laque", "Canard laqué express & riz", "🦆", "Chinoise", "main", 30,
  { duck: 160, soy_sauce: 15, honey: 12, ginger: 5, garlic: 4, rice: 90, spring_onion: 0.25, cucumber: 60 },
  ["Riz au rice cooker.", "Saisir le canard, puis laquer avec soja, miel, ail et gingembre jusqu’à caramélisation.", "Trancher, servir avec concombre et oignon vert."]);
r("parmentier_canard", "Parmentier de canard", "🥔", "Française", "batch", 70,
  { duck: 500, potato: 1200, milk: 200, butter: 30, onion: 150 },
  ["Cuire le canard (cuisses) 1 h 30 à couvert au four à 160 °C, effilocher.", "Purée : pommes de terre, lait chaud, beurre.", "Canard + oignon fondu au fond, purée dessus, gratiner 20 minutes à 200 °C. Se congèle."], { freezer: true, portions: 5 });

// ─── Préparations du dimanche (batch) ─────────────────────────────────────
r("chili_poulet", "Chili au poulet haché", "🌶️", "Tex-Mex", "batch", 60,
  { chicken_mince: 500, beans: 480, tomato: 800, onion: 150, pepper: 200, taco_spice: 15, corn: 285, oil_sun: 20 },
  ["Faire revenir oignon et poivron, ajouter le poulet haché et les épices (74 °C).", "Tomates, haricots, maïs : mijoter 30 minutes.", "Portionner : frigo 3 jours ou congélateur."], { freezer: true, portions: 6 });
r("bolo_poulet", "Bolognaise de poulet", "🍝", "Italienne", "batch", 75,
  { chicken_mince: 500, passata: 500, tomato: 400, onion: 150, carrot: 150, garlic: 10, oil: 20 },
  ["Oignon, carotte, ail hachés au hachoir ou au mixeur, revenus 10 minutes.", "Ajouter le poulet haché (74 °C), puis passata et tomates.", "Mijoter 45 minutes, portionner, congeler."], { freezer: true, portions: 6 });
r("egg_muffins", "Muffins aux œufs jambon & légumes", "🧁", "Basiques", "batch", 30,
  { egg: 6, ham: 100, pepper: 100, grated_cheese: 60, spinach: 80 },
  ["Battre les œufs, ajouter jambon, poivron, épinards et fromage.", "Moules à muffins huilés, four 180 °C 20 minutes (ou air fryer 160 °C 14 minutes).", "Frigo 4 jours ou congélateur : 1 minute au micro-ondes le matin."], { freezer: true, portions: 6, unit: "muffins", meal: "breakfast" });
r("banana_bread", "Banana bread", "🍌", "Américaine", "batch", 70,
  { flour: 220, banana: 300, egg: 2, sugar: 80, butter: 70, baking_powder: 8 },
  ["Écraser les bananes bien mûres, mélanger au robot batteur avec beurre fondu, sucre, œufs.", "Ajouter farine et levure.", "Moule à cake, four 175 °C 50 minutes. Se congèle en tranches."], { veg: true, freezer: true, portions: 10, unit: "tranches", meal: "breakfast" });
r("energy_balls", "Energy balls avoine, cacahuète & chocolat", "🟤", "Tendance", "batch", 20,
  { oats: 150, peanut: 80, honey: 40, cocoa: 15, chocolate: 30 },
  ["Mixer l’avoine grossièrement.", "Mélanger avec beurre de cacahuète, miel, cacao et chocolat haché.", "Former 12 boules, 30 minutes au frais. Encas : 2 par personne."], { veg: true, freezer: true, portions: 12, unit: "boules", meal: "breakfast" });
