# Olivier White — personal academic website

Static site built with [Eleventy](https://www.11ty.dev/) and published on GitHub Pages
at **https://olivierwhite.github.io**. No database, no tracker, no client-side framework.

## Where things are

| What you want to change | File |
| --- | --- |
| Text of a page | `src/index.md` (Home intro), `src/research.md`, `src/publications.md` (intro), `src/team.md`, `src/teaching.md`, `src/service.md`, `src/contact.md` |
| News on the Home page | `src/_data/news.yaml` |
| Research theme cards and "Beyond the lab" (Home) | `src/_data/home.yaml` |
| Publications (which items appear, and their wording) | `content/publications.md` |
| Selected papers and their one-line comment | `src/_data/selectedPapers.yaml` |
| Collaborators and their flags | `src/_data/collaborators.yaml` |
| Distinctions | `src/_data/distinctions.yaml` |
| Photos, captions and alt text | photos in `src/assets/images/`, captions and alt text in `src/_data/images.yaml` |
| CV | replace `src/assets/cv/White_CV_2026.pdf` (keep the name, or change `cv` in `src/_data/site.yaml`) |
| Name, title, profile links, menu, site address | `src/_data/site.yaml` |
| Colours, fonts, layout | `src/css/main.css` (colours are the variables at the top) |

In Markdown and in the YAML files, `*text*` gives *italics* and `**text**` gives **bold**.

`content/pages.md` is the validated text from phase 1, kept for reference on your computer only
(git-ignored, like `CLAUDE.md`, `mockups/` and `docs/kit/`); the site does not read it.

## Common updates

**Add a news item.** Open `src/_data/news.yaml` and add one line at the top:

```yaml
- { year: 2027, text: "Paper with … accepted in *Journal of Neuroscience*." }
```

**Add a paper.** In `content/publications.md`, add a line under the right year, in the same
format as the others, ideally with its DOI:

```
- White O, Coauthor A. (2027). Title of the paper. J Neurosci 47(3), 123–134. doi:10.1523/JNEUROSCI.0000-27.2027
```

Then run `npm run pubs`: it looks the paper up on Crossref (DOI, missing volume or pages,
open-access licence) and updates `docs/publications-report.md`. If the paper has no DOI, it is
searched by title and first author and accepted only if exactly one record matches; otherwise it
is listed as written, without a DOI link, and named in the report. Your text is never changed:
differences with Crossref are only reported.

For the PNAS paper under embargo: when it is published, replace the in-press line with the full
reference under its year, and remove it from "In press".

**Change a photo caption.** Edit `src/_data/images.yaml`; the caption changes everywhere the photo is used.

## Preview and publish

Once, after downloading the folder: install [Node.js](https://nodejs.org/) 20 or later, then run `npm install`.

- `npm start` — local preview at http://localhost:8080, refreshed as you save.
- `npm run build` — builds the site into `_site/` (looks up new publications first).
- `npm run pubs -- --refresh` — checks every publication on Crossref again.

Publishing is automatic: every push to the `main` branch on GitHub runs
`.github/workflows/deploy.yml`, which builds the site and publishes it on GitHub Pages
within a minute or two. Small text edits can also be made directly on github.com
(open the file, click the pencil, "Commit changes").

## Notes

- Fonts (Source Serif 4, Source Sans 3) are served from the site itself, not from Google, so
  visitors' browsers contact no third party.
- Photos are converted at build time to AVIF, WebP and JPEG in several sizes.
- The theme follows the visitor's system setting; the button under the menu switches it and is
  remembered in the browser (`localStorage`).
- `src/assets/originals/` holds original photos that are not published (ignored by git).
- A custom domain can be added later: put the domain alone in a file `src/CNAME`, change `url`
  in `src/_data/site.yaml`, and set the domain in the repository's Pages settings.
