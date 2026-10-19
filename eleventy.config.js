import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { IdAttributePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const FLAGS = ["at", "be", "ca", "fr", "de", "il", "it", "jp", "kz", "lu", "si", "gb", "us"];

export default function (eleventyConfig) {
  // YAML data files (news, collaborators, images, ...)
  eleventyConfig.addDataExtension("yaml,yml", (contents) => loadYaml(contents));

  // ids on headings, so sections can be linked (e.g. /team/#joining-the-team)
  eleventyConfig.addPlugin(IdAttributePlugin, {
    slugify: (text) => {
      const slug = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return /^[a-z]/.test(slug) ? slug : `s-${slug}`;
    },
  });

  // Photos: AVIF + WebP + JPEG, several widths, width/height set, lazy by default.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "jpeg"],
    widths: [400, 800, 1200],
    urlPath: "/img/",
    outputDir: "_site/img/",
    svgShortCircuit: true,
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
    },
  });

  // Static files
  eleventyConfig.addPassthroughCopy({ "src/assets/cv/White_CV_2026.pdf": "assets/cv/White_CV_2026.pdf" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" }); // only if a custom domain is set
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg", "src/favicon.png": "favicon.png", "src/apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fontsource/source-sans-3/files/source-sans-3-latin*-{400,600}-normal.woff2": "fonts" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fontsource/source-sans-3/files/source-sans-3-latin*-400-italic.woff2": "fonts" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fontsource/source-serif-4/files/source-serif-4-latin*-600-normal.woff2": "fonts" });
  for (const code of FLAGS) {
    eleventyConfig.addPassthroughCopy({ [`node_modules/flag-icons/flags/4x3/${code}.svg`]: `assets/flags/${code}.svg` });
  }

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/assets/images/");

  // Inline an SVG from assets/images, recoloured by the site's theme tokens.
  // The file's own <style> (which only follows prefers-color-scheme) is dropped so the
  // manual light/dark toggle also applies; ids are prefixed to stay unique on the page.
  eleventyConfig.addShortcode("inlineSvg", (file, label, prefix) => {
    let svg = fs.readFileSync(path.join("src/assets/images", file), "utf8");
    svg = svg.replace(/<\?xml[^>]*>\s*/, "").replace(/<style>[\s\S]*?<\/style>/, "");
    svg = svg.replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`);
    svg = svg.replace(/aria-labelledby="[^"]*"/, `aria-label="${label.replace(/"/g, "&quot;")}"`);
    svg = svg.replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
    svg = svg.replace(/href="#([^"]+)"/g, `href="#${prefix}-$1"`);
    return svg.replace(/\n\s*\n/g, "\n");
  });

  // A captioned photo from src/_data/images.yaml. Returned on one line so it can sit
  // inside Markdown without being split into paragraphs.
  eleventyConfig.addShortcode("figure", function (key, sizes = "(min-width: 760px) 340px, 100vw") {
    const img = this.ctx.images[key];
    if (!img) throw new Error(`Unknown image "${key}" (see src/_data/images.yaml)`);
    const caption = img.caption ? `<figcaption>${img.caption}</figcaption>` : "";
    const cls = img.position ? ` style="object-position: ${img.position}"` : "";
    return `<figure><img src="/assets/images/${img.file}" alt="${img.alt}" sizes="${sizes}"${cls}>${caption}</figure>`;
  });

  // Collaborators table (Research page), from src/_data/collaborators.yaml.
  // Flags are decorative: the country name is always written next to them.
  eleventyConfig.addShortcode("collaborators", function () {
    const rows = this.ctx.collaborators
      .map(
        (c) =>
          `<tr><th scope="row"><img eleventy:ignore class="flag" src="/assets/flags/${c.flag}.svg" alt="" width="20" height="15">${c.country}</th><td>${c.people}</td></tr>`
      )
      .join("");
    return `<table class="collaborators"><caption class="visually-hidden">Collaborators by country</caption><tbody>${rows}</tbody></table>`;
  });

  // *italic* and **bold** in short texts kept in data files.
  eleventyConfig.addFilter("mdInline", (text = "") =>
    String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
  );

  // Author list with Olivier's name in bold.
  eleventyConfig.addFilter("authorsHtml", (authors = "") =>
    authors
      .replace(/&/g, "&amp;")
      .replace(/\bWhite O\b(\*?)/g, "<strong>White O$1</strong>")
  );
  eleventyConfig.addFilter("boldName", (html = "") => html.replace(/\bWhite O\b(\*?)/g, "<strong>White O$1</strong>"));
  eleventyConfig.addFilter("endsWithPunct", (s = "") => /[.?!]\*?$/.test(s.trim()));
  eleventyConfig.addFilter("linkify", (html = "") =>
    html.replace(/(https:\/\/[^\s<)]+)/g, '<a href="$1">$1</a>')
  );

  // On phones, table rows stack; each cell gets its column name as a label.
  eleventyConfig.addTransform("table-labels", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<table>([\s\S]*?)<\/table>/g, (table, inner) => {
      const head = inner.match(/<thead>([\s\S]*?)<\/thead>/);
      if (!head) return table;
      const labels = [...head[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").replace(/"/g, "&quot;"));
      const body = inner.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
        let i = 0;
        // Short cells (names, years, levels) stay on one line on wide screens.
        const withLabels = cells.replace(/<td([^>]*)>([\s\S]*?)<\/td>/g, (m, attrs, text) => {
          const short = text.replace(/<[^>]+>/g, "").length <= 20 ? ' class="nowrap"' : "";
          return `<td${attrs}${short} data-label="${labels[i++] || ""}">${text}</td>`;
        });
        return `<tr>${withLabels}</tr>`;
      });
      return `<div class="table-wrap"><table class="stack">${body}</table></div>`;
    });
  });

  eleventyConfig.addFilter("monthYear", (date) =>
    new Date(date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  );
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
