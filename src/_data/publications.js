// Publication lists for the site: the items and wording of content/publications.md,
// plus DOI, missing volume/pages and open-access status from src/_data/crossref.json
// (filled by `npm run pubs`). Items without a confident DOI are shown as written.
import fs from "node:fs";
import { readSource, CACHE } from "../../scripts/publications-lib.js";

const norm = (s = "") =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const volumePages = (c) =>
  `${c.volume}${c.issue ? `(${c.issue})` : ""}${c.page || c.articleNumber ? `, ${(c.page || c.articleNumber).replace(/-/g, "–")}` : ""}`;

export default function () {
  const src = readSource();
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

  const enrich = (p) => {
    const e = cache[p.key] || {};
    const c = ["given", "matched"].includes(e.status) ? e.crossref : null;
    let details = p.details;
    if (c?.volume) {
      const volumeOnly = /^\d+(\(\d+\))?$/.test(details) && details.startsWith(c.volume);
      const takeVolume = p.checks.some((x) => /take volume from crossref/i.test(x));
      if (!details || volumeOnly || takeVolume) details = volumePages(c);
    }
    return { ...p, details, doi: c ? e.doi : p.doi || null, openAccess: Boolean(c?.openAccess) };
  };

  const published = src.published.map(enrich);
  const years = [...new Set(published.map((p) => p.year))].sort((a, b) => b - a);
  const byYear = years.map((year) => ({ year, items: published.filter((p) => p.year === year) }));

  return {
    inPress: src.inPress,
    underReview: src.underReview,
    byYear,
    count: published.length,
    thesis: src.thesis,
    chapters: src.chapters.map(enrich),
    invitedTalks: src.invitedTalks,
    conferenceTalks: src.conferenceTalks,
    // Used by the selected papers to find their DOI and open-access status.
    find(title) {
      return published.find((p) => norm(p.title) === norm(title));
    },
  };
}
