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
  ["Mixer l’avoine grossièrement.", "Mélanger avec beurre de cacahuète, miel, cacao et chocolat haché.", "Former 12 boules, 30 minutes au frais. Encas : 2 par personne."], { veg: true, freezer: true, portions: 12, unit: "boules", meal: "breakfast", snack: true });

// ─── Douceurs à faire en plus ─────────────────────────────────────────────
r("cookies", "Cookies aux pépites de chocolat", "🍪", "Américaine", "batch", 30,
  { flour: 250, butter: 125, sugar: 150, egg: 1, chocolate: 150, baking_powder: 5 },
  ["Au robot batteur : beurre mou et sucre 2 minutes, puis l’œuf.", "Ajouter farine, levure chimique, pincée de sel, puis le chocolat haché grossièrement.", "Boules de pâte espacées sur plaque : 10–12 minutes à 180 °C (ou 8 minutes à l’air fryer à 170 °C). Bords dorés, centre encore mou : ils durcissent en refroidissant. Se congèlent crus en boules."],
  { veg: true, freezer: true, portions: 16, unit: "cookies", meal: "breakfast", snack: true });
r("crepes", "Crêpes", "🥞", "Française", "batch", 30,
  { flour: 250, milk: 500, egg: 3, sugar: 20, butter: 30 },
  ["Au mixeur : farine, œufs, sucre, pincée de sel et lait, jusqu’à une pâte lisse. Repos 30 minutes si possible.", "Poêle chaude légèrement beurrée : une petite louche, étaler, 1 minute par face.", "Se congèlent empilées avec du papier cuisson entre chaque crêpe."],
  { veg: true, freezer: true, portions: 12, unit: "crêpes", meal: "breakfast" });

// ─── Boissons ─────────────────────────────────────────────────────────────
r("matcha_latte", "Matcha latte (chaud ou glacé)", "🍵", "Japonaise", "drink", 5,
  { matcha: 2, milk: 250, honey: 5 },
  ["Fouetter le matcha avec 30 ml d’eau chaude, pas bouillante (80 °C), jusqu’à ce qu’il mousse et qu’il n’y ait plus de grumeaux.", "Chauffer le lait et le faire mousser au mixeur plongeant ou au robot batteur (ou le verser froid sur des glaçons pour la version glacée).", "Verser le lait sur le matcha, sucrer au miel."],
  { veg: true });
r("cafe_proteine_frappe", "Café frappé protéiné", "🧋", "Basiques", "drink", 5,
  { protein_coffee: 1, banana: 60, oats: 15 },
  ["Mixer le café protéiné avec la banane, l’avoine et quelques glaçons.", "Environ 25 g de protéines par verre."],
  { veg: true });

// ─── En-cas ───────────────────────────────────────────────────────────────
r("pomme_cacahuete", "Pomme & beurre de cacahuète", "🍏", "Basiques", "snack", 3,
  { apple: 150, peanut: 20 },
  ["Couper la pomme en quartiers.", "Tremper dans le beurre de cacahuète."], { veg: true });
r("yaourt_miel_noix", "Yaourt grec, miel & noix", "🍯", "Méditerranéenne", "snack", 3,
  { yogurt: 150, honey: 10, nuts: 15 },
  ["Verser le yaourt dans un bol.", "Ajouter le miel et les noix concassées."], { veg: true });
r("carottes_houmous", "Bâtonnets de carottes & houmous express", "🥕", "Méditerranéenne", "snack", 10,
  { carrot: 100, chickpea: 80, lemon: 10, oil: 5, garlic: 2 },
  ["Mixer pois chiches, jus de citron, ail, huile et une cuillère d’eau jusqu’à ce que ce soit lisse.", "Couper les carottes en bâtonnets et tremper."], { veg: true });
r("oeufs_durs", "Œufs durs & sel au paprika", "🥚", "Basiques", "snack", 12,
  { egg: 2, paprika: 0.5 },
  ["Cuire les œufs 10 minutes dans l’eau bouillante, refroidir à l’eau froide.", "Écaler, saupoudrer de sel et de paprika. Se gardent 4 jours au frigo dans leur coquille."], { veg: true });

// ─── Sauces maison (quantités pour un pot) ────────────────────────────────
r("sauce_teriyaki", "Sauce teriyaki maison", "🥫", "Japonaise", "sauce", 10,
  { soy_sauce: 100, honey: 40, garlic: 10, ginger: 10, rice_vinegar: 15, cornstarch: 8 },
  ["Dans une petite casserole : soja, miel, vinaigre de riz, ail et gingembre râpés, 100 ml d’eau.", "Porter à frémissement, ajouter la fécule délayée dans 2 cuillères d’eau froide, remuer 1 minute jusqu’à ce que la sauce nappe la cuillère.", "Pot fermé au réfrigérateur : 1 semaine. Pour laquer poulet, saumon ou légumes."],
  { veg: true, portions: 6 });
r("sauce_cacahuete", "Sauce cacahuète", "🥜", "Thaïlandaise", "sauce", 5,
  { peanut: 80, coconut_milk: 100, soy_sauce: 30, lemon: 20, honey: 15, garlic: 5 },
  ["Fouetter tous les ingrédients jusqu’à ce que ce soit lisse (ou au mixeur plongeant).", "Allonger avec un peu d’eau chaude si elle est trop épaisse.", "Réfrigérateur : 5 jours. Avec nouilles, bo bun, brochettes de poulet, crudités."],
  { veg: true, portions: 6 });
r("sauce_yaourt_ail", "Sauce yaourt, ail & herbes", "🥛", "Méditerranéenne", "sauce", 5,
  { yogurt: 250, garlic: 6, lemon: 15, herbs: 0.5, oil: 10 },
  ["Râper l’ail, ciseler les herbes.", "Mélanger au yaourt avec le jus de citron, l’huile, sel et poivre.", "Réfrigérateur : 3 jours. Pour wraps, shawarma, galettes de courgette, pommes de terre."],
  { veg: true, portions: 6 });
r("vinaigrette", "Vinaigrette moutarde-citron", "🫙", "Française", "sauce", 3,
  { oil: 90, mustard: 15, lemon: 30, honey: 5 },
  ["Dans un pot : moutarde, jus de citron, miel, sel, poivre.", "Ajouter l’huile, fermer et secouer jusqu’à ce que ce soit émulsionné.", "Se garde 1 semaine au réfrigérateur ; secouer avant usage."],
  { veg: true, portions: 8 });
r("sauce_tomate", "Sauce tomate maison à congeler", "🍅", "Italienne", "sauce", 40,
  { passata: 700, tomato: 400, onion: 150, garlic: 10, oil: 30, provence_herbs: 2 },
  ["Faire fondre l’oignon et l’ail hachés dans l’huile, 8 minutes à feu doux.", "Ajouter passata, tomates et herbes, mijoter 30 minutes à couvert.", "Mixer au mixeur plongeant si vous la voulez lisse. Portionner : 4 jours au réfrigérateur ou 3 mois au congélateur. Pour pâtes, pizzas, shakshuka."],
  { veg: true, freezer: true, portions: 8 });
r("mayo_epicee", "Mayonnaise épicée", "🌶️", "Japonaise", "sauce", 3,
  { mayonnaise: 150, chili: 5, lemon: 10, garlic: 3 },
  ["Hacher très finement le piment et l’ail.", "Mélanger à la mayonnaise avec le jus de citron.", "Réfrigérateur : 5 jours. Pour onigiri, chirashi, nuggets, smash tacos."],
  { veg: true, portions: 8 });
r("nuoc_cham", "Nước chấm (sauce vietnamienne)", "🥢", "Vietnamienne", "sauce", 5,
  { fish_sauce: 45, sugar: 30, lemon: 40, garlic: 6, chili: 3 },
  ["Dissoudre le sucre dans 120 ml d’eau tiède.", "Ajouter sauce poisson, jus de citron, ail et piment hachés.", "Réfrigérateur : 1 semaine. Pour bo bun, nems, salades de vermicelles."],
  { portions: 6 });

// ─── Libanaises ───────────────────────────────────────────────────────────
r("kebab_libanais", "Kebab libanais au poulet (pita, toum & pickles)", "🥙", "Libanaise", "main", 35,
  { chicken_thigh: 170, pita: 1.5, yogurt: 50, garlic: 6, lemon: 20, paprika: 2, curry_powder: 2, cinnamon: 0.5, lettuce: 0.15, fresh_tomato: 80, pickles: 30, oil: 10 },
  ["Couper les hauts de cuisse en lanières d’1 cm. Mariner 20 minutes (ou la veille) avec la moitié du citron, l’huile, le paprika, le curry, la cannelle, la moitié de l’ail râpé, sel et poivre.", "Saisir 8 à 10 minutes à la poêle bien chaude, ou 12 minutes à l’air fryer à 200 °C en secouant à mi-cuisson : les bords doivent caraméliser.", "Sauce façon toum : yaourt + reste d’ail râpé + reste de citron + sel.", "Réchauffer les pitas 1 minute à la poêle. Garnir de sauce, poulet, salade, tomate en rondelles et pickles, rouler serré dans du papier."]);
r("chich_taouk", "Chich taouk, riz & salade concombre", "🍢", "Libanaise", "main", 35,
  { chicken: 160, yogurt: 40, tomato_paste: 10, garlic: 5, lemon: 20, paprika: 2, rice: 80, cucumber: 100, herbs: 0.3, oil: 10 },
  ["Couper le blanc en cubes de 3 cm. Mariner avec yaourt, concentré de tomate, ail râpé, la moitié du citron, paprika, sel : 30 minutes minimum.", "Lancer le riz au rice cooker (1 volume de riz pour 1,2 volume d’eau).", "Enfiler sur des pics et cuire 12 minutes à l’air fryer à 200 °C (ou 10 minutes à la poêle), en retournant à mi-cuisson.", "Concombre en dés d’1 cm, persil haché, reste du citron, huile, sel. Servir avec le riz."]);
r("kafta_poulet", "Kafta de poulet & taboulé de boulgour", "🧆", "Libanaise", "main", 30,
  { chicken_mince: 150, onion: 40, herbs: 0.4, paprika: 2, cinnamon: 0.5, bulgur: 50, fresh_tomato: 120, cucumber: 60, lemon: 20, oil: 12, yogurt: 40 },
  ["Boulgour : verser 1,5 volume d’eau bouillante salée dessus, couvrir 15 minutes.", "Mixer l’oignon et la moitié du persil, mélanger à la viande avec paprika, cannelle, sel. Former des boudins de 10 cm.", "Cuire 10 minutes à l’air fryer à 200 °C ou à la poêle en les roulant.", "Taboulé : boulgour égrainé, tomate et concombre en petits dés, reste de persil haché, citron, huile, sel. Servir avec le yaourt."]);
r("moujaddara", "Moujaddara (lentilles, riz & oignons frits)", "🧅", "Libanaise", "main", 40,
  { lentil: 70, rice: 50, onion: 150, oil: 20, curry_powder: 2, yogurt: 80, cucumber: 80, lemon: 10 },
  ["Rincer les lentilles, les cuire 10 minutes dans l’eau. Égoutter.", "Mettre lentilles + riz + curry + sel au rice cooker avec 1,5 volume d’eau pour le volume total, lancer la cuisson.", "Pendant ce temps, émincer les oignons en fines lamelles et les faire dorer 20 minutes dans l’huile, feu moyen, jusqu’à ce qu’ils soient bruns et croustillants.", "Servir le riz-lentilles couvert d’oignons, avec yaourt et concombre au citron."], { veg: true });
r("fattouche", "Fattouche & pois chiches rôtis", "🥗", "Libanaise", "main", 20,
  { lettuce: 0.3, fresh_tomato: 120, cucumber: 100, pita: 1, chickpea: 120, lemon: 20, oil: 15, herbs: 0.3, paprika: 2, telemea: 40 },
  ["Pois chiches égouttés et séchés + paprika + un filet d’huile : 12 minutes à l’air fryer à 200 °C.", "Pita coupée en carrés de 3 cm, 4 minutes à l’air fryer : bien croustillante.", "Salade, tomate et concombre en morceaux, persil haché.", "Vinaigrette citron-huile-sel, mélanger au dernier moment avec la pita, les pois chiches et la telemea émiettée."], { veg: true });
r("manakish", "Manakich zaatar & fromage, crudités", "🫓", "Libanaise", "main", 90,
  { flour: 120, yeast: 2, oil: 20, provence_herbs: 4, sesame_seeds: 8, telemea: 50, mozzarella: 40, fresh_tomato: 100, cucumber: 80 },
  ["Pâte au robot (crochet) : farine, levure, pincée de sel et sucre, 75 ml d’eau tiède, 1 cuillère d’huile. Pétrir 6 minutes, lever 1 h.", "Mélanger herbes, sésame et 2 cuillères d’huile (zaatar maison).", "Étaler 2 galettes fines par personne. L’une couverte de zaatar, l’autre de telemea et mozzarella émiettées.", "Cuire 8 à 10 minutes à 240 °C sur la grille la plus basse. Servir avec tomate et concombre en quartiers."], { veg: true });
r("hachweh", "Riz libanais à la viande hachée & noix", "🍚", "Libanaise", "main", 30,
  { chicken_mince: 130, rice: 80, onion: 60, cinnamon: 1, nuts: 12, oil: 10, yogurt: 70, cucumber: 80 },
  ["Faire revenir l’oignon en dés dans l’huile 5 minutes, ajouter la viande, cannelle, sel, poivre : cuire 8 minutes en émiettant.", "Ajouter le riz rincé, mélanger 1 minute, puis 1,6 volume d’eau. Couvrir, feu doux 15 minutes (ou tout transférer au rice cooker).", "Torréfier les noix à sec 3 minutes.", "Servir parsemé de noix, avec le yaourt et le concombre."]);
r("shorbat_adas", "Chorba adas (soupe libanaise de lentilles corail)", "🍲", "Libanaise", "main", 30,
  { lentil: 80, carrot: 80, onion: 60, curry_powder: 2, lemon: 20, oil: 10, pita: 1 },
  ["Soup maker : lentilles rincées, carotte et oignon en morceaux, curry, sel, huile et 400 ml d’eau par personne, programme velouté (≈ 25 minutes).", "Sans soup maker : cuire 25 minutes à frémissement puis mixer au mixeur plongeant.", "Servir avec beaucoup de citron et la pita grillée en triangles."], { veg: true });
r("falafels", "Falafels au four (≈30 pièces)", "🧆", "Libanaise", "batch", 50,
  { chickpea: 720, onion: 100, garlic: 10, herbs: 2, flour: 60, curry_powder: 6, baking_powder: 5, oil_sun: 40 },
  ["Égoutter et sécher les pois chiches dans un torchon (important pour qu’ils tiennent).", "Hachoir à viande grille moyenne (ou mixeur par à-coups) : pois chiches, oignon, ail, persil. Ajouter farine, curry, levure chimique, sel : la pâte doit se tenir.", "Former des boulettes aplaties de 3 cm, badigeonner d’huile.", "Air fryer 200 °C 12 minutes en retournant, ou four 210 °C 20 minutes.", "Congeler à plat sur une plaque puis en sac. Réchauffer 6 minutes à l’air fryer. Servir en pita avec houmous ou sauce yaourt et crudités."],
  { veg: true, freezer: true, portions: 6 });
r("houmous_maison", "Houmous maison au tahini (grand pot)", "🫘", "Libanaise", "sauce", 10,
  { chickpea: 480, tahini: 60, lemon: 60, garlic: 8, oil: 30 },
  ["Garder 4 cuillères du jus des pois chiches.", "Mixer pois chiches, tahini, jus de citron, ail, sel et le jus réservé 3 minutes, jusqu’à ce que ce soit très lisse (ajouter un peu d’eau glacée si trop épais).", "Servir avec un filet d’huile et du paprika. Réfrigérateur : 5 jours."],
  { veg: true, portions: 8 });

// ─── Grecques ─────────────────────────────────────────────────────────────
r("souvlaki_pita", "Souvlaki de poulet, pita & tzatziki", "🇬🇷", "Grecque", "main", 30,
  { chicken: 160, lemon: 20, garlic: 6, provence_herbs: 2, oil: 12, pita: 1.5, yogurt: 70, cucumber: 80, onion: 30, fresh_tomato: 80 },
  ["Blanc en cubes de 3 cm, mariné 20 minutes avec citron, la moitié de l’ail, herbes, huile, sel.", "Tzatziki : concombre râpé et pressé dans les mains, yaourt, reste d’ail râpé, sel.", "Brochettes 12 minutes à l’air fryer à 200 °C (ou poêle).", "Pita réchauffée, tzatziki, poulet, tomate et oignon en fines lamelles."]);
r("gyros_frites", "Gyros de poulet & frites au four", "🥙", "Grecque", "main", 40,
  { chicken_thigh: 160, paprika: 2, provence_herbs: 2, garlic: 5, oil: 15, yogurt: 60, cucumber: 60, pita: 1, potato: 180, fresh_tomato: 60 },
  ["Pommes de terre en frites de 1 cm, huile, sel : 20 minutes à l’air fryer à 200 °C.", "Hauts de cuisse en fines lanières, paprika, herbes, ail, sel, huile ; saisir 8 minutes à feu vif pour griller les bords.", "Tzatziki express : yaourt, concombre râpé pressé, sel.", "Dans la pita : sauce, gyros, tomate et quelques frites, le reste à côté."]);
r("moussaka_lentilles", "Moussaka aux lentilles", "🍆", "Grecque", "batch", 100,
  { eggplant: 900, lentil: 200, tomato: 800, onion: 150, garlic: 10, cinnamon: 2, milk: 500, flour: 40, butter: 40, egg: 1, parmesan: 40, oil: 40 },
  ["Aubergines en rondelles de 1 cm, huilées au pinceau, 15 minutes à l’air fryer à 200 °C en plusieurs fois (ou 25 minutes au four).", "Sauce : oignon et ail dans un peu d’huile, lentilles rincées, tomates, cannelle, sel, 300 ml d’eau. Mijoter 25 minutes à couvert.", "Béchamel : beurre fondu + farine 1 minute, lait froid d’un coup, fouetter jusqu’à épaississement, hors du feu l’œuf et la moitié du parmesan.", "Dans un plat : aubergines, sauce, aubergines, sauce, béchamel, parmesan. Four 180 °C 40 minutes, repos 15 minutes.", "Congeler en parts dans des boîtes."],
  { veg: true, freezer: true, portions: 6 });
r("pastitsio", "Pastitsio (gratin grec de pâtes à la viande)", "🍝", "Grecque", "batch", 90,
  { pasta: 400, chicken_mince: 500, tomato: 400, onion: 120, garlic: 6, cinnamon: 2, milk: 600, flour: 50, butter: 50, egg: 1, grated_cheese: 80 },
  ["Cuire les pâtes 2 minutes de moins que le paquet, égoutter.", "Sauce : oignon, ail, viande émiettée 8 minutes, tomates, cannelle, sel. Mijoter 15 minutes.", "Béchamel : beurre + farine, lait froid, fouetter jusqu’à épaississement, puis l’œuf et la moitié du fromage hors du feu.", "Plat : la moitié des pâtes, la sauce, le reste des pâtes, la béchamel, le fromage. Four 180 °C 40 minutes.", "Congeler en parts."],
  { freezer: true, portions: 6 });
r("spanakopita", "Spanakopita (tourte épinards & feta)", "🥧", "Grecque", "batch", 70,
  { puff_pastry: 800, spinach: 900, telemea: 300, egg: 3, onion: 100, herbs: 1 },
  ["Décongeler les épinards et les presser très fort dans les mains (le secret pour une pâte croustillante).", "Faire fondre l’oignon émincé, mélanger aux épinards, telemea émiettée, œufs (en garder un peu pour dorer), aneth haché, poivre.", "Plat : une pâte au fond, la farce, la deuxième pâte, souder les bords, dorer, entailler en losanges.", "Four 190 °C 40 minutes. Congeler en parts ; réchauffer 15 minutes au four ou 8 minutes à l’air fryer."],
  { veg: true, freezer: true, portions: 6 });
r("keftedes", "Keftedes (boulettes grecques à la menthe)", "🧆", "Grecque", "batch", 50,
  { chicken_mince: 750, bread: 80, egg: 1, onion: 100, herbs: 1, provence_herbs: 4, garlic: 8, flour: 30, oil_sun: 30 },
  ["Tremper le pain dans un peu d’eau, l’essorer.", "Mixer oignon et herbes, mélanger avec viande, pain, œuf, ail, origan, sel, poivre.", "Former des boulettes de 4 cm, les rouler dans la farine.", "Air fryer 190 °C 12 minutes en secouant (ou poêle). Congeler à plat. Servir avec tzatziki, riz ou pita et salade."],
  { freezer: true, portions: 6 });
r("salade_grecque", "Salade grecque (horiatiki) & pain grillé", "🥗", "Grecque", "main", 15,
  { fresh_tomato: 200, cucumber: 150, onion: 30, pepper: 60, olives: 40, telemea: 80, oil: 15, provence_herbs: 1, bread: 80, chickpea: 80 },
  ["Tomates en quartiers, concombre en demi-rondelles épaisses, poivron et oignon en fines lamelles.", "Ajouter olives et pois chiches égouttés.", "Poser la telemea en bloc dessus, origan, huile, sel. Servir avec le pain grillé."], { veg: true });
r("gemista", "Gemista (poivrons & tomates farcis au riz)", "🫑", "Grecque", "main", 70,
  { pepper: 300, fresh_tomato: 240, rice: 60, onion: 60, garlic: 5, herbs: 0.3, tomato_paste: 15, oil: 15, telemea: 40 },
  ["Couper un chapeau aux légumes, creuser les tomates et hacher leur chair.", "Farce : oignon fondu, ail, riz cru, chair de tomate, concentré, herbes hachées, sel, 100 ml d’eau. Cuire 5 minutes.", "Remplir les légumes aux trois quarts (le riz gonfle), remettre les chapeaux, un fond d’eau dans le plat.", "Four 190 °C 50 minutes. Servir avec la telemea émiettée."], { veg: true });
r("fasolada", "Fasolada (soupe grecque aux haricots)", "🍲", "Grecque", "main", 35,
  { beans: 240, carrot: 80, onion: 60, tomato: 150, oil: 15, herbs: 0.3, bread: 60 },
  ["Soup maker : haricots égouttés, carotte en rondelles, oignon en dés, tomates, huile, sel, 300 ml d’eau par personne, programme soupe avec morceaux.", "Sans soup maker : 25 minutes à frémissement.", "Servir avec persil, un filet d’huile et du pain."], { veg: true });
r("poulet_citron_grec", "Poulet citron-origan & pommes de terre rôties", "🍋", "Grecque", "main", 50,
  { chicken_thigh: 180, potato: 280, lemon: 30, garlic: 6, provence_herbs: 2, oil: 15, mustard: 5, green_beans: 120 },
  ["Pommes de terre en quartiers, poulet, citron pressé, ail écrasé, origan, moutarde, huile, sel, 100 ml d’eau : tout dans un plat.", "Four 200 °C 45 minutes en retournant une fois : les pommes de terre absorbent le jus citronné.", "Haricots verts 8 minutes à l’eau bouillante salée, servir à côté."]);
r("kritharaki", "Kritharaki (pâtes risoni, poulet & tomate)", "🍝", "Grecque", "main", 25,
  { pasta: 90, chicken: 140, tomato: 150, onion: 50, telemea: 30, provence_herbs: 1, oil: 10, spinach: 80 },
  ["Poulet en dés de 2 cm saisi 5 minutes dans l’huile avec l’oignon.", "Ajouter tomates, origan, sel et 250 ml d’eau par personne, puis les petites pâtes : cuire 10 minutes en remuant, comme un risotto.", "Ajouter les épinards 2 minutes, servir avec la telemea émiettée."]);
r("briam", "Briam (légumes rôtis à la grecque) & feta", "🍅", "Grecque", "main", 60,
  { zucchini: 200, eggplant: 150, potato: 150, fresh_tomato: 120, onion: 60, garlic: 5, oil: 20, telemea: 60, provence_herbs: 1 },
  ["Tous les légumes en rondelles de 5 mm, oignon en lamelles.", "Mélanger avec ail, origan, huile, sel et 100 ml d’eau dans un plat.", "Four 200 °C 50 minutes, couvert les 20 premières minutes.", "Servir avec la telemea émiettée."], { veg: true });

// ─── Cuisine maison gourmande (versions maison, style comptes food Instagram) ───
r("one_pot_tomate_epinards", "One pot pasta tomate, épinards & cottage", "🍝", "Française", "main", 20,
  { pasta: 100, tomato: 200, spinach: 100, garlic: 5, cottage: 80, parmesan: 10, provence_herbs: 1, oil: 5 },
  ["Dans une sauteuse : pâtes crues, tomates, ail émincé, herbes, sel et 300 ml d’eau par personne.", "Cuire 10 à 12 minutes à feu moyen en remuant, jusqu’à ce que l’eau soit absorbée.", "Ajouter les épinards 2 minutes, puis le cottage hors du feu et le parmesan."], { veg: true });
r("gratin_patate_douce_poulet", "Gratin patate douce, poulet & épinards", "🍠", "Française", "main", 50,
  { sweet_potato: 250, chicken: 140, spinach: 100, cream: 40, grated_cheese: 25, garlic: 4 },
  ["Patate douce en rondelles de 5 mm, poulet en dés de 2 cm.", "Dans un plat : patate, poulet, épinards, crème mélangée à l’ail et au sel, fromage.", "Four 190 °C 40 minutes, jusqu’à ce que la patate soit tendre à la pointe du couteau."]);
r("gnocchis_poeles_courgette", "Gnocchis poêlés, courgette, tomate & mozzarella", "🥔", "Française", "main", 20,
  { gnocchi: 200, zucchini: 150, fresh_tomato: 120, mozzarella: 60, garlic: 5, oil: 10, provence_herbs: 1 },
  ["Dorer les gnocchis 6 minutes dans l’huile sans les cuire avant : ils deviennent croustillants.", "Ajouter la courgette en demi-rondelles et l’ail, 5 minutes.", "Ajouter les tomates en dés et les herbes 2 minutes, puis la mozzarella déchirée, couvrir 1 minute."], { veg: true });
r("clafoutis_sale_courgette", "Clafoutis salé courgette-feta & salade", "🥧", "Française", "main", 40,
  { egg: 2, milk: 100, flour: 25, zucchini: 200, telemea: 50, provence_herbs: 1, oil: 5, lettuce: 0.25, bread: 60 },
  ["Courgette en fines rondelles, revenue 5 minutes à la poêle.", "Fouetter œufs, farine, lait, herbes, poivre.", "Plat huilé : courgette, telemea émiettée, appareil. Four 180 °C 30 minutes.", "Servir tiède avec la salade et le pain."], { veg: true });
r("riz_cremeux_poulet_champi", "Riz crémeux poulet & champignons (one pot)", "🍄", "Française", "main", 30,
  { rice: 80, chicken: 140, mushroom: 120, onion: 50, cream: 40, stock_cube: 0.5, parmesan: 10, frozen_peas: 60, oil: 5 },
  ["Saisir le poulet en dés 4 minutes, réserver. Faire revenir oignon et champignons émincés 5 minutes.", "Ajouter le riz 1 minute, puis 250 ml de bouillon par personne. Couvrir, feu doux 15 minutes.", "Remettre le poulet, les petits pois, la crème et le parmesan, 3 minutes."]);
r("tarte_fine_tomate_moutarde", "Tarte fine tomates-moutarde & salade", "🍅", "Française", "main", 35,
  { puff_pastry: 115, fresh_tomato: 200, mustard: 15, grated_cheese: 30, egg: 1, lettuce: 0.25, provence_herbs: 1 },
  ["Étaler la pâte, piquer à la fourchette, badigeonner de moutarde.", "Fromage, tomates en rondelles fines, herbes, sel.", "Four 200 °C 25 minutes. Servir avec un œuf mollet (6 minutes) et la salade."], { veg: true });
r("bowl_lentilles_carottes", "Bowl lentilles, carottes rôties & œuf mollet", "🥕", "Française", "main", 35,
  { lentil: 70, carrot: 150, egg: 2, yogurt: 50, curry_powder: 2, lemon: 10, oil: 10, lettuce: 0.15 },
  ["Carottes en bâtonnets, huile, curry, sel : 20 minutes à l’air fryer à 190 °C.", "Lentilles 20 minutes dans l’eau frémissante, saler en fin de cuisson.", "Œufs mollets : 6 minutes 30 dans l’eau bouillante puis eau froide.", "Sauce : yaourt, citron, sel. Assembler sur la salade."], { veg: true });
r("poulet_moutarde_puree", "Poulet crème-moutarde, purée & haricots verts", "🍗", "Française", "main", 35,
  { chicken: 150, mustard: 15, cream: 40, green_beans: 150, potato: 250, milk: 50, butter: 8 },
  ["Purée : pommes de terre en morceaux 20 minutes à l’eau salée, écraser avec lait chaud et beurre.", "Poulet en aiguillettes doré 6 minutes, ajouter crème et moutarde, 3 minutes à feu doux.", "Haricots verts 8 minutes à l’eau bouillante salée."]);
r("veloute_carotte_coco", "Velouté carotte-coco & pois chiches croustillants", "🥕", "Française", "main", 30,
  { carrot: 250, onion: 50, coconut_milk: 60, ginger: 5, curry_powder: 2, chickpea: 120, bread: 50, oil: 5 },
  ["Soup maker : carottes et oignon en morceaux, gingembre, curry, lait de coco, sel, 300 ml d’eau par personne, programme velouté.", "Pois chiches séchés + huile + sel : 12 minutes à l’air fryer à 200 °C.", "Servir le velouté parsemé de pois chiches, avec le pain."], { veg: true });

// ─── Maghrébines maison ───────────────────────────────────────────────────
r("harira", "Harira (soupe tomate, lentilles & pois chiches)", "🍲", "Maghrébine", "main", 40,
  { lentil: 40, chickpea: 80, tomato: 200, onion: 60, chicken: 60, herbs: 0.4, curry_powder: 2, cinnamon: 0.5, flour: 10, lemon: 15, oil: 8 },
  ["Faire revenir oignon et poulet en petits dés 5 minutes avec les épices.", "Ajouter tomates, lentilles rincées, pois chiches, la moitié des herbes hachées et 400 ml d’eau par personne. Cuire 25 minutes.", "Délayer la farine dans un peu d’eau froide, verser en remuant : la soupe devient veloutée en 3 minutes.", "Servir avec le reste des herbes et le citron."]);
r("tajine_poulet_citron", "Tajine de poulet citron & olives, semoule", "🫒", "Maghrébine", "main", 50,
  { chicken_thigh: 180, onion: 100, olives: 30, lemon: 30, garlic: 5, ginger: 4, curry_powder: 2, herbs: 0.3, oil: 10, couscous: 70 },
  ["Faire dorer le poulet dans l’huile, ajouter l’oignon émincé, ail, gingembre râpé, curry, sel.", "Ajouter 150 ml d’eau par personne, couvrir, feu doux 35 minutes.", "Ajouter olives, jus et quelques fines lamelles de citron, réduire 10 minutes à découvert.", "Semoule : même volume d’eau bouillante salée, couvrir 5 minutes, égrainer. Parsemer de coriandre."]);
r("kefta_tajine_oeufs", "Tajine de kefta à la tomate & œufs", "🍳", "Maghrébine", "main", 35,
  { chicken_mince: 120, onion: 60, tomato: 250, garlic: 5, paprika: 2, curry_powder: 1, herbs: 0.4, egg: 1, oil: 8, bread: 70 },
  ["Mélanger viande, la moitié des herbes hachées, paprika, sel ; former des petites boulettes de 2 cm.", "Sauce : oignon et ail fondus, tomates, curry, sel, 10 minutes.", "Déposer les boulettes, couvrir 12 minutes.", "Casser l’œuf au centre, couvrir 4 minutes jusqu’à ce que le blanc soit pris. Servir avec le pain."]);
r("pastilla_poulet", "Pastilla au poulet (version feuilletée)", "🥧", "Maghrébine", "batch", 80,
  { chicken_thigh: 700, onion: 300, nuts: 80, egg: 3, cinnamon: 4, sugar: 20, ginger: 6, herbs: 1, puff_pastry: 800, butter: 30 },
  ["Cuire le poulet 35 minutes à couvert avec les oignons émincés, gingembre, cannelle, sel et 200 ml d’eau, puis l’effilocher.", "Réduire le jus, y cuire les œufs battus en remuant (comme des œufs brouillés), ajouter les herbes hachées.", "Concasser les noix, les mélanger avec le sucre et 1 cuillère de cannelle.", "Plat : pâte, poulet, œufs, noix, pâte ; souder, badigeonner de beurre fondu. Four 190 °C 35 minutes.", "Congeler en parts ; réchauffer 15 minutes au four."],
  { freezer: true, portions: 6 });
r("batbouts", "Batbouts (petits pains marocains à la poêle)", "🫓", "Maghrébine", "batch", 90,
  { flour: 500, semolina: 100, yeast: 7, sugar: 10, oil: 20 },
  ["Robot (crochet) : farine, semoule, levure, sucre, 1 cuillère de sel, huile, 330 ml d’eau tiède. Pétrir 8 minutes, lever 1 h.", "Diviser en 12 boules, étaler à 5 mm, laisser reposer 15 minutes sous un torchon.", "Cuire à sec dans une poêle chaude, 2 minutes par face : ils gonflent.", "Congeler en sac ; 1 minute au grille-pain. À garnir comme une pita."],
  { veg: true, freezer: true, portions: 12, unit: "pains", meal: "snack" });
r("chorba_frik", "Chorba au poulet & vermicelles de riz", "🍜", "Maghrébine", "main", 40,
  { chicken: 100, tomato: 150, onion: 60, carrot: 60, chickpea: 60, rice_noodles: 30, herbs: 0.4, cinnamon: 0.5, paprika: 1, oil: 8 },
  ["Faire revenir poulet en dés, oignon et carotte en petits dés avec épices 5 minutes.", "Ajouter tomates, pois chiches, 400 ml d’eau par personne, sel. Cuire 25 minutes.", "Ajouter les vermicelles cassés 5 minutes et la coriandre hachée."]);

// ─── Snacks maison façon fast-food (versions maison) ──────────────────────
r("burger_poulet_croustillant", "Crispy chicken burger & frites air fryer", "🍔", "Américaine", "main", 35,
  { chicken: 150, panko: 30, egg: 0.5, paprika: 2, buns: 1, lettuce: 0.1, fresh_tomato: 50, cheese_slices: 20, mayonnaise: 15, frozen_fries: 150, oil: 8 },
  ["Couper le blanc en deux dans l’épaisseur, saler, paprika. Passer dans l’œuf battu puis dans le panko en appuyant.", "Air fryer 200 °C : frites 18 minutes, puis le poulet huilé au spray 10 minutes en retournant à mi-cuisson (même panier si la place le permet).", "Sauce : mayonnaise + une pincée de paprika.", "Toaster les pains 1 minute, monter : sauce, salade, poulet, cheddar (qui fond sur le poulet chaud), tomate."]);
r("loaded_fries", "Loaded fries poulet, cheddar & crème", "🍟", "Américaine", "main", 30,
  { frozen_fries: 200, chicken: 120, paprika: 2, garlic: 3, cheese_slices: 30, sour_cream: 40, spring_onion: 0.2, lettuce: 0.2, fresh_tomato: 80 },
  ["Frites 18 minutes à l’air fryer à 200 °C.", "Poulet en petits dés, paprika, ail, sel : 6 minutes à la poêle.", "Sur les frites : poulet et cheddar en morceaux, 2 minutes à l’air fryer pour faire fondre.", "Crème fraîche, oignon vert ciselé. Salade-tomate à côté pour l’équilibre."]);
r("cheese_naan_tikka", "Cheese naan & poulet tikka", "🫓", "Indienne", "main", 45,
  { flour: 100, yogurt: 90, baking_powder: 2, cream_cheese: 25, mozzarella: 30, chicken: 140, curry_powder: 4, garlic: 4, lemon: 10, cucumber: 80 },
  ["Poulet en cubes mariné avec 50 g de yaourt, curry, ail, citron, sel (15 minutes minimum), puis 12 minutes à l’air fryer à 200 °C.", "Pâte : farine, levure chimique, sel, reste du yaourt ; pétrir 2 minutes.", "Étaler en disque, garnir le centre de cream cheese et mozzarella, refermer, aplatir à 5 mm.", "Cuire 3 minutes par face à la poêle sèche couverte. Servir avec le concombre."]);
r("katsu_sando", "Katsu sando (sandwich poulet pané japonais)", "🥪", "Japonaise", "main", 30,
  { chicken: 150, panko: 30, egg: 0.5, sandwich_bread: 80, cabbage: 80, mayonnaise: 15, soy_sauce: 5, tomato_paste: 5, honey: 3 },
  ["Aplatir le blanc à 1,5 cm, saler, œuf puis panko. Air fryer 200 °C 10 minutes, huilé au spray.", "Sauce katsu : concentré de tomate, sauce soja, miel, une cuillère d’eau.", "Chou blanc émincé très fin (mandoline ou couteau) avec la mayonnaise.", "Pain de mie, chou, poulet nappé de sauce, pain. Presser 1 minute, couper en deux."]);
r("smash_burger_poulet", "Smash burger de poulet & salade de chou", "🍔", "Américaine", "main", 25,
  { chicken_mince: 140, buns: 1, cheese_slices: 20, onion: 30, pickles: 25, mustard: 8, mayonnaise: 10, cabbage: 100, carrot: 50, lemon: 10 },
  ["Coleslaw : chou et carotte râpés, mayonnaise, citron, sel.", "Diviser la viande en 2 boules. Poêle très chaude : écraser chaque boule à 5 mm avec une spatule, saler, 2 minutes ; retourner, cheddar dessus, 1 minute.", "Toaster les pains, moutarde, oignon en fines rondelles, pickles, les deux steaks.", "Servir avec le coleslaw."]);
