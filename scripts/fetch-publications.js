// Looks up every published item of content/publications.md on Crossref and stores the
// metadata in src/_data/crossref.json (committed, so the site builds without network).
// Writes a report of anything that needs Olivier's attention to docs/publications-report.md.
//
//   npm run pubs              only items not looked up yet
//   npm run pubs -- --refresh look everything up again
//
// Rules: a DOI written in publications.md is used as is. Otherwise Crossref is searched by
// title and first author, and a DOI is accepted only when exactly one record matches
// (near-identical title, same first author, year within one). Nothing in publications.md
// is ever changed: differences are reported, not applied.
import fs from "node:fs";
import { readSource, CACHE } from "./publications-lib.js";

const REPORT = "docs/publications-report.md";
const API = "https://api.crossref.org/works";
const HEADERS = { "User-Agent": "olivier-white-website/1.0 (https://olivierwhite.github.io)" };
const FIELDS = "DOI,title,author,issued,published-print,published-online,container-title,short-container-title,volume,issue,page,article-number,type,license";
const refresh = process.argv.includes("--refresh");

// ---------- helpers ----------

export const norm = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Similarity of two titles, 0–1 (Dice coefficient on character bigrams).
export function similarity(a, b) {
  const grams = (s) => {
    const t = norm(s).replace(/ /g, "");
    const m = new Map();
    for (let i = 0; i < t.length - 1; i++) m.set(t.slice(i, i + 2), (m.get(t.slice(i, i + 2)) || 0) + 1);
    return m;
  };
  const A = grams(a);
  const B = grams(b);
  let inter = 0;
  let total = 0;
  for (const [g, n] of A) { inter += Math.min(n, B.get(g) || 0); total += n; }
  for (const n of B.values()) total += n;
  return total ? (2 * inter) / total : 0;
}

const firstAuthorFamily = (authors) => authors.split(",")[0].trim().replace(/\s+[A-Z-]+\*?$/, "");
const year = (part) => part?.["date-parts"]?.[0]?.[0] ?? null;

const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, "");

function summarise(w) {
  return {
    doi: w.DOI,
    title: decode((w.title || [""])[0]).replace(/\s+/g, " ").trim(),
    firstAuthor: w.author?.[0]?.family || w.author?.[0]?.name || "",
    authors: (w.author || [])
      .map((a) => (a.family ? `${a.family} ${(a.given || "").split(/[\s.-]+/).filter(Boolean).map((g) => g[0]).join("")}` : a.name))
      .join(", "),
    authorCount: w.author?.length || 0,
    journal: decode((w["container-title"] || [""])[0]),
    shortJournal: decode((w["short-container-title"] || [""])[0]),
    volume: w.volume || "",
    issue: w.issue || "",
    page: w.page || "",
    articleNumber: w["article-number"] || "",
    yearIssued: year(w.issued),
    yearPrint: year(w["published-print"]),
    yearOnline: year(w["published-online"]),
    type: w.type,
    openAccess: (w.license || []).some(
      (l) => /creativecommons\.org/.test(l.URL) && ["vor", "unspecified"].includes(l["content-version"])
    ),
  };
}

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()).message;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

async function lookUp(item) {
  if (item.doi) {
    const w = await get(`${API}/${encodeURIComponent(item.doi)}`);
    if (!w) return { status: "doi-not-found", doi: item.doi };
    return { status: "given", doi: item.doi, crossref: summarise(w) };
  }
  const family = firstAuthorFamily(item.authors);
  const q = new URLSearchParams({ "query.bibliographic": item.title, "query.author": family, rows: "10", select: FIELDS });
  const found = (await get(`${API}?${q}`))?.items || [];
  const candidates = found
    .map(summarise)
    .filter((c) => !/^(correction|erratum|corrigendum|retraction)\b/i.test(c.title) && c.type !== "posted-content" && c.type !== "peer-review")
    .map((c) => ({ ...c, score: similarity(item.title, c.title) }));
  const strong = candidates.filter(
    (c) =>
      c.score >= 0.9 &&
      norm(c.firstAuthor) === norm(family) &&
      [c.yearIssued, c.yearPrint, c.yearOnline].some((y) => y && Math.abs(y - item.year) <= 1)
  );
  const dois = [...new Set(strong.map((c) => c.doi.toLowerCase()))];
  if (dois.length === 1) return { status: "matched", doi: strong[0].doi, crossref: strong[0] };
  const best = candidates.sort((a, b) => b.score - a.score).slice(0, 3);
  return {
    status: dois.length > 1 ? "ambiguous" : "no-match",
    candidates: (dois.length > 1 ? strong : best).map(({ doi, title, authors, journal, volume, issue, page, articleNumber, yearIssued, score }) => ({
      doi, title, authors, journal, volume, issue, page: page || articleNumber, year: yearIssued, score: Math.round(score * 100) / 100,
    })),
  };
}

// Differences between the text in publications.md and Crossref, for the report.
function differences(item, entry) {
  const c = entry.crossref;
  if (!c) return [];
  const out = [];
  const years = [c.yearPrint, c.yearOnline, c.yearIssued].filter(Boolean);
  if (item.year && !years.includes(item.year))
    out.push(`Year: publications.md gives ${item.year}; Crossref gives ${[...new Set(years)].join(" / ")} (print ${c.yearPrint ?? "–"}, online ${c.yearOnline ?? "–"}).`);
  const sim = similarity(item.title, c.title);
  if (sim < 0.9) out.push(`Title differs (similarity ${sim.toFixed(2)}). Crossref: “${c.title}”.`);
  if (c.firstAuthor && norm(c.firstAuthor) !== norm(firstAuthorFamily(item.authors)))
    out.push(`First author: publications.md gives ${firstAuthorFamily(item.authors)}; Crossref gives ${c.firstAuthor}.`);
  const vol = item.details.match(/^(\d+)/)?.[1];
  if (vol && c.volume && vol !== c.volume) out.push(`Volume: publications.md gives ${vol}; Crossref gives ${c.volume}.`);
  return out;
}

// ---------- main ----------

const sources = readSource();
const items = [...sources.published, ...sources.chapters.filter((c) => c.doi)];
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const next = {};
let queried = 0;
let failed = 0;

for (const item of items) {
  const mentioned = item.checks.join(" ").match(/10\.\d{4,}\/[^\s"”)]+/)?.[0];
  if (!refresh && cache[item.key] && cache[item.key].status !== "error" && (!mentioned || cache[item.key].mentioned)) {
    next[item.key] = cache[item.key];
    continue;
  }
  try {
    next[item.key] = { line: item.raw, ...(await lookUp(item)), checkedAt: new Date().toISOString().slice(0, 10) };
    if (mentioned) {
      const w = await get(`${API}/${encodeURIComponent(mentioned)}`);
      next[item.key].mentioned = w ? summarise(w) : { doi: mentioned, title: "(not found on Crossref)" };
    }
    queried++;
    await new Promise((r) => setTimeout(r, 120));
  } catch (e) {
    failed++;
    // Keep what we had; the site falls back to the text of publications.md.
    next[item.key] = cache[item.key] || { line: item.raw, status: "error", error: String(e.message) };
  }
}
fs.writeFileSync(CACHE, JSON.stringify(next, null, 2) + "\n");

// ---------- report ----------

const describe = (c) =>
  `${c.doi}: “${c.title}”, ${c.authors || c.firstAuthor}, *${c.journal}* ${c.volume || ""}${c.issue ? `(${c.issue})` : ""}${c.page ? `, ${c.page}` : ""}${c.articleNumber ? `, ${c.articleNumber}` : ""}, ${c.year || c.yearIssued}`;
const cite = (i) => `${i.authors} (${i.year}). ${i.title}. ${i.venue}`;
const noDoi = [];
const diffs = [];
const known = [];
for (const item of items) {
  const e = next[item.key];
  if (!["given", "matched"].includes(e.status)) noDoi.push({ item, e });
  const d = differences(item, e);
  if (item.checks.length) known.push({ item, e, d });
  else if (d.length) diffs.push({ item, e, d });
}

const lines = [
  "# Publications: Crossref report",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run pubs\` from \`content/publications.md\`. Nothing in publications.md has been changed; decide each point and edit that file if needed.`,
  "",
  `- Items checked: ${items.length} (${sources.published.length} published articles + edited volume with DOI)`,
  `- DOI written in publications.md: ${items.filter((i) => next[i.key].status === "given").length}`,
  `- DOI found on Crossref (unambiguous match): ${items.filter((i) => next[i.key].status === "matched").length}`,
  `- Without a confident DOI (listed from the text as given, no DOI link): ${noDoi.length}`,
  "",
  "## Items with a check note in publications.md",
  "",
];
for (const { item, e, d } of known) {
  lines.push(`**${cite(item)}**`, "", `- Note in publications.md: ${item.checks.join(" ")}`);
  if (e.crossref) {
    const c = e.crossref;
    lines.push(`- Crossref (${e.status === "given" ? "DOI given" : "found by search"}) ${describe(c)}; print ${c.yearPrint ?? "–"}, online ${c.yearOnline ?? "–"}.`);
  } else {
    lines.push(`- Crossref: no confident match (${e.status}).`);
    for (const c of (e.candidates || []).filter((c) => c.score >= 0.6)) lines.push(`  - closest record: ${describe(c)} (title similarity ${c.score})`);
  }
  if (e.mentioned) lines.push(`- The DOI named in the note resolves to ${describe(e.mentioned)}.`);
  for (const x of d) lines.push(`- ${x}`);
  lines.push("");
}

lines.push("## Items without a confident DOI", "");
if (!noDoi.length) lines.push("None.", "");
for (const { item, e } of noDoi) {
  lines.push(`- **${cite(item)}** (${e.status})`);
  const close = (e.candidates || []).filter((c) => c.score >= 0.6);
  if (!close.length) lines.push("  - Crossref has no close record.");
  for (const c of close) lines.push(`  - closest record: ${describe(c)} (title similarity ${c.score})`);
}
lines.push("", "## Differences between publications.md and Crossref", "");
if (!diffs.length) lines.push("None.", "");
for (const { item, e, d } of diffs) {
  lines.push(`- **${cite(item)}** (doi:${e.doi}, ${e.status === "given" ? "DOI given" : "found by search"})`);
  for (const x of d) lines.push(`  - ${x}`);
}
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync(REPORT, lines.join("\n") + "\n");

console.log(`Crossref: ${queried} looked up, ${failed} failed (kept previous data), ${noDoi.length} without a confident DOI. Report: ${REPORT}`);
