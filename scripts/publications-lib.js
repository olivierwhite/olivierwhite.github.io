// Reads content/publications.md (the source of truth for which items appear).
// Shared by the Crossref script (scripts/fetch-publications.js) and the site data
// (src/_data/publications.js).
import fs from "node:fs";
import crypto from "node:crypto";

export const SOURCE = "content/publications.md";
export const CACHE = "src/_data/crossref.json";

const DOI_RE = /\s*doi:\s*(10\.\S+?)\.?(?=\s|$)/i;

// Notes in the source that are instructions for the build, not text for the site.
const isInstruction = (note) => /crossref|^cv gives/i.test(note);

export function key(line) {
  return crypto.createHash("sha1").update(line).digest("hex").slice(0, 10);
}

// One reference line: "Authors. (Year). Title. Journal details. doi:… (note) [CHECK: …]"
export function parseReference(line) {
  let rest = line.trim();
  const out = { raw: rest, key: key(rest), notes: [], checks: [] };

  rest = rest.replace(/\s*\[CHECK\b:?\s*([\s\S]*?)\]\s*$/, (_, c) => {
    out.checks.push(c.trim());
    return "";
  });
  // Trailing parenthetical notes, e.g. "(Faculty of 1000)", "(*equal contribution)"
  let m;
  while ((m = rest.match(/\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$/)) && !/^\d{4}$/.test(m[1])) {
    const note = m[1].trim();
    if (isInstruction(note)) out.checks.push(note);
    else out.notes.unshift(note);
    rest = rest.slice(0, m.index).trim();
  }
  const doi = rest.match(DOI_RE);
  if (doi) {
    out.doi = doi[1].replace(/[.,;]$/, "");
    rest = (rest.slice(0, doi.index) + rest.slice(doi.index + doi[0].length)).trim();
  }

  const y = rest.match(/^(.*?)\.?\s*\((\d{4})\)\.\s*(.*)$/);
  if (y) {
    out.authors = y[1].trim();
    out.year = Number(y[2]);
    rest = y[3];
  } else {
    const a = rest.match(/^(.*?[A-Z]{1,4})\.\s+(.*)$/);
    out.authors = a ? a[1] : "";
    rest = a ? a[2] : rest;
  }

  // Title ends at the first ". " or "? " (a question mark stays in the title).
  // An italic placeholder (the embargoed PNAS paper) is kept as written.
  const placeholder = rest.match(/^(\*[^*]+\*)\s*(.*)$/);
  const t = placeholder || rest.match(/^(.*?[.?])(?:\s+|$)(.*)$/);
  if (placeholder) {
    out.title = placeholder[1];
    out.placeholderTitle = true;
    rest = placeholder[2];
  } else if (t) {
    out.title = t[1].replace(/\.$/, "");
    rest = t[2];
  } else {
    out.title = rest;
    rest = "";
  }

  // Venue: journal name up to the first token containing a digit, then volume/pages.
  rest = rest.replace(/^[.,]\s*/, "").replace(/\.\s*$/, "").trim();
  out.venue = rest;
  const tokens = rest.split(" ");
  const i = tokens.findIndex((tok) => /\d/.test(tok));
  out.journal = (i === -1 ? tokens : tokens.slice(0, i)).join(" ").replace(/,$/, "");
  out.details = i === -1 ? "" : tokens.slice(i).join(" ");
  return out;
}

// Split the Markdown file into sections of list items.
export function readSource(file = SOURCE) {
  const md = fs.readFileSync(file, "utf8");
  const sections = { inPress: [], underReview: [], published: [], thesis: [], chapters: [], invitedTalks: [], conferenceTalks: [] };
  let h2 = "";
  let h3 = "";
  let skipNext = false;
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) { h2 = line.slice(3).trim(); h3 = ""; continue; }
    if (line.startsWith("### ")) { h3 = line.slice(4).trim(); continue; }
    if (/^\s+→/.test(raw)) continue; // instruction line under an item
    if (!line.startsWith("- ")) continue;
    const text = line.slice(2).trim();

    if (h2 === "In press") sections.inPress.push(parseReference(text));
    else if (h2.startsWith("Under review")) sections.underReview.push(parseReference(text));
    else if (h2 === "Published" && h3.startsWith("Thesis")) sections.thesis.push(parseReference(text));
    else if (h2 === "Published" && /^\d{4}$/.test(h3)) sections.published.push(parseReference(text));
    else if (h2.startsWith("Book chapters")) sections.chapters.push(parseReference(text));
    else if (h2 === "Selected talks" && h3.startsWith("Invited")) {
      const [, year, body] = text.match(/^(\d{4})\s+—\s+(.*)$/) || [, "", text];
      sections.invitedTalks.push({ year: Number(year), text: body });
    } else if (h2 === "Selected talks" && h3.startsWith("Conference")) sections.conferenceTalks.push(parseReference(text));
  }
  return sections;
}
