// Builds /css/site.css: self-hosted @font-face rules followed by main.css.
import fs from "node:fs";

export const data = {
  permalink: "/css/site.css",
  eleventyExcludeFromCollections: true,
};

export function render({ fontFaces }) {
  return `${fontFaces}\n${fs.readFileSync("src/css/main.css", "utf8")}`;
}
