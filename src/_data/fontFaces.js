// @font-face rules for the self-hosted fonts (Latin and Latin Extended only),
// taken from the @fontsource packages so the unicode ranges stay correct.
import fs from "node:fs";

const FILES = [
  "@fontsource/source-sans-3/400.css",
  "@fontsource/source-sans-3/400-italic.css",
  "@fontsource/source-sans-3/600.css",
  "@fontsource/source-serif-4/600.css",
];

export default function () {
  return FILES.map((file) => {
    const css = fs.readFileSync(`node_modules/${file}`, "utf8");
    return css
      .split(/(?=\/\*)/)
      .filter((block) => /^\/\* [a-z0-9-]+-latin(-ext)?-\d{3}-(normal|italic) \*\//.test(block))
      .map((block) =>
        block
          .replace(/url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\), url\([^)]+\) format\('woff'\)/, "url(/fonts/$1) format('woff2')")
          .trim()
      )
      .join("\n");
  }).join("\n");
}
