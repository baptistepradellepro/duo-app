const STORES = ["Lidl", "Kaufland", "Carrefour", "Auchan", "METRO"];
const STORE_ICON = { Lidl: "🟡", Kaufland: "🔴", Carrefour: "🔵", Auchan: "🟥", METRO: "🟦" };
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SLOTS = ["PETIT-DÉJEUNER", "DÉJEUNER", "DÎNER"];
const PR = window.PRICES || { updated: null, stores: {} };
const C = window.CATALOG.map((x) => ({ ...x }));
const by = Object.fromEntries(C.map((x) => [x.id, x]));
// Créateurs food à suivre : leurs recettes s'ajoutent via « + Ajouter une recette ».
const CREATORS = [
  ["louloukitchen", "Comfort food"],
  ["therese.lum", "Cuisine asiatique maison"],
  ["kurveyskitchen", "Recettes gourmandes"],
  ["aisletotokyo", "Japon & Asie"],
  ["martin.cuisto", "Cuisine du quotidien"],
  ["fitspau", "Recettes saines"],
  ["cedricgrolet", "Pâtisserie"],
];
let R = [],
  byR = {};
const KEY = "duo-kitchen-v2";
const initial = () => ({
  stock: {},
  custom: [],
  myPrices: {},
  lock: {},
  barcodes: {},
  freezer: {},
  myRecipes: [],
  history: [],
  creators: [],
  ratings: {},
  extras: [],
  freezerTarget: 8,
  prepDone: {},
  lastBatches: [],
  rateDate: null,
  profiles: [
    { name: "Personne 1", protein: 120, kcal: 2200 },
    { name: "Personne 2", protein: 100, kcal: 2000 },
  ],
  budgetEur: 70,
  rate: 5.1,
  cards: true,
  lidlMargin: 8,
  porkMax: 1,
  topupOn: true,
  topup: "protein_coffee",
  topupInBudget: true,
  topupMax: 7,
  morning: "none",
  juiceMl: 150,
  breakfastShare: 1.5,
  veg: false,
  exclude: [],
  plan: null,
  done: {},
  batchDone: {},
  checked: {},
  powder: 80,
  day: 0,
  setup: false,
  fixed: { chirashi: true, ramen: 3 },
  batches: ["poulet_entier", "pizzas", "brioche", "gateau_yaourt", "cinnamon_rolls"],
});
function migrate() {
  // Reprend le stock, les profils et les prix de la première version de l'app.
  const n = initial();
  try {
    const o = JSON.parse(localStorage.getItem("duo-kitchen-v1"));
    if (!o) return n;
    Object.assign(n, {
      stock: o.stock || {},
      custom: o.custom || [],
      profiles: o.profiles || n.profiles,
      exclude: o.exclude || [],
      powder: o.powder || 80,
      setup: !!o.setup,
    });
    for (const [id, p] of Object.entries(o.prices || {}))
      if (by[id]) n.myPrices[id] = { [by[id].store]: { price: p, pack: by[id].pack } };
    for (const [id, st] of Object.entries(o.stores || {})) n.lock[id] = st;
  } catch {}
  return n;
}
let s;
try {
  s = JSON.parse(localStorage.getItem(KEY));
} catch {
  s = null;
}
s = { ...initial(), ...(s || migrate()) };
let tab = "home",
  query = "",
  category = "all",
  cuisine = "all",
  offerCache = {};
for (const x of s.custom || []) {
  if (/^custom[0-9]+$/.test(x.id) && !by[x.id]) {
    x.must ??= [];
    x.not ??= [];
    C.push(x);
    by[x.id] = x;
  }
}
function loadRecipes() {
  for (const k of Object.keys(featCache)) delete featCache[k];
  const all = [...window.RECIPES, ...(s.myRecipes || [])].map(balance);
  // Recettes retirées : jamais proposées ni listées, mais un ancien menu qui les cite s'affiche encore.
  R = all.filter((r) => !r.retired);
  byR = Object.fromEntries(all.map((r) => [r.id, r]));
  // Un menu n'est jamais effacé : une recette introuvable (supprimée du carnet) devient une fiche à remplacer.
  const ids = [s.plan, ...(s.history || []).map((h) => h.plan)].filter(Boolean).flatMap((p) => p.days.flat());
  for (const id of ids) if (id && !byR[id]) byR[id] = { id, name: id.startsWith("missing:") ? `${id.slice(8)} (introuvable)` : "Recette introuvable", emoji: "❔", cuisine: "Maison", type: "main", time: 0, ingredients: {}, steps: ["Cette recette n’est plus dans le carnet. Touchez « Choisir » pour la remplacer."], veg: true, freezer: false, portions: 0, unit: "portions", meal: "main", fixed: null, retired: true, noPlan: true };
}

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    toast("Mémoire indisponible : exportez vos données.");
  }
};
const esc = (x) =>
  String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const norm = (x) =>
  String(x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// Budget de la période en € : celui choisi en composant, sinon la base hebdomadaire au prorata des jours.
const periodEur = (plan = s.plan) => plan?.budgetEur ?? (s.budgetEur * (plan?.days.length || 7)) / 7;
const budget = () => periodEur() * s.rate;
const eur = (ron) => money(ron / s.rate) + " €";
const qtyLabel = (q, unit) => `${Math.round(q * 100) / 100} ${unit}`;
const perUnit = (o, unit) =>
  unit === "pièce" ? `${money(o.price / o.pack)} RON/pièce` : `${money((o.price / o.pack) * 1000)} RON/${unit === "ml" ? "L" : "kg"}`;
const modal = () => document.getElementById("modal");

// ─── Prix : offres de chaque magasin et meilleur achat ────────────────────
function offers(id) {
  if (offerCache[id]) return offerCache[id];
  const x = by[id],
    list = [];
  for (const st of STORES) {
    const mine = s.myPrices[id]?.[st];
    if (mine && mine.price > 0) {
      list.push({ store: st, price: mine.price, pack: mine.pack || x.pack, name: x.name, source: "moi" });
      continue;
    }
    for (const o of PR.stores?.[st]?.[id] || [])
      list.push({
        store: st,
        price: s.cards && o.plus ? o.plus : o.price,
        pack: o.pack,
        name: o.name + (o.plus ? (s.cards ? " (prix carte fidélité)" : ` (${money(o.plus)} avec la carte)`) : ""),
        url: o.url,
        source: o.promo ? "promo" : "site",
      });
  }
  // L'estimation de départ ne sert que si aucun vrai prix n'est connu.
  if (!list.length && x.price > 0)
    list.push({ store: x.store, price: x.price, pack: x.pack, name: x.name, source: "estimation" });
  return (offerCache[id] = list);
}
function bestBuy(id, missing, store = s.lock[id]) {
  let list = offers(id);
  if (store) {
    const l = list.filter((o) => o.store === store);
    if (l.length) list = l;
  }
  const cheapest = (l) => {
    let best = null;
    for (const o of l) {
      const packs = Math.max(1, Math.ceil(missing / o.pack - 1e-9)),
        total = packs * o.price;
      if (!best || total < best.total - 1e-9 || (Math.abs(total - best.total) < 1e-9 && o.pack < best.pack))
        best = { ...o, packs, total };
    }
    return best;
  };
  let best = cheapest(list);
  // Lidl est le plus pratique : on y reste si l'écart de prix est faible.
  if (!store && best && best.store !== "Lidl") {
    const lidl = cheapest(list.filter((o) => o.store === "Lidl"));
    if (lidl && lidl.total <= best.total * (1 + s.lidlMargin / 100) + 0.5) best = lidl;
  }
  const x = by[id];
  return best || { store: "À définir", price: 0, pack: x.pack, packs: Math.ceil(missing / x.pack), total: 0, name: x.name, source: "inconnu" };
}
const unitPrice = (id) => Math.min(Infinity, ...offers(id).map((o) => o.price / o.pack)) || 0;
const sourceLabel = { moi: "mon prix", site: "prix en ligne", promo: "prix de la semaine", estimation: "estimation", inconnu: "prix inconnu" };
// Viande que les préparations cochées (poulet entier désossé) vont ajouter au placard.
function pendingYield(id) {
  return s.batches.reduce((a, b) => a + (!s.batchDone[b] && byR[b]?.yields?.[id] ? byR[b].yields[id] : 0), 0);
}
const avail = (id) => (s.stock[id] || 0) + pendingYield(id);
// Fait maison, jamais sur la liste de courses.
const HOMEMADE = new Set(["broth"]);

// ─── Recettes et planning ─────────────────────────────────────────────────
function macro(r) {
  const v = Object.entries(r.ingredients).reduce(
    (v, [id, q]) => {
      const x = by[id];
      if (!x) return v;
      const f = (q - (r.discard?.[id] || 0)) / (x.unit === "pièce" ? 1 : 100);
      v.kcal += x.kcal * f;
      v.protein += x.protein * f;
      v.fiber += (x.fiber || 0) * f;
      return v;
    },
    { kcal: 0, protein: 0, fiber: 0 },
  );
  if (isTotal(r)) {
    v.kcal /= r.portions || 1;
    v.protein /= r.portions || 1;
    v.fiber /= r.portions || 1;
  }
  // Accompagnement d'un plat du congélateur, par personne.
  for (const [id, q] of Object.entries(r.serve || {})) {
    const x = by[id];
    if (!x) continue;
    const f = q / (x.unit === "pièce" ? 1 : 100);
    v.kcal += x.kcal * f;
    v.protein += x.protein * f;
    v.fiber += (x.fiber || 0) * f;
  }
  return v;
}
// Le matin : un verre de jus d'orange ou une orange entière par personne (réglage de Ma semaine).
function morningItem() {
  if (s.morning === "juice") return { id: "orange_juice", qty: s.juiceMl, label: `verre de jus d’orange (${s.juiceMl} ml)` };
  if (s.morning === "orange") return { id: "orange", qty: window.PIECE_G?.orange || 180, label: "orange entière" };
  return null;
}
function morningMacro() {
  const m = morningItem(),
    x = m && by[m.id],
    v = x ? { kcal: (x.kcal * m.qty) / 100, protein: (x.protein * m.qty) / 100, fiber: ((x.fiber || 0) * m.qty) / 100 } : { kcal: 0, protein: 0, fiber: 0 },
    c = by.protein_coffee;
  // Café protéiné du matin : une personne sur deux, soit un demi-café par personne en moyenne.
  if (s.topupOn && s.topup === "protein_coffee" && c && +s.topupMax > 0) {
    v.kcal += c.kcal / 2;
    v.protein += c.protein / 2;
  }
  return v;
}
// Fournées et sauces : quantités pour la recette entière ; les autres recettes : par personne.
const isTotal = (r) => r.type === "batch" || r.type === "sauce";
const factor = (r) => (isTotal(r) ? 1 : 2);
function slot(i, j, plan = s.plan) {
  const key = i + "-" + j,
    fz = plan.freezerUse?.[key];
  return { key, fz: !!fz, r: byR[fz || plan.days[i][j]] };
}
function demands(plan = s.plan, top = false) {
  const d = {};
  const add = (r, f, ings = r.ingredients) => Object.entries(ings).forEach(([id, q]) => by[id] && (d[id] = (d[id] || 0) + q * f));
  if (plan) {
    plan.days.forEach((day, i) =>
      day.forEach((_, j) => {
        const { key, fz, r } = slot(i, j, plan);
        if (s.done[key] || !r) return;
        if (!fz && r.type !== "batch") add(r, 2);
        else if (r.serve) add(r, 2, r.serve);
      }),
    );
    for (const b of s.batches) if (byR[b] && !s.batchDone[b]) add(byR[b], 1);
    const mi = morningItem();
    if (mi && by[mi.id]) {
      const mornings = plan.days.filter((_, i) => !s.done[i + "-0"]).length;
      d[mi.id] = (d[mi.id] || 0) + mi.qty * 2 * mornings;
    }
    const q = top ? topupQty(plan) : 0;
    if (q) d[s.topup] = (d[s.topup] || 0) + q;
  }
  return d;
}
// Détail du besoin d'un aliment, recette par recette, pour comprendre chaque ligne de courses.
function needFor(id, plan = s.plan) {
  const out = {},
    add = (label, q) => q > 0 && (out[label] = (out[label] || 0) + q);
  plan.days.forEach((day, i) =>
    day.forEach((_, j) => {
      const { key, fz, r } = slot(i, j, plan);
      if (s.done[key] || !r) return;
      if (!fz && r.type !== "batch") add(r.name, (r.ingredients[id] || 0) * 2);
      else add(r.name + " (accompagnement)", (r.serve?.[id] || 0) * 2);
    }),
  );
  for (const b of s.batches) if (byR[b] && !s.batchDone[b]) add(byR[b].name + " (batch du dimanche)", byR[b].ingredients[id] || 0);
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}
// top : inclure les compléments protéinés (toujours dans la liste de courses, dans le budget seulement si demandé).
function basket(plan = s.plan, top = true) {
  return Object.entries(demands(plan, top))
    .filter(([id]) => !HOMEMADE.has(id))
    .map(([id, need]) => {
      const have = avail(id),
        missing = Math.max(0, need - have),
        // Il en reste presque assez : on s'adapte plutôt que racheter un paquet entier pour quelques grammes.
        tiny = have > 0 && (by[id]?.unit === "pièce" ? missing < 0.5 : missing <= Math.max(15, need * 0.08));
      return missing > 1e-9 && !tiny ? { id, need, have, missing, ...bestBuy(id, missing) } : null;
    })
    .filter(Boolean);
}
const cost = (plan, top = s.topupInBudget) => basket(plan, top).reduce((a, b) => a + b.total, 0);
// Coût de ce qui est vraiment mangé : les restes de paquets restent au placard pour les semaines suivantes.
const used = (plan, top = s.topupInBudget) => basket(plan, top).reduce((a, b) => a + Math.min(b.total, (b.missing / b.pack) * b.price), 0);
// Protéines qui manquent sur la semaine (deux profils additionnés) et compléments pour les combler.
function dayProtein(plan, i) {
  return plan.days[i].reduce((a, _, j) => a + macro(slot(i, j, plan).r).protein, 0);
}
function proteinGap(plan = s.plan) {
  if (!plan) return 0;
  return plan.days.reduce((a, _, i) => a + s.profiles.reduce((v, p) => v + Math.max(0, p.protein - dayProtein(plan, i)), 0), 0);
}
function topupQty(plan = s.plan) {
  const x = by[s.topup];
  if (!s.topupOn || !x || !x.protein) return 0;
  // Plafond hebdomadaire (7 cafés protéinés par défaut) ; pour un produit au poids, plafond en portions de 100 g.
  const max = Math.round((Math.max(0, +s.topupMax || 0) * (plan?.days.length || 7)) / 7);
  // Le café protéiné est pris chaque matin, quoi qu'apportent les repas.
  if (s.topup === "protein_coffee") return max;
  const gap = proteinGap(plan);
  return x.unit === "pièce" ? Math.min(max, Math.ceil(gap / x.protein)) : Math.min(max * 100, Math.ceil((gap / x.protein) * 100));
}
const topupCost = () => {
  const q = topupQty(),
    x = s.topup;
  if (!q) return 0;
  const missing = Math.max(0, q - (s.stock[x] || 0));
  return missing ? bestBuy(x, missing).total : 0;
};
// Bœuf et canard : achetés rarement, cuisinés seulement s'il y en a au placard ou au congélateur.
const RARE = ["beef_stew", "beef_mince", "duck"];
const allowed = (r) =>
  !r.retired &&
  (!s.veg || r.veg) &&
  !Object.keys(r.ingredients).some((id) => s.exclude.includes(id)) &&
  RARE.every((id) => !r.ingredients[id] || avail(id) >= r.ingredients[id] * factor(r)) &&
  s.ratings[r.id] !== -1;
// Goûts appris des notes : 1 = j'aime, 0 = moyen, -1 = j'aime pas.
// Une recette non notée hérite de la moyenne de sa cuisine et de ses ingrédients principaux.
function taste(r) {
  const own = s.ratings[r.id];
  if (own !== undefined) return own;
  const rated = Object.entries(s.ratings).map(([id, v]) => [byR[id], v]).filter(([x]) => x);
  if (!rated.length) return 0;
  const avg = (list) => (list.length ? list.reduce((a, [, v]) => a + v, 0) / list.length : 0);
  const main = Object.keys(r.ingredients).filter((id) => !["oil", "oil_sun", "garlic", "onion", "soy_sauce", "stock_cube"].includes(id)).slice(0, 3);
  return 0.5 * avg(rated.filter(([x]) => x.cuisine === r.cuisine)) + 0.5 * avg(rated.filter(([x]) => main.some((id) => x.ingredients[id])));
}
const hasPork = (r) => !!r.ingredients.pork_mince;
function fixedFor(i, j, start = planStart()) {
  if (j !== 2) return null;
  const wd = weekdayOf(isoAdd(start, i));
  if (wd === 1 && s.fixed.chirashi) return "chirashi";
  if (wd === +s.fixed.ramen) return "ramen";
  return null;
}
// Lundi de la semaine planifiée : demain si on est dimanche, sinon lundi de cette semaine.
function weekStartISO(d = new Date()) {
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() + (m.getDay() === 0 ? 1 : 1 - m.getDay()));
  return m.toISOString().slice(0, 10);
}
// Dates du planning : le jour 0 est plan.weekStart (aujourd'hui, ou le lundi d'une semaine pleine).
const isoAdd = (iso, n) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const todayISO = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};
const weekdayOf = (iso) => (new Date(iso + "T12:00:00").getDay() + 6) % 7; // 0 = lundi
const planStart = () => s.plan?.weekStart || weekStartISO();
const nDays = () => s.plan?.days.length || 7;
const dayName = (i) => DAYS[weekdayOf(isoAdd(planStart(), i))];
const dayDate = (i) => new Date(isoAdd(planStart(), i) + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" });
// Poids des fibres dans le choix des menus : classement des plats et écart au repère de 30 g par personne et par jour.
const FIBER_WEIGHT = 1.5,
  FIBER_PICK = 1.5;
// ─── Équilibre des menus : base, protéine et légumes de chaque plat ───
const BASES = { riz: "rice|sushi_rice", "pâtes": "pasta|vermicelli|noodles|rice_noodles|gnocchi", "pommes de terre": "potato|sweet_potato|frozen_fries", pain: "bread|baguette|tortilla|pita|buns|sandwich_bread|puff_pastry|rice_paper", "céréales": "couscous|bulgur|semolina|buckwheat|polenta", "légumineuses": "lentil|beans|chickpea" };
const PROTEINS = { volaille: "chicken|chicken_thigh|whole_chicken|chicken_mince|turkey|ham|bacon", "bœuf": "beef_stew|beef_mince", porc: "pork_mince", poisson: "salmon|tuna", canard: "duck", "œufs": "egg", "légumineuses": "lentil|beans|chickpea", tofu: "tofu", fromage: "cheese|cottage|telemea|mozzarella|grated_cheese|cheese_slices|cream_cheese" };
// Quantité à partir de laquelle une source compte (g par personne) : un œuf de panure ne compte pas, deux œufs oui.
const PROTEIN_MIN = { "œufs": 55, "légumineuses": 60, fromage: 40 };
const VEG = new Set([...Object.entries(window.GROUP_OF).filter(([, place]) => /^(Légumes|Surgelés)/.test(place) && !/Frites|Fruits/.test(place)).map(([id]) => id), "tomato", "passata", "sauerkraut", "corn"]);
// Grammes par personne (les fournées et sauces sont rapportées à une portion).
const grams = (r, id) => ((r.ingredients[id] || 0) / (isTotal(r) ? r.portions || 1 : 1) + (r.serve?.[id] || 0)) * (by[id]?.unit === "pièce" ? window.PIECE_G?.[id] || 60 : 1);
const featCache = {};
// Forme du plat, lue dans son nom : deux plats de même forme le même jour se ressemblent trop (deux farcis, deux soupes…).
const FORMS = [
  ["farci", /farci|gemista|dolma/],
  ["soupe", /soupe|veloute|chorba|harira|ramen|pho\b|fasolada|bortsch|borscht|bouillon|minestrone|potage|tom kha/],
  ["gratin", /gratin|moussaka|pastitsio|lasagne|hachis|parmentier|tian/],
  ["sandwich", /wrap|tacos|burrito|pita|kebab|souvlaki|gyros|sandwich|burger|sando|quesadilla|croque|panini|naan|flatbread|manakich/],
  ["curry", /curry|dal\b|tikka|butter chicken|massaman|korma/],
  ["salade", /salade|fattouche|taboule|poke/],
  ["tarte", /pizza|tarte|quiche|clafoutis|tourte|spanakopita|pastilla/],
  ["oeufs", /omelette|shakshuka|frittata|oeufs? (brouilles|au plat|cocotte)/],
  ["boulettes", /boulette|keftedes|kafta|falafel|nuggets|meatball|kefta/],
  ["wok", /wok|saute|kra pao|riz cantonais|riz frit|nouilles sautees/],
  ["bowl", /bowl|buddha/],
  ["raviolis", /gyoza|nems|pelmeni|raviol|dumpling/],
];
const formOf = (r) => FORMS.find(([, re]) => re.test(norm(r.name)))?.[0] || null;
function features(r) {
  if (featCache[r.id]) return featCache[r.id];
  const amount = (ids) => ids.split("|").reduce((a, id) => a + grams(r, id), 0);
  const top = (groups) => {
    let best = null,
      max = 40;
    for (const [k, ids] of Object.entries(groups)) if (amount(ids) >= max) [best, max] = [k, amount(ids)];
    return best;
  };
  // Tous les glucides et toutes les protéines du plat, pas seulement le principal.
  const starches = new Set(Object.entries(BASES).filter(([, ids]) => amount(ids) >= 30).map(([k]) => k));
  const proteins = new Set(Object.entries(PROTEINS).filter(([k, ids]) => amount(ids) >= (PROTEIN_MIN[k] || 40)).map(([k]) => k));
  const base = top(BASES) || "autre",
    protein = top(PROTEINS) || "léger";
  const vegIds = [...new Set([...Object.keys(r.ingredients), ...Object.keys(r.serve || {})])].filter((id) => VEG.has(id)),
    // Légume vedette : celui qui pèse le plus, s'il fait au moins 120 g par personne (poivrons farcis, ratatouille…).
    star = vegIds.reduce((a, id) => (grams(r, id) >= 120 && (!a || grams(r, id) > grams(r, a)) ? id : a), null);
  return (featCache[r.id] = { base, starches, protein, proteins, family: `${base}/${protein}`, form: formOf(r), star, veg: vegIds.reduce((a, id) => a + grams(r, id), 0) });
}
// Deux plats trop proches : un glucide en commun (riz et riz), une protéine en commun (œufs et œufs),
// la même forme (deux farcis, deux soupes) ou le même légume vedette (poivrons et poivrons).
function tooClose(a, b) {
  if (!a || !b) return false;
  const x = features(a),
    y = features(b);
  return [...x.starches].some((k) => y.starches.has(k)) || [...x.proteins].some((k) => y.proteins.has(k)) || (!!x.form && x.form === y.form) || (!!x.star && x.star === y.star);
}
// Même journée : petit-déjeuner, midi et soir sans glucide ni protéine en commun.
function dayOk(days, i, j, r) {
  return days[i].every((id, k) => k === j || !tooClose(r, byR[id]));
}
// Une recette à cette place : règle de la journée, et pas le même glucide que le repas d'avant ou d'après.
function slotOk(days, i, j, r) {
  if (!dayOk(days, i, j, r)) return false;
  if (j === 0) return true;
  const prev = byR[j === 2 ? days[i][1] : days[i - 1]?.[2]],
    next = byR[j === 1 ? days[i][2] : days[i + 1]?.[1]],
    f = features(r),
    sameBase = (x) => x && [...f.starches].some((k) => features(x).starches.has(k));
  return !sameBase(prev) && !sameBase(next);
}
// ─── Repas équilibrés ─────────────────────────────────────────────────────
// Un plat du menu doit être un vrai repas du quotidien (par personne) : assez de légumes, de protéines
// et d'énergie, sans excès. Sinon on ajoute un accompagnement simple, adapté à la cuisine du plat.
const MEAL = { kcalMin: 600, kcalMax: 1000, protein: 30, veg: 120 };
// Plats de fête, entrées, apéritifs et desserts : gardés dans le carnet, jamais proposés comme repas.
const NOT_A_MEAL = /\b(foie gras|caviar|truffe|homard|langouste|huitres?|saint jacques|verrines?|amuse bouche|aperitif|apero|canapes?|entree|dessert|buche|tiramisu|mousse au chocolat|fondant au chocolat|gateau|brownies?|cookies?|creme brulee|panna cotta|cocktail|smoothie|biscuits?|muffins?)\b/;
// Préparations de base (pâte à pizza, sauce, bouillon, pain…) : des ingrédients d'une recette, pas un repas.
const COMPONENT = /^\s*(pate (a|de|brisee|feuilletee|sablee)|pates? maison|sauce|bouillon|fond|vinaigrette|marinade|pain|base|glacage|coulis|pesto|levain|garniture|farce|bechamel|mayonnaise|ketchup|confiture)\b/;
const SIDE_ASIA = /Japonaise|Chinoise|Coréenne|Thaïlandaise|Vietnamienne/,
  SIDE_SALAD = /Indienne|Maghrébine|Libanaise|Grecque|Méditerranéenne|Turque/,
  SIDE_BEANS = /Française|Basiques|Russe|Maison/;
const round5 = (q) => Math.max(5, Math.round(q / 5) * 5);
function balance(r) {
  if (r.manual) return { ...r, noPlan: true };
  if (r.fixed || !(r.type === "main" || (r.type === "batch" && r.meal === "main"))) return r;
  const out = { ...r, ingredients: { ...r.ingredients }, steps: [...r.steps] };
  if (NOT_A_MEAL.test(" " + norm(r.name) + " ") || COMPONENT.test(norm(r.name))) return { ...out, noPlan: true };
  const batch = r.type === "batch",
    // Accompagnement : ajouté aux ingrédients d'un plat, servi à part pour un plat du congélateur.
    side = batch ? (out.serve = {}) : out.ingredients,
    notes = [],
    look = () => {
      delete featCache[out.id];
      const f = features(out),
        m = macro(out);
      delete featCache[out.id];
      return { f, m };
    },
    add = (ings, text) => {
      for (const [id, q] of Object.entries(ings)) if (by[id] && q > 0) side[id] = (side[id] || 0) + q;
      notes.push(text);
    };
  let { f, m } = look();
  // Ni protéine ni légumes (une pâte, un féculent nature, une douceur) : ce n'est pas un repas, on ne le rafistole pas.
  // Protéines : une source reconnue, ou au moins 4 g pour 100 kcal (jambon-fromage d'un croque, par exemple).
  if (!f.proteins.size && m.protein < m.kcal * 0.04 && f.veg < 80) return { ...out, noPlan: true };
  if (f.veg < MEAL.veg) {
    const q = Math.min(200, Math.max(100, round5(150 - f.veg)));
    if (SIDE_ASIA.test(r.cuisine)) add({ broccoli: q }, `${q} g de brocolis vapeur par personne (8 minutes à la vapeur, ou 4 minutes au micro-ondes couverts avec un fond d’eau), un trait de sauce soja`);
    else if (SIDE_SALAD.test(r.cuisine)) add({ cucumber: round5(q / 2), fresh_tomato: round5(q / 2), lemon: 5 }, `une salade concombre-tomate au citron (${q} g par personne)`);
    else if (SIDE_BEANS.test(r.cuisine)) add({ green_beans: q }, `${q} g de haricots verts par personne (8 minutes à l’eau bouillante salée)`);
    else add({ lettuce: 0.2, fresh_tomato: round5(Math.max(60, q - 50)) }, "une salade verte et des tomates, vinaigrette légère");
    ({ f, m } = look());
  }
  if (!f.proteins.size) {
    add({ egg: 2 }, "2 œufs au plat ou mollets par personne (6 minutes 30 dans l’eau bouillante)");
    ({ f, m } = look());
  } else if (m.protein < MEAL.protein) {
    const q = Math.min(200, Math.max(100, Math.ceil((MEAL.protein - m.protein) / 0.1 / 50) * 50));
    add({ yogurt: q }, `en dessert, ${q} g de yaourt protéiné nature par personne`);
    ({ f, m } = look());
  }
  if (m.kcal < MEAL.kcalMin && !f.starches.size) {
    const g = Math.min(100, Math.max(50, round5((MEAL.kcalMin - m.kcal) / 3.5)));
    if (/Italienne/.test(r.cuisine)) add({ pasta: g }, `${g} g de pâtes par personne`);
    else if (SIDE_ASIA.test(r.cuisine) || /Indienne|Tex-Mex/.test(r.cuisine)) add({ rice: g }, `${g} g de riz cru par personne (rice cooker)`);
    else if (/Maghrébine/.test(r.cuisine)) add({ couscous: g }, `${g} g de semoule par personne`);
    else if (/Libanaise|Grecque|Méditerranéenne|Turque/.test(r.cuisine)) add({ pita: 1 }, "une pita par personne");
    else if (/Russe/.test(r.cuisine)) add({ potato: round5(g * 3.5) }, `${round5(g * 3.5)} g de pommes de terre vapeur par personne`);
    else add({ bread: round5(g * 1.3) }, `${round5(g * 1.3)} g de pain complet par personne`);
    ({ f, m } = look());
  }
  if (batch) {
    // Une portion = une personne : on recoupe la fournée pour que chaque part, accompagnement compris, fasse un vrai repas.
    const total = macro({ ...r, portions: 1 }).kcal,
      sideKcal = m.kcal - total / r.portions;
    if (m.kcal > MEAL.kcalMax || m.kcal < MEAL.kcalMin) out.portions = Math.max(1, Math.round(total / Math.max(250, 750 - sideKcal)));
    if (out.portions !== r.portions) out.steps.push(`Cette fournée fait ${out.portions} parts d’un repas complet (une part par personne).`);
  } else if (m.kcal > MEAL.kcalMax || m.kcal < MEAL.kcalMin) {
    // Plat trop léger ou trop copieux : on ajuste ses quantités (pas celles de l'accompagnement).
    const k = Math.min(1.5, Math.max(0.6, (m.kcal > MEAL.kcalMax ? 900 : 650) / m.kcal));
    for (const [id, q] of Object.entries(r.ingredients)) out.ingredients[id] = (out.ingredients[id] - q) + (by[id]?.unit === "pièce" ? Math.max(0.25, Math.round(q * k * 4) / 4) : round5(q * k));
  }
  if (notes.length) out.steps.push((batch ? "Au moment de servir, ajouter " : "Pour un repas complet, servir avec ") + notes.join(" ; ") + ".");
  if (batch && !Object.keys(out.serve).length) delete out.serve;
  return out;
}
loadRecipes();
// opts : { start: "AAAA-MM-JJ", days: nombre de jours, budgetEur: budget de la période }.
function generate(auto = false, opts = {}) {
  offerCache = {};
  const start = opts.start || weekStartISO(),
    N = Math.max(1, opts.days || 7),
    periodBudget = opts.budgetEur ?? Math.round((s.budgetEur * N) / 7);
  if (!auto && s.plan && (s.shopped || Object.keys(s.done).length) && !confirm(`${s.shopped ? "Les courses de ce menu sont faites." : "Des repas de ce menu sont déjà cuisinés."} Le remplacer ? (Il reste récupérable dans « Menus précédents ».)`)) return;
  keepHistory();
  // Le batch cooking se fait le dimanche : ses plats arrivent au menu à partir du lundi qui suit.
  // Période commencée en milieu de semaine : jusque-là, cuisine au jour le jour et congélateur.
  const batchFrom = (7 - weekdayOf(start)) % 7,
    batchDays = N - batchFrom;
  s.lastBatches = s.batches;
  const chosen = batchDays > 0 ? autoBatches(batchDays, batchFrom, !!opts.pantryFirst) : [],
    isMeal = (id) => byR[id]?.type === "batch" && byR[id].meal === "main" && byR[id].freezer,
    // Au-delà des plats servis au menu, les fournées pour remplir le congélateur attendent de voir s'il reste du budget.
    extras = chosen.filter(isMeal).slice(menuBatchCount(batchDays));
  s.batches = chosen.filter((id) => !extras.includes(id));
  const pantry = !!opts.pantryFirst;
  s.batchDone = {};
  s.prepDone = {};
  // Cinnamon rolls : ceux du congélateur d'abord, ceux du dimanche à partir du lundi, puis petits-déjeuners simples.
  const bake = MORNING_BAKES.find((id) => byR[id] && (s.batches.includes(id) || (s.freezer[id] || 0) > 0)),
    rolls = Array.from({ length: N }, () => false),
    bakes = bake ? [bake] : [],
    // Plats préparés le dimanche : servis au menu de la semaine (deux fois sur une longue période).
    menuBatches = s.batches.filter((id) => byR[id]?.type === "batch" && byR[id].meal === "main" && byR[id].freezer),
    mains = R.filter((r) => r.type === "main" && !r.fixed && !r.noPlan && allowed(r));
  if (bake) {
    let frozen = s.freezer[bake] || 0,
      fresh = s.batches.includes(bake) ? byR[bake].portions : 0;
    for (let i = 0; i < N; i++) {
      if (i >= batchFrom) [frozen, fresh] = [frozen + fresh, 0];
      if (frozen + 1e-9 >= s.breakfastShare) [rolls[i], frozen] = [true, frozen - s.breakfastShare];
    }
  }
  if (!mains.length) {
    toast("Vos exclusions ne permettent pas de composer les repas. Ajustez-les.");
    return;
  }
  s.done = {};
  s.checked = {};
  // Courses déjà faites : le menu se compose avec le placard, la liste ne garde que ce qui manque encore.
  s.shopped = !!opts.pantryFirst;
  // Classement des plats : ce qu'ils obligent à acheter, puis les goûts et les fibres.
  const tastes = Object.fromEntries(R.map((r) => [r.id, taste(r)])),
    fiberOf = Object.fromEntries(R.map((r) => [r.id, macro(r).fiber])),
    // Paquet le moins cher de chaque ingrédient (taille et prix), pour compter les paquets entiers à acheter.
    packOf = Object.fromEntries(
      C.map((x) => {
        const o = bestBuy(x.id, x.pack);
        return [x.id, o?.pack > 0 && o.price > 0 ? { pack: o.pack, price: o.price } : { pack: x.pack || 1, price: x.price || 0 }];
      }),
    );
  let best = null,
    bestScore = Infinity,
    cheapest = null,
    low = Infinity;
  for (let t = 0; t < 400; t++) {
    const picked = {};
    let pork = 0;
    // Ce qui reste des paquets achetés pour la période : un plat qui réutilise un paquet entamé ne coûte presque rien,
    // un plat qui oblige à acheter un paquet entier pour une cuillère coûte le paquet.
    const left = {},
      have = (id) => (left[id] ??= avail(id)),
      extra = (ings, f) =>
        Object.entries(ings).reduce((a, [id, q]) => {
          const short = q * f - (packOf[id] ? have(id) : q * f);
          return short > 1e-9 ? a + Math.ceil(short / packOf[id].pack - 1e-9) * packOf[id].price : a;
        }, 0),
      take = (ings, f) => {
        for (const [id, q] of Object.entries(ings)) {
          if (!packOf[id]) continue;
          const short = q * f - have(id);
          if (short > 1e-9) left[id] += Math.ceil(short / packOf[id].pack - 1e-9) * packOf[id].pack;
          left[id] -= q * f;
        }
      },
      dish = (r) => (r.type === "batch" ? r.serve || {} : r.ingredients);
    for (const id of s.batches) if (byR[id]) take(byR[id].ingredients, 1);
    const pick = (arr, fits = () => true, dayFits = () => true) => {
      const pool = arr
        .map((r) => [r, extra(dish(r), 2) - tastes[r.id] * 6 - fiberOf[r.id] * FIBER_PICK])
        .sort((a, b) => a[1] - b[1])
        .map(([r]) => r);
      const free = (r) => (picked[r.id] || 0) < (r.type === "main" ? 1 : 3) && (!hasPork(r) || pork < s.porkMax);
      let cand = pool.filter((r) => free(r) && fits(r));
      if (!cand.length) cand = pool.filter((r) => free(r) && dayFits(r));
      if (!cand.length) cand = pool.filter((r) => dayFits(r));
      if (!cand.length) cand = pool.filter(free);
      if (!cand.length) cand = pool.filter((r) => !hasPork(r));
      if (!cand.length) cand = pool;
      const r = t === 0 ? cand[0] : cand[Math.floor(Math.pow(Math.random(), 2) * cand.length)];
      take(dish(r), 2);
      picked[r.id] = (picked[r.id] || 0) + 1;
      if (hasPork(r)) pork++;
      return r.id;
    };
    // Plats fixes d'abord (chirashi, ramen), puis chaque midi et soir en respectant l'équilibre.
    // Le matin : cinnamon rolls seulement ; sans rolls, juste le café protéiné.
    const days = Array.from({ length: N }, (_, i) => [rolls[i] ? bake : "matin_cafe", null, fixedFor(i, 2, start)]);
    days.forEach((d) => d[2] && take(byR[d[2]].ingredients, 2));
    const bases = {},
      prots = {},
      families = {},
      forms = {};
    const note = (id) => {
      const f = features(byR[id]);
      bases[f.base] = (bases[f.base] || 0) + 1;
      prots[f.protein] = (prots[f.protein] || 0) + 1;
      families[f.family] = (families[f.family] || 0) + 1;
      if (f.form) forms[f.form] = (forms[f.form] || 0) + 1;
    };
    days.forEach((d) => d[2] && note(d[2]));
    for (const id of menuBatches) {
      const times = Math.min(Math.floor(byR[id].portions / 2), batchDays >= 10 ? 2 : 1);
      for (let k = 0; k < times; k++) {
        const free = [];
        for (let i = batchFrom; i < N; i++) for (const j of [1, 2]) if (!days[i][j] && slotOk(days, i, j, byR[id])) free.push([i, j]);
        if (!free.length) break;
        const [i, j] = free[Math.floor(Math.random() * free.length)];
        days[i][j] = id;
        take(dish(byR[id]), 2);
        picked[id] = (picked[id] || 0) + 1;
        if (hasPork(byR[id])) pork++;
        note(id);
      }
    }
    const weekOk = (r) => {
      const f = features(r);
      // Une même famille (riz + poulet, pâtes + œufs…) une seule fois par semaine, une même forme (soupe, gratin…) deux fois.
      return (!f.form || (forms[f.form] || 0) < 2) && (bases[f.base] || 0) < (f.base === "autre" ? 6 : 4) && (prots[f.protein] || 0) < (f.protein === "volaille" ? 5 : 3) && (f.family.includes("autre") || f.family.includes("léger") || !families[f.family]);
    };
    for (let i = 0; i < N; i++)
      for (const j of [1, 2]) {
        if (days[i][j]) continue;
        const id = pick(mains, (r) => slotOk(days, i, j, r) && weekOk(r), (r) => dayOk(days, i, j, r));
        days[i][j] = id;
        note(id);
      }
    const p = {
      days,
      freezerUse: {},
      created: new Date().toISOString(),
      weekStart: start,
      budgetEur: periodBudget,
      batchFrom,
    };
    const c = cost(p),
      u = used(p);
    if (c < low) {
      low = c;
      cheapest = p;
    }
    const diversity = new Set(p.days.flat()).size,
      cuisines = new Set(p.days.flat().map((id) => byR[id].cuisine)).size,
      target = s.profiles.reduce((a, b) => a + Number(b.kcal), 0) / 2,
      dayMacro = (d) => d.reduce((x, id) => ({ kcal: x.kcal + macro(byR[id]).kcal, protein: x.protein + macro(byR[id]).protein, fiber: x.fiber + macro(byR[id]).fiber }), { ...morningMacro() }),
      fiberGap = p.days.reduce((a, d) => a + Math.max(0, 30 - dayMacro(d).fiber), 0),
      avg = p.days.reduce((a, d) => a + dayMacro(d).kcal, 0) / N,
      protGap = p.days.reduce((a, d) => a + s.profiles.reduce((v, pr) => v + Math.max(0, pr.protein - dayMacro(d).protein), 0), 0) / N,
      liking = p.days.reduce((a, d) => a + d.slice(1).reduce((x, id) => x + tastes[id], 0), 0),
      // Au moins ~200 g de légumes par personne et par jour sur le midi et le soir.
      vegGap = p.days.reduce((a, d) => a + Math.max(0, 200 - d.slice(1).reduce((x, id) => x + features(byR[id]).veg, 0)), 0),
      clashes = p.days.reduce((a, d, i) => a + [[0, 1], [0, 2], [1, 2]].filter(([x, y]) => tooClose(byR[d[x]], byR[d[y]])).length + (i && [...features(byR[d[1]]).starches].some((b) => features(byR[p.days[i - 1][2]]).starches.has(b)) ? 1 : 0), 0),
      repeats = Object.values(p.days.flatMap((d) => d.slice(1)).reduce((a, id) => ((a[features(byR[id]).family] = (a[features(byR[id]).family] || 0) + 1), a), {})).reduce((a, n) => a + Math.max(0, n - 1), 0),
      score = c * (pantry ? 2 : 0.2) + u * 0.05 - diversity * 5 - cuisines * 4 - liking * 8 + Math.abs(avg - target) * 0.015 + protGap * 0.6 + vegGap * 0.05 + clashes * 25 + repeats * 6 + fiberGap * FIBER_WEIGHT;
    if ((pantry || c <= periodBudget * s.rate) && score < bestScore) {
      bestScore = score;
      best = p;
    }
  }
  s.plan = best || cheapest;
  // Fournées en plus pour le congélateur, tant que le ticket reste dans le budget.
  for (const id of extras) {
    // Courses déjà faites : une fournée en plus seulement si tout est déjà au placard.
    if (pantry && batchCost(byR[id]) > 0.01) continue;
    s.batches.push(id);
    if (cost(s.plan) > periodBudget * s.rate) s.batches.pop();
  }
  save();
  go("week");
  toast(pantry ? `Menu composé avec votre placard : ${cost(s.plan) > 0.5 ? `il manque encore ${eur(cost(s.plan))} de courses.` : "rien à racheter."}` : best ? (N === 7 ? "Votre semaine est prête !" : `Vos ${N} jours sont prêts !`) : `Budget trop serré : au mieux ${eur(cost(s.plan))} à payer pour ${money(periodBudget)} €. Augmentez le budget ou remplissez le placard.`);
}
// Menus précédents : les 6 derniers, avec leur état (cuisiné, courses faites, batch), pour revenir en arrière.
const HISTORY_KEYS = ["plan", "done", "checked", "shopped", "batches", "batchDone", "prepDone", "lastBatches"];
function keepHistory() {
  if (!s.plan) return;
  s.history = [{ savedAt: new Date().toISOString(), ...Object.fromEntries(HISTORY_KEYS.map((k) => [k, structuredClone(s[k])])) }, ...(s.history || [])].slice(0, 6);
}
function menuHistory() {
  const fmt = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "numeric" }),
    list = s.history || [];
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>↺ Menus précédents</h2><p class="muted">Le menu en cours est gardé ici quand vous en restaurez un autre.</p>${
    list.length
      ? `<div class="choice-list">${list
          .map((h, k) => {
            const p = h.plan,
              first = p.days[0].slice(1).map((id) => byR[id]?.name || "?").join(" / ");
            return `<div class="panel"><b>${fmt(p.weekStart)} → ${fmt(isoAdd(p.weekStart, p.days.length - 1))}</b> · ${p.days.length} jours${h.shopped ? " · courses faites" : ""}<br><small class="muted">Remplacé le ${new Date(h.savedAt).toLocaleString("fr-FR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })} · 1er jour : ${esc(first)}</small><br><button class="small" onclick="restoreHistory(${k})">Restaurer ce menu</button></div>`;
          })
          .join("")}</div>`
      : '<p class="muted">Aucun menu précédent enregistré pour l’instant.</p>'
  }<details class="panel"><summary>Restaurer depuis un programme partagé</summary><p class="muted">Collez le programme envoyé par l’app (« 📤 Envoyer le programme ») depuis WhatsApp ou Messages : les menus sont reconstruits jour par jour.</p><form onsubmit="event.preventDefault();restoreFromText(this.text.value)"><textarea name="text" rows="8" required placeholder="DUO — du vendredi 30/10 au …"></textarea><button type="submit">Reconstruire le menu</button></form></details>`;
  modal().showModal();
}
function restoreHistory(k) {
  const h = s.history[k];
  if (!h) return;
  s.history.splice(k, 1);
  keepHistory();
  for (const key of HISTORY_KEYS) if (key in h) s[key] = h[key];
  offerCache = {};
  loadRecipes();
  save();
  modal().close();
  go("week");
  toast("Menu restauré.");
}
// Programme partagé : « DUO — du vendredi 30/10 au … » puis une ligne par jour « Vendredi 30/10 : matin / midi / soir ».
function restoreFromText(text) {
  const byName = Object.fromEntries(Object.values(byR).map((r) => [norm(r.name), r.id])),
    lines = text.split("\n").map((l) => l.match(/^\s*\S+\s+(\d{1,2})\/(\d{1,2})\s*:\s*(.+)$/)).filter(Boolean),
    missing = [];
  if (!lines.length) return toast("Aucune ligne de menu trouvée (format « Lundi 2/11 : … / … / … »).");
  const find = (name) => byName[norm(name)] || Object.entries(byName).find(([n]) => n.startsWith(norm(name)) || norm(name).startsWith(n))?.[1];
  const days = lines.map(([, , , meals]) => {
    let parts = meals.split(" / ");
    // Un nom de recette peut contenir « / » : on recolle tant que les morceaux ne sont pas reconnus.
    while (parts.length > 3) {
      const k = parts.findIndex((x, i) => i < parts.length - 1 && !find(x));
      parts.splice(k < 0 ? 0 : k, 2, parts[k < 0 ? 0 : k] + " / " + parts[(k < 0 ? 0 : k) + 1]);
    }
    return parts.map((x) => {
      const id = find(x.trim());
      if (!id) missing.push(x.trim());
      return id || "missing:" + x.trim().slice(0, 60);
    });
  });
  const [, d, m] = lines[0],
    today = new Date(),
    year = +m > today.getMonth() + 7 ? today.getFullYear() - 1 : today.getFullYear(),
    start = `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  keepHistory();
  s.plan = { days, freezerUse: {}, created: new Date().toISOString(), weekStart: start, budgetEur: Math.round((s.budgetEur * days.length) / 7), batchFrom: (7 - weekdayOf(start)) % 7 };
  s.done = {};
  s.checked = {};
  s.shopped = true;
  loadRecipes();
  save();
  modal().close();
  go("week");
  toast(missing.length ? `Menu reconstruit. Introuvables : ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}` : "Menu reconstruit, courses considérées comme faites.");
}
// Recomposer : d'aujourd'hui à dimanche, jusqu'à dimanche prochain (si les courses ne sont pas encore faites), ou la semaine prochaine.
let periods = [];
function recompose() {
  const today = todayISO(),
    left = 7 - weekdayOf(today);
  periods = [
    { start: today, days: left, label: "D’aujourd’hui à dimanche" },
    { start: today, days: left + 7, label: "D’aujourd’hui à dimanche prochain" },
    { start: isoAdd(today, left), days: 7, label: "La semaine prochaine seulement" },
  ];
  const rec = !s.shopped && left <= 4 ? 1 : 0,
    fmt = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "numeric" }),
    eurFor = (k) => Math.round((s.budgetEur * periods[k].days) / 7 / 5) * 5;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>↻ Composer les menus</h2><p class="muted">${s.shopped ? "Les courses de la période actuelle sont faites." : "Courses pas encore faites : la période peut couvrir la fin de cette semaine et la suivante, pour un seul passage en magasin."}</p><form onsubmit="event.preventDefault();recomposeGo(this)"><div class="choice-list">${periods
    .map((pr, k) => `<label class="period"><input type="radio" name="period" value="${k}" ${k === rec ? "checked" : ""} onchange="this.form.budget.value=${eurFor(k)}"> <span><b>${pr.label}</b>${k === rec && k === 1 ? " · conseillé" : ""}<br><small class="muted">${fmt(pr.start)} → ${fmt(isoAdd(pr.start, pr.days - 1))} · ${pr.days} jours</small></span></label>`)
    .join("")}</div><label class="inline"><input type="checkbox" name="pantry"> Courses déjà faites : composer d’abord avec ce qu’il y a au placard</label><label>Budget courses pour la période (€)<input name="budget" type="number" min="0" step="5" value="${eurFor(rec)}"></label><p class="muted">Base : ${money(s.budgetEur)} € par semaine, au prorata des jours. Modifiable.</p><button type="submit">Composer</button></form>`;
  modal().showModal();
}
function recomposeGo(f) {
  const pr = periods[+f.period.value];
  modal().close();
  generate(false, { start: pr.start, days: pr.days, budgetEur: Math.max(0, +f.budget.value || 0), pantryFirst: f.pantry.checked });
}
function go(t) {
  tab = t;
  render();
  window.scrollTo(0, 0);
}
function toast(t) {
  const e = document.getElementById("toast");
  e.textContent = t;
  e.style.display = "block";
  clearTimeout(window.tt);
  window.tt = setTimeout(() => (e.style.display = "none"), 3500);
}
function heading(k, title, desc, action = "") {
  return `<div class="page-head"><div><div class="eyebrow">${k}</div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
}
function card(r, i = 0) {
  const m = macro(r);
  const tag = r.type === "sauce" ? "🥫 SAUCE" : r.type === "drink" ? "🥤 BOISSON" : r.type === "snack" || r.snack ? "🍿 EN-CAS" : r.type === "batch" ? (r.freezer ? "🧊 CONGÉLATION" : "FOURNÉE") : r.veg ? "VÉGÉTARIEN" : esc(r.cuisine).toUpperCase();
  return `<article class="recipe" onclick="detail('${r.id}')" tabindex="0" onkeydown="if(event.key==='Enter')detail('${r.id}')"><div class="food ${i % 3 === 1 ? "b" : i % 3 === 2 ? "c" : ""}"><span class="tag">${tag} · ${r.time} MIN</span>${r.emoji}</div><div class="recipe-body"><h3>${esc(r.name)}</h3><p>${esc(r.cuisine)} · ${isTotal(r) ? `${r.portions} ${esc(r.unit)}` : "pour deux"}${r.source !== undefined ? " · ma recette" : ""}${s.ratings[r.id] !== undefined ? " · " + RATES.find(([v]) => v === s.ratings[r.id])[1] : ""}</p><div class="macros"><span>◉ <b>${Math.round(m.kcal)}</b> kcal</span><span>↗ <b>${Math.round(m.protein)}</b> g prot.</span><span>🌾 <b>${Math.round(m.fiber)}</b> g fibres</span></div></div></article>`;
}

// ─── Pages ────────────────────────────────────────────────────────────────
function todayIndex() {
  if (!s.plan) return -1;
  const i = Math.round((new Date().setHours(12, 0, 0, 0) - new Date(s.plan.weekStart + "T12:00:00")) / 864e5);
  return i >= 0 && i < s.plan.days.length ? i : -1;
}
function home() {
  const frozen = Object.entries(s.freezer).filter(([id, n]) => n > 0 && byR[id]),
    total = frozen.reduce((a, [, n]) => a + n, 0),
    i = todayIndex(),
    tasks = s.plan ? sundayTasks().filter((x) => !x.done) : [],
    b = s.plan ? basket() : [],
    left = b.filter((x) => !s.checked[x.id]);
  return (
    heading(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase(), "Bonjour à vous deux 👋", s.plan ? `Semaine du ${dayDate(0)} au ${dayDate(6)}.` : "Commencez par générer votre semaine.") +
    (i >= 0
      ? `<div class="panel"><div class="row spread"><h2>Aujourd’hui · ${dayName(i)}</h2><span class="row"><button class="secondary small" onclick="extraPicker()">🍳 Cuisiné en plus</button><button class="text-button" onclick="go('week')">Toute la semaine ↗</button></span></div><div class="today">${[0, 1, 2].map((j) => mealCell(i, j)).join("")}</div></div>`
      : `<div class="panel"><h2>${s.plan ? "Semaine terminée" : "Pas encore de semaine"}</h2><p>${s.plan ? "Dimanche, la semaine suivante se prépare toute seule." : "Générez votre première semaine : repas, batch cooking et liste de courses."}</p><button onclick="go('week');${s.plan ? "" : "generate()"}">${s.plan ? "Voir la semaine" : "✦ Générer ma semaine"}</button></div>`) +
    `<div class="stats home-stats"><div class="stat" onclick="go('stock')" role="button" tabindex="0"><small>🧊 Au congélateur</small><strong>${total} <span style="font-size:13px">portions</span></strong><em>${frozen.length ? frozen.slice(0, 3).map(([id, n]) => `${byR[id].emoji} ${n}`).join(" · ") : "prêtes pour les soirs de flemme"}</em></div><div class="stat" onclick="go('week')" role="button" tabindex="0"><small>🧑‍🍳 Batch cooking</small><strong>${!s.plan ? "—" : tasks.length ? `${tasks.length} <span style="font-size:13px">à faire</span>` : "✓"}</strong><em>${!s.plan ? "après la première semaine" : tasks.length ? "à faire dimanche" : "terminé pour cette semaine"}</em></div><div class="stat" onclick="go('shopping')" role="button" tabindex="0"><small>🛒 Courses</small><strong>${!s.plan ? "—" : left.length ? `${left.length} <span style="font-size:13px">articles</span>` : "✓"}</strong><em>${!s.plan ? "liste générée avec la semaine" : left.length ? `≈ ${eur(left.reduce((a, x) => a + x.total, 0))} à acheter` : "tout est acheté"}</em></div></div>${!s.setup ? '<div class="notice">👋 Première visite ? Scannez ou saisissez ce que vous avez dans « Mon placard ».</div>' : ""}`
  );
}
function week() {
  const c = s.plan ? used(s.plan) : 0,
    pay = s.plan ? cost(s.plan) : 0;
  const ramenSel = [["3", "Jeudi soir"], ["4", "Vendredi soir"], ["-1", "Pas cette semaine"]]
    .map(([v, l]) => `<option value="${v}" ${String(s.fixed.ramen) === v ? "selected" : ""}>${l}</option>`)
    .join("");
  return (
    heading("VOTRE MENU SUR MESURE", "La semaine à table.", s.plan ? `Du ${dayName(0).toLowerCase()} ${dayDate(0)} au ${dayName(nDays() - 1).toLowerCase()} ${dayDate(nDays() - 1)} · ${nDays()} jours · 2 personnes` : "7 jours · 3 repas par jour · 2 personnes", `<span class="row"><button class="secondary" onclick="extraPicker()">🍳 Cuisiné en plus</button><button class="secondary" onclick="menuHistory()">↺ Menus précédents</button><button onclick="recompose()">${s.plan ? "↻ Recomposer" : "✦ Générer ma semaine"}</button></span>`) +
    (s.plan ? sundayPanel() : "") +
    `<div class="panel row spread">${s.plan ? `<label>Budget courses · € pour ces ${nDays()} jours<input type="number" min="0" step="5" value="${Math.round(periodEur())}" onchange="s.plan.budgetEur=Math.max(0,+this.value);save();render()"></label>` : `<label>Budget courses · € par semaine pour deux<input type="number" min="0" step="5" value="${s.budgetEur}" onchange="s.budgetEur=Math.max(0,+this.value);save();render()"></label>`}<label>Taux Revolut · 1 € = RON<input type="number" min="1" step="0.01" value="${s.rate}" onchange="setRate(this.value)"></label><span class="muted">${s.rateManual ? `Votre taux, gardé tel quel. <button class="text-button" onclick="s.rateManual=false;s.rateDate=null;save();updateRate()">Revenir au taux automatique</button>` : s.rateDate ? `Taux du marché du ${new Date(s.rateDate).toLocaleDateString("fr-FR")}, corrigez-le si Revolut affiche autre chose.` : ""} · ≈ ${money(budget())} RON</span></div>` +
    (s.plan
      ? `<div class="notice ${pay > budget() + 0.5 ? "warning" : ""}">${pay > budget() + 0.5 ? "Budget dépassé pour la proposition la moins chère. Augmentez le budget ou ajoutez votre stock." : "Vos courses tiennent dans le budget."} À payer en magasin : <b>${eur(pay)} / ${money(periodEur())} €</b>${pay - c > 1 ? ` (dont ${eur(pay - c)} de restes de paquets qui restent au placard)` : ""}. <button class="text-button" onclick="go('shopping')">Voir mes courses ↗</button></div>${topupNotice()}${extrasPanel()}<p class="muted">Touchez un repas pour sa recette détaillée. Mangé autre chose ? « Autre » le retire du placard.</p>${s.plan.days.map((day, i) => `<div class="day ${i === todayIndex() ? "is-today" : ""}"><div class="day-label">${dayName(i).slice(0, 3)}.<br><small class="muted">${dayDate(i)}</small></div>${day.map((_, j) => mealCell(i, j)).join("")}</div>`).join("")}`
      : '<div class="panel"><h2>Le menu commence ici.</h2><p>Générez 21 repas pour vous deux : les fournées du dimanche sont choisies selon votre congélateur, et la liste de courses prend le magasin le moins cher.</p></div>') +
    `<details class="panel"><summary>Réglages de la semaine</summary><div class="row"><label class="inline"><input type="checkbox" ${s.fixed.chirashi ? "checked" : ""} onchange="s.fixed.chirashi=this.checked;save()"> 🍣 Chirashi saumon & avocat le mardi soir</label><label>🍜 Ramen au bouillon<select onchange="s.fixed.ramen=+this.value;save()">${ramenSel}</select></label><label class="inline"><input type="checkbox" ${s.veg ? "checked" : ""} onchange="s.veg=this.checked;save()"> Menus végétariens</label><label>Budget de base · € par semaine<input type="number" min="0" step="5" value="${s.budgetEur}" onchange="s.budgetEur=Math.max(0,+this.value);save();render()"></label><label>Le matin, en plus<select onchange="s.morning=this.value;s.checked={};save();render()">${[["juice", "Un verre de jus d’orange"], ["orange", "Une orange entière (plus de fibres)"], ["none", "Rien"]].map(([v, l]) => `<option value="${v}" ${s.morning === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>${s.morning === "juice" ? `<label>Verre de jus (ml)<input type="number" min="50" max="400" step="25" value="${s.juiceMl}" onchange="s.juiceMl=Math.max(50,Math.min(400,+this.value||150));s.checked={};save();render()"></label>` : ""}<label>Cinnamon rolls : portions par matin pour vous deux<input type="number" min="0.5" max="4" step="0.5" value="${s.breakfastShare}" onchange="s.breakfastShare=Math.max(0.5,Math.min(4,+this.value||1.5));save();render()"></label><label>Garder au congélateur (portions de plats)<input type="number" min="0" max="40" value="${s.freezerTarget}" onchange="s.freezerTarget=Math.max(0,+this.value);save()"></label></div><p class="muted">Recomposez la semaine pour appliquer ces réglages. Le poulet entier est désossé chaque dimanche : ≈ 350 g de blancs et 400 g de cuisses pour la semaine, la carcasse et les ailes pour le bouillon du ramen.</p>${batchPanel()}</details>`
  );
}
function topupNotice() {
  const q = topupQty(),
    x = by[s.topup];
  if (!q || !x) return "";
  return `<div class="notice">💪 Protéines : il manque environ <b>${Math.round(proteinGap())} g</b> sur la semaine (vous deux). Ajouté aux courses : <b>${qtyLabel(q, x.unit)} de ${esc(x.name.split(" · ")[0])}</b> · ${eur(topupCost())}${s.topupInBudget ? "" : " (hors budget repas)"}. <button class="text-button" onclick="go('profils')">Régler ↗</button></div>`;
}
// Fournées de la semaine, choisies selon le congélateur :
// on ne refait pas ce qui n'a pas été mangé, on propose une autre recette ou rien.
function batchCost(r) {
  return Object.entries(r.ingredients).reduce((a, [id, q]) => a + Math.max(0, q - avail(id)) * unitPrice(id), 0) / (r.portions || 1);
}
// Seule fournée du matin ; les autres matins, un petit-déjeuner simple.
const MORNING_BAKES = ["cinnamon_rolls"],
  // Plats du dimanche servis au menu : deux sur une semaine, un seul sur une période courte.
  menuBatchCount = (N) => (N >= 6 ? 2 : 1);
// pre : matins avant le lundi du batch, servis avec les cinnamon rolls du congélateur.
// pantry : courses déjà faites, on choisit d'abord les fournées que le placard permet.
function autoBatches(N = 7, pre = 0, pantry = false) {
  const frozen = (id) => s.freezer[id] || 0,
    last = s.lastBatches || [],
    pick = byR.poulet_entier ? ["poulet_entier"] : [];
  const rank = (list) =>
    list
      .map((r) => ({ r, v: pantry ? taste(r) - batchCost(r) * (r.portions || 1) + Math.random() * 0.5 : taste(r) * 3 - batchCost(r) * 0.4 - (last.includes(r.id) ? 1.5 : 0) + Math.random() * 1.5 }))
      .sort((a, b) => b.v - a.v)
      .map((x) => x.r);
  const batches = R.filter((r) => r.type === "batch" && r.id !== "poulet_entier" && !r.noPlan && allowed(r) && (frozen(r.id) === 0 || MORNING_BAKES.includes(r.id)));
  // Petit-déjeuner : seulement les cinnamon rolls, s'il n'en reste plus assez au congélateur.
  let need = N * s.breakfastShare - Math.max(0, MORNING_BAKES.reduce((a, id) => a + frozen(id), 0) - pre * s.breakfastShare);
  for (const r of rank(batches.filter((r) => MORNING_BAKES.includes(r.id)))) {
    if (need <= 0 || pick.length >= 4) break;
    pick.push(r.id);
    need -= r.portions;
  }
  // Plats du dimanche : au moins menuBatchCount(N) pour le menu de la semaine, puis on complète le congélateur
  // (chaque plat servi au menu en consomme deux portions).
  let meals = R.filter((r) => r.type === "batch" && r.freezer && r.meal === "main").reduce((a, r) => a + frozen(r.id), 0),
    cooked = 0;
  for (const r of rank(batches.filter((r) => r.freezer && r.meal === "main"))) {
    if ((cooked >= menuBatchCount(N) && (N < 6 || meals >= s.freezerTarget)) || pick.length >= 6) break;
    if (hasPork(r) && pick.some((id) => hasPork(byR[id]))) continue;
    pick.push(r.id);
    meals += r.portions - 2;
    cooked++;
  }
  return pick;
}
// Ce qu'on avance le dimanche, dans l'ordre : fournées puis préparation des 3 premiers jours.
// Forme de coupe d'un légume pour une recette : lue dans les étapes, sinon la coupe habituelle.
const CUTS = [
  [/julienne/, "en julienne (bâtonnets fins comme des allumettes)"],
  [/\brap(e|ee|es|ees|er)\b/, "râpé (gros trous de la râpe)"],
  [/hach/, "haché très fin (hachoir ou mixeur)"],
  [/emince|lamelle/, "en fines lamelles (2–3 mm)"],
  [/laniere/, "en lanières d’1 cm"],
  [/batonnet/, "en bâtonnets (1 × 5 cm)"],
  [/rondelle/, "en rondelles de 5 mm"],
  [/bouquet/, "en petits bouquets"],
  [/cube/, "en cubes de 2 cm"],
  [/quartier/, "en quartiers"],
  [/\ben des\b|\bdes de\b/, "en dés d’1 cm"],
  [/tranch/, "en tranches fines"],
];
const DEFAULT_CUT = {
  onion: "en fines lamelles (2–3 mm)",
  carrot: "en rondelles de 5 mm",
  pepper: "en lanières d’1 cm",
  zucchini: "en dés d’1 cm",
  cabbage: "en fines lamelles (2–3 mm)",
  cauliflower: "en petits bouquets",
  sweet_potato: "en cubes de 2 cm",
  eggplant: "en dés de 2 cm",
  mushroom: "en lamelles",
};
// Coupes plausibles par légume (une phrase comme « oignon puis carottes en bâtonnets » ne vise pas l'oignon).
const CUT_OK = { onion: /emince|lamelle|hach|des|laniere|quartier/ };
function cutFor(r, id) {
  const st = stems(id);
  for (const sentence of r.steps.join(". ").split(/[.;:]/).map(norm)) {
    if (!st.some((x) => sentence.includes(x)) && !/\blegumes\b/.test(sentence)) continue;
    const cut = CUTS.find(([re]) => re.test(sentence));
    if (!cut || (CUT_OK[id] && !CUT_OK[id].test(cut[0].source))) continue;
    // Taille écrite dans la recette (« dés de 2 cm ») plutôt que la taille par défaut.
    const size = sentence.match(/(\d+(?: \d+)?) cm/);
    if (!size || !/des|cube/.test(cut[0].source)) return cut[1];
    const cm = size[1].replace(" ", ",");
    return `en ${/cube/.test(cut[0].source) ? "cubes" : "dés"} ${cm === "1" ? "d’" : "de "}${cm} cm`;
  }
  return DEFAULT_CUT[id] || "comme vous préférez";
}
function sundayTasks() {
  const tasks = [],
    done = (key) => !!s.prepDone?.[key],
    short = (id) => esc(by[id].name.split(" · ")[0].replace(/\(.*?\)/g, "").trim().toLowerCase()),
    when = (m) => `${dayName(m.i)} ${m.j === 1 ? "midi" : "soir"}`;
  const meals = (from, to) =>
    s.plan.days.slice(from, to).flatMap((d, k) => d.map((_, j) => ({ i: from + k, j, ...slot(from + k, j) })).filter((m) => m.j > 0 && !m.fz && m.r.type !== "batch" && !s.done[m.i + "-" + m.j]));
  const list = (items) => `<ul class="sub">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;

  // 1. Les fournées (le poulet et les pâtes levées d'abord : ils mijotent ou lèvent pendant qu'on fait le reste).
  for (const id of s.batches) {
    const r = byR[id];
    if (!r) continue;
    const what = r.yields ? "les blancs et la viande de cuisse pour la semaine, le bouillon pour le ramen" : r.freezer ? `${r.portions} ${esc(r.unit)} à ranger au congélateur` : `${r.portions} ${esc(r.unit)} pour les petits-déjeuners`;
    tasks.push({ key: "b:" + id, batch: id, done: !!s.batchDone[id], html: `${r.emoji} <b>${esc(r.name)}</b> · ${r.time} min<br><small class="muted">Donne ${what}. Touchez « Recette » pour les étapes.</small>` });
  }

  const from = s.plan.batchFrom || 0,
    early = meals(from, from + 3);
  // 2. Le riz des 3 premiers jours au rice cooker (pas le riz rond du chirashi : il se cuit le jour même).
  const rice = early.filter((m) => m.r.ingredients.rice);
  if (rice.length) {
    const raw = rice.reduce((a, m) => a + m.r.ingredients.rice * 2, 0),
      cups = (Math.round((raw / 150) * 2) / 2).toLocaleString("fr-FR");
    tasks.push({
      key: "rice",
      done: done("rice"),
      html:
        `🍚 <b>Riz au rice cooker</b> pour ${rice.length} repas : <b>${raw} g de riz cru</b>, soit environ ${cups} verres doseurs du rice cooker (1 verre ≈ 150 g).` +
        list([
          "Rincer le riz dans un saladier d’eau froide, en le frottant entre les mains. Jeter l’eau et recommencer 3 fois, jusqu’à ce qu’elle soit presque claire.",
          `Verser le riz égoutté dans la cuve. Ajouter l’eau jusqu’au trait <b>${cups}</b> gravé dans la cuve (sans trait : environ ${Math.round((raw / 150) * 200)} ml d’eau, soit un peu plus d’un verre d’eau par verre de riz).`,
          "Fermer, lancer le programme « riz blanc » (ou « white rice »). Quand il passe en maintien au chaud (35 à 45 min), laisser reposer 10 min sans ouvrir.",
          "Étaler le riz sur un grand plat pour qu’il refroidisse vite : 20 minutes maximum à l’air libre.",
          `Répartir dans des boîtes avec le nom du repas : ${rice.map((m) => `<b>${when(m)}</b> · ${esc(m.r.name)} : ${Math.round(m.r.ingredients.rice * 2 * 2.5)} g de riz cuit`).join(" · ")}.`,
          "Fermer et ranger au réfrigérateur : 3 jours maximum. Le jour J, réchauffer avec 1 cuillère d’eau, couvert, 2 minutes au micro-ondes, jusqu’à ce que ce soit bien chaud partout.",
        ]),
    });
  }

  // 3. Les légumes des 3 premiers jours, une boîte par repas.
  const VEG = ["onion", "carrot", "pepper", "zucchini", "cabbage", "cauliflower", "sweet_potato", "eggplant", "mushroom"];
  const vegMeals = early.filter((m) => VEG.some((id) => m.r.ingredients[id]));
  if (vegMeals.length)
    tasks.push({
      key: "veg",
      done: done("veg"),
      html:
        `🔪 <b>Légumes</b> : éplucher, laver, couper selon la forme indiquée, puis une boîte hermétique par repas.` +
        list([
          ...vegMeals.map((m) => `<b>${when(m)}</b> · ${esc(m.r.name)} :<br>${VEG.filter((id) => m.r.ingredients[id]).map((id) => `${short(id)} ${qtyLabel(m.r.ingredients[id] * 2, by[id].unit)} → <b>${cutFor(m.r, id)}</b>`).join("<br>")}`),
          "L’ail et le gingembre s’épluchent seulement : on les coupe le jour même, sinon ils perdent leur goût.",
        ]),
    });

  // 4. La viande des deux premiers jours, prête au frigo ; le reste attend au congélateur.
  const MEATS = ["chicken", "chicken_thigh", "turkey", "chicken_mince", "pork_mince", "beef_stew", "beef_mince", "duck"];
  const meatOf = (m) => MEATS.filter((id) => m.r.ingredients[id]);
  const soon = meals(from, from + 2).filter((m) => meatOf(m).length);
  if (soon.length)
    tasks.push({
      key: "meat",
      done: done("meat"),
      html:
        `🥩 <b>Viande de lundi et mardi</b> : la couper comme dans la recette et la mettre en boîte fermée au réfrigérateur (2 jours maximum).` +
        list(soon.map((m) => `<b>${when(m)}</b> · ${esc(m.r.name)} : ${meatOf(m).map((id) => `${qtyLabel(m.r.ingredients[id] * 2, "g")} de ${short(id)}`).join(", ")}${/marin/i.test(m.r.steps.join(" ")) ? " · on peut déjà la mariner, voir la recette" : ""}`)),
    });
  const later = meals(from + 2, s.plan.days.length).filter((m) => meatOf(m).length);
  if (later.length)
    tasks.push({
      key: "freeze",
      done: done("freeze"),
      html:
        `❄️ <b>Viande de mercredi à dimanche</b> : la ranger au congélateur dès le retour des courses, dans des sacs étiquetés au nom du repas. La sortir au réfrigérateur la veille au soir :` +
        list(later.map((m) => `${dayName(m.i - 1).toLowerCase()} soir → pour <b>${when(m)}</b> · ${esc(m.r.name)} : ${meatOf(m).map((id) => `${qtyLabel(m.r.ingredients[id] * 2, "g")} de ${short(id)}`).join(", ")}`)),
    });
  return tasks;
}
function sundayPanel() {
  const from = s.plan.batchFrom || 0;
  // Période qui s'arrête avant le prochain dimanche de batch : rien à préparer à l'avance.
  if (from >= s.plan.days.length) return "";
  const all = sundayTasks(),
    todo = all.filter((x) => !x.done),
    sunday = from ? ` · ${new Date(isoAdd(s.plan.weekStart, from - 1) + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" })}` : "";
  if (!todo.length) return `<div class="panel sunday done-all" id="sunday"><h2>🧑‍🍳 Batch cooking terminé ✓</h2><p class="muted">Tout est prêt pour la semaine. <button class="text-button" onclick="shareWeek()">📤 Renvoyer le programme</button></p></div>`;
  return `<section class="panel sunday" id="sunday"><div class="row spread"><h2>🧑‍🍳 Batch cooking du dimanche${sunday}</h2><span class="muted">${all.length - todo.length} / ${all.length} fait</span></div><p class="muted">${from ? `À faire dimanche, pas avant : les plats du batch arrivent au menu à partir de lundi. D’ici là, cuisine au jour le jour.` : "À faire en premier : lundi démarre presque tout prêt."} Chaque étape disparaît quand elle est faite.</p><ol class="tasks">${todo
    .map((x) => `<li><span>${x.html}</span><span class="row">${x.batch ? `<button class="text-button" onclick="detail('${x.batch}')">Recette</button><button class="text-button" onclick="removeBatch('${x.batch}')">Retirer</button><button class="small" onclick="cookBatch('${x.batch}')">✓ Fait</button>` : `<button class="small" onclick="prepDone('${x.key}')">✓ Fait</button>`}</span></li>`)
    .join("")}</ol><div class="row"><button onclick="shareWeek()">📤 Envoyer le programme & la liste</button><button class="secondary" onclick="go('shopping')">Voir les courses</button></div></section>`;
}
function prepDone(key) {
  (s.prepDone ??= {})[key] = true;
  save();
  render();
  document.getElementById("sunday")?.scrollIntoView({ block: "nearest" });
}
function weekText() {
  const b = basket(),
    plain = (h) => h.replace(/<li>/g, "\n   - ").replace(/<br>/g, " ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "’").replace(/&quot;/g, '"');
  return (
    `DUO — du ${dayName(0).toLowerCase()} ${dayDate(0)} au ${dayName(nDays() - 1).toLowerCase()} ${dayDate(nDays() - 1)} (${nDays()} jours)\n\nDIMANCHE — BATCH COOKING\n` +
    sundayTasks().map((t, k) => `${k + 1}. ${plain(t.html)}`).join("\n") +
    `\n\nMENUS\n` +
    s.plan.days.map((d, i) => `${dayName(i)} ${dayDate(i)} : ${d.map((_, j) => slot(i, j).r.name).join(" / ")}`).join("\n") +
    `\n\nCOURSES (magasin le moins cher)\n` +
    [...STORES, "À définir"]
      .filter((st) => b.some((x) => x.store === st))
      .map((st) => `${st.toUpperCase()} — ${money(b.filter((x) => x.store === st).reduce((a, x) => a + x.total, 0))} RON\n` + b.filter((x) => x.store === st).map((x) => `☐ ${by[x.id].name.split(" · ")[0]} — ${x.packs} × ${qtyLabel(x.pack, by[x.id].unit)}`).join("\n"))
      .join("\n\n") +
    `\n\nTOTAL : ${money(b.reduce((a, x) => a + x.total, 0))} RON ≈ ${eur(b.reduce((a, x) => a + x.total, 0))}`
  );
}
async function shareWeek() {
  if (!s.plan) return toast("Générez votre semaine d’abord.");
  const text = weekText();
  try {
    if (navigator.share) return await navigator.share({ title: "Duo — la semaine", text });
  } catch (e) {
    if (e.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast("Programme et liste copiés : collez-les dans WhatsApp ou Messages.");
  } catch {
    download("duo-semaine.txt", text, "text/plain;charset=utf-8");
  }
}
function mealCell(i, j) {
  const { key, fz, r } = slot(i, j),
    done = s.done[key],
    ate = s.plan.ate?.[key],
    m = macro(r);
  if (ate) return `<div class="meal done"><div><small>${SLOTS[j]} · AUTRE CHOSE</small><b>🍽️ ${esc(ate)}</b><span class="muted">retiré du placard</span></div></div>`;
  const tag = done ? " · ✓" : fz ? " · 🧊 CONGÉLO" : r.fixed ? " · RITUEL" : r.type === "batch" ? (r.freezer ? " · CONGÉLO" : " · FOURNÉE") : "";
  return `<div class="meal ${done ? "done" : ""} ${fz ? "frozen" : ""}"><div onclick="detail('${r.id}',${i},${j})" role="button" tabindex="0" onkeydown="if(event.key==='Enter')detail('${r.id}',${i},${j})"><small>${SLOTS[j]}${tag}</small><b>${r.emoji} ${esc(r.name)}</b><span class="muted">${Math.round(m.kcal)} kcal · ${Math.round(m.protein)} g prot. · ${Math.round(m.fiber)} g fibres</span></div>${done ? "" : `<div class="meal-actions"><button class="text-button" onclick="pickMeal(${i},${j})">Choisir</button><button class="text-button" onclick="swap(${i},${j})">Au hasard ↻</button>${j > 0 ? `<button class="text-button" onclick="useFreezer(${i},${j})">🧊 Congélo</button>` : ""}<button class="text-button" onclick="ateOther(${i},${j})">Autre</button></div>`}</div>`;
}
function batchPanel() {
  const list = R.filter((r) => r.type === "batch");
  return `<h3>Fournées de la semaine</h3><p class="muted">Choisies automatiquement chaque dimanche selon le congélateur. Vous pouvez en ajouter ou en retirer ici.</p><div class="batch-grid">${list
    .map((r) => {
      const on = s.batches.includes(r.id),
        done = s.batchDone[r.id];
      return `<div class="batch ${on ? "on" : ""} ${done ? "done" : ""}"><label class="inline"><input type="checkbox" ${on ? "checked" : ""} ${done ? "disabled" : ""} onchange="toggleBatch('${r.id}',this.checked)"> ${r.emoji} ${esc(r.name)}</label><small class="muted">${r.portions} ${esc(r.unit)}${r.freezer ? " · 🧊 se congèle" : ""}${r.meal === "breakfast" ? " · petit-déj & encas" : ""}${s.freezer[r.id] ? ` · ${s.freezer[r.id]} au congélateur` : ""}</small><div class="row"><button class="text-button" onclick="detail('${r.id}')">Recette</button>${done ? "<b>Préparée ✓</b>" : ""}</div></div>`;
    })
    .join("")}</div>`;
}
// Retirer une fournée du batch de la semaine : ses repas au menu sont remplacés (sauf s'il en reste au congélateur),
// ses ingrédients sortent des courses.
function removeBatch(id) {
  const r = byR[id];
  if (!r || !confirm(`Retirer « ${r.name} » du batch cooking de la semaine ?`)) return;
  s.batches = s.batches.filter((x) => x !== id);
  delete s.batchDone[id];
  let frozen = s.freezer[id] || 0,
    replaced = 0;
  s.plan?.days.forEach((d, i) =>
    d.forEach((x, j) => {
      if (x !== id || s.done[i + "-" + j]) return;
      // Il en reste au congélateur : le repas reste prévu, servi de là.
      const part = j === 0 ? s.breakfastShare : 2;
      if (frozen >= part) return void (frozen -= part);
      if (j === 0) d[0] = "matin_cafe";
      else {
        const pool = R.filter((m) => m.type === "main" && !m.fixed && !m.noPlan && allowed(m) && !s.plan.days.some((y) => y.includes(m.id)));
        // Le remplaçant le moins cher à acheter (placard d'abord), puis le plus apprécié.
        const buy = (m) => Object.entries(m.ingredients).reduce((a, [k, q]) => a + Math.max(0, q * 2 - avail(k)) * unitPrice(k), 0) - taste(m) * 6,
          fit = pool.filter((m) => slotOk(s.plan.days, i, j, m)).sort((a, b) => buy(a) - buy(b));
        d[j] = (fit[0] || pool[0] || { id: x }).id;
      }
      replaced++;
    }),
  );
  s.checked = {};
  save();
  render();
  toast(`${r.name} retiré du batch${replaced ? ` : ${replaced} repas remplacé${replaced > 1 ? "s" : ""} au menu` : ""}. Courses recalculées.`);
}
function toggleBatch(id, on) {
  if (!on) return removeBatch(id);
  s.batches = s.batches.filter((x) => x !== id);
  if (on) s.batches.push(id);
  s.checked = {};
  save();
  render();
}
// ─── Cuisiné en plus du planning : on retire les ingrédients du placard ───
function extraPicker() {
  pickQuery = "";
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>🍳 Cuisiné en plus</h2><p class="muted">Une recette faite en dehors du menu : ses ingrédients sortent du placard, le menu ne change pas.</p><input type="search" placeholder="Cookies, crêpes, une recette…" oninput="pickQuery=this.value;extraRows()" autofocus><div id="extra-rows" class="pick-list"></div><button class="secondary" onclick="manualExtra()">Pas dans le carnet : saisir les ingrédients</button>`;
  modal().showModal();
  extraRows();
}
function extraRows() {
  const q = norm(pickQuery);
  const list = R.filter((r) => norm(r.name + " " + r.cuisine + " " + Object.keys(r.ingredients).map((id) => by[id]?.name || "").join(" ")).includes(q))
    .map((r) => ({ r, ok: inPantry(r) }))
    .sort((a, b) => b.ok - a.ok || a.r.name.localeCompare(b.r.name, "fr"));
  document.getElementById("extra-rows").innerHTML =
    list.map(({ r, ok }) => `<button class="pick-row" onclick="cookExtra('${r.id}')"><span class="pick-emoji">${r.emoji}</span><span><b>${esc(r.name)}</b><small class="muted">${esc(r.cuisine)} · ${r.type === "batch" ? `${r.portions} ${esc(r.unit)}` : "plat"}${ok ? " · ✓ tout est au placard" : ""}</small></span></button>`).join("") || '<p class="muted">Aucune recette trouvée.</p>';
}
function cookExtra(id) {
  const r = byR[id],
    batch = isTotal(r);
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><div style="font-size:44px">${r.emoji}</div><h2>${esc(r.name)}</h2><form oninput="extraPreview(this,'${id}')" onsubmit="saveExtra(event,'${id}')"><div class="row"><label>${batch ? `${r.type === "sauce" ? "Nombre de pots" : "Nombre de fournées"} (1 = ${r.portions} ${esc(r.unit)})` : "Pour combien de personnes"}<input name="n" type="number" min="0.5" step="0.5" value="${batch ? 1 : 2}"></label><label>${batch ? `${esc(r.unit[0].toUpperCase() + r.unit.slice(1))} mis au congélateur` : "Portions mises au congélateur"}<input name="fz" type="number" min="0" step="1" value="${batch && r.freezer ? r.portions : 0}"></label></div><h3>Retiré du placard</h3><div id="extra-preview"></div><button type="submit">Retirer du placard</button></form>`;
  modal().showModal();
  extraPreview(modal().querySelector("form"), id);
}
function extraPreview(f, id) {
  const r = byR[id],
    n = Math.max(0, +f.n.value || 0);
  document.getElementById("extra-preview").innerHTML = `<table>${Object.entries(r.ingredients)
    .filter(([x]) => by[x])
    .map(([x, q]) => {
      const need = q * n,
        have = s.stock[x] || 0;
      return `<tr><td>${esc(by[x].name.split(" · ")[0])}</td><td>${qtyLabel(need, by[x].unit)}</td><td class="muted">${have >= need ? `reste ${qtyLabel(have - need, by[x].unit)}` : `⚠️ placard : ${qtyLabel(have, by[x].unit)}`}</td></tr>`;
    })
    .join("")}</table><p class="muted">Ce qui manque au placard est mis à zéro : corrigez le stock ensuite si besoin.</p>`;
}
function saveExtra(ev, id) {
  ev.preventDefault();
  const r = byR[id],
    f = ev.target,
    n = Math.max(0, +f.n.value || 0),
    fz = Math.max(0, Math.round(+f.fz.value || 0));
  if (!n) return toast("Indiquez la quantité préparée.");
  Object.entries(r.ingredients).forEach(([x, q]) => by[x] && (s.stock[x] = Math.max(0, (s.stock[x] || 0) - q * n)));
  if (fz) s.freezer[id] = (s.freezer[id] || 0) + fz;
  (s.extras ??= []).push({ date: new Date().toISOString(), id, n, fz });
  s.checked = {};
  save();
  modal().close();
  render();
  toast(`${r.name} : placard mis à jour${fz ? `, ${fz} au congélateur` : ""}. Courses recalculées.`);
  if (s.ratings[id] === undefined) askRating(id);
}
function manualExtra() {
  const row = `<div class="row ing-row"><input class="ing-name" list="ing-list" placeholder="Ingrédient"><input class="ing-qty" type="number" min="0" step="any" placeholder="Quantité"></div>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>🍳 Cuisiné en plus</h2><form onsubmit="saveManualExtra(event)"><label>Qu’avez-vous préparé ?<input name="label" required maxlength="60" placeholder="Ex. gâteau d’anniversaire"></label><h3>Ingrédients utilisés</h3><p class="muted">En g, ml ou pièces selon l’aliment.</p><div id="extra-ing">${row.repeat(4)}</div><button type="button" class="secondary" onclick="document.getElementById('extra-ing').insertAdjacentHTML('beforeend',document.querySelector('#extra-ing .ing-row').outerHTML)">+ Ligne</button><datalist id="ing-list">${C.map((x) => `<option value="${esc(x.name)}">${x.unit}</option>`).join("")}</datalist><button type="submit">Retirer du placard</button></form>`;
  modal().showModal();
}
function saveManualExtra(ev) {
  ev.preventDefault();
  const f = ev.target,
    used = {};
  for (const row of f.querySelectorAll(".ing-row")) {
    const typed = row.querySelector(".ing-name").value,
      q = +row.querySelector(".ing-qty").value,
      m = matchProduct(typed),
      x = C.find((c) => norm(c.name) === norm(typed)) || (m[0] && m[0].score >= 13 ? by[m[0].id] : null);
    if (x && q > 0) used[x.id] = (used[x.id] || 0) + q;
  }
  if (!Object.keys(used).length) return toast("Ajoutez au moins un ingrédient reconnu avec sa quantité.");
  Object.entries(used).forEach(([x, q]) => (s.stock[x] = Math.max(0, (s.stock[x] || 0) - q)));
  (s.extras ??= []).push({ date: new Date().toISOString(), label: f.label.value.trim().slice(0, 60) });
  s.checked = {};
  save();
  modal().close();
  render();
  toast("Placard mis à jour. Courses recalculées.");
}
function extrasPanel() {
  const list = (s.extras || []).filter((e) => s.plan && e.date.slice(0, 10) >= s.plan.weekStart).reverse();
  if (!list.length) return "";
  return `<div class="panel"><h2>🍳 En plus cette semaine</h2>${list
    .map((e) => `<div class="review-row"><span>${e.id && byR[e.id] ? `${byR[e.id].emoji} ${esc(byR[e.id].name)}` : `🍽️ ${esc(e.label || "Autre")}`}</span><small class="muted">${new Date(e.date).toLocaleDateString("fr-FR", { weekday: "long" })}${e.fz ? ` · ${e.fz} au congélateur` : ""}</small></div>`)
    .join("")}</div>`;
}

// ─── Choisir un repas dans le carnet ───
// Recettes possibles pour une place du menu : petit-déjeuner ou plat, sans les recettes écartées.
const fitsSlot = (r, j) => r.ratings !== -1 && s.ratings[r.id] !== -1 && (j === 0 ? r.meal === "breakfast" : r.type === "main");
const inPantry = (r) => Object.entries(r.ingredients).every(([id, q]) => !by[id] || avail(id) >= q * factor(r));
let pickQuery = "";
function pickMeal(i, j) {
  pickQuery = "";
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>Choisir le ${SLOTS[j].toLowerCase()}</h2><p class="muted">${dayName(i)} ${dayDate(i)} · actuellement : ${esc(slot(i, j).r.name)}</p><input type="search" placeholder="Une recette, un ingrédient, une cuisine…" oninput="pickQuery=this.value;pickRows(${i},${j})" autofocus><div id="pick-rows" class="pick-list"></div>`;
  modal().showModal();
  pickRows(i, j);
}
function pickRows(i, j) {
  const q = norm(pickQuery),
    cur = slot(i, j).r.id;
  const list = R.filter((r) => fitsSlot(r, j) && r.id !== cur && norm(r.name + " " + r.cuisine + " " + Object.keys(r.ingredients).map((id) => by[id]?.name || "").join(" ")).includes(q))
    .map((r) => ({ r, ok: inPantry(r), like: s.ratings[r.id] === 1, fit: slotOk(s.plan.days, i, j, r) }))
    .sort((a, b) => b.fit - a.fit || b.ok - a.ok || b.like - a.like || a.r.name.localeCompare(b.r.name, "fr"));
  const frozen = j > 0 && !q ? freezerRows(i, j) : "";
  document.getElementById("pick-rows").innerHTML =
    (frozen ? `<p class="muted"><b>🧊 Au congélateur</b></p>${frozen}<p class="muted"><b>Dans le carnet</b></p>` : "") +
    list
      .map(({ r, ok, like, fit }) => {
        const m = macro(r);
        return `<button class="pick-row" onclick="setMeal(${i},${j},'${r.id}')"><span class="pick-emoji">${r.emoji}</span><span><b>${esc(r.name)}</b><small class="muted">${esc(r.cuisine)} · ${r.time} min · ${Math.round(m.kcal)} kcal · ${Math.round(m.protein)} g prot.${ok ? " · ✓ tout est au placard" : ""}${like ? " · 👍" : ""}${j && !slotOk(s.plan.days, i, j, r) ? " · ⚠️ ressemble à un repas voisin" : ""}</small></span></button>`;
      })
      .join("") || '<p class="muted">Aucune recette trouvée.</p>';
}
function setMeal(i, j, id) {
  s.plan.days[i][j] = id;
  if (s.plan.freezerUse) delete s.plan.freezerUse[i + "-" + j];
  if (s.plan.ate) delete s.plan.ate[i + "-" + j];
  delete s.done[i + "-" + j];
  s.checked = {};
  save();
  modal().close();
  render();
  toast(`${dayName(i)} : ${byR[id].name}. Courses et budget recalculés.`);
}
// Depuis une fiche recette : choisir le jour et le repas à remplacer.
function addToMenu(id) {
  const r = byR[id],
    slots = r.meal === "breakfast" ? [0] : [1, 2],
    batch = r.type === "batch",
    have = s.freezer[id] || 0;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>📅 ${esc(r.name)}</h2><p class="muted">Remplace le repas choisi ; les courses et le budget suivent.</p>${
    batch
      ? `<form id="batch-src" class="choice-list"><label class="period"><input type="radio" name="src" value="freezer" ${have ? "checked" : ""}> <span><b>🧊 Il y en a au congélateur</b><br><small class="muted">${have ? `${have} portion${have > 1 ? "s" : ""} comptée${have > 1 ? "s" : ""}` : "Portions au congélateur :"} <input name="n" type="number" min="1" max="40" value="${have || 2}" style="width:70px" ${have ? "hidden" : ""}></small></span></label><label class="period"><input type="radio" name="src" value="cook" ${have ? "" : "checked"}> <span><b>🧑‍🍳 Je le prépare</b><br><small class="muted">Ajouté au batch cooking et à la liste de courses</small></span></label></form>`
      : ""
  }<div class="slot-grid">${s.plan.days
    .map((d, i) => `<div class="slot-day"><b>${dayName(i).slice(0, 3)}. ${dayDate(i)}</b>${slots.map((j) => (s.done[i + "-" + j] ? `<span class="muted">${SLOTS[j].toLowerCase()} · fait</span>` : `<button class="secondary small" onclick="placeMeal(${i},${j},'${id}')">${SLOTS[j].toLowerCase()}<br><small>${esc(slot(i, j).r.name)}</small></button>`)).join("")}</div>`)
    .join("")}</div>`;
  modal().showModal();
}
// Plat de fournée mis au menu depuis sa fiche : servi du congélateur, ou préparé (batch cooking et courses).
function placeMeal(i, j, id) {
  const f = document.getElementById("batch-src");
  if (!f) return setMeal(i, j, id);
  if (f.src.value === "freezer") {
    if (!(s.freezer[id] > 0)) s.freezer[id] = Math.max(1, Math.round(+f.n.value || 2));
    return setFreezer(i, j, id);
  }
  if (!s.batches.includes(id)) s.batches.push(id);
  delete s.batchDone[id];
  setMeal(i, j, id);
}
function swap(i, j) {
  const cur = s.plan.days[i][j];
  const opts =
    j === 0
      ? [...s.batches.filter((id) => byR[id]?.meal === "breakfast").map((id) => byR[id]), ...R.filter((r) => r.type === "breakfast" && allowed(r))]
      : R.filter((r) => r.type === "main" && !r.fixed && !r.noPlan && allowed(r) && !hasPork(r));
  const all = opts.filter((r) => r.id !== cur),
    balanced = all.filter((r) => slotOk(s.plan.days, i, j, r)),
    pool = balanced.length ? balanced : all;
  if (!pool.length) return toast("Aucune alternative avec ces exclusions.");
  s.plan.days[i][j] = pool[Math.floor(Math.random() * pool.length)].id;
  delete s.plan.freezerUse?.[i + "-" + j];
  s.checked = {};
  save();
  render();
  toast("Repas remplacé, budget et courses recalculés.");
}
// Plats du congélateur pour le midi ou le soir : ce qui y est, et de quoi déclarer un plat congelé que l'app ne connaît pas encore.
const frozenMeals = () => Object.entries(s.freezer).filter(([id, n]) => n > 0 && byR[id] && byR[id].meal === "main" && !byR[id].yields);
const freezable = () => R.filter((r) => (r.type === "batch" ? r.meal === "main" && r.freezer && !r.yields : r.type === "main" && !r.fixed));
function freezerRows(i, j) {
  return frozenMeals()
    .map(([id, n]) => `<button class="pick-row" onclick="setFreezer(${i},${j},'${id}')"><span class="pick-emoji">🧊</span><span><b>${byR[id].emoji} ${esc(byR[id].name)}</b><small class="muted">${n} portion${n > 1 ? "s" : ""} au congélateur${n < 2 ? " · une seule portion : à compléter" : ""}${slotOk(s.plan.days, i, j, byR[id]) ? "" : " · ⚠️ ressemble à un repas voisin"}</small></span></button>`)
    .join("");
}
function useFreezer(i, j) {
  const rows = freezerRows(i, j);
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>🧊 Un plat du congélateur</h2><p class="muted">${dayName(i)} · ${SLOTS[j].toLowerCase()}. Deux portions seront retirées quand le repas sera marqué mangé ; ses ingrédients sortent des courses.</p>${rows ? `<div class="pick-list">${rows}</div>` : '<p class="muted">L’app ne compte aucun plat au congélateur.</p>'}<details class="panel" ${rows ? "" : "open"}><summary>Un plat congelé qui n’est pas dans la liste</summary><form onsubmit="event.preventDefault();declareFrozen(this,${i},${j})"><label>Plat<input name="dish" list="freezable-list" required placeholder="Ex. Gyoza, Bolognaise…"></label><datalist id="freezable-list">${freezable()
    .map((r) => `<option value="${esc(r.name)}">`)
    .join("")}</datalist><label>Portions au congélateur (une par personne et par repas)<input name="n" type="number" min="1" max="40" value="2"></label><button type="submit">Ajouter et mettre au menu</button></form></details>`;
  modal().showModal();
}
function declareFrozen(f, i, j) {
  const name = norm(f.dish.value),
    r = freezable().find((x) => norm(x.name) === name) || freezable().find((x) => norm(x.name).includes(name));
  if (!r) return toast("Plat introuvable : choisissez-le dans la liste proposée.");
  s.freezer[r.id] = (s.freezer[r.id] || 0) + Math.max(1, Math.round(+f.n.value || 2));
  setFreezer(i, j, r.id);
}
function setFreezer(i, j, id) {
  (s.plan.freezerUse ??= {})[i + "-" + j] = id;
  if (s.plan.ate) delete s.plan.ate[i + "-" + j];
  delete s.done[i + "-" + j];
  s.checked = {};
  save();
  modal().close();
  render();
  toast("Repas du congélateur prévu : ses ingrédients sortent des courses.");
}
function stock() {
  const frozen = Object.entries(s.freezer).filter(([id, n]) => n > 0 && byR[id]),
    mine = C.filter((x) => (s.stock[x.id] || 0) > 0).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    review = s.custom.filter((x) => by[x.id] && !x.confirmed),
    same = maybeSame().filter(([from]) => !review.some((x) => x.id === from));
  return (
    heading("LA BASE DE VOS FUTURS REPAS", "Mon placard.", "Scannez, tapez ou modifiez ce que vous avez. Les recettes et les courses en tiennent compte.") +
    `<div class="panel"><div class="row spread"><h2>➕ Ajouter des aliments</h2><button class="secondary small" onclick="aiSettings()">🤖 Claude : ${aiKey() ? "activé" : "désactivé"}</button></div><div class="row"><button onclick="scanner()">📷 Scanner un code-barres</button></div><label>Ou tapez-les, un par ligne ou séparés par des virgules<textarea id="quick" rows="3" placeholder="2 steaks, 500 g de vermicelles de riz, sauce soja, 6 œufs, 1 kg de carottes"></textarea></label><button class="secondary" onclick="quickParse()">Analyser</button><div id="quick-result"></div></div>` +
    (same.length
      ? `<div class="panel review"><h2>🧩 Même aliment ? (${same.length})</h2><p class="muted">Ces produits ressemblent à un aliment de l’app. Une réponse suffit : l’app s’en souvient.</p>${same
          .map(([from, to]) => `<div class="review-row"><span><b>${esc(by[from].name)}</b> <small class="muted">${qtyLabel(s.stock[from] || 0, by[from].unit)}</small><br><small class="muted">= ${esc(by[to].name.split(" · ")[0])} ?</small></span><span class="row"><button class="small" onclick="mergeInto('${from}','${to}')">C’est pareil</button><button class="secondary small" onclick="notSame('${from}','${to}')">Non</button></span></div>`)
          .join("")}</div>`
      : "") +
    (review.length
      ? `<div class="panel review"><h2>🔗 À rattacher (${review.length})</h2><p class="muted">Reliez chaque produit à un aliment de l’app pour que les recettes l’utilisent, ou confirmez que c’est un produit à part (sirop, snack…) : il reçoit alors son rayon.</p><div class="row"><button class="small" onclick="claudeCopy()">📋 Classer avec l’app Claude</button><button class="secondary small" onclick="claudePaste()">📥 Coller la réponse de Claude</button>${aiKey() ? `<button class="secondary small" onclick="aiReview()">🤖 Classer automatiquement (clé API)</button>` : ""}</div>${review
          .map((x) => {
            const m = matchProduct(x.name)[0];
            return `<div class="review-row"><span><b>${esc(x.name)}</b> <small class="muted">${qtyLabel(s.stock[x.id] || 0, x.unit)}</small></span><span class="row">${m && !m.id.startsWith("custom") ? `<button class="small" onclick="mergeInto('${x.id}','${m.id}')">= ${esc(by[m.id].name.split(" · ")[0])}</button>` : ""}<button class="secondary small" onclick="editItem('${x.id}')">Choisir…</button></span></div>`;
          })
          .join("")}</div>`
      : "") +
    `<div class="panel"><div class="row spread"><h2>🥫 Dans mon placard (${mine.length})</h2><input type="search" placeholder="Rechercher…" value="${esc(query)}" oninput="query=this.value;stockRows()"></div><div id="stockrows" class="pantry"></div></div>` +
    `<div class="panel"><div class="row spread"><h2>🧊 Congélateur</h2><select aria-label="Ajouter au congélateur" onchange="if(this.value){s.freezer[this.value]=(s.freezer[this.value]||0)+1;save();render()}"><option value="">+ Ajouter une portion…</option>${R.filter((r) => r.freezer).map((r) => `<option value="${r.id}">${r.emoji} ${esc(r.name)}</option>`).join("")}</select></div>${
      frozen.length
        ? `<div class="freezer">${frozen.map(([id, n]) => `<div class="freezer-item"><span>${byR[id].emoji} ${esc(byR[id].name)}</span><span class="row"><button class="secondary small" onclick="s.freezer['${id}']=Math.max(0,${n}-1);save();render()" aria-label="Retirer une portion">−</button><b>${n}</b><button class="secondary small" onclick="s.freezer['${id}']=${n}+1;save();render()" aria-label="Ajouter une portion">+</button><small class="muted">${esc(byR[id].unit)}</small></span></div>`).join("")}</div>`
        : '<p class="muted">Vide pour l’instant. Les fournées marquées « Fait » s’ajoutent ici automatiquement.</p>'
    }</div><details class="panel"><summary>Tous les aliments de l’app (${C.length})</summary><p class="muted">Pour saisir une quantité directement ou exclure un aliment des menus.</p><div class="table-wrap"><table><thead><tr><th>Aliment</th><th>En stock</th><th>Exclure</th></tr></thead><tbody id="allrows"></tbody></table></div></details><p class="muted">Riz, pâtes et lentilles pesés secs ; viandes crues ; conserves égouttées. Le scanner retient chaque code-barres : la prochaine fois, un scan suffit.</p>`
  );
}
function stockRows() {
  const q = norm(query),
    hit = (x) => !q || norm(x.name + " " + (window.ALIASES?.[x.id] || "")).includes(q);
  const e = document.getElementById("stockrows");
  if (e) {
    const mine = C.filter((x) => (s.stock[x.id] || 0) > 0 && hit(x)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const html = [...Object.keys(window.TAXONOMY), "À rattacher"]
      .map((main) => {
        const inMain = mine.filter((x) => aisle(x).split(" › ")[0] === main);
        if (!inMain.length) return "";
        const subs = [...new Set(inMain.map((x) => aisle(x).split(" › ")[1] || ""))];
        return `<h3 class="aisle">${esc(main)}</h3>` + subs.map((sub) => (sub ? `<h4 class="sub-aisle">${esc(sub)}</h4>` : "") + inMain.filter((x) => (aisle(x).split(" › ")[1] || "") === sub).map(pantryRow).join("")).join("");
      })
      .join("");
    e.innerHTML =
      html || `<p class="muted">${q ? "Rien de ce nom dans le placard." : "Placard vide : scannez ou tapez vos aliments ci-dessus."}</p>`;
  }
  const all = document.getElementById("allrows");
  if (all)
    all.innerHTML = C.filter(hit)
      .map(
        (x) =>
          `<tr><td>${esc(x.name)}</td><td><input aria-label="Stock ${esc(x.name)}" type="number" min="0" step="${x.unit === "pièce" ? 1 : 10}" value="${s.stock[x.id] || 0}" onchange="s.stock['${x.id}']=Math.max(0,+this.value);s.setup=true;save()"> <small class="muted">${x.unit}</small></td><td><input aria-label="Exclure ${esc(x.name)}" type="checkbox" ${s.exclude.includes(x.id) ? "checked" : ""} onchange="exclude('${x.id}',this.checked)"></td></tr>`,
      )
      .join("");
}
// Place d'un aliment (« Rayon › Sous-catégorie ») : celle du catalogue, celle choisie pour un produit à part, sinon « À rattacher ».
const aisle = (x) => window.GROUP_OF[x.id] || (x.confirmed ? normCat(x.cat) : "À rattacher");
// Anciens rayons sans sous-catégorie (« Boissons », « Snacks & sucreries »…) → « Rayon › Autre ».
const OLD_CATS = { Snacks: "En-cas", "Viandes & poissons": "Viandes", "Fruits & légumes": "Légumes", "Conserves & épicerie salée": "Conserves", "Sauces & huiles": "Sauces & condiments", "Épicerie sucrée": "Sucré", Protéinés: "Sucré › Desserts protéinés", "Snacks & sucreries": "En-cas" };
function normCat(c) {
  if (typeof c === "string") c = c.replace(/^Snacks ›/, "En-cas ›");
  if (window.CATEGORIES.includes(c)) return c;
  const old = OLD_CATS[c] || c || "Autre";
  if (window.CATEGORIES.includes(old)) return old;
  const main = Object.keys(window.TAXONOMY).find((m) => m === old) || "Autre";
  return `${main} › Autre`;
}
const catOptions = (cur) =>
  Object.entries(window.TAXONOMY)
    .map(([main, subs]) => `<optgroup label="${esc(main)}">${Object.keys(subs).map((sub) => `<option value="${esc(`${main} › ${sub}`)}" ${cur === `${main} › ${sub}` ? "selected" : ""}>${esc(sub)}</option>`).join("")}</optgroup>`)
    .join("");
function pantryRow(x) {
  return `<div class="pantry-row"><button class="link-like" onclick="editItem('${x.id}')">${esc(x.name.split(" · ")[0])}${x.id.startsWith("custom") && !x.confirmed ? ' <small class="badge">à rattacher</small>' : ""}</button><span class="row"><input aria-label="Quantité ${esc(x.name)}" type="number" min="0" step="${x.unit === "pièce" ? 1 : 10}" value="${Math.round((s.stock[x.id] || 0) * 100) / 100}" onchange="s.stock['${x.id}']=Math.max(0,+this.value);s.setup=true;save()"><small class="muted">${x.unit}</small><button class="secondary small" onclick="editItem('${x.id}')" aria-label="Modifier ${esc(x.name)}">✏️</button></span></div>`;
}

function exclude(id, on) {
  s.exclude = s.exclude.filter((x) => x !== id);
  if (on) s.exclude.push(id);
  save();
  toast("Préférence enregistrée. Recomposez la semaine pour l’appliquer.");
}
function shopping() {
  const same = maybeSame(),
    b = basket(),
    c = b.reduce((a, x) => a + x.total, 0);
  const saved = b.reduce((a, x) => {
    const worst = Math.max(...STORES.map((st) => (offers(x.id).some((o) => o.store === st) ? bestBuy(x.id, x.missing, st).total : 0)));
    return a + Math.max(0, worst - x.total);
  }, 0);
  const shops = [...STORES, "À définir"].filter((st) => b.some((x) => x.store === st));
  return (
    heading("JUSTE CE QU’IL VOUS MANQUE", "Mes courses.", "Chaque produit est placé dans le magasin où il coûte le moins cher pour la quantité nécessaire.", `<button onclick="exportList()">↓ Exporter la liste</button>`) +
    `<label class="inline panel"><input type="checkbox" ${s.cards ? "checked" : ""} onchange="s.cards=this.checked;offerCache={};save();render()"> Cartes de fidélité (Lidl Plus, Kaufland Card XTRA) : utiliser leurs prix réduits</label><label class="panel">Préférer Lidl si l’écart ne dépasse pas (%)<input type="number" min="0" max="50" value="${s.lidlMargin}" onchange="s.lidlMargin=Math.max(0,Math.min(50,+this.value));offerCache={};save();render()"></label>` +
    (!s.plan
      ? '<div class="notice">Générez votre semaine pour obtenir une liste de courses.</div>'
      : `<div class="stats"><div class="stat"><small>À payer au meilleur prix</small><strong>${eur(c)}</strong><em>${money(c)} RON · budget ${money(periodEur())} €${c > budget() + 0.5 ? ` · <b>${eur(c - budget())} au-dessus</b>` : ""}</em></div><div class="stat"><small>Mangé pendant la période</small><strong>${eur(used(s.plan, true))}</strong><em>le reste des paquets entiers reste au placard</em></div><div class="stat"><small>Économie</small><strong>${money(saved)} RON</strong><em>vs le magasin le plus cher, produit par produit</em></div><div class="stat"><small>Magasins</small><strong>${shops.length}</strong><em>${b.length} articles à acheter</em></div></div>${shops
          .map((shop) => {
            const items = b.filter((x) => x.store === shop);
            return `<div class="panel"><h2>${STORE_ICON[shop] || "❔"} ${shop} <span class="muted" style="font-size:13px">· ${money(items.reduce((a, x) => a + x.total, 0))} RON</span></h2><div class="table-wrap"><table class="shop-table"><thead><tr><th>Pris</th><th>Produit</th><th>À acheter</th><th>Total</th></tr></thead><tbody>${items
              .map((x) => {
                const alts = STORES.filter((st) => st !== x.store && offers(x.id).some((o) => o.store === st)).map((st) => `${st} ${money(bestBuy(x.id, x.missing, st).total)}`);
                return `<tr><td><input aria-label="Pris ${esc(by[x.id].name)}" type="checkbox" ${s.checked[x.id] ? "checked" : ""} onchange="s.checked['${x.id}']=this.checked;save()"></td><td><b>${esc(by[x.id].name)}</b><br><small class="muted">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a> · ` : x.name !== by[x.id].name ? esc(x.name) + " · " : ""}${sourceLabel[x.source]}${s.lock[x.id] ? " · 🔒 magasin choisi" : ""}</small><br><small class="muted">Besoin net : ${qtyLabel(x.missing, by[x.id].unit)}${x.have > 0 ? ` (il en faut ${qtyLabel(x.need, by[x.id].unit)}, vous en avez ${qtyLabel(x.have, by[x.id].unit)})` : ""}<br><small class="muted">Pour : ${needFor(x.id)
                  .map(([label, q]) => `${esc(label)} ${qtyLabel(q, by[x.id].unit)}`)
                  .join(" · ") || "le matin"}</small> <button class="text-button" onclick="enough('${x.id}',${x.need})">✓ J’en ai assez</button>${same
                  .filter(([, to]) => to === x.id)
                  .map(([from, to]) => `<br><small>Déjà au placard ? <b>${esc(by[from].name)}</b> (${qtyLabel(s.stock[from] || 0, by[from].unit)}) <button class="small" onclick="mergeInto('${from}','${to}')">C’est pareil</button><button class="secondary small" onclick="notSame('${from}','${to}')">Non</button></small>`)
                  .join("")}${alts.length ? " · ailleurs : " + alts.join(" · ") + " RON" : ""}</small> <button class="text-button" onclick="priceEditor('${x.id}')">Prix ↗</button></td><td>${x.packs} × ${qtyLabel(x.pack, by[x.id].unit)}</td><td>${money(x.total)} RON</td></tr>`;
              })
              .join("")}</tbody></table></div></div>`;
          })
          .join("")}${b.length ? "" : '<div class="notice">Rien à acheter : votre placard couvre toute la semaine.</div>'}<button onclick="receive()">Ajouter les articles cochés au stock</button><p class="muted">Cette action ajoute les paquets au placard et déduit leur coût du budget restant.</p>`) +
    `<details class="panel"><summary>Catalogue & prix des magasins</summary><div class="notice">Auchan et Carrefour : prix relevés sur leurs sites${PR.updated ? ` le ${new Date(PR.updated).toLocaleDateString("fr-FR")}` : ""}. Kaufland : promotions de la semaine seulement. Lidl et METRO : pas de prix en ligne, saisissez-les depuis vos tickets. Les prix changent : relancez <code>node tools/fetch-prices.mjs</code> sur le Mac pour les rafraîchir.</div><input type="search" placeholder="Rechercher un ingrédient…" oninput="catalogRows(this.value)"><div class="table-wrap"><table><thead><tr><th>Ingrédient</th><th>Meilleur prix unitaire</th><th></th></tr></thead><tbody id="catalogrows"></tbody></table></div></details>`
  );
}
function catalogRows(q = "") {
  const e = document.getElementById("catalogrows");
  if (!e) return;
  e.innerHTML = C.filter((x) => norm(x.name).includes(norm(q)))
    .map((x) => {
      const o = [...offers(x.id)].sort((a, b) => a.price / a.pack - b.price / b.pack)[0];
      return `<tr><td>${esc(x.name)}</td><td>${o ? `${perUnit(o, x.unit)} <small class="muted">· ${o.store} · ${sourceLabel[o.source]}</small>` : '<span class="muted">aucun prix</span>'}</td><td><button class="text-button" onclick="priceEditor('${x.id}')">Prix ↗</button></td></tr>`;
    })
    .join("");
}
function priceEditor(id) {
  const x = by[id];
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>${esc(x.name)}</h2><p class="muted">Prix en RON TTC par paquet. Votre prix remplace celui du site pour ce magasin.</p><div class="table-wrap"><table><thead><tr><th>Magasin</th><th>Produits trouvés</th><th>Mon prix</th><th>Paquet (${x.unit})</th></tr></thead><tbody>${STORES.map((st) => {
    const found = (PR.stores?.[st]?.[id] || []).map((o) => `${o.url ? `<a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.name)}</a>` : esc(o.name)} — <b>${money(o.price)}</b>${o.plus ? ` · ${money(o.plus)} avec la carte` : ""}${o.promo ? " (cette semaine)" : ""}`).join("<br>");
    const mine = s.myPrices[id]?.[st] || {};
    return `<tr><td>${STORE_ICON[st]} ${st}</td><td><small>${found || '<span class="muted">—</span>'}</small></td><td><input type="number" min="0" step=".01" value="${mine.price ?? ""}" placeholder="—" onchange="setMyPrice('${id}','${st}',this.value,null)"></td><td><input type="number" min="1" value="${mine.pack ?? x.pack}" onchange="setMyPrice('${id}','${st}',null,this.value)"></td></tr>`;
  }).join("")}</tbody></table></div><label>Toujours acheter chez<select onchange="if(this.value)s.lock['${id}']=this.value;else delete s.lock['${id}'];save();render()"><option value="">Le moins cher (automatique)</option>${STORES.map((st) => `<option ${s.lock[id] === st ? "selected" : ""}>${st}</option>`).join("")}</select></label>`;
  modal().showModal();
}
function setMyPrice(id, st, price, pack) {
  const cur = ((s.myPrices[id] ??= {})[st] ??= { price: 0, pack: by[id].pack });
  if (price !== null) cur.price = Math.max(0, +price || 0);
  if (pack !== null) cur.pack = Math.max(1, +pack || by[id].pack);
  if (!cur.price) delete s.myPrices[id][st];
  offerCache = {};
  save();
  if (tab === "shopping") {
    const open = document.querySelector("details.panel")?.open;
    render();
    if (open) document.querySelector("details.panel").open = true;
  }
}
function receive() {
  const items = basket().filter((x) => s.checked[x.id]);
  if (!items.length) return toast("Cochez les articles achetés.");
  const amount = items.reduce((a, x) => a + x.total, 0);
  items.forEach((x) => (s.stock[x.id] = (s.stock[x.id] || 0) + x.packs * x.pack));
  if (s.plan) s.plan.budgetEur = Math.max(0, Math.round((periodEur() - amount / s.rate) * 100) / 100);
  else s.budgetEur = Math.max(0, Math.round((s.budgetEur - amount / s.rate) * 100) / 100);
  s.shopped = true;
  s.checked = {};
  save();
  render();
  toast("Achats ajoutés au stock, budget restant mis à jour.");
}
// Trois idées selon vos goûts, hors recettes déjà au menu de la semaine.
let inspirationIds = null;
function inspiration() {
  const planned = new Set(s.plan ? s.plan.days.flat() : []);
  if (!inspirationIds || inspirationIds.some((id) => !byR[id] || !allowed(byR[id])))
    inspirationIds = R.filter((r) => r.type === "main" && !r.fixed && !r.noPlan && allowed(r) && !planned.has(r.id))
      .map((r) => ({ id: r.id, v: taste(r) * 2 + Math.random() * 2 }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 3)
      .map((x) => x.id);
  return `<div class="section-line"><h2>✨ Idées pour vous</h2><button class="text-button" onclick="inspirationIds=null;render()">Autres idées ↻</button></div><div class="grid">${inspirationIds.map((id, i) => card(byR[id], i)).join("")}</div>`;
}
function recipes() {
  const cuisines = [...new Set(R.map((r) => r.cuisine))].sort();
  const creators = [...CREATORS, ...s.creators.map((h) => [h, "Ajouté par vous"])];
  return (
    heading("D’ASIE, DE RUSSIE, DE FRANCE…", "Le carnet de recettes.", `${R.length} recettes · quantités pour deux à l’ouverture.`, `<span class="row"><button class="secondary" onclick="recipeImport()">📥 Importer depuis Claude</button><button onclick="recipeForm()">+ Ajouter une recette</button></span>`) +
    inspiration() +
    `<div class="row filters"><input id="rq" type="search" placeholder="Une recette, un ingrédient…" value="${esc(query)}" oninput="query=this.value;recipeRows()"><select onchange="category=this.value;recipeRows()">${[["all", "Toutes les recettes"], ["breakfast", "Petit-déjeuner"], ["main", "Déjeuner & dîner"], ["drink", "🥤 Boissons"], ["snack", "🍿 En-cas"], ["sauce", "🥫 Sauces"], ["batch", "Fournées & congélation"], ["veg", "Végétarien"], ["mine", "Mes recettes"], ["liked", "👍 On aime"], ["unrated", "Pas encore notées"], ["disliked", "👎 Écartées"]].map(([v, l]) => `<option value="${v}" ${category === v ? "selected" : ""}>${l}</option>`).join("")}</select><select onchange="cuisine=this.value;recipeRows()"><option value="all">Toutes les cuisines</option>${cuisines.map((c) => `<option ${cuisine === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div><div class="grid" id="reciperows"></div><details class="panel"><summary>Créateurs food à suivre</summary><p class="muted">Vous voyez une recette qui vous plaît dans un reel ? Ajoutez-la avec « + Ajouter une recette » en collant le lien : elle entre dans le planning et la liste de courses.</p><div class="chips">${creators.map(([h, d]) => `<a class="chip" href="https://www.instagram.com/${encodeURIComponent(h)}/" target="_blank" rel="noopener">@${esc(h)} <small>${esc(d)}</small></a>`).join("")}</div><form class="row" onsubmit="event.preventDefault();addCreator(this.h.value)"><input name="h" placeholder="@compte_instagram" maxlength="40" required><button class="secondary">Ajouter</button></form></details>`
  );
}
function addCreator(h) {
  h = h.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{2,30}$/.test(h)) return toast("Nom de compte invalide.");
  if (!s.creators.includes(h)) s.creators.push(h);
  save();
  render();
  document.querySelector("details.panel").open = true;
}
function recipeRows() {
  const q = norm(query);
  const list = R.filter(
    (r) =>
      (category === "all" ||
        (category === "veg" && r.veg) ||
        (category === "mine" && r.source !== undefined) ||
        (category === "liked" && s.ratings[r.id] === 1) ||
        (category === "unrated" && s.ratings[r.id] === undefined) ||
        (category === "disliked" && s.ratings[r.id] === -1) ||
        (category === "snack" && r.snack) ||
        r.type === category) &&
      (cuisine === "all" || r.cuisine === cuisine) &&
      norm(r.name + " " + r.cuisine + " " + Object.keys(r.ingredients).map((id) => by[id]?.name || "").join(" ")).includes(q),
  );
  document.getElementById("reciperows").innerHTML = list.map(card).join("") || "<p>Aucune recette trouvée.</p>";
}
function profiles() {
  if (s.plan && s.day >= s.plan.days.length) s.day = 0;
  const d = s.plan ? s.plan.days[s.day].map((_, j) => slot(s.day, j).r) : [],
    m = d.reduce(
      (a, r) => {
        const v = macro(r);
        a.kcal += v.kcal;
        a.protein += v.protein;
        a.fiber += v.fiber;
        return a;
      },
      { ...(s.plan ? morningMacro() : { kcal: 0, protein: 0, fiber: 0 }) },
    );
  return (
    heading("DES REPÈRES POUR CHACUN", "Profils & nutrition.", "Deux personnes, deux objectifs. Des portions identiques pour commencer.") +
    `<div class="notice">Saisissez votre propre objectif quotidien en protéines et calories. Les valeurs proposées sont des exemples à personnaliser, pas une prescription. Calculs alimentaires estimatifs à vérifier avec les étiquettes.</div><div class="profile-grid">${s.profiles.map((p, i) => `<section class="panel"><div class="eyebrow">PROFIL 0${i + 1}</div><label>Prénom<input type="text" maxlength="40" value="${esc(p.name)}" onchange="s.profiles[${i}].name=this.value;save()"></label><br><label>Objectif de protéines · g / jour<input type="number" min="1" max="500" value="${p.protein}" onchange="s.profiles[${i}].protein=Math.max(1,Math.min(500,+this.value));save();render()"></label><label>Objectif énergétique · kcal / jour<input type="number" min="500" max="6000" value="${p.kcal}" onchange="s.profiles[${i}].kcal=Math.max(500,Math.min(6000,+this.value));save();render()"></label></section>`).join("")}</div><div class="panel"><div class="row spread"><h2>Votre journée en chiffres</h2><select onchange="s.day=+this.value;save();render()">${(s.plan ? s.plan.days : DAYS).map((_, i) => `<option value="${i}" ${i === s.day ? "selected" : ""}>${s.plan ? `${dayName(i)} ${dayDate(i)}` : DAYS[i]}</option>`).join("")}</select></div>${
      s.plan
        ? `<p class="muted">Prévision des 3 repas du menu par personne${morningItem() ? `, avec le ${morningItem().label} du matin` : ""}. Repère fibres : 30 g par jour.</p><div class="profile-grid">${s.profiles
            .map((p) => {
              const gap = Math.max(0, p.protein - m.protein);
              return `<div><h3>${esc(p.name)}</h3><b>${Math.round(m.protein)} / ${p.protein} g de protéines</b><div class="progress"><span style="width:${Math.min(100, (m.protein / p.protein) * 100)}%"></span></div><b>${Math.round(m.fiber)} / 30 g de fibres</b><div class="progress fiber"><span style="width:${Math.min(100, (m.fiber / 30) * 100)}%"></span></div><p>${Math.round(m.kcal)} / ${p.kcal} kcal prévues<br><span class="muted">${m.kcal < p.kcal ? Math.round(p.kcal - m.kcal) + " kcal à couvrir selon vos besoins" : "Objectif énergétique atteint ou dépassé"}</span></p><div class="notice ${gap ? "warning" : ""}">${gap ? `Écart : <b>${Math.round(gap)} g de protéines</b>.<br>Équivalent théorique : <b>${Math.ceil(gap / (s.powder / 100))} g de poudre</b> à ${s.powder} % de protéines, ou environ ${Math.ceil((gap / 10) * 100)} g de yaourt protéiné.` : "Objectif protéique atteint par les repas prévus."}</div></div>`;
            })
            .join("")}</div>`
        : "<p>Générez une semaine pour afficher les apports prévus et les écarts.</p>"
    }<div class="panel"><h2>💪 Compléter les protéines</h2><p class="muted">L’écart de la semaine est comblé avec un produit ajouté automatiquement à la liste de courses.</p><div class="row"><label class="inline"><input type="checkbox" ${s.topupOn ? "checked" : ""} onchange="s.topupOn=this.checked;save();render()"> Ajouter aux courses</label><label>Produit<select onchange="s.topup=this.value;save();render()">${["protein_coffee", "protein_pudding", "yogurt", "cottage", "cheese"].map((id) => `<option value="${id}" ${s.topup === id ? "selected" : ""}>${esc(by[id].name.split(" · ")[0])}</option>`).join("")}</select></label><label class="inline"><input type="checkbox" ${s.topupInBudget ? "checked" : ""} onchange="s.topupInBudget=this.checked;save();render()"> Compter dans le budget</label><label>Maximum par semaine<input type="number" min="0" max="50" step="1" value="${s.topupMax}" onchange="s.topupMax=Math.max(0,Math.round(+this.value||0));save();render()"></label></div>${s.plan ? `<p>Cette semaine : <b>${Math.round(proteinGap())} g</b> à compléter → <b>${qtyLabel(topupQty(), by[s.topup].unit)}</b> (${eur(topupCost())}).</p>` : ""}<p class="muted">Ex. un café protéiné ≈ 25 g de protéines. Vérifiez l’étiquette de votre produit.</p></div><label>Protéines de votre poudre · g pour 100 g<input type="number" min="1" max="100" value="${s.powder}" onchange="s.powder=Math.max(1,Math.min(100,+this.value));save();render()"></label></div>`
  );
}
function detail(id, i, j) {
  const r = byR[id],
    m = macro(r),
    f = factor(r);
  const key = i !== undefined ? i + "-" + j : null,
    fz = key && s.plan?.freezerUse?.[key] === id;
  let action = "";
  if (key && !s.done[key]) action = `<button onclick="cook(${i},${j})">${fz ? "✓ Mangé : retirer 2 portions du congélateur" : r.type === "batch" ? "✓ Mangé" : "✓ Repas cuisiné : déduire du placard"}</button>`;
  else if (!key && (r.type === "main" || r.type === "breakfast" || (r.type === "batch" && r.meal === "main" && !r.yields)) && s.plan) action = `<button onclick="addToMenu('${id}')">📅 Mettre au menu</button>`;
  if (!key && r.type === "batch" && s.batches.includes(id) && !s.batchDone[id]) action += `<button class="${action ? "secondary" : ""}" onclick="cookBatch('${id}')">✓ Fournée préparée : déduire du placard${r.freezer ? " et ranger au congélateur" : ""}</button>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><div style="font-size:50px">${r.emoji}</div><h2>${esc(r.name)}</h2><p>${esc(r.cuisine)} · ${r.time} min · <b>${isTotal(r) ? `${r.type === "sauce" ? "pour" : "fournée de"} ${r.portions} ${esc(r.unit)}` : "2 personnes"}</b>${r.freezer ? " · 🧊 se congèle" : ""}</p>${r.source ? `<p><a href="${esc(r.source)}" target="_blank" rel="noopener">Voir la recette d’origine ↗</a></p>` : ""}<div class="notice">Par ${isTotal(r) ? "portion" : "personne"} : ${Math.round(m.kcal)} kcal · ${Math.round(m.protein)} g de protéines · ${Math.round(m.fiber)} g de fibres</div>${tools(r)}<h3>Dans la cuisine</h3><table>${Object.entries(r.ingredients)
    .filter(([x]) => by[x])
    .map(([x, q]) => `<tr><td>${esc(by[x].name)}</td><td>${qtyLabel(q * f, by[x].unit)}</td></tr>`)
    .join("")}</table>${beforeCooking(r, i)}<h3>À vous de jouer</h3><ol class="steps rich">${richSteps(r, f)}</ol><p class="muted">Sel, poivre et eau selon vos préférences. Poids crus / secs / égouttés.</p>${action}${key ? "" : ` <button class="secondary" onclick="cookExtra('${id}')">🍳 Cuisiné en plus</button>`}${rateBlock(id)}${r.source !== undefined ? ` <button class="secondary" onclick="deleteRecipe('${id}')">Supprimer cette recette</button>` : ""}`;
  modal().showModal();
}
// Chaque étape rappelle les quantités des ingrédients qu'elle utilise (à la première mention).
const STOP = new Set(["frais", "fraiche", "fraiches", "surgele", "surgeles", "seche", "seches", "egoutte", "egouttes", "nature", "riche", "proteines", "entier", "fine", "pret", "boire", "moulue", "douce", "grillees", "fumee", "maison", "japonais", "rond", "liquide", "epaisse", "tranches", "volaille", "lardons"]);
function stems(id) {
  return norm(by[id].name.split(" · ")[0].replace(/\(.*?\)/g, ""))
    .split(" ")
    .filter((w) => w.length >= 3 && !STOP.has(w) && !["des", "aux", "les", "une", "pour"].includes(w))
    .map((w) => w.replace(/(es|s|x)$/, "").slice(0, 6));
}
function richSteps(r, f) {
  const left = new Set(Object.keys(r.ingredients).filter((id) => by[id]));
  return r.steps
    .map((step) => {
      const n = norm(step),
        here = [...left].filter((id) => stems(id).some((st) => st.length >= 3 && n.includes(st)));
      here.forEach((id) => left.delete(id));
      const q = here.map((id) => `${esc(by[id].name.split(" · ")[0].replace(/\(.*?\)/g, "").trim().toLowerCase())} <b>${qtyLabel(r.ingredients[id] * f, by[id].unit)}</b>`);
      return `<li><p>${esc(step)}</p>${q.length ? `<small class="muted">→ ${q.join(" · ")}</small>` : ""}</li>`;
    })
    .join("");
}
// Ce qui a été avancé le dimanche, ou à sortir du congélateur la veille.
function beforeCooking(r, i) {
  if (i === undefined || r.type === "batch") return "";
  const tips = [],
    ing = r.ingredients;
  if (i < 3 && (ing.rice || ing.sushi_rice || ing.buckwheat || ing.bulgur)) tips.push("🍚 La céréale a été cuite dimanche au rice cooker : la réchauffer 2 minutes à la poêle ou au micro-ondes avec une cuillère d’eau.");
  if (i < 3 && ["onion", "carrot", "pepper", "zucchini", "cabbage", "garlic", "ginger"].some((id) => ing[id])) tips.push("🔪 Les légumes sont déjà épluchés et émincés dans la boîte du jour.");
  const meat = ["chicken", "chicken_thigh", "turkey", "chicken_mince", "pork_mince", "beef_stew", "beef_mince", "duck"].find((id) => ing[id]);
  if (meat && i < 2) tips.push("🥩 La viande est portionnée au frigo depuis dimanche.");
  else if (meat) tips.push("❄️ Sortir la viande du congélateur la veille au soir, décongélation au frigo.");
  return tips.length ? `<div class="notice before"><b>Avant de commencer</b><br>${tips.join("<br>")}</div>` : "";
}
const RATES = [
  [1, "👍", "J’aime"],
  [0, "😐", "Moyen"],
  [-1, "👎", "J’aime pas"],
];
function rateBlock(id) {
  const cur = s.ratings[id];
  return `<div class="rate" id="rate-${id}"><h3>Votre avis</h3><div class="row">${RATES.map(([v, e, l]) => `<button class="${cur === v ? "" : "secondary"}" onclick="rate('${id}',${v})">${e} ${l}</button>`).join("")}</div><p class="muted">${cur === -1 ? "Cette recette ne sera plus proposée." : cur === 1 ? "Elle reviendra plus souvent." : "Vos notes affinent les menus : les cuisines et ingrédients que vous aimez reviennent, ceux que vous n’aimez pas s’effacent."}</p></div>`;
}
function rate(id, v) {
  if (s.ratings[id] === v) delete s.ratings[id];
  else s.ratings[id] = v;
  save();
  const e = document.getElementById("rate-" + id);
  if (e) e.outerHTML = rateBlock(id);
  if (tab === "recipes") recipeRows();
  else if (tab !== "week") render();
  toast(v === -1 && s.ratings[id] === -1 ? "Noté : on ne vous la proposera plus. « Changer ↻ » pour la remplacer cette semaine." : "Merci, vos goûts sont mis à jour.");
}
// Juste après un repas : demander l'avis.
function askRating(id) {
  const r = byR[id];
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><div style="font-size:44px">${r.emoji}</div><h2>${esc(r.name)}</h2><p class="muted">Alors, c’était comment ?</p>${rateBlock(id)}`;
  modal().showModal();
}
// Astuces selon l'équipement de la cuisine : four, air fryer, plaques, mixeurs, robot, hachoir, soup maker, rice cooker.
function tools(r) {
  const ing = r.ingredients,
    text = norm(r.name + " " + r.steps.join(" ")),
    t = [];
  if (r.noPlan && !r.manual) t.push("🎉 Plat de fête, entrée ou dessert : jamais proposé comme repas du menu");
  if (ing.rice || ing.sushi_rice || ing.buckwheat) t.push("🍚 Rice cooker pour la céréale");
  if (/air fryer/.test(text)) t.push("💨 Air fryer");
  else if (ing.frozen_fries || ing.panko || ing.chicken_thigh) t.push("💨 Air fryer possible pour dorer sans friture");
  if (/soupe|ciorba|bortsch|tom kha|pho|veloute/.test(text)) t.push("🥣 Soup maker (velouté ou morceaux)");
  if (ing.flour >= 300 && ing.yeast) t.push("🎛️ Robot batteur, crochet");
  if (ing.pork_mince || ing.chicken_mince || ing.beef_mince) t.push("🔩 Hachoir à viande : hachez vous-même des hauts de cuisse");
  if (ing.lemon) t.push("🍋 Presse-agrumes");
  if (/mixer|blender|lisse|velout/.test(text)) t.push("🌀 Mixeur ou mixeur plongeant");
  return t.length ? `<div class="chips">${t.map((x) => `<span class="chip">${x}</span>`).join("")}</div>` : "";
}
function takeStock(ingredients, f, label) {
  const short = Object.entries(ingredients).filter(([id, q]) => by[id] && !HOMEMADE.has(id) && (s.stock[id] || 0) < q * f);
  if (short.length && !confirm(`Stock insuffisant pour ${short.map(([id]) => by[id].name.split(" · ")[0]).join(", ")}.\n${label} quand même et mettre ces stocks à zéro ?`)) return false;
  Object.entries(ingredients).forEach(([id, q]) => by[id] && (s.stock[id] = Math.max(0, (s.stock[id] || 0) - q * f)));
  return true;
}
function cook(i, j) {
  const { key, fz, r } = slot(i, j);
  if (s.done[key]) return;
  // Repas du congélateur (plat ou petit-déjeuner congelé) : deux portions en moins.
  const fromFreezer = fz || (r.type === "batch" && r.freezer && (s.freezer[r.id] || 0) > 0);
  // Plat du congélateur : 2 portions ; petit-déjeuner en fournée : la part du matin (1,5 par défaut).
  if (fromFreezer && r.serve && !takeStock(r.serve, 2, "Marquer mangé")) return;
  if (fromFreezer) s.freezer[r.id] = Math.max(0, Math.round(((s.freezer[r.id] || 0) - (fz ? 2 : r.meal === "breakfast" ? s.breakfastShare : 2)) * 10) / 10);
  else if (r.type !== "batch" && !takeStock(r.ingredients, 2, "Marquer cuisiné")) return;
  s.done[key] = true;
  save();
  modal().close();
  render();
  toast(fromFreezer ? "Bon appétit ! Congélateur mis à jour." : "Repas cuisiné, stock mis à jour pour deux.");
  if (s.ratings[r.id] === undefined) askRating(r.id);
}
// Mangé autre chose que prévu : on retire du placard ce qui a vraiment été mangé.
function ateOther(i, j) {
  const frozen = Object.entries(s.freezer).filter(([id, n]) => n > 0 && byR[id]);
  const row = `<div class="row ing-row"><input class="ing-name" list="ing-list" placeholder="Ingrédient"><input class="ing-qty" type="number" min="0" step="any" placeholder="Quantité"></div>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>On a mangé autre chose</h2><p class="muted">${dayName(i)} · ${SLOTS[j].toLowerCase()}. Le repas prévu reste au placard pour plus tard.</p><form id="ate-form" onsubmit="saveAte(event,${i},${j})"><label>Une recette du carnet (pour deux)<input name="recipe" list="recipe-list" placeholder="Ex. Pâtes carbonara"></label><datalist id="recipe-list">${R.filter((r) => r.type !== "batch").map((r) => `<option value="${esc(r.name)}">`).join("")}</datalist>${frozen.length ? `<label>Ou un plat du congélateur (−2 portions)<select name="freezer"><option value="">—</option>${frozen.map(([id, n]) => `<option value="${id}">${byR[id].emoji} ${esc(byR[id].name)} · ${n}</option>`).join("")}</select></label>` : ""}<h3>Ou des ingrédients à la main</h3><div id="ate-rows">${row.repeat(3)}</div><button type="button" class="secondary" onclick="document.getElementById('ate-rows').insertAdjacentHTML('beforeend',document.querySelector('#ate-rows .ing-row').outerHTML)">+ Ligne</button><datalist id="ing-list">${C.map((x) => `<option value="${esc(x.name)}">${x.unit}</option>`).join("")}</datalist><div class="row" style="margin-top:16px"><button type="submit">Enregistrer</button><button type="button" class="secondary" onclick="saveAte(null,${i},${j},'Restaurant ou livraison')">Restaurant / livraison</button></div></form>`;
  modal().showModal();
}
function saveAte(ev, i, j, label) {
  ev?.preventDefault();
  const key = i + "-" + j,
    used = {};
  if (ev) {
    const f = ev.target,
      r = R.find((x) => norm(x.name) === norm(f.recipe.value));
    if (r) {
      Object.entries(r.ingredients).forEach(([id, q]) => (used[id] = (used[id] || 0) + q * factor(r)));
      label = r.name;
    } else if (f.freezer?.value) {
      s.freezer[f.freezer.value] = Math.max(0, (s.freezer[f.freezer.value] || 0) - 2);
      label = byR[f.freezer.value].name;
    }
    for (const row of f.querySelectorAll(".ing-row")) {
      const typed = row.querySelector(".ing-name").value,
        m = matchProduct(typed),
        x = C.find((c) => norm(c.name) === norm(typed)) || (m[0] && m[0].score >= 13 ? by[m[0].id] : null),
        q = +row.querySelector(".ing-qty").value;
      if (x && q > 0) used[x.id] = (used[x.id] || 0) + q;
    }
    if (!label && Object.keys(used).length) label = Object.keys(used).map((id) => by[id].name.split(" · ")[0]).join(", ");
    if (!label) return toast("Choisissez une recette, un plat du congélateur ou des ingrédients.");
  }
  Object.entries(used).forEach(([id, q]) => (s.stock[id] = Math.max(0, (s.stock[id] || 0) - q)));
  (s.plan.ate ??= {})[key] = label;
  s.done[key] = true;
  save();
  modal().close();
  render();
  toast(Object.keys(used).length ? "Noté : le placard est mis à jour." : "Noté, rien à retirer du placard.");
}
function cookBatch(id) {
  const r = byR[id];
  if (!takeStock(r.ingredients, 1, "Marquer préparée")) return;
  s.batchDone[id] = true;
  if (r.freezer) s.freezer[id] = (s.freezer[id] || 0) + r.portions;
  for (const [x, q] of Object.entries(r.yields || {})) s.stock[x] = (s.stock[x] || 0) + q;
  save();
  if (modal().open) modal().close();
  render();
  toast(r.freezer ? `${r.portions} ${r.unit} au congélateur.` : "Fournée prête, stock mis à jour.");
}

// ─── Mes recettes (vues sur Insta, TikTok…) ──────────────────────────────
// ─── Importer des recettes depuis l'app Claude (abonnement) ───
const RECIPE_TYPES = { main: "plat", breakfast: "petit-déjeuner", drink: "boisson", snack: "en-cas", sauce: "sauce", batch: "fournée / batch cooking" };
function importPrompt() {
  return [
    "Retrouve dans nos conversations passées toutes les recettes que tu m’as proposées (et celles de cette conversation si j’en colle). Je veux les importer dans mon app de cuisine.",
    "Inclus tout : plats, petits-déjeuners, batch cooking, mais aussi les sauces, les boissons et les en-cas.",
    "",
    "Réponds UNIQUEMENT par un tableau JSON, sans texte autour, une entrée par recette, sans doublon :",
    '[{"name":"Poulet teriyaki","emoji":"🍗","cuisine":"Japonaise","type":"main","time":25,"servings":2,"portions":0,"freezer":false,"veg":false,"ingredients":[{"name":"hauts de cuisse de poulet","qty":300,"unit":"g"},{"name":"sauce soja","qty":45,"unit":"ml"},{"name":"oeuf","qty":2,"unit":"pièce"}],"steps":["Étape 1 claire et complète.","Étape 2."]}]',
    "",
    "Règles :",
    `- type : ${Object.entries(RECIPE_TYPES).map(([k, v]) => `"${k}" (${v})`).join(", ")}.`,
    "- servings : nombre de personnes pour les quantités données. Pour une fournée (batch) ou une sauce (sauce), quantités pour la recette entière et portions = nombre de portions produites.",
    "- unit : seulement g, ml ou pièce. Convertis : 1 c. à soupe ≈ 15 g ou 15 ml, 1 c. à café ≈ 5 g ou 5 ml, 1 verre ≈ 200 ml, 1 gousse d’ail ≈ 5 g. Sel, poivre et eau : ne pas les lister.",
    "- name des ingrédients : nom simple en français (« blanc de poulet », « riz », « sauce soja »), sans marque.",
    "- steps : étapes réécrites clairement, avec températures et temps de cuisson. J’ai four, air fryer, plaques, rice cooker, soup maker, robot batteur, mixeur et hachoir.",
    "- freezer : true si le plat se congèle bien. veg : true si végétarien.",
    "- type \"main\" seulement pour un vrai repas du quotidien (une protéine, des légumes, un féculent). Entrées, apéritifs, plats de fête (foie gras…) et desserts : type \"snack\".",
  ].join("\n");
}
function recipeImport() {
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>📥 Importer depuis Claude</h2><ol class="steps"><li>Touchez « Copier la demande », ouvrez l’app Claude et collez-la dans une nouvelle conversation. Claude retrouve les recettes qu’il vous a déjà proposées. Vous pouvez aussi coller une recette en dessous de la demande.</li><li>Copiez sa réponse (le tableau qui commence par <code>[</code>) et collez-la ci-dessous.</li></ol><div class="row"><button class="secondary" onclick="navigator.clipboard.writeText(importPrompt()).then(()=>toast('Demande copiée : collez-la dans Claude.')).catch(()=>{document.getElementById('import-prompt').hidden=false})">📋 Copier la demande</button><a class="button-like" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude</a></div><textarea id="import-prompt" readonly rows="5" hidden onclick="this.select()">${esc(importPrompt())}</textarea><form onsubmit="event.preventDefault();importApply(this.reply.value)"><label>Réponse de Claude<textarea name="reply" rows="8" required placeholder='[{"name":"…","type":"main","ingredients":[…],"steps":[…]}]'></textarea></label><button type="submit">Importer les recettes</button></form>`;
  modal().showModal();
}
// Ingrédient d'une recette importée : aliment de l'app si reconnu, sinon nouvel ingrédient.
function importIngredient(name, qty, unit, created) {
  const m = matchProduct(name),
    x = C.find((c) => norm(c.name.split(" · ")[0]) === norm(name)) || (m[0] && m[0].score >= 13 && !m[0].id.startsWith("custom") ? by[m[0].id] : null);
  const u = ["g", "ml", "pièce"].includes(unit) ? unit : "g";
  if (x) {
    if (x.unit === u || (x.unit !== "pièce" && u !== "pièce")) return [x.id, qty];
    const piece = window.PIECE_G?.[x.id];
    return [x.id, x.unit === "pièce" ? Math.max(0.25, Math.round((qty / (piece || 60)) * 4) / 4) : qty * (piece || 100)];
  }
  const id = newCustom(name.replace(/^./, (c) => c.toUpperCase()), u, u === "pièce" ? 1 : 500);
  Object.assign(by[id], { confirmed: true, cat: "Autre › Autre" });
  created.push(by[id].name);
  return [id, qty];
}
function importApply(reply) {
  let list;
  try {
    list = JSON.parse(reply.slice(reply.indexOf("["), reply.lastIndexOf("]") + 1));
    if (!Array.isArray(list)) throw Error();
  } catch {
    return toast("Réponse illisible : copiez tout le tableau donné par Claude.");
  }
  const created = [],
    added = [],
    skipped = [];
  for (const raw of list) {
    if (!raw || typeof raw.name !== "string" || !Array.isArray(raw.ingredients) || !raw.ingredients.length) continue;
    const name = raw.name.trim().slice(0, 80);
    if (R.some((r) => norm(r.name) === norm(name))) {
      skipped.push(name);
      continue;
    }
    const type = RECIPE_TYPES[raw.type] ? raw.type : "main",
      servings = Math.max(1, +raw.servings || 2),
      ingredients = {};
    for (const ing of raw.ingredients) {
      const qty = +ing?.qty;
      if (!ing || typeof ing.name !== "string" || !ing.name.trim() || !(qty > 0)) continue;
      const [id, q] = importIngredient(ing.name.trim().slice(0, 70), qty, ing.unit, created);
      ingredients[id] = (ingredients[id] || 0) + (type === "batch" || type === "sauce" ? q : q / servings);
    }
    if (!Object.keys(ingredients).length) continue;
    s.myRecipes.push({
      id: "my" + Date.now() + added.length,
      name,
      emoji: typeof raw.emoji === "string" && raw.emoji ? raw.emoji.slice(0, 4) : "🍽️",
      cuisine: typeof raw.cuisine === "string" && raw.cuisine.trim() ? raw.cuisine.trim().slice(0, 30) : "Maison",
      type,
      time: Math.max(1, Math.round(+raw.time || 30)),
      ingredients,
      steps: (Array.isArray(raw.steps) ? raw.steps : []).filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim().slice(0, 600)),
      veg: !!raw.veg,
      freezer: !!raw.freezer,
      portions: type === "batch" || type === "sauce" ? Math.max(1, Math.round(+raw.portions || servings)) : 0,
      unit: "portions",
      meal: type === "breakfast" ? "breakfast" : "main",
      fixed: null,
      source: "",
    });
    added.push(name);
  }
  offerCache = {};
  loadRecipes();
  save();
  modal().close();
  category = "mine";
  render();
  toast(added.length ? `${added.length} recette${added.length > 1 ? "s" : ""} importée${added.length > 1 ? "s" : ""}${skipped.length ? `, ${skipped.length} déjà dans le carnet` : ""}${created.length ? `, ${created.length} nouvel${created.length > 1 ? "s" : ""} ingrédient${created.length > 1 ? "s" : ""}` : ""}.` : skipped.length ? "Ces recettes sont déjà dans le carnet." : "Aucune recette lisible dans la réponse.");
}
function recipeForm() {
  const row = () => `<div class="row ing-row"><input class="ing-name" list="ing-list" placeholder="Ingrédient"><input class="ing-qty" type="number" min="0" step="any" placeholder="Quantité"></div>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>Ajouter une recette</h2><p class="muted">Notez avec vos mots une recette vue chez un créateur, et collez le lien de la vidéo pour la retrouver.</p><form id="recipe-form" onsubmit="saveRecipe(event)"><label>Nom<input name="name" required maxlength="80" placeholder="Ex. Ramen crémeux au miso"></label><div class="row"><label>Emoji<input name="emoji" maxlength="4" value="🍽️" style="width:70px"></label><label>Cuisine<input name="cuisine" list="cuisine-list" maxlength="30" value="Japonaise"></label><label>Temps (min)<input name="time" type="number" min="1" value="30"></label></div><div class="row"><label>Type<select name="type" onchange="this.form.portions.parentElement.hidden=this.value!=='batch'&&this.value!=='sauce'"><option value="main">Plat · quantités pour 2</option><option value="breakfast">Petit-déj · quantités pour 2</option><option value="drink">Boisson · quantités pour 2</option><option value="snack">En-cas · quantités pour 2</option><option value="sauce">Sauce · quantités pour un pot</option><option value="batch">Fournée / congélation · quantités totales</option></select></label><label hidden>Portions produites<input name="portions" type="number" min="1" value="6"></label><label class="inline"><input type="checkbox" name="veg"> Végétarien</label><label class="inline"><input type="checkbox" name="freezer"> Se congèle</label></div><label>Lien de la vidéo (Instagram, TikTok…)<input name="source" type="url" placeholder="https://www.instagram.com/reel/…"></label><h3>Ingrédients</h3><p class="muted">Choisissez dans la liste pour que les courses suivent. Quantités en g, ml ou pièces selon l’ingrédient.</p><div id="ing-rows">${row().repeat(5)}</div><button type="button" class="secondary" onclick="document.getElementById('ing-rows').insertAdjacentHTML('beforeend',document.querySelector('.ing-row').outerHTML)">+ Ligne</button><datalist id="ing-list">${C.map((x) => `<option value="${esc(x.name)}">${x.unit}</option>`).join("")}</datalist><datalist id="cuisine-list">${[...new Set(R.map((r) => r.cuisine))].map((c) => `<option value="${esc(c)}">`).join("")}</datalist><label>Étapes (une par ligne)<textarea name="steps" rows="6" required></textarea></label><button type="submit">Enregistrer la recette</button></form>`;
  modal().showModal();
}
function saveRecipe(ev) {
  ev.preventDefault();
  const f = new FormData(ev.target),
    type = f.get("type"),
    ingredients = {};
  let created = 0;
  for (const row of ev.target.querySelectorAll(".ing-row")) {
    const name = row.querySelector(".ing-name").value.trim(),
      q = +row.querySelector(".ing-qty").value;
    if (!name || !(q > 0)) continue;
    const m = matchProduct(name);
    let x = C.find((c) => norm(c.name) === norm(name)) || (m[0] && m[0].score >= 13 ? by[m[0].id] : null);
    if (!x) {
      x = { id: "custom" + Date.now() + created++, name: name.slice(0, 70), unit: "g", pack: 500, price: 0, kcal: 0, protein: 0, store: "Lidl", must: [], not: [] };
      C.push(x);
      by[x.id] = x;
      s.custom.push(x);
    }
    ingredients[x.id] = (ingredients[x.id] || 0) + (type === "batch" || type === "sauce" ? q : q / 2);
  }
  if (!Object.keys(ingredients).length) return toast("Ajoutez au moins un ingrédient avec sa quantité.");
  const source = String(f.get("source") || "").trim();
  s.myRecipes.push({
    id: "my" + Date.now(),
    name: String(f.get("name")).trim().slice(0, 80),
    emoji: String(f.get("emoji") || "🍽️").slice(0, 4),
    cuisine: String(f.get("cuisine") || "Maison").trim().slice(0, 30) || "Maison",
    type,
    time: Math.max(1, +f.get("time") || 30),
    ingredients,
    steps: String(f.get("steps")).split("\n").map((x) => x.trim()).filter(Boolean),
    veg: !!f.get("veg"),
    freezer: !!f.get("freezer"),
    portions: type === "batch" || type === "sauce" ? Math.max(1, +f.get("portions") || 1) : 0,
    unit: "portions",
    meal: type === "breakfast" ? "breakfast" : "main",
    fixed: null,
    source: /^https?:\/\//.test(source) ? source : "",
  });
  offerCache = {};
  loadRecipes();
  save();
  modal().close();
  render();
  toast(created ? `Recette ajoutée. ${created} ingrédient(s) nouveau(x) : ajoutez leur prix dans Mes courses.` : "Recette ajoutée au carnet.");
}
function deleteRecipe(id) {
  if (!confirm("Supprimer cette recette de votre carnet ?")) return;
  s.myRecipes = s.myRecipes.filter((r) => r.id !== id);
  s.batches = s.batches.filter((x) => x !== id);
  loadRecipes();
  save();
  modal().close();
  render();
}

// ─── Scanner de codes-barres ──────────────────────────────────────────────
let reader = null;
const canLive = () => window.ZXing && navigator.mediaDevices?.getUserMedia && window.isSecureContext;
function scanner() {
  const e = modal();
  e.innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>📷 Scanner un produit</h2><p class="muted">Visez le code-barres. Le nom du produit vient d’Open Food Facts (connexion internet nécessaire).</p><div id="scan-live">${canLive() ? '<video id="scan-video" playsinline muted></video>' : '<div class="notice">La caméra en direct demande une adresse sécurisée (https). Prenez plutôt le code en photo : ça marche partout.</div>'}</div><div class="row"><label class="button-like">📸 Photographier le code<input hidden type="file" accept="image/*" capture="environment" onchange="scanPhoto(event)"></label></div><form class="row" onsubmit="event.preventDefault();onCode(this.code.value.trim())"><input name="code" inputmode="numeric" placeholder="ou tapez le code (ex. 5941234567890)" pattern="[0-9]{6,14}" required><button class="secondary">Chercher</button></form><div id="scan-result"></div>`;
  e.onclose = stopScan;
  e.showModal();
  if (canLive()) startLive();
}
function startLive() {
  try {
    reader = new ZXing.BrowserMultiFormatReader();
    reader
      .decodeFromConstraints({ video: { facingMode: "environment" } }, "scan-video", (res) => {
        if (res) onCode(res.getText());
      })
      .catch(() => {
        const live = document.getElementById("scan-live");
        if (live) live.innerHTML = '<div class="notice warning">Caméra refusée ou indisponible. Photographiez le code à la place.</div>';
      });
  } catch {
    stopScan();
  }
}
function stopScan() {
  try {
    reader?.reset();
  } catch {}
  reader = null;
}
async function scanPhoto(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  if (!window.ZXing) return toast("Lecteur indisponible. Tapez le code à la main.");
  const url = URL.createObjectURL(file);
  try {
    const res = await new ZXing.BrowserMultiFormatReader().decodeFromImageUrl(url);
    onCode(res.getText());
  } catch {
    toast("Code illisible. Reprenez la photo plus près, bien net et éclairé.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
function parseQty(q) {
  const n = String(q || "").toLowerCase().replace(",", ".");
  const conv = (v, u) => (u === "kg" || u === "l" ? v * 1000 : u === "cl" ? v * 10 : v);
  let m = n.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|l|ml|cl)\b/);
  if (m) return { qty: +m[1] * conv(+m[2], m[3]), unit: /l/.test(m[3]) ? "ml" : "g" };
  if ((m = n.match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml|cl)\b/))) return { qty: conv(+m[1], m[2]), unit: /l/.test(m[2]) ? "ml" : "g" };
  return { qty: 1, unit: "pièce" };
}
// ─── Reconnaissance des aliments : synonymes, catégories Open Food Facts, quantités ───
// Mots trop vagues pour rapprocher deux noms (« frais » rapprochait « saumon frais » et « sirop à la fraise »).
const WEAK = new Set(["frai", "fraiche", "file", "filet", "nature", "natur", "classic", "original", "extra", "premium", "mini", "maxi", "pack", "sachet", "bucati", "buca", "pentru", "with", "avec", "sans", "light", "family", "gust", "aroma"]);
const NOT_COOKING = /\b(sirop|syrup|sirup|soda|limonade|limonada|boisson|bautura|jus|suc|nectar|biscuit|biscuiti|bonbon|bomboane|chips|barre|baton|cereale|cereales|glace|inghetata|napolitane|tablette|energy|monin|cola)s?\b/;
const singular = (t) => t.split(" ").map((w) => (w.length > 3 ? w.replace(/(x|s)$/, "") : w)).join(" ");
const BRANDS = new Set(["kikkoman", "knorr", "maggi", "philadelphia"]);
const ALIAS_LIST = Object.entries(window.ALIASES || {}).flatMap(([id, list]) => list.split("|").map((a) => ({ id, a: " " + singular(norm(a)) + " " })));
// Aliments de l'app les plus probables pour un nom de produit, du plus sûr au moins sûr.
function matchProduct(text, cats = []) {
  const t = " " + singular(norm(text)) + " ",
    scores = {};
  const add = (id, v) => by[id] && (scores[id] = Math.max(scores[id] || 0, v));
  // L'expression la plus longue l'emporte : « steak haché » avant « steak ».
  // Une marque ne dit pas quel produit c'est (Kikkoman fait aussi du mirin) : elle suggère, sans jamais décider seule.
  for (const { id, a } of ALIAS_LIST) if (t.includes(a)) add(id, BRANDS.has(a.trim()) ? 12 : 10 + a.length);
  const tags = cats.map((c) => String(c).toLowerCase());
  for (const [id, list] of Object.entries(window.CATS || {}))
    if (tags.length && list.split("|").some((c) => tags.some((tag) => tag.endsWith(":" + c) || tag.includes(c)))) scores[id] = (scores[id] || 0) + 25;
  if (!Object.keys(scores).length)
    for (const x of C) {
      const n = singular(norm(x.name + " " + (x.query || "")))
        .split(" ")
        .filter((w) => w.length >= 5 && !WEAK.has(w) && t.includes(" " + w + " ")).length;
      if (n) add(x.id, n * 3);
    }
  // Sirop, soda, biscuits… : on propose, mais jamais de rattachement automatique.
  if (NOT_COOKING.test(norm(text))) for (const id in scores) scores[id] = Math.min(scores[id], 12);
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score }));
}
const sure = (m) => m[0] && m[0].score >= 14 && (!m[1] || m[0].score - m[1].score >= 3);
const PACK_WORDS = /^(boites?|paquets?|sachets?|bouteilles?|pots?|conserves?|barquettes?|briques?|filets?)$/;
// Quantité exprimée dans l'unité de l'aliment (g, ml ou pièce).
function toUnit(id, n, unit) {
  const x = by[id],
    piece = window.PIECE_G?.[id];
  // Sans quantité : une pièce pour la viande et le poisson (« steak » = un steak), sinon un paquet.
  if (n == null) return x.unit === "pièce" ? 1 : piece && ["beef_stew", "beef_mince", "chicken", "chicken_thigh", "turkey", "duck", "salmon", "pork_mince"].includes(id) ? piece : x.pack;
  const u = (unit || "").toLowerCase();
  let grams = null;
  if (/^(kg|kilos?)$/.test(u)) grams = n * 1000;
  else if (/^(g|gr|grammes?)$/.test(u)) grams = n;
  else if (/^(l|litres?)$/.test(u)) grams = n * 1000;
  else if (u === "cl") grams = n * 10;
  else if (u === "ml") grams = n;
  else if (PACK_WORDS.test(u)) return n * x.pack;
  if (grams != null) return x.unit === "pièce" ? Math.max(1, Math.round(grams / (piece || 60))) : grams;
  // « 2 steaks », « 3 carottes » : des pièces.
  if (x.unit === "pièce") return n;
  return piece ? n * piece : n * x.pack;
}
// « 500 g de vermicelles de riz », « 2 steaks », « sauce soja » → aliment + quantité.
function parseFoodLine(line) {
  const raw = line.trim();
  if (!raw) return null;
  const t = raw.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/œ/g, "oe");
  let n = null,
    unit = null,
    name = t,
    m = t.match(/^(\d+(?:[.,]\d+)?)\s*([a-z]+)?\s*(?:de |d'|d’)?(.*)$/);
  if (m) {
    n = parseFloat(m[1].replace(",", "."));
    const word = m[2] || "";
    if (/^(kg|kilos?|g|gr|grammes?|l|litres?|cl|ml)$/.test(word) || PACK_WORDS.test(word)) {
      unit = word;
      name = m[3];
    } else name = (word + " " + m[3]).trim();
  } else if ((m = t.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|l|cl|ml)\b/))) {
    name = m[1];
    n = parseFloat(m[2].replace(",", "."));
    unit = m[3];
  }
  name = name.replace(/^(de |d'|d’)/, "").trim();
  const matches = matchProduct(name),
    best = matches[0];
  return { raw, name, n, unit, id: best?.id || null, sure: sure(matches), alts: matches.slice(0, 5).map((x) => x.id), qty: best ? toUnit(best.id, n, unit) : n || 1 };
}
let quickItems = [];
function quickParse() {
  const text = document.getElementById("quick").value;
  quickItems = text.split(/[\n,;]+/).map(parseFoodLine).filter(Boolean);
  if (!quickItems.length) return toast("Tapez au moins un aliment.");
  const options = (it) =>
    `${it.alts.length ? `<optgroup label="Suggestions">${it.alts.map((id) => `<option value="${id}" ${id === it.id ? "selected" : ""}>${esc(by[id].name)}</option>`).join("")}</optgroup>` : ""}<option value="new" ${it.id ? "" : "selected"}>— Nouveau produit : « ${esc(it.name)} » —</option><optgroup label="Tous les aliments">${C.filter((x) => !it.alts.includes(x.id)).map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}</optgroup>`;
  document.getElementById("quick-result").innerHTML = `<div class="quick-list">${quickItems
    .map(
      (it, k) =>
        `<div class="quick-row ${it.sure ? "" : "unsure"}"><small class="muted">« ${esc(it.raw)} »${it.sure ? "" : " · à vérifier"}</small><select onchange="quickLink(${k},this.value)">${options(it)}</select><span class="row"><input type="number" min="0" step="any" value="${Math.round(it.qty * 100) / 100}" onchange="quickItems[${k}].qty=+this.value"><small class="muted" id="qu-${k}">${it.id ? by[it.id].unit : !it.unit || PACK_WORDS.test(it.unit) ? "pièce" : it.unit}</small><button class="secondary small" onclick="quickItems[${k}]=null;this.closest('.quick-row').remove()" aria-label="Retirer">✕</button></span></div>`,
    )
    .join("")}</div><div class="row">${quickItems.some((it) => !it.sure) ? (aiKey() ? `<button class="secondary" onclick="aiQuick()">🤖 Vérifier les lignes incertaines avec Claude</button>` : `<button class="secondary" onclick="aiSettings()">🤖 Activer Claude pour les lignes incertaines</button>`) : ""}<button onclick="quickSave()">Ajouter au placard</button></div>`;
}
function quickLink(k, id) {
  const it = quickItems[k];
  it.id = id === "new" ? null : id;
  if (it.id) {
    it.qty = toUnit(it.id, it.n, it.unit);
    document.querySelectorAll(".quick-row")[k].querySelector("input").value = Math.round(it.qty * 100) / 100;
  }
  document.getElementById("qu-" + k).textContent = it.id ? by[it.id].unit : "g";
}
function quickSave() {
  const done = [];
  for (const it of quickItems.filter(Boolean)) {
    if (!(it.qty > 0)) continue;
    let id = it.id;
    if (!id) {
      // Produit inconnu : pièces sans unité, sinon grammes ou millilitres convertis.
      const u = it.unit || "",
        unit = !u || PACK_WORDS.test(u) ? "pièce" : /^(l|litres?|cl|ml)$/.test(u) ? "ml" : "g";
      if (unit !== "pièce" && it.n != null && it.qty === it.n) it.qty = it.n * (/^(kg|kilos?|l|litres?)$/.test(u) ? 1000 : u === "cl" ? 10 : 1);
      id = newCustom(it.name.replace(/^./, (c) => c.toUpperCase()), it.aiUnit || unit, it.qty);
      if (it.aiCat) Object.assign(by[id], { confirmed: true, cat: normCat(it.aiCat) });
    }
    s.stock[id] = (s.stock[id] || 0) + it.qty;
    done.push(by[id].name.split(" · ")[0]);
  }
  s.setup = true;
  offerCache = {};
  save();
  render();
  toast(done.length ? `Ajouté : ${done.join(", ")}.` : "Rien à ajouter.");
}
function newCustom(name, unit, pack) {
  const id = "custom" + Date.now() + Math.floor(Math.random() * 1000),
    x = { id, name: name.slice(0, 70), unit, pack: pack || (unit === "pièce" ? 1 : 500), price: 0, kcal: 0, protein: 0, store: "Lidl", must: [], not: [] };
  C.push(x);
  by[id] = x;
  s.custom.push(x);
  return id;
}
// Convertit une quantité d'un aliment vers l'unité d'un autre (g ↔ ml ≈ 1:1, pièces via le poids moyen).
function convertQty(q, from, to) {
  const a = by[from].unit,
    b = by[to].unit,
    // Une « pièce » d'un produit vendu au poids (farine, viande hachée…) est un paquet entier.
    piece = window.PIECE_G?.[to] || (b === "pièce" ? window.PIECE_G?.[from] || 60 : by[to].pack || 100);
  if (a === b || (a !== "pièce" && b !== "pièce")) return q;
  return a === "pièce" ? q * piece : Math.max(1, Math.round(q / piece));
}
// Fusionne un produit dans un aliment de l'app : stock, codes-barres, recettes perso, exclusions.
function mergeInto(from, to, quiet = false) {
  if (!by[from] || !by[to] || from === to) return;
  const q = s.stock[from] || 0;
  if (q) s.stock[to] = (s.stock[to] || 0) + convertQty(q, from, to);
  delete s.stock[from];
  for (const b of Object.values(s.barcodes)) if (b.id === from) Object.assign(b, { id: to, qty: convertQty(b.qty, from, to) });
  for (const r of s.myRecipes)
    if (r.ingredients[from] != null) {
      r.ingredients[to] = (r.ingredients[to] || 0) + convertQty(r.ingredients[from], from, to);
      delete r.ingredients[from];
    }
  s.exclude = s.exclude.map((x) => (x === from ? to : x));
  if (from.startsWith("custom")) {
    s.custom = s.custom.filter((x) => x.id !== from);
    C.splice(C.indexOf(by[from]), 1);
    delete by[from];
    delete s.myPrices[from];
    delete s.lock[from];
  }
  offerCache = {};
  loadRecipes();
  if (quiet) return;
  save();
  if (modal().open) modal().close();
  render();
  toast(`Rattaché à ${by[to].name.split(" · ")[0]}.`);
}
// Fiche d'un aliment du placard : quantité, nom, unité, rattachement, suppression.
function editItem(id) {
  const x = by[id],
    custom = id.startsWith("custom"),
    m = matchProduct(x.name).filter((c) => c.id !== id && !c.id.startsWith("custom")).slice(0, 5);
  const codes = Object.entries(s.barcodes).filter(([, b]) => b.id === id).map(([c]) => c);
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>${esc(x.name.split(" · ")[0])}</h2>${custom ? '<p class="muted">Produit ajouté par vous, pas encore relié à un aliment de l’app.</p>' : `<p class="muted">${esc(x.name)}</p>`}<form onsubmit="saveItem(event,'${id}')">${custom ? `<label>Nom<input name="name" maxlength="70" value="${esc(x.name)}"></label>` : ""}<div class="row"><label>Quantité en stock<input name="qty" type="number" min="0" step="any" value="${Math.round((s.stock[id] || 0) * 100) / 100}"></label>${custom ? `<label>Unité<select name="unit">${["g", "ml", "pièce"].map((u) => `<option ${u === x.unit ? "selected" : ""}>${u}</option>`).join("")}</select></label>` : `<span class="muted">${x.unit}</span>`}</div><label>${custom ? "C’est en fait…" : "Déplacer ce stock vers un autre aliment"}<select name="link"><option value="">${custom ? "— Aucun : produit à part, rangé dans le rayon ci-dessous —" : "— Non —"}</option>${m.length ? `<optgroup label="Suggestions">${m.map((c) => `<option value="${c.id}" ${custom && c === m[0] ? "selected" : ""}>${esc(by[c.id].name)}</option>`).join("")}</optgroup>` : ""}<optgroup label="Tous les aliments">${C.filter((c) => c.id !== id && !m.some((y) => y.id === c.id)).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</optgroup></select></label>${custom ? `<fieldset class="standalone"><legend>Si c’est un produit à part</legend><p class="muted">Sirop, soda, snack… : il reste dans le placard, rangé ici. Utilisé seulement si aucun aliment n’est choisi au-dessus.</p><label>Rayon et sous-catégorie<select name="cat">${catOptions(normCat(x.cat))}</select></label></fieldset>` : ""}${codes.length ? `<p class="muted">Code-barres associé${codes.length > 1 ? "s" : ""} : ${codes.join(", ")}</p>` : ""}<div class="row"><button type="submit">Enregistrer</button><button type="button" class="secondary" onclick="s.stock['${id}']=0;save();modal().close();render()">Vider</button>${custom ? `<button type="button" class="secondary" onclick="deleteItem('${id}')">Supprimer le produit</button>` : ""}</div></form>`;
  modal().showModal();
}
function saveItem(ev, id) {
  ev.preventDefault();
  const f = ev.target,
    x = by[id];
  s.stock[id] = Math.max(0, +f.qty.value || 0);
  if (f.name) x.name = f.name.value.trim().slice(0, 70) || x.name;
  if (f.unit) x.unit = f.unit.value;
  if (f.link.value) return mergeInto(id, f.link.value);
  // Produit ajouté par vous sans aliment choisi : rangé à part, il quitte « À rattacher ».
  if (id.startsWith("custom") && f.cat) return confirmItem(id, f.cat.value);
  save();
  modal().close();
  render();
  toast("Placard mis à jour.");
}
function deleteItem(id) {
  if (!confirm(`Supprimer « ${by[id].name} » du placard ?`)) return;
  delete s.stock[id];
  s.custom = s.custom.filter((x) => x.id !== id);
  for (const [c, b] of Object.entries(s.barcodes)) if (b.id === id) delete s.barcodes[c];
  C.splice(C.indexOf(by[id]), 1);
  delete by[id];
  save();
  modal().close();
  render();
}
function confirmItem(id, cat, name) {
  const x = by[id];
  if (name) x.name = name.trim().slice(0, 70) || x.name;
  Object.assign(x, { confirmed: true, cat: normCat(cat) });
  save();
  modal().close();
  render();
  toast(`${x.name} rangé dans « ${x.cat} ».`);
}

// ─── Classement par Claude (clé API personnelle, gardée sur cet appareil) ───
const AI_KEY = "duo-claude-key",
  AI_MODEL = "claude-opus-5-5",
  SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.132.0/+esm";
const aiKey = () => {
  try {
    return localStorage.getItem(AI_KEY) || "";
  } catch {
    return "";
  }
};
let aiClient = null;
async function claudeClient() {
  if (!aiKey()) throw Error("Clé API Claude manquante.");
  if (!navigator.onLine) throw Error("Pas de connexion internet.");
  if (!aiClient) {
    const { default: Anthropic } = await import(SDK_URL);
    aiClient = new Anthropic({ apiKey: aiKey(), dangerouslyAllowBrowser: true });
  }
  return aiClient;
}
function aiSettings() {
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>🤖 Classement par Claude</h2><p class="notice">Sans clé API : dans « À rattacher », touchez « 📋 Classer avec l’app Claude » pour passer par votre abonnement.</p><p>Quand un produit n’est pas reconnu avec certitude, Claude lit son nom, sa marque et ses catégories Open Food Facts, puis le relie au bon aliment de l’app, ou le range comme produit à part.</p><div class="notice">Il faut une clé API Anthropic (console.anthropic.com › API Keys) et internet. Chaque classement coûte environ 1 à 3 centimes, facturés sur votre compte Anthropic. La clé reste sur cet appareil : elle n’est ni exportée dans la sauvegarde ni publiée. Mettez une limite de dépense sur la clé.</div><form onsubmit="event.preventDefault();saveAiKey(this.key.value)"><label>Clé API<input name="key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${aiKey() ? "••••••••" : ""}"></label><div class="row"><button type="submit">Enregistrer</button>${aiKey() ? `<button type="button" class="secondary" onclick="saveAiKey('')">Supprimer la clé</button>` : ""}</div></form>`;
  modal().showModal();
}
function saveAiKey(v) {
  if (v === "••••••••") return modal().close();
  try {
    if (v.trim()) localStorage.setItem(AI_KEY, v.trim());
    else localStorage.removeItem(AI_KEY);
  } catch {
    return toast("Impossible d’enregistrer la clé sur cet appareil.");
  }
  aiClient = null;
  modal().close();
  render();
  toast(v.trim() ? "Claude activé pour le classement des produits." : "Clé supprimée.");
}
// Classe une liste de produits : aliment du catalogue (ou « none »), rayon, unité, nom court.
async function aiClassify(items) {
  const client = await claudeClient();
  const catalog = C.filter((x) => !x.id.startsWith("custom"));
  const schema = {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "integer" },
            match: { type: "string", enum: [...catalog.map((x) => x.id), "none"] },
            category: { type: "string", enum: window.CATEGORIES },
            unit: { type: "string", enum: ["g", "ml", "pièce"] },
            name_fr: { type: "string" },
            reason: { type: "string" },
          },
          required: ["index", "match", "category", "unit", "name_fr", "reason"],
          additionalProperties: false,
        },
      },
    },
    required: ["results"],
    additionalProperties: false,
  };
  const res = await client.beta.messages.create({
    model: AI_MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system:
      "Tu ranges les produits du placard d’un couple qui fait ses courses en Roumanie, pour une app de cuisine. " +
      "Pour chaque produit, donne l’identifiant du catalogue seulement si le produit EST cet ingrédient tel qu’on l’utilise en cuisine : « tăiței de orez » = rice_noodles, « steak » = beef_stew, « steak haché » = beef_mince. " +
      "Un produit sucré, une boisson, un plat préparé ou un produit dont l’ingrédient n’est qu’un parfum ne correspond à aucun : « sirop Monin fraise » → none, Boissons › Sirops ; « chips paprika » → none, En-cas › Chips & salés. " +
      "Dans le doute, réponds none : une mauvaise correspondance fausse les recettes et le stock. " +
      "category : la place « Rayon › Sous-catégorie » la plus juste. unit : comment on le compte (g, ml ou pièce). name_fr : nom court en français, sans la marque. reason : une phrase courte en français.",
    messages: [
      {
        role: "user",
        content:
          "Catalogue (identifiant : nom, unité) :\n" +
          catalog.map((x) => `${x.id} : ${x.name} (${x.unit})`).join("\n") +
          "\n\nProduits à classer :\n" +
          items.map((it, i) => `${i}. ${it.name}${it.brand ? ` · marque ${it.brand}` : ""}${it.quantity ? ` · ${it.quantity}` : ""}${it.categories?.length ? ` · catégories Open Food Facts : ${it.categories.slice(0, 10).join(", ")}` : ""}`).join("\n"),
      },
    ],
    output_config: { format: { type: "json_schema", schema } },
  });
  if (res.stop_reason === "refusal") throw Error("Claude a refusé cette demande.");
  if (res.stop_reason === "max_tokens") throw Error("Réponse de Claude incomplète.");
  const text = res.content.find((b) => b.type === "text")?.text;
  return JSON.parse(text).results.filter((r) => items[r.index]);
}
// ─── Classement via l'app Claude (abonnement) : demande copiée, réponse collée ───
function claudePrompt(list) {
  const catalog = C.filter((x) => !x.id.startsWith("custom"));
  return [
    "Je range le placard de mon app de cuisine (courses en Roumanie). Pour chaque produit ci-dessous, dis-moi à quel aliment du catalogue il correspond.",
    "",
    "Règles :",
    "- match : l’identifiant du catalogue seulement si le produit EST cet ingrédient tel qu’on l’utilise en cuisine (« tăiței de orez » = rice_noodles, « steak » = beef_stew, « steak haché » = beef_mince).",
    "- Un produit sucré, une boisson, un plat préparé ou un produit dont l’ingrédient n’est qu’un parfum → \"none\" (« sirop Monin fraise » → none, Boissons › Sirops).",
    "- Dans le doute → \"none\".",
    "- category : « Rayon › Sous-catégorie », exactement l’une de ces places :",
    ...Object.entries(window.TAXONOMY).map(([main, subs]) => `  ${main} › ${Object.keys(subs).join(" | ")}`),
    "- unit : g, ml ou pièce. name_fr : nom court en français, sans la marque.",
    "",
    "Réponds UNIQUEMENT par un tableau JSON, sans texte autour, au format :",
    '[{"id":"custom123","match":"rice_noodles","category":"Féculents & céréales › Pâtes & nouilles","unit":"g","name_fr":"Vermicelles de riz"}]',
    "",
    "Produits à classer :",
    ...list.map((x) => `${x.id} : ${x.name}`),
    "",
    "Catalogue (identifiant : nom) :",
    ...catalog.map((x) => `${x.id} : ${x.name.split(" · ")[0]}`),
  ].join("\n");
}
async function claudeCopy() {
  const list = s.custom.filter((x) => by[x.id] && !x.confirmed);
  if (!list.length) return toast("Rien à classer.");
  const text = claudePrompt(list);
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {}
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>📋 Classer avec l’app Claude</h2><ol class="steps"><li>${copied ? "La demande est copiée." : "Copiez la demande ci-dessous (tout sélectionner, puis Copier)."}</li><li>Ouvrez l’app Claude, collez-la dans une nouvelle conversation et envoyez.</li><li>Copiez la réponse de Claude (le tableau qui commence par <code>[</code>), revenez ici et touchez « Coller la réponse ».</li></ol><textarea readonly rows="6" onclick="this.select()">${esc(text)}</textarea><div class="row"><a class="button-like" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude</a><button class="secondary" onclick="claudePaste()">📥 Coller la réponse</button></div><p class="muted">${list.length} produit${list.length > 1 ? "s" : ""} à classer. Utilise votre abonnement Claude, sans clé API.</p>`;
  modal().showModal();
}
function claudePaste() {
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>📥 Réponse de Claude</h2><p class="muted">Collez ici la réponse complète de Claude.</p><form onsubmit="event.preventDefault();claudeApply(this.reply.value)"><textarea name="reply" rows="8" placeholder='[{"id":"custom…","match":"…","category":"…","unit":"g","name_fr":"…"}]' required></textarea><div class="row"><button type="button" class="secondary" onclick="navigator.clipboard?.readText().then((v)=>{this.form.reply.value=v}).catch(()=>toast('Collez avec un appui long dans le champ.'))">Coller depuis le presse-papiers</button><button type="submit">Appliquer</button></div></form>`;
  modal().showModal();
}
// Lit la réponse de Claude, vérifie chaque ligne, puis rattache ou range les produits.
function claudeApply(reply) {
  let rows;
  try {
    const a = reply.indexOf("["),
      b = reply.lastIndexOf("]");
    rows = JSON.parse(reply.slice(a, b + 1));
    if (!Array.isArray(rows)) throw Error();
  } catch {
    return toast("Réponse illisible : copiez tout le tableau donné par Claude.");
  }
  let linked = 0,
    apart = 0,
    skipped = 0;
  for (const r of rows) {
    const x = r && typeof r.id === "string" ? by[r.id] : null;
    if (!x || !r.id.startsWith("custom") || x.confirmed) {
      skipped++;
      continue;
    }
    if (typeof r.match === "string" && r.match !== "none" && by[r.match] && !r.match.startsWith("custom")) {
      mergeInto(x.id, r.match, true);
      linked++;
    } else {
      Object.assign(x, { confirmed: true, cat: normCat(r.category) });
      if (typeof r.name_fr === "string" && r.name_fr.trim()) x.name = r.name_fr.trim().slice(0, 70);
      if (["g", "ml", "pièce"].includes(r.unit) && !(s.stock[x.id] > 0)) x.unit = r.unit;
      apart++;
    }
  }
  save();
  modal().close();
  render();
  toast(`Claude : ${linked} rattaché${linked > 1 ? "s" : ""}, ${apart} rangé${apart > 1 ? "s" : ""} à part${skipped ? `, ${skipped} ignoré${skipped > 1 ? "s" : ""}` : ""}.`);
}
const aiError = (e) => toast(`Claude indisponible : ${e.message || e}. Le classement automatique reste utilisé.`);
async function aiQuick() {
  const todo = quickItems.map((it, k) => [it, k]).filter(([it]) => it && !it.sure);
  if (!todo.length) return;
  toast("Claude réfléchit…");
  try {
    const out = await aiClassify(todo.map(([it]) => ({ name: it.name })));
    for (const r of out) {
      const [it, k] = todo[r.index],
        row = document.querySelectorAll(".quick-row")[k];
      if (!row) continue;
      if (r.match !== "none") {
        row.querySelector("select").value = r.match;
        quickLink(k, r.match);
      } else {
        row.querySelector("select").value = "new";
        quickLink(k, "new");
        Object.assign(it, { aiCat: r.category, aiUnit: r.unit, name: r.name_fr || it.name });
      }
      it.sure = true;
      row.classList.remove("unsure");
      row.querySelector("small").textContent = `« ${it.raw} » · 🤖 ${r.match === "none" ? `produit à part, rayon ${r.category}` : "reconnu"} : ${r.reason}`;
    }
  } catch (e) {
    aiError(e);
  }
}
async function aiReview() {
  const todo = s.custom.filter((x) => by[x.id] && !x.confirmed);
  if (!todo.length) return;
  toast("Claude classe vos produits…");
  try {
    const out = await aiClassify(todo.map((x) => ({ name: x.name })));
    let linked = 0,
      apart = 0;
    for (const r of out) {
      const x = todo[r.index];
      if (r.match !== "none" && by[r.match]) {
        mergeInto(x.id, r.match, true);
        linked++;
      } else {
        Object.assign(x, { confirmed: true, cat: normCat(r.category) });
        apart++;
      }
    }
    save();
    render();
    toast(`Claude : ${linked} produit${linked > 1 ? "s" : ""} rattaché${linked > 1 ? "s" : ""}, ${apart} rangé${apart > 1 ? "s" : ""} à part.`);
  } catch (e) {
    aiError(e);
  }
}

// Au lancement : rattache automatiquement les produits enregistrés à part quand la correspondance est sûre.
// Le cerveau du placard : chaque aliment n'existe qu'une fois.
// 1. Deux produits ajoutés à la main au même nom (pluriel, accents, majuscules près) n'en font qu'un.
// 2. Un produit ajouté à la main qui correspond sans ambiguïté à un aliment de l'app y est fusionné, même s'il avait
//    été rangé à part ou créé par un import de recettes. Sirop, soda, snack… ne sont jamais fusionnés (voir matchProduct).
function autoSync() {
  let n = 0;
  const seen = {};
  for (const x of [...s.custom]) {
    const key = singular(norm(x.name));
    if (seen[key] && by[seen[key]]) {
      mergeInto(x.id, seen[key], true);
      n++;
    } else seen[key] = x.id;
  }
  for (const x of [...s.custom]) {
    if (!by[x.id]) continue;
    const m = matchProduct(x.name).filter((c) => !c.id.startsWith("custom") && !(x.notSame || []).includes(c.id));
    if (sure(m) && (!x.confirmed || m[0].score >= 16)) {
      mergeInto(x.id, m[0].id, true);
      n++;
    }
  }
  if (n) {
    save();
    setTimeout(() => toast(`${n} produit${n > 1 ? "s" : ""} du placard rattaché${n > 1 ? "s" : ""} automatiquement aux aliments de l’app.`), 600);
  }
}
// Ressemblances trop faibles pour fusionner seul : on demande une fois (« C'est pareil ? »), puis on s'en souvient.
function maybeSame() {
  const out = [];
  for (const x of s.custom) {
    if (!by[x.id] || !(s.stock[x.id] > 0)) continue;
    const m = matchProduct(x.name).filter((c) => !c.id.startsWith("custom") && !(x.notSame || []).includes(c.id));
    if (m[0] && m[0].score >= 12) out.push([x.id, m[0].id]);
  }
  return out;
}
// « J'en ai assez » : le placard est corrigé à la quantité nécessaire, la ligne disparaît.
function enough(id, need) {
  s.stock[id] = Math.max(s.stock[id] || 0, need - pendingYield(id));
  save();
  render();
  toast(`${by[id].name.split(" · ")[0]} : placard corrigé (${qtyLabel(s.stock[id], by[id].unit)}).`);
}
function notSame(from, to) {
  const x = s.custom.find((c) => c.id === from);
  if (x) (x.notSame ??= []).push(to);
  save();
  render();
}
async function onCode(code) {
  if (!/^\d{6,14}$/.test(code)) return toast("Code-barres invalide.");
  stopScan();
  const out = document.getElementById("scan-result");
  if (!out) return;
  const known = s.barcodes[code];
  if (known && by[known.id]) {
    const x = by[known.id];
    out.innerHTML = `<div class="notice">Déjà connu : <b>${esc(x.name)}</b></div><form class="row" onsubmit="event.preventDefault();addScanned('${x.id}',+this.qty.value*+this.n.value)"><label>Contenu d’un paquet (${x.unit})<input name="qty" type="number" min="0" step="any" value="${known.qty}"></label><label>Nombre de paquets<input name="n" type="number" min="1" value="1"></label><button>Ajouter au placard</button></form>`;
    return;
  }
  out.innerHTML = '<p class="muted">Recherche du produit…</p>';
  let p = null;
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_fr,product_name_ro,product_name_en,generic_name_fr,generic_name,brands,quantity,image_small_url,categories_tags`);
    const j = await res.json();
    if (j.status === 1) p = j.product;
  } catch {}
  const name = p ? [p.product_name_fr || p.product_name || p.product_name_ro, p.brands?.split(",")[0]].filter(Boolean).join(" · ") : "";
  const pq = parseQty(p?.quantity),
    found = matchProduct([p?.product_name_fr, p?.product_name, p?.product_name_ro, p?.product_name_en, p?.generic_name_fr, p?.generic_name].filter(Boolean).join(" "), p?.categories_tags || []),
    g = found[0] && found[0].score >= 13 ? found[0].id : null,
    sugg = found.slice(0, 5).map((x) => x.id);
  out.innerHTML = `${p ? `<div class="scan-product">${p.image_small_url ? `<img src="${esc(p.image_small_url)}" alt="" width="64">` : ""}<div><b>${esc(name || "Produit sans nom")}</b><br><small class="muted">${esc(p.quantity || "")} · code ${code}</small></div></div>` : `<div class="notice">Produit inconnu d’Open Food Facts (ou hors connexion). Donnez-lui un nom.</div>`}<form id="scan-form" onsubmit="saveScan(event,'${code}')"><label>Nom<input name="name" required maxlength="70" value="${esc(name)}"></label><label>Correspond à<select name="link" onchange="scanLinkChange(this.form)">${sugg.length ? `<optgroup label="Suggestions">${sugg.map((id) => `<option value="${id}" ${id === g ? "selected" : ""}>${esc(by[id].name)}</option>`).join("")}</optgroup>` : ""}<option value="new" ${g ? "" : "selected"}>— Nouveau produit du placard —</option><optgroup label="Tous les aliments">${C.filter((x) => !sugg.includes(x.id)).map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}</optgroup></select></label>${g ? "" : '<p class="muted">Pas reconnu avec certitude : choisissez l’aliment pour que les recettes l’utilisent.</p>'}<div class="row"><label>Contenu d’un paquet<input name="qty" type="number" min="0" step="any" value="${pq.qty}" data-scan="${pq.qty}" data-unit="${pq.unit}"></label><label>Unité<select name="unit">${["g", "ml", "pièce"].map((u) => `<option ${u === pq.unit ? "selected" : ""}>${u}</option>`).join("")}</select></label><label>Nombre de paquets<input name="n" type="number" min="1" value="1"></label></div><button type="submit">Ajouter au placard</button></form>`;
  scanLinkChange(document.getElementById("scan-form"));
  if (p && !sure(found) && aiKey()) aiScan(code, p, name);
}
async function aiScan(code, p, name) {
  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = "🤖 Claude vérifie ce produit…";
  document.getElementById("scan-form")?.before(note);
  try {
    const [r] = await aiClassify([{ name: [p.product_name_fr, p.product_name, p.product_name_ro, p.generic_name_fr].filter(Boolean).join(" / ") || name, brand: p.brands, quantity: p.quantity, categories: p.categories_tags }]);
    const f = document.getElementById("scan-form");
    if (!r || !f) return;
    if (r.match !== "none") {
      f.link.value = r.match;
    } else {
      f.link.value = "new";
      f.name.value = r.name_fr || f.name.value;
      f.dataset.cat = r.category;
    }
    scanLinkChange(f);
    note.textContent = `🤖 Claude : ${r.match === "none" ? `produit à part, rayon ${r.category}` : by[r.match].name.split(" · ")[0]}. ${r.reason}`;
  } catch (e) {
    note.textContent = `🤖 Claude indisponible (${e.message || e}). Choisissez l’aliment à la main.`;
  }
}
function scanLinkChange(f) {
  const x = by[f.link.value],
    scanned = { qty: +f.qty.dataset.scan, unit: f.qty.dataset.unit };
  f.unit.disabled = !!x;
  if (x) {
    f.unit.value = x.unit;
    f.qty.value = scanned.unit === x.unit ? scanned.qty : x.pack;
  } else {
    f.unit.value = scanned.unit;
    f.qty.value = scanned.qty;
  }
}
function saveScan(ev, code) {
  ev.preventDefault();
  const f = ev.target,
    qty = Math.max(0, +f.qty.value),
    n = Math.max(1, +f.n.value);
  let id = f.link.value;
  if (id === "new") {
    id = "custom" + Date.now();
    const x = { id, name: f.name.value.trim().slice(0, 70), unit: f.unit.value, pack: qty || 1, price: 0, kcal: 0, protein: 0, store: "Lidl", must: [], not: [], ...(f.dataset.cat ? { confirmed: true, cat: normCat(f.dataset.cat) } : {}) };
    C.push(x);
    by[id] = x;
    s.custom.push(x);
    offerCache = {};
  }
  s.barcodes[code] = { id, qty };
  addScanned(id, qty * n);
}
function addScanned(id, amount) {
  s.stock[id] = (s.stock[id] || 0) + amount;
  s.setup = true;
  save();
  modal().close();
  render();
  toast(`+${qtyLabel(amount, by[id].unit)} de ${by[id].name.split(" · ")[0]} au placard.`);
}

// ─── Sauvegarde, export, rendu ────────────────────────────────────────────
function download(name, body, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function backup() {
  download("duo-sauvegarde.json", JSON.stringify(s, null, 2), "application/json");
}
async function restore(ev) {
  try {
    const n = JSON.parse(await ev.target.files[0].text());
    const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
    const finite = (x, min = 0, max = 1e7) => typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
    if (!obj(n) || !obj(n.stock) || !Array.isArray(n.profiles) || n.profiles.length !== 2) throw Error();
    if (!n.profiles.every((p) => typeof p.name === "string" && finite(p.protein, 1, 500) && finite(p.kcal, 500, 6000))) throw Error();
    const custom = Array.isArray(n.custom) ? n.custom.filter((x) => /^custom[0-9]+$/.test(x.id) && typeof x.name === "string" && ["g", "ml", "pièce"].includes(x.unit) && finite(x.pack, 0.01)) : [];
    for (const x of custom) {
      x.must = [];
      x.not = [];
      if (!by[x.id]) C.push(x);
      by[x.id] = x;
    }
    for (const [id, q] of Object.entries(n.stock)) if (!by[id] || !finite(q)) throw Error();
    const myRecipes = (n.myRecipes || []).filter((r) => /^my[0-9]+$/.test(r.id) && typeof r.name === "string" && obj(r.ingredients) && Array.isArray(r.steps));
    s = { ...initial(), ...n, custom, myRecipes };
    offerCache = {};
    loadRecipes();
    save();
    render();
    toast("Sauvegarde restaurée.");
  } catch {
    toast("Fichier de sauvegarde invalide.");
  }
}
function exportList() {
  if (!s.plan) return toast("Générez votre semaine d’abord.");
  const b = basket();
  download(
    "duo-courses.txt",
    "DUO — COURSES POUR DEUX\nMagasin le moins cher pour chaque produit · prix TTC en RON\n\n" +
      [...STORES, "À définir"]
        .filter((st) => b.some((x) => x.store === st))
        .map((st) => st.toUpperCase() + "\n" + b.filter((x) => x.store === st).map((x) => `[ ] ${by[x.id].name} — ${x.packs} × ${qtyLabel(x.pack, by[x.id].unit)} (${x.name}) — ${money(x.total)} RON`).join("\n"))
        .join("\n\n") +
      `\n\nTOTAL : ${money(cost(s.plan))} RON\n\nFOURNÉES : ${s.batches.map((id) => byR[id]?.name).filter(Boolean).join(", ")}\n\nMENUS\n` +
      s.plan.days.map((d, i) => dayName(i) + " " + dayDate(i) + " : " + d.map((_, j) => slot(i, j).r.name).join(" / ")).join("\n"),
    "text/plain;charset=utf-8",
  );
}
function render() {
  document.getElementById("nav").innerHTML = [
    ["home", "⌂", "Vue d’ensemble", "Accueil"],
    ["week", "▦", "Ma semaine", "Semaine"],
    ["recipes", "♧", "Les recettes", "Recettes"],
    ["stock", "▤", "Mon placard", "Placard"],
    ["shopping", "▱", "Mes courses", "Courses"],
    ["profils", "◉", "Profils & nutrition", "Profils"],
  ]
    .map(([id, icon, label, short]) => `<button class="${tab === id ? "active" : ""}" onclick="query='';go('${id}')"><span>${icon}</span><em class="nav-long">${label}</em><em class="nav-short">${short}</em></button>`)
    .join("");
  document.getElementById("app").innerHTML = { home, week, recipes, stock, shopping, profils: profiles }[tab]();
  if (tab === "stock") stockRows();
  if (tab === "recipes") recipeRows();
  if (tab === "shopping") catalogRows();
}
// Le dimanche (ou via le raccourci iPhone qui ouvre …/#dimanche) : la semaine suivante est prête automatiquement.
function sundayRoutine() {
  const sunday = new Date().getDay() === 0 || location.hash === "#dimanche";
  if (!sunday) return render();
  const covered = s.plan && isoAdd(s.plan.weekStart, s.plan.days.length - 1) >= isoAdd(weekStartISO(), 6);
  if (!covered) {
    generate(true);
    toast("Nouvelle semaine prête : batch cooking et liste de courses à envoyer.");
  } else go("week");
  document.getElementById("sunday")?.scrollIntoView();
  // Les prix sont rafraîchis chaque dimanche matin sur le Mac puis republiés.
  const age = PR.updated ? (Date.now() - new Date(PR.updated + "T12:00:00")) / 864e5 : 99;
  if (age > 2) setTimeout(() => toast(`Attention : prix relevés le ${PR.updated ? new Date(PR.updated).toLocaleDateString("fr-FR") : "?"}, la mise à jour du dimanche n’a pas tourné.`), 3800);
}
// Taux EUR → RON du marché (celui de Revolut en semaine), rafraîchi au plus toutes les 6 h quand internet est là.
// Un taux saisi à la main (celui de Revolut) n'est plus écrasé par la mise à jour automatique.
function setRate(v) {
  const n = +String(v).replace(",", ".");
  if (!(n > 1)) return toast("Taux invalide.");
  s.rate = n;
  s.rateManual = true;
  save();
  render();
  toast(`Taux enregistré : 1 € = ${n.toLocaleString("fr-FR")} RON.`);
}
async function updateRate() {
  if (s.rateManual || (s.rateDate && Date.now() - new Date(s.rateDate) < 6 * 36e5)) return;
  for (const url of ["https://api.frankfurter.dev/v1/latest?base=EUR&symbols=RON", "https://api.frankfurter.app/latest?from=EUR&to=RON"]) {
    try {
      const j = await (await fetch(url)).json();
      if (j.rates?.RON > 1) {
        s.rate = j.rates.RON;
        s.rateDate = new Date().toISOString();
        save();
        if (tab === "week" || tab === "home") render();
        return;
      }
    } catch {}
  }
}
for (const x of s.custom) if (x.confirmed && x.cat !== normCat(x.cat)) x.cat = normCat(x.cat);
// Passage unique à l'orange entière le matin (plus de fibres que le jus) ; ensuite le réglage reste libre.
if (s.morningV !== 2) Object.assign(s, { morning: "orange", morningV: 2 });
// Le budget couvre tout le ticket de caisse, cafés protéinés compris.
if (s.budgetV !== 2) Object.assign(s, { topupInBudget: true, budgetV: 2 });
// 70 € par semaine pour manger équilibré, plus d'orange le matin.
if (s.budgetV !== 3) Object.assign(s, { budgetEur: 70, morning: "none", checked: {}, budgetV: 3 });
// Les 4,5 L de bouillon déjà préparés.
if (s.brothV !== 1) {
  s.stock.broth = (s.stock.broth || 0) + 4500;
  s.brothV = 1;
}
// Le matin : cinnamon rolls et un café protéiné Lidl par jour.
if (s.coffeeV !== 1) {
  Object.assign(s, { topupOn: true, topup: "protein_coffee", topupMax: 7, coffeeV: 1 });
  s.lock = { ...s.lock, protein_coffee: "Lidl" };
}
autoSync();
sundayRoutine();
updateRate();
window.addEventListener("hashchange", () => location.hash === "#dimanche" && sundayRoutine());

function newIngredient() {
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>Tout votre placard, au même endroit.</h2><p class="muted">Cet ingrédient sera mémorisé et utilisable dans vos propres recettes.</p><form id="ingredient-form" onsubmit="addIngredient(event)"><label>Nom<input name="name" required maxlength="70" placeholder="Ex. sauce sriracha"></label><div class="row" style="margin:18px 0"><label>Unité<select name="unit"><option>g</option><option>ml</option><option>pièce</option></select></label><label>Quantité en stock<input name="qty" type="number" required min="0" value="0"></label><label>Taille d’un paquet<input name="pack" type="number" required min="1" value="500"></label><label>Prix par paquet · RON<input name="price" type="number" required min="0" step=".01" value="0"></label><label>Magasin<select name="store">${STORES.map((st) => `<option>${st}</option>`).join("")}</select></label></div><button type="submit">Enregistrer l’ingrédient</button></form>`;
  modal().showModal();
}
function addIngredient(ev) {
  ev.preventDefault();
  const f = new FormData(ev.target),
    id = "custom" + Date.now(),
    x = { id, name: String(f.get("name")).trim(), unit: f.get("unit"), pack: +f.get("pack"), price: +f.get("price"), kcal: 0, protein: 0, store: f.get("store"), must: [], not: [] };
  if (!x.name) return;
  C.push(x);
  by[id] = x;
  s.custom.push(x);
  s.stock[id] = +f.get("qty");
  s.setup = true;
  offerCache = {};
  save();
  modal().close();
  render();
  toast("Ingrédient ajouté au placard.");
}
if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("sw.js").catch(() => {});
