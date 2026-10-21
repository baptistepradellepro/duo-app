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
  creators: [],
  ratings: {},
  freezerTarget: 8,
  prepDone: {},
  lastBatches: [],
  rateDate: null,
  profiles: [
    { name: "Personne 1", protein: 120, kcal: 2200 },
    { name: "Personne 2", protein: 100, kcal: 2000 },
  ],
  budgetEur: 60,
  rate: 5.1,
  cards: true,
  lidlMargin: 8,
  porkMax: 1,
  topupOn: true,
  topup: "protein_coffee",
  topupInBudget: false,
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
  R = [...window.RECIPES, ...(s.myRecipes || [])];
  byR = Object.fromEntries(R.map((r) => [r.id, r]));
}
loadRecipes();
if (s.plan && !s.plan.days?.every((d) => d.every((id) => byR[id]))) s.plan = null;

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
const budget = () => s.budgetEur * s.rate;
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

// ─── Recettes et planning ─────────────────────────────────────────────────
function macro(r) {
  const v = Object.entries(r.ingredients).reduce(
    (v, [id, q]) => {
      const x = by[id];
      if (!x) return v;
      const f = q / (x.unit === "pièce" ? 1 : 100);
      v.kcal += x.kcal * f;
      v.protein += x.protein * f;
      return v;
    },
    { kcal: 0, protein: 0 },
  );
  if (r.type === "batch") {
    v.kcal /= r.portions || 1;
    v.protein /= r.portions || 1;
  }
  return v;
}
const factor = (r) => (r.type === "batch" ? 1 : 2);
function slot(i, j, plan = s.plan) {
  const key = i + "-" + j,
    fz = plan.freezerUse?.[key];
  return { key, fz: !!fz, r: byR[fz || plan.days[i][j]] };
}
function demands(plan = s.plan, top = false) {
  const d = {};
  const add = (r, f) =>
    Object.entries(r.ingredients).forEach(([id, q]) => by[id] && (d[id] = (d[id] || 0) + q * f));
  if (plan) {
    plan.days.forEach((day, i) =>
      day.forEach((_, j) => {
        const { key, fz, r } = slot(i, j, plan);
        if (!s.done[key] && !fz && r && r.type !== "batch") add(r, 2);
      }),
    );
    for (const b of s.batches) if (byR[b] && !s.batchDone[b]) add(byR[b], 1);
    const q = top ? topupQty(plan) : 0;
    if (q) d[s.topup] = (d[s.topup] || 0) + q;
  }
  return d;
}
// top : inclure les compléments protéinés (toujours dans la liste de courses, dans le budget seulement si demandé).
function basket(plan = s.plan, top = true) {
  return Object.entries(demands(plan, top))
    .map(([id, need]) => {
      const missing = Math.max(0, need - avail(id));
      return missing > 1e-9 ? { id, need, missing, ...bestBuy(id, missing) } : null;
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
  const gap = proteinGap(plan);
  return x.unit === "pièce" ? Math.ceil(gap / x.protein) : Math.ceil((gap / x.protein) * 100);
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
function unitCost(r) {
  return Object.entries(r.ingredients).reduce(
    (a, [id, q]) => a + Math.max(0, q * 2 - avail(id)) * unitPrice(id),
    0,
  );
}
function fixedFor(i, j) {
  if (j !== 2) return null;
  if (i === 1 && s.fixed.chirashi) return "chirashi";
  if (i === +s.fixed.ramen) return "ramen";
  return null;
}
// Lundi de la semaine planifiée : demain si on est dimanche, sinon lundi de cette semaine.
function weekStartISO(d = new Date()) {
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() + (m.getDay() === 0 ? 1 : 1 - m.getDay()));
  return m.toISOString().slice(0, 10);
}
const dayDate = (i) => {
  const d = new Date((s.plan?.weekStart || weekStartISO()) + "T12:00:00");
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" });
};
function generate(auto = false) {
  offerCache = {};
  if (!auto && s.plan && Object.keys(s.done).length && !confirm("Les repas déjà cuisinés restent déduits du stock. Remplacer le planning ?")) return;
  // Nouvelles fournées selon le congélateur ; les petits-déjeuners congelés restants sont aussi servis.
  s.lastBatches = s.batches;
  s.batches = ["poulet_entier"];
  s.batches = autoBatches();
  s.batchDone = {};
  s.prepDone = {};
  const frozenBreakfast = R.filter((r) => r.type === "batch" && r.meal === "breakfast" && (s.freezer[r.id] || 0) >= 2).map((r) => r.id);
  const bakes = [...new Set([...s.batches.filter((id) => byR[id]?.meal === "breakfast"), ...frozenBreakfast])],
    breakfasts = R.filter((r) => r.type === "breakfast" && allowed(r)),
    mains = R.filter((r) => r.type === "main" && !r.fixed && allowed(r));
  if ((!bakes.length && !breakfasts.length) || !mains.length) {
    toast("Vos exclusions ne permettent pas de composer les repas. Ajustez-les.");
    return;
  }
  s.done = {};
  s.checked = {};
  const costs = Object.fromEntries(R.map((r) => [r.id, unitCost(r)])),
    tastes = Object.fromEntries(R.map((r) => [r.id, taste(r)]));
  let best = null,
    bestScore = Infinity,
    cheapest = null,
    low = Infinity;
  for (let t = 0; t < 400; t++) {
    const picked = {};
    let pork = 0;
    const pick = (arr) => {
      const pool = [...arr].sort((a, b) => costs[a.id] - tastes[a.id] * 6 - (costs[b.id] - tastes[b.id] * 6));
      let cand = pool.filter((r) => (picked[r.id] || 0) < (r.type === "main" ? 1 : 3) && (!hasPork(r) || pork < s.porkMax));
      if (!cand.length) cand = pool.filter((r) => !hasPork(r));
      if (!cand.length) cand = pool;
      const r = t === 0 ? cand[0] : cand[Math.floor(Math.pow(Math.random(), 1.5) * cand.length)];
      picked[r.id] = (picked[r.id] || 0) + 1;
      if (hasPork(r)) pork++;
      return r.id;
    };
    const p = {
      days: Array.from({ length: 7 }, (_, i) => [
        bakes.length ? bakes[i % bakes.length] : pick(breakfasts),
        pick(mains),
        fixedFor(i, 2) || pick(mains),
      ]),
      freezerUse: {},
      created: new Date().toISOString(),
      weekStart: weekStartISO(),
    };
    const c = cost(p),
      u = used(p);
    if (u < low) {
      low = u;
      cheapest = p;
    }
    const diversity = new Set(p.days.flat()).size,
      cuisines = new Set(p.days.flat().map((id) => byR[id].cuisine)).size,
      target = s.profiles.reduce((a, b) => a + Number(b.kcal), 0) / 2,
      dayMacro = (d) => d.reduce((x, id) => ({ kcal: x.kcal + macro(byR[id]).kcal, protein: x.protein + macro(byR[id]).protein }), { kcal: 0, protein: 0 }),
      avg = p.days.reduce((a, d) => a + dayMacro(d).kcal, 0) / 7,
      protGap = p.days.reduce((a, d) => a + s.profiles.reduce((v, pr) => v + Math.max(0, pr.protein - dayMacro(d).protein), 0), 0) / 7,
      liking = p.days.reduce((a, d) => a + d.slice(1).reduce((x, id) => x + tastes[id], 0), 0),
      score = u * 0.2 + (c - u) * 0.05 - diversity * 5 - cuisines * 4 - liking * 8 + Math.abs(avg - target) * 0.015 + protGap * 0.6;
    if (u <= budget() && score < bestScore) {
      bestScore = score;
      best = p;
    }
  }
  s.plan = best || cheapest;
  save();
  go("week");
  toast(best ? "Votre semaine est prête !" : "Budget trop serré : proposition la moins chère trouvée.");
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
  const tag = r.type === "batch" ? (r.freezer ? "🧊 CONGÉLATION" : "FOURNÉE") : r.veg ? "VÉGÉTARIEN" : esc(r.cuisine).toUpperCase();
  return `<article class="recipe" onclick="detail('${r.id}')" tabindex="0" onkeydown="if(event.key==='Enter')detail('${r.id}')"><div class="food ${i % 3 === 1 ? "b" : i % 3 === 2 ? "c" : ""}"><span class="tag">${tag} · ${r.time} MIN</span>${r.emoji}</div><div class="recipe-body"><h3>${esc(r.name)}</h3><p>${esc(r.cuisine)} · ${r.type === "batch" ? `${r.portions} ${esc(r.unit)}` : "pour deux"}${r.source !== undefined ? " · ma recette" : ""}${s.ratings[r.id] !== undefined ? " · " + RATES.find(([v]) => v === s.ratings[r.id])[1] : ""}</p><div class="macros"><span>◉ <b>${Math.round(m.kcal)}</b> kcal</span><span>↗ <b>${Math.round(m.protein)}</b> g prot.</span></div></div></article>`;
}

// ─── Pages ────────────────────────────────────────────────────────────────
function todayIndex() {
  if (!s.plan) return -1;
  const i = Math.round((new Date().setHours(12, 0, 0, 0) - new Date(s.plan.weekStart + "T12:00:00")) / 864e5);
  return i >= 0 && i < 7 ? i : -1;
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
      ? `<div class="panel"><div class="row spread"><h2>Aujourd’hui · ${DAYS[i]}</h2><button class="text-button" onclick="go('week')">Toute la semaine ↗</button></div><div class="today">${[0, 1, 2].map((j) => mealCell(i, j)).join("")}</div></div>`
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
    heading("VOTRE MENU SUR MESURE", "La semaine à table.", s.plan ? `Du ${dayDate(0)} au ${dayDate(6)} · 2 personnes` : "7 jours · 3 repas par jour · 2 personnes", `<button onclick="generate()">${s.plan ? "↻ Recomposer" : "✦ Générer ma semaine"}</button>`) +
    (s.plan ? sundayPanel() : "") +
    `<div class="panel row spread"><label>Budget courses · € par semaine pour deux<input type="number" min="0" step="5" value="${s.budgetEur}" onchange="s.budgetEur=Math.max(0,+this.value);save();render()"></label><label>Taux Revolut · 1 € = RON<input type="number" min="1" step="0.01" value="${s.rate}" onchange="setRate(this.value)"></label><span class="muted">${s.rateManual ? `Votre taux, gardé tel quel. <button class="text-button" onclick="s.rateManual=false;s.rateDate=null;save();updateRate()">Revenir au taux automatique</button>` : s.rateDate ? `Taux du marché du ${new Date(s.rateDate).toLocaleDateString("fr-FR")}, corrigez-le si Revolut affiche autre chose.` : ""} · ≈ ${money(budget())} RON</span></div>` +
    (s.plan
      ? `<div class="notice ${c > budget() ? "warning" : ""}">${c > budget() ? "Budget dépassé pour la proposition la moins chère. Augmentez le budget ou ajoutez votre stock." : "Votre semaine tient dans le budget."} Consommé : <b>${eur(c)} / ${money(s.budgetEur)} €</b>. À payer en magasin : <b>${eur(pay)}</b>${pay - c > 1 ? ` (dont ${eur(pay - c)} de restes de paquets qui restent au placard)` : ""}. <button class="text-button" onclick="go('shopping')">Voir mes courses ↗</button></div>${topupNotice()}<p class="muted">Touchez un repas pour sa recette détaillée. Mangé autre chose ? « Autre » le retire du placard.</p>${s.plan.days.map((day, i) => `<div class="day ${i === todayIndex() ? "is-today" : ""}"><div class="day-label">${DAYS[i].slice(0, 3)}.<br><small class="muted">${dayDate(i)}</small></div>${day.map((_, j) => mealCell(i, j)).join("")}</div>`).join("")}`
      : '<div class="panel"><h2>Le menu commence ici.</h2><p>Générez 21 repas pour vous deux : les fournées du dimanche sont choisies selon votre congélateur, et la liste de courses prend le magasin le moins cher.</p></div>') +
    `<details class="panel"><summary>Réglages de la semaine</summary><div class="row"><label class="inline"><input type="checkbox" ${s.fixed.chirashi ? "checked" : ""} onchange="s.fixed.chirashi=this.checked;save()"> 🍣 Chirashi saumon & avocat le mardi soir</label><label>🍜 Ramen au bouillon<select onchange="s.fixed.ramen=+this.value;save()">${ramenSel}</select></label><label class="inline"><input type="checkbox" ${s.veg ? "checked" : ""} onchange="s.veg=this.checked;save()"> Menus végétariens</label><label>Garder au congélateur (portions de plats)<input type="number" min="0" max="40" value="${s.freezerTarget}" onchange="s.freezerTarget=Math.max(0,+this.value);save()"></label></div><p class="muted">Recomposez la semaine pour appliquer ces réglages. Le poulet entier est désossé chaque dimanche : ≈ 350 g de blancs et 400 g de cuisses pour la semaine, la carcasse et les ailes pour le bouillon du ramen.</p>${batchPanel()}</details>`
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
function autoBatches() {
  const frozen = (id) => s.freezer[id] || 0,
    last = s.lastBatches || [],
    pick = byR.poulet_entier ? ["poulet_entier"] : [];
  const rank = (list) =>
    list
      .map((r) => ({ r, v: taste(r) * 3 - batchCost(r) * 0.4 - (last.includes(r.id) ? 1.5 : 0) + Math.random() * 1.5 }))
      .sort((a, b) => b.v - a.v)
      .map((x) => x.r);
  const batches = R.filter((r) => r.type === "batch" && r.id !== "poulet_entier" && allowed(r) && frozen(r.id) === 0);
  // Petits-déjeuners et encas : 14 portions pour la semaine, moins ce qui reste au congélateur.
  let need = 14 - R.filter((r) => r.type === "batch" && r.meal === "breakfast").reduce((a, r) => a + frozen(r.id), 0);
  for (const r of rank(batches.filter((r) => r.meal === "breakfast"))) {
    if (need <= 0 || pick.length >= 4) break;
    pick.push(r.id);
    need -= r.portions;
  }
  // Plats du congélateur pour les soirs de flemme : on complète jusqu'à l'objectif.
  let meals = R.filter((r) => r.type === "batch" && r.freezer && r.meal === "main").reduce((a, r) => a + frozen(r.id), 0);
  for (const r of rank(batches.filter((r) => r.freezer && r.meal === "main"))) {
    if (meals >= s.freezerTarget || pick.length >= 6) break;
    if (hasPork(r) && pick.some((id) => hasPork(byR[id]))) continue;
    pick.push(r.id);
    meals += r.portions;
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
    when = (m) => `${DAYS[m.i]} ${m.j === 1 ? "midi" : "soir"}`;
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

  const early = meals(0, 3);
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
  const soon = meals(0, 2).filter((m) => meatOf(m).length);
  if (soon.length)
    tasks.push({
      key: "meat",
      done: done("meat"),
      html:
        `🥩 <b>Viande de lundi et mardi</b> : la couper comme dans la recette et la mettre en boîte fermée au réfrigérateur (2 jours maximum).` +
        list(soon.map((m) => `<b>${when(m)}</b> · ${esc(m.r.name)} : ${meatOf(m).map((id) => `${qtyLabel(m.r.ingredients[id] * 2, "g")} de ${short(id)}`).join(", ")}${/marin/i.test(m.r.steps.join(" ")) ? " · on peut déjà la mariner, voir la recette" : ""}`)),
    });
  const later = meals(2, 7).filter((m) => meatOf(m).length);
  if (later.length)
    tasks.push({
      key: "freeze",
      done: done("freeze"),
      html:
        `❄️ <b>Viande de mercredi à dimanche</b> : la ranger au congélateur dès le retour des courses, dans des sacs étiquetés au nom du repas. La sortir au réfrigérateur la veille au soir :` +
        list(later.map((m) => `${DAYS[(m.i + 6) % 7].toLowerCase()} soir → pour <b>${when(m)}</b> · ${esc(m.r.name)} : ${meatOf(m).map((id) => `${qtyLabel(m.r.ingredients[id] * 2, "g")} de ${short(id)}`).join(", ")}`)),
    });
  return tasks;
}
function sundayPanel() {
  const all = sundayTasks(),
    todo = all.filter((x) => !x.done);
  if (!todo.length) return `<div class="panel sunday done-all" id="sunday"><h2>🧑‍🍳 Batch cooking terminé ✓</h2><p class="muted">Tout est prêt pour la semaine. <button class="text-button" onclick="shareWeek()">📤 Renvoyer le programme</button></p></div>`;
  return `<section class="panel sunday" id="sunday"><div class="row spread"><h2>🧑‍🍳 Batch cooking du dimanche</h2><span class="muted">${all.length - todo.length} / ${all.length} fait</span></div><p class="muted">À faire en premier : lundi démarre presque tout prêt. Chaque étape disparaît quand elle est faite.</p><ol class="tasks">${todo
    .map((x) => `<li><span>${x.html}</span><span class="row">${x.batch ? `<button class="text-button" onclick="detail('${x.batch}')">Recette</button><button class="small" onclick="cookBatch('${x.batch}')">✓ Fait</button>` : `<button class="small" onclick="prepDone('${x.key}')">✓ Fait</button>`}</span></li>`)
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
    `DUO — semaine du ${dayDate(0)} au ${dayDate(6)}\n\nDIMANCHE — BATCH COOKING\n` +
    sundayTasks().map((t, k) => `${k + 1}. ${plain(t.html)}`).join("\n") +
    `\n\nMENUS\n` +
    s.plan.days.map((d, i) => `${DAYS[i]} ${dayDate(i)} : ${d.map((_, j) => slot(i, j).r.name).join(" / ")}`).join("\n") +
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
    m = macro(r),
    canFreeze = Object.entries(s.freezer).some(([id, n]) => n >= 2 && byR[id]?.meal === "main");
  if (ate) return `<div class="meal done"><div><small>${SLOTS[j]} · AUTRE CHOSE</small><b>🍽️ ${esc(ate)}</b><span class="muted">retiré du placard</span></div></div>`;
  const tag = done ? " · ✓" : fz ? " · 🧊 CONGÉLO" : r.fixed ? " · RITUEL" : r.type === "batch" ? (r.freezer ? " · CONGÉLO" : " · FOURNÉE") : "";
  return `<div class="meal ${done ? "done" : ""} ${fz ? "frozen" : ""}"><div onclick="detail('${r.id}',${i},${j})" role="button" tabindex="0" onkeydown="if(event.key==='Enter')detail('${r.id}',${i},${j})"><small>${SLOTS[j]}${tag}</small><b>${r.emoji} ${esc(r.name)}</b><span class="muted">${Math.round(m.kcal)} kcal · ${Math.round(m.protein)} g prot.</span></div>${done ? "" : `<div class="meal-actions"><button class="text-button" onclick="swap(${i},${j})">Changer ↻</button>${j > 0 && canFreeze ? `<button class="text-button" onclick="useFreezer(${i},${j})">🧊 Congélo</button>` : ""}<button class="text-button" onclick="ateOther(${i},${j})">Autre</button></div>`}</div>`;
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
function toggleBatch(id, on) {
  s.batches = s.batches.filter((x) => x !== id);
  if (on) s.batches.push(id);
  s.checked = {};
  save();
  render();
}
function swap(i, j) {
  const cur = s.plan.days[i][j];
  const opts =
    j === 0
      ? [...s.batches.filter((id) => byR[id]?.meal === "breakfast").map((id) => byR[id]), ...R.filter((r) => r.type === "breakfast" && allowed(r))]
      : R.filter((r) => r.type === "main" && !r.fixed && allowed(r) && !hasPork(r));
  const pool = opts.filter((r) => r.id !== cur);
  if (!pool.length) return toast("Aucune alternative avec ces exclusions.");
  s.plan.days[i][j] = pool[Math.floor(Math.random() * pool.length)].id;
  delete s.plan.freezerUse?.[i + "-" + j];
  s.checked = {};
  save();
  render();
  toast("Repas remplacé, budget et courses recalculés.");
}
function useFreezer(i, j) {
  const items = Object.entries(s.freezer).filter(([id, n]) => n >= 2 && byR[id]?.meal === "main");
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>🧊 Un plat du congélateur</h2><p class="muted">${DAYS[i]} · ${SLOTS[j].toLowerCase()}. Deux portions seront retirées quand le repas sera marqué mangé.</p><div class="choice-list">${items
    .map(([id, n]) => `<button class="secondary" onclick="setFreezer(${i},${j},'${id}')">${byR[id].emoji} ${esc(byR[id].name)} <small>· ${n} portions</small></button>`)
    .join("")}</div>`;
  modal().showModal();
}
function setFreezer(i, j, id) {
  (s.plan.freezerUse ??= {})[i + "-" + j] = id;
  s.checked = {};
  save();
  modal().close();
  render();
  toast("Repas du congélateur prévu : ses ingrédients sortent des courses.");
}
function stock() {
  const frozen = Object.entries(s.freezer).filter(([id, n]) => n > 0 && byR[id]);
  return (
    heading("LA BASE DE VOS FUTURS REPAS", "Mon placard.", "Scannez vos produits ou saisissez les quantités. Zéro signifie que vous n’en avez pas.") +
    `<div class="panel"><div class="row spread"><h2>🧊 Congélateur</h2><select aria-label="Ajouter au congélateur" onchange="if(this.value){s.freezer[this.value]=(s.freezer[this.value]||0)+1;save();render()}"><option value="">+ Ajouter une portion…</option>${R.filter((r) => r.freezer).map((r) => `<option value="${r.id}">${r.emoji} ${esc(r.name)}</option>`).join("")}</select></div>${
      frozen.length
        ? `<div class="freezer">${frozen.map(([id, n]) => `<div class="freezer-item"><span>${byR[id].emoji} ${esc(byR[id].name)}</span><span class="row"><button class="secondary small" onclick="s.freezer['${id}']=Math.max(0,${n}-1);save();render()" aria-label="Retirer une portion">−</button><b>${n}</b><button class="secondary small" onclick="s.freezer['${id}']=${n}+1;save();render()" aria-label="Ajouter une portion">+</button><small class="muted">${esc(byR[id].unit)}</small></span></div>`).join("")}</div>`
        : '<p class="muted">Vide pour l’instant. Les fournées marquées « Préparée » s’ajoutent ici automatiquement.</p>'
    }</div><div class="panel"><div class="row spread"><button onclick="scanner()">📷 Scanner un produit</button><button class="secondary" onclick="newIngredient()">+ Ajouter un ingrédient</button><input type="search" placeholder="Rechercher un ingrédient…" value="${esc(query)}" oninput="query=this.value;stockRows()"><button class="secondary" onclick="s.setup=true;save();go('week')">Préparer ma semaine ↗</button></div><div class="table-wrap"><table><thead><tr><th>Ingrédient</th><th>En stock</th><th>Unité</th><th>Exclure</th></tr></thead><tbody id="stockrows"></tbody></table></div></div><p class="muted">Riz, pâtes et lentilles pesés secs ; viandes crues ; conserves égouttées. Le scanner retient chaque code-barres : la prochaine fois, un scan suffit pour ajouter le paquet. Les exclusions se font par ingrédient ; vérifiez aussi les étiquettes pour les allergènes.</p>`
  );
}
function stockRows() {
  const e = document.getElementById("stockrows");
  if (!e) return;
  const q = norm(query);
  e.innerHTML = C.filter((x) => norm(x.name).includes(q))
    .sort((a, b) => (s.stock[b.id] > 0) - (s.stock[a.id] > 0))
    .map(
      (x) =>
        `<tr><td>${esc(x.name)}</td><td><input aria-label="Stock ${esc(x.name)}" type="number" min="0" step="${x.unit === "pièce" ? 1 : 10}" value="${s.stock[x.id] || 0}" onchange="s.stock['${x.id}']=Math.max(0,+this.value);s.setup=true;save()"></td><td>${x.unit}</td><td><input aria-label="Exclure ${esc(x.name)}" type="checkbox" ${s.exclude.includes(x.id) ? "checked" : ""} onchange="exclude('${x.id}',this.checked)"></td></tr>`,
    )
    .join("");
}
function exclude(id, on) {
  s.exclude = s.exclude.filter((x) => x !== id);
  if (on) s.exclude.push(id);
  save();
  toast("Préférence enregistrée. Recomposez la semaine pour l’appliquer.");
}
function shopping() {
  const b = basket(),
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
      : `<div class="stats"><div class="stat"><small>À payer au meilleur prix</small><strong>${eur(c)}</strong><em>${money(c)} RON · paquets entiers</em></div><div class="stat"><small>Réellement consommé</small><strong>${eur(used(s.plan))}</strong><em>budget ${money(s.budgetEur)} € · les restes de paquets restent au placard</em></div><div class="stat"><small>Économie</small><strong>${money(saved)} RON</strong><em>vs le magasin le plus cher, produit par produit</em></div><div class="stat"><small>Magasins</small><strong>${shops.length}</strong><em>${b.length} articles à acheter</em></div></div>${shops
          .map((shop) => {
            const items = b.filter((x) => x.store === shop);
            return `<div class="panel"><h2>${STORE_ICON[shop] || "❔"} ${shop} <span class="muted" style="font-size:13px">· ${money(items.reduce((a, x) => a + x.total, 0))} RON</span></h2><div class="table-wrap"><table class="shop-table"><thead><tr><th>Pris</th><th>Produit</th><th>À acheter</th><th>Total</th></tr></thead><tbody>${items
              .map((x) => {
                const alts = STORES.filter((st) => st !== x.store && offers(x.id).some((o) => o.store === st)).map((st) => `${st} ${money(bestBuy(x.id, x.missing, st).total)}`);
                return `<tr><td><input aria-label="Pris ${esc(by[x.id].name)}" type="checkbox" ${s.checked[x.id] ? "checked" : ""} onchange="s.checked['${x.id}']=this.checked;save()"></td><td><b>${esc(by[x.id].name)}</b><br><small class="muted">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a> · ` : x.name !== by[x.id].name ? esc(x.name) + " · " : ""}${sourceLabel[x.source]}${s.lock[x.id] ? " · 🔒 magasin choisi" : ""}</small><br><small class="muted">Besoin net : ${qtyLabel(x.missing, by[x.id].unit)}${alts.length ? " · ailleurs : " + alts.join(" · ") + " RON" : ""}</small> <button class="text-button" onclick="priceEditor('${x.id}')">Prix ↗</button></td><td>${x.packs} × ${qtyLabel(x.pack, by[x.id].unit)}</td><td>${money(x.total)} RON</td></tr>`;
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
  s.budgetEur = Math.max(0, Math.round((s.budgetEur - amount / s.rate) * 100) / 100);
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
    inspirationIds = R.filter((r) => r.type === "main" && !r.fixed && allowed(r) && !planned.has(r.id))
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
    heading("D’ASIE, DE RUSSIE, DE FRANCE…", "Le carnet de recettes.", `${R.length} recettes · quantités pour deux à l’ouverture.`, `<button onclick="recipeForm()">+ Ajouter une recette</button>`) +
    inspiration() +
    `<div class="row filters"><input id="rq" type="search" placeholder="Une recette, un ingrédient…" value="${esc(query)}" oninput="query=this.value;recipeRows()"><select onchange="category=this.value;recipeRows()">${[["all", "Tous les repas"], ["breakfast", "Petit-déjeuner"], ["main", "Déjeuner & dîner"], ["batch", "Fournées & congélation"], ["veg", "Végétarien"], ["mine", "Mes recettes"], ["liked", "👍 On aime"], ["unrated", "Pas encore notées"], ["disliked", "👎 Écartées"]].map(([v, l]) => `<option value="${v}" ${category === v ? "selected" : ""}>${l}</option>`).join("")}</select><select onchange="cuisine=this.value;recipeRows()"><option value="all">Toutes les cuisines</option>${cuisines.map((c) => `<option ${cuisine === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div><div class="grid" id="reciperows"></div><details class="panel"><summary>Créateurs food à suivre</summary><p class="muted">Vous voyez une recette qui vous plaît dans un reel ? Ajoutez-la avec « + Ajouter une recette » en collant le lien : elle entre dans le planning et la liste de courses.</p><div class="chips">${creators.map(([h, d]) => `<a class="chip" href="https://www.instagram.com/${encodeURIComponent(h)}/" target="_blank" rel="noopener">@${esc(h)} <small>${esc(d)}</small></a>`).join("")}</div><form class="row" onsubmit="event.preventDefault();addCreator(this.h.value)"><input name="h" placeholder="@compte_instagram" maxlength="40" required><button class="secondary">Ajouter</button></form></details>`
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
        r.type === category) &&
      (cuisine === "all" || r.cuisine === cuisine) &&
      norm(r.name + " " + r.cuisine + " " + Object.keys(r.ingredients).map((id) => by[id]?.name || "").join(" ")).includes(q),
  );
  document.getElementById("reciperows").innerHTML = list.map(card).join("") || "<p>Aucune recette trouvée.</p>";
}
function profiles() {
  const d = s.plan ? s.plan.days[s.day].map((_, j) => slot(s.day, j).r) : [],
    m = d.reduce(
      (a, r) => {
        const v = macro(r);
        a.kcal += v.kcal;
        a.protein += v.protein;
        return a;
      },
      { kcal: 0, protein: 0 },
    );
  return (
    heading("DES REPÈRES POUR CHACUN", "Profils & nutrition.", "Deux personnes, deux objectifs. Des portions identiques pour commencer.") +
    `<div class="notice">Saisissez votre propre objectif quotidien en protéines et calories. Les valeurs proposées sont des exemples à personnaliser, pas une prescription. Calculs alimentaires estimatifs à vérifier avec les étiquettes.</div><div class="profile-grid">${s.profiles.map((p, i) => `<section class="panel"><div class="eyebrow">PROFIL 0${i + 1}</div><label>Prénom<input type="text" maxlength="40" value="${esc(p.name)}" onchange="s.profiles[${i}].name=this.value;save()"></label><br><label>Objectif de protéines · g / jour<input type="number" min="1" max="500" value="${p.protein}" onchange="s.profiles[${i}].protein=Math.max(1,Math.min(500,+this.value));save();render()"></label><label>Objectif énergétique · kcal / jour<input type="number" min="500" max="6000" value="${p.kcal}" onchange="s.profiles[${i}].kcal=Math.max(500,Math.min(6000,+this.value));save();render()"></label></section>`).join("")}</div><div class="panel"><div class="row spread"><h2>Votre journée en chiffres</h2><select onchange="s.day=+this.value;save();render()">${DAYS.map((x, i) => `<option value="${i}" ${i === s.day ? "selected" : ""}>${x}</option>`).join("")}</select></div>${
      s.plan
        ? `<p class="muted">Prévision des 3 repas du menu, par personne.</p><div class="profile-grid">${s.profiles
            .map((p) => {
              const gap = Math.max(0, p.protein - m.protein);
              return `<div><h3>${esc(p.name)}</h3><b>${Math.round(m.protein)} / ${p.protein} g de protéines</b><div class="progress"><span style="width:${Math.min(100, (m.protein / p.protein) * 100)}%"></span></div><p>${Math.round(m.kcal)} / ${p.kcal} kcal prévues<br><span class="muted">${m.kcal < p.kcal ? Math.round(p.kcal - m.kcal) + " kcal à couvrir selon vos besoins" : "Objectif énergétique atteint ou dépassé"}</span></p><div class="notice ${gap ? "warning" : ""}">${gap ? `Écart : <b>${Math.round(gap)} g de protéines</b>.<br>Équivalent théorique : <b>${Math.ceil(gap / (s.powder / 100))} g de poudre</b> à ${s.powder} % de protéines, ou environ ${Math.ceil((gap / 10) * 100)} g de yaourt protéiné.` : "Objectif protéique atteint par les repas prévus."}</div></div>`;
            })
            .join("")}</div>`
        : "<p>Générez une semaine pour afficher les apports prévus et les écarts.</p>"
    }<div class="panel"><h2>💪 Compléter les protéines</h2><p class="muted">L’écart de la semaine est comblé avec un produit ajouté automatiquement à la liste de courses.</p><div class="row"><label class="inline"><input type="checkbox" ${s.topupOn ? "checked" : ""} onchange="s.topupOn=this.checked;save();render()"> Ajouter aux courses</label><label>Produit<select onchange="s.topup=this.value;save();render()">${["protein_coffee", "protein_pudding", "yogurt", "cottage", "cheese"].map((id) => `<option value="${id}" ${s.topup === id ? "selected" : ""}>${esc(by[id].name.split(" · ")[0])}</option>`).join("")}</select></label><label class="inline"><input type="checkbox" ${s.topupInBudget ? "checked" : ""} onchange="s.topupInBudget=this.checked;save();render()"> Compter dans le budget</label></div>${s.plan ? `<p>Cette semaine : <b>${Math.round(proteinGap())} g</b> à compléter → <b>${qtyLabel(topupQty(), by[s.topup].unit)}</b> (${eur(topupCost())}).</p>` : ""}<p class="muted">Ex. un café protéiné ≈ 25 g de protéines. Vérifiez l’étiquette de votre produit.</p></div><label>Protéines de votre poudre · g pour 100 g<input type="number" min="1" max="100" value="${s.powder}" onchange="s.powder=Math.max(1,Math.min(100,+this.value));save();render()"></label></div>`
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
  else if (!key && r.type === "batch" && s.batches.includes(id) && !s.batchDone[id]) action = `<button onclick="cookBatch('${id}')">✓ Fournée préparée : déduire du placard${r.freezer ? " et ranger au congélateur" : ""}</button>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><div style="font-size:50px">${r.emoji}</div><h2>${esc(r.name)}</h2><p>${esc(r.cuisine)} · ${r.time} min · <b>${r.type === "batch" ? `fournée de ${r.portions} ${esc(r.unit)}` : "2 personnes"}</b>${r.freezer ? " · 🧊 se congèle" : ""}</p>${r.source ? `<p><a href="${esc(r.source)}" target="_blank" rel="noopener">Voir la recette d’origine ↗</a></p>` : ""}<div class="notice">Par ${r.type === "batch" ? "portion" : "personne"} : ${Math.round(m.kcal)} kcal · ${Math.round(m.protein)} g de protéines</div>${tools(r)}<h3>Dans la cuisine</h3><table>${Object.entries(r.ingredients)
    .filter(([x]) => by[x])
    .map(([x, q]) => `<tr><td>${esc(by[x].name)}</td><td>${qtyLabel(q * f, by[x].unit)}</td></tr>`)
    .join("")}</table>${beforeCooking(r, i)}<h3>À vous de jouer</h3><ol class="steps rich">${richSteps(r, f)}</ol><p class="muted">Sel, poivre et eau selon vos préférences. Poids crus / secs / égouttés.</p>${action}${rateBlock(id)}${r.source !== undefined ? ` <button class="secondary" onclick="deleteRecipe('${id}')">Supprimer cette recette</button>` : ""}`;
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
  const short = Object.entries(ingredients).filter(([id, q]) => by[id] && (s.stock[id] || 0) < q * f);
  if (short.length && !confirm(`Stock insuffisant pour ${short.map(([id]) => by[id].name.split(" · ")[0]).join(", ")}.\n${label} quand même et mettre ces stocks à zéro ?`)) return false;
  Object.entries(ingredients).forEach(([id, q]) => by[id] && (s.stock[id] = Math.max(0, (s.stock[id] || 0) - q * f)));
  return true;
}
function cook(i, j) {
  const { key, fz, r } = slot(i, j);
  if (s.done[key]) return;
  // Repas du congélateur (plat ou petit-déjeuner congelé) : deux portions en moins.
  const fromFreezer = fz || (r.type === "batch" && r.freezer && (s.freezer[r.id] || 0) > 0);
  if (fromFreezer) s.freezer[r.id] = Math.max(0, (s.freezer[r.id] || 0) - 2);
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
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>On a mangé autre chose</h2><p class="muted">${DAYS[i]} · ${SLOTS[j].toLowerCase()}. Le repas prévu reste au placard pour plus tard.</p><form id="ate-form" onsubmit="saveAte(event,${i},${j})"><label>Une recette du carnet (pour deux)<input name="recipe" list="recipe-list" placeholder="Ex. Pâtes carbonara"></label><datalist id="recipe-list">${R.filter((r) => r.type !== "batch").map((r) => `<option value="${esc(r.name)}">`).join("")}</datalist>${frozen.length ? `<label>Ou un plat du congélateur (−2 portions)<select name="freezer"><option value="">—</option>${frozen.map(([id, n]) => `<option value="${id}">${byR[id].emoji} ${esc(byR[id].name)} · ${n}</option>`).join("")}</select></label>` : ""}<h3>Ou des ingrédients à la main</h3><div id="ate-rows">${row.repeat(3)}</div><button type="button" class="secondary" onclick="document.getElementById('ate-rows').insertAdjacentHTML('beforeend',document.querySelector('#ate-rows .ing-row').outerHTML)">+ Ligne</button><datalist id="ing-list">${C.map((x) => `<option value="${esc(x.name)}">${x.unit}</option>`).join("")}</datalist><div class="row" style="margin-top:16px"><button type="submit">Enregistrer</button><button type="button" class="secondary" onclick="saveAte(null,${i},${j},'Restaurant ou livraison')">Restaurant / livraison</button></div></form>`;
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
      const x = C.find((c) => norm(c.name) === norm(row.querySelector(".ing-name").value)),
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
function recipeForm() {
  const row = () => `<div class="row ing-row"><input class="ing-name" list="ing-list" placeholder="Ingrédient"><input class="ing-qty" type="number" min="0" step="any" placeholder="Quantité"></div>`;
  modal().innerHTML = `<button class="close" onclick="modal().close()" aria-label="Fermer">✕</button><h2>Ajouter une recette</h2><p class="muted">Notez avec vos mots une recette vue chez un créateur, et collez le lien de la vidéo pour la retrouver.</p><form id="recipe-form" onsubmit="saveRecipe(event)"><label>Nom<input name="name" required maxlength="80" placeholder="Ex. Ramen crémeux au miso"></label><div class="row"><label>Emoji<input name="emoji" maxlength="4" value="🍽️" style="width:70px"></label><label>Cuisine<input name="cuisine" list="cuisine-list" maxlength="30" value="Japonaise"></label><label>Temps (min)<input name="time" type="number" min="1" value="30"></label></div><div class="row"><label>Type<select name="type" onchange="this.form.portions.parentElement.hidden=this.value!=='batch'"><option value="main">Plat · quantités pour 2</option><option value="breakfast">Petit-déj · quantités pour 2</option><option value="batch">Fournée / congélation · quantités totales</option></select></label><label hidden>Portions produites<input name="portions" type="number" min="1" value="6"></label><label class="inline"><input type="checkbox" name="veg"> Végétarien</label><label class="inline"><input type="checkbox" name="freezer"> Se congèle</label></div><label>Lien de la vidéo (Instagram, TikTok…)<input name="source" type="url" placeholder="https://www.instagram.com/reel/…"></label><h3>Ingrédients</h3><p class="muted">Choisissez dans la liste pour que les courses suivent. Quantités en g, ml ou pièces selon l’ingrédient.</p><div id="ing-rows">${row().repeat(5)}</div><button type="button" class="secondary" onclick="document.getElementById('ing-rows').insertAdjacentHTML('beforeend',document.querySelector('.ing-row').outerHTML)">+ Ligne</button><datalist id="ing-list">${C.map((x) => `<option value="${esc(x.name)}">${x.unit}</option>`).join("")}</datalist><datalist id="cuisine-list">${[...new Set(R.map((r) => r.cuisine))].map((c) => `<option value="${esc(c)}">`).join("")}</datalist><label>Étapes (une par ligne)<textarea name="steps" rows="6" required></textarea></label><button type="submit">Enregistrer la recette</button></form>`;
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
    let x = C.find((c) => norm(c.name) === norm(name)) || C.find((c) => norm(c.name).startsWith(norm(name)));
    if (!x) {
      x = { id: "custom" + Date.now() + created++, name: name.slice(0, 70), unit: "g", pack: 500, price: 0, kcal: 0, protein: 0, store: "Lidl", must: [], not: [] };
      C.push(x);
      by[x.id] = x;
      s.custom.push(x);
    }
    ingredients[x.id] = (ingredients[x.id] || 0) + (type === "batch" ? q : q / 2);
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
    portions: type === "batch" ? Math.max(1, +f.get("portions") || 1) : 0,
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
  if (s.plan && !s.plan.days.every((d) => d.every((x) => byR[x]))) s.plan = null;
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
function guess(name) {
  const words = norm(name).split(" ").filter((w) => w.length >= 4);
  let best = null,
    score = 0;
  for (const x of C) {
    const hay = norm(x.name + " " + (x.query || ""));
    const sc = words.filter((w) => hay.includes(w)).length;
    if (sc > score) {
      score = sc;
      best = x.id;
    }
  }
  return best;
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
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_fr,product_name_ro,brands,quantity,image_small_url`);
    const j = await res.json();
    if (j.status === 1) p = j.product;
  } catch {}
  const name = p ? [p.product_name_fr || p.product_name || p.product_name_ro, p.brands?.split(",")[0]].filter(Boolean).join(" · ") : "";
  const pq = parseQty(p?.quantity),
    g = guess(name);
  out.innerHTML = `${p ? `<div class="scan-product">${p.image_small_url ? `<img src="${esc(p.image_small_url)}" alt="" width="64">` : ""}<div><b>${esc(name || "Produit sans nom")}</b><br><small class="muted">${esc(p.quantity || "")} · code ${code}</small></div></div>` : `<div class="notice">Produit inconnu d’Open Food Facts (ou hors connexion). Donnez-lui un nom.</div>`}<form id="scan-form" onsubmit="saveScan(event,'${code}')"><label>Nom<input name="name" required maxlength="70" value="${esc(name)}"></label><label>Correspond à<select name="link" onchange="scanLinkChange(this.form)"><option value="new">— Nouveau produit du placard —</option>${C.map((x) => `<option value="${x.id}" ${x.id === g ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label><div class="row"><label>Contenu d’un paquet<input name="qty" type="number" min="0" step="any" value="${pq.qty}" data-scan="${pq.qty}" data-unit="${pq.unit}"></label><label>Unité<select name="unit">${["g", "ml", "pièce"].map((u) => `<option ${u === pq.unit ? "selected" : ""}>${u}</option>`).join("")}</select></label><label>Nombre de paquets<input name="n" type="number" min="1" value="1"></label></div><button type="submit">Ajouter au placard</button></form>`;
  scanLinkChange(document.getElementById("scan-form"));
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
    const x = { id, name: f.name.value.trim().slice(0, 70), unit: f.unit.value, pack: qty || 1, price: 0, kcal: 0, protein: 0, store: "Lidl", must: [], not: [] };
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
    if (s.plan && !s.plan.days?.every((d) => d.every((id) => byR[id]))) s.plan = null;
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
      s.plan.days.map((d, i) => DAYS[i] + " : " + d.map((_, j) => slot(i, j).r.name).join(" / ")).join("\n"),
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
  if (!s.plan || s.plan.weekStart !== weekStartISO()) {
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
