// Récupère les prix réels Auchan.ro et Carrefour.ro (catalogue en ligne) et les offres
// de la semaine Kaufland.ro pour chaque ingrédient de data/ingredients.js.
// Écrit data/prices.js. À relancer quand vous voulez rafraîchir les prix :
//   node tools/fetch-prices.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "data/ingredients.js"), "utf8"), sandbox);
const CATALOG = sandbox.window.CATALOG;
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9.,%]+/g, " ").trim();

// Taille du produit, convertie dans l'unité du catalogue.
function parseSize(name, unit, refPack) {
  const n = norm(name).replace(/(\d),(\d)/g, "$1.$2");
  const conv = (q, u) => (u === "kg" || u === "l" ? q * 1000 : u === "cl" ? q * 10 : q);
  let m = n.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|gr|l|ml|cl)\b/);
  let qty = null;
  if (m) qty = +m[1] * conv(+m[2], m[3]);
  else if ((m = n.match(/(\d+(?:\.\d+)?)\s*(kg|g|gr|l|ml|cl)\b/))) qty = conv(+m[1], m[2]);
  else if (/\b(per|\/)\s*kg\b|\bla kg\b/.test(n)) qty = 1000;
  const pcs = n.match(/(\d+)\s*(buc|bucati|oua|felii)\b/) || n.match(/\bx\s*(\d+)\b/);
  if (unit === "pièce") {
    if (pcs) return +pcs[1];
    return refPack > 1 ? (qty ? refPack : null) : 1;
  }
  return qty;
}

// Exclus partout (sauf si le mot fait partie des mots obligatoires de l'ingrédient) :
// nourriture pour animaux, cosmétique, accessoires, plats déjà préparés.
const GLOBAL_NOT = ["pisici", "caini", "hrana", "suport", "masca", "fata", "sampon", "gel", "sapun", "biscuiti", "bautura", "limonada", "suc", "sirop", "chips", "snacks", "preparat", "gatit", "gatita", "gratar", "asortat", "inghetata", "ciocolata", "bomboane", "napolitane", "bebelusi", "aroma", "balsam", "garnier", "dog", "cat", "adult", "puppy", "junior", "figurina", "figurine", "surpriza", "kinder", "sweet", "foietaj"];
function matches(item, name) {
  const n = " " + norm(name) + " ";
  // Le mot principal doit être dans le nom du produit lui-même, pas après « cu », « și », « pentru »…
  const head = " " + norm(name.split(/\s(?:cu|si|și|pentru|in|în|din|with)\s|\+/i)[0]) + " ";
  const must = item.must.map(norm);
  return (
    must.every((w) => n.includes(w)) &&
    (!must.length || head.includes(" " + must[0])) &&
    !item.not.some((w) => n.includes(" " + norm(w))) &&
    !GLOBAL_NOT.some((w) => !must.includes(w) && n.includes(" " + w))
  );
}

function keep(item, offers) {
  // Garde les meilleures options au prix unitaire, plus le plus petit conditionnement.
  const ok = offers.filter((o) => o.pack && o.price > 0 && o.pack >= item.pack * 0.15 && o.pack <= item.pack * 8);
  ok.sort((a, b) => a.price / a.pack - b.price / b.pack);
  const out = ok.slice(0, 4);
  const smallest = [...ok].sort((a, b) => a.pack - b.pack)[0];
  if (smallest && !out.includes(smallest)) out.push(smallest);
  return out.map((o) => ({ ...o, price: Math.round(o.price * 100) / 100 }));
}

async function auchan(item) {
  const url = `https://www.auchan.ro/api/catalog_system/pub/products/search?ft=${encodeURIComponent(item.query)}&_from=0&_to=29`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok && res.status !== 206) throw Error("Auchan " + res.status);
  const list = await res.json();
  return list
    .filter((p) => matches(item, p.productName))
    .map((p) => {
      const offer = p.items?.[0]?.sellers?.[0]?.commertialOffer || {};
      return {
        name: p.productName,
        price: offer.IsAvailable === false ? 0 : offer.Price,
        pack: parseSize(p.productName, item.unit, item.pack),
        url: `https://www.auchan.ro/${p.linkText}/p`,
      };
    });
}

async function carrefour(item) {
  const url = `https://carrefour.ro/catalogsearch/result/?q=${encodeURIComponent(item.query)}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw Error("Carrefour " + res.status);
  const html = await res.text();
  const out = [];
  for (const m of html.matchAll(/"item_name":("(?:[^"\\]|\\.)*"),"price":([0-9.]+)/g)) {
    const name = JSON.parse(m[1]);
    if (matches(item, name)) out.push({ name, price: +m[2], pack: parseSize(name, item.unit, item.pack), url });
  }
  return out;
}

// Lidl n'a pas de boutique en ligne : son API de recherche donne les produits en magasin
// cette semaine, avec le prix normal et le prix Lidl Plus.
async function lidl(item) {
  const url = `https://www.lidl.ro/q/api/search?assortment=RO&locale=ro_RO&version=v2.0.0&fetchsize=40&q=${encodeURIComponent(item.query)}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw Error("Lidl " + res.status);
  const out = [];
  for (const it of (await res.json()).items || []) {
    const g = it.gridbox?.data || {};
    const lp = g.lidlPlus?.[0]?.price;
    const base = lp?.basePrice?.text?.match(/([0-9]+,[0-9]{2})/)?.[1];
    const price = base ? +base.replace(",", ".") : g.price?.price;
    const size = lp?.packaging?.text || g.price?.packaging?.text || "";
    const name = `${g.fullTitle || ""} ${size}`.trim();
    if (!price || !matches(item, g.fullTitle || "")) continue;
    out.push({
      name,
      price,
      plus: lp && lp.price < price ? lp.price : undefined,
      pack: parseSize(name, item.unit, item.pack),
      url: g.canonicalUrl ? "https://www.lidl.ro" + g.canonicalUrl : url,
      promo: true,
    });
  }
  return out;
}

async function kauflandOffers() {
  const pages = [
    "https://www.kaufland.ro/oferte/oferte-saptamanale.html",
    "https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.html",
  ];
  const tiles = new Map();
  for (const url of pages) {
    try {
      const html = await (await fetch(url, { headers: UA })).text();
      for (const t of html.split('class="k-product-tile"').slice(1)) {
        const get = (cls) => (t.match(new RegExp(`k-product-tile__${cls}">([^<]*)`)) || [])[1]?.trim() || "";
        const num = (x) => (x ? +x.replace(",", ".") : undefined);
        let price = num((t.match(/k-price-tag__price">\s*([0-9]+,[0-9]{2})/) || [])[1]);
        if (!price) continue;
        // Offre réservée à la Kaufland Card XTRA : le prix affiché est le prix carte, l'ancien prix est le prix normal.
        let plus;
        if (t.includes('is-k-card-only="true"')) {
          const normal = num((t.match(/k-price-tag__no-logo">\s*([0-9]+,[0-9]{2})/) || [])[1]);
          if (normal) [plus, price] = [price, normal];
        }
        const name = `${get("title")} ${get("subtitle")}`.trim();
        tiles.set(name + price, { name, size: get("unit-price"), price, plus, url });
      }
    } catch (e) {
      console.warn("Kaufland", url, e.message);
    }
    await sleep(400);
  }
  return [...tiles.values()];
}

const out = { updated: new Date().toISOString().slice(0, 10), stores: { Lidl: {}, Auchan: {}, Carrefour: {}, Kaufland: {} } };
const kaufland = await kauflandOffers();
console.log(`Kaufland : ${kaufland.length} offres de la semaine`);
for (const item of CATALOG) {
  for (const [store, fn] of [["Lidl", lidl], ["Auchan", auchan], ["Carrefour", carrefour]]) {
    try {
      const kept = keep(item, await fn(item));
      if (kept.length) out.stores[store][item.id] = kept;
    } catch (e) {
      console.warn(store, item.id, e.message);
    }
    await sleep(250);
  }
  const k = keep(
    item,
    kaufland
      .filter((o) => matches(item, o.name))
      .map((o) => ({ name: `${o.name} ${o.size}`.trim(), price: o.price, plus: o.plus, pack: parseSize(`${o.name} ${o.size}`, item.unit, item.pack), url: o.url, promo: true })),
  );
  if (k.length) out.stores.Kaufland[item.id] = k;
  const best = ["Lidl", "Auchan", "Carrefour", "Kaufland"].map((s) => (out.stores[s][item.id] ? s[0] : "·")).join("");
  console.log(`${best} ${item.id}`);
}
writeFileSync(
  join(root, "data/prices.js"),
  "// Généré par tools/fetch-prices.mjs — ne pas modifier à la main.\nwindow.PRICES = " + JSON.stringify(out, null, 1) + ";\n",
);
const count = (s) => Object.keys(out.stores[s]).length;
console.log(`OK : Lidl ${count("Lidl")}, Auchan ${count("Auchan")}, Carrefour ${count("Carrefour")}, Kaufland ${count("Kaufland")} ingrédients sur ${CATALOG.length}`);
