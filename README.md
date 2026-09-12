# ROOM — research project website

A responsive, research-first project page for **ROOM: A Human–Humanoid Interaction Manipulation Dataset for Nonverbal Behavior Grounding**. Built with Vite, React and TypeScript. All research claims and experimental figures are sourced from the supplied anonymous manuscript.


## Design versions

- **Version 2 (current):** silver-blue hero, a nonverbal-to-action diagram, alternating light research panels and deep-blue technical sections.
- **Version 1 (preserved):** the original charcoal/orange design, available at `versions/v1/` relative to the site root. The complete static snapshot is in `public/versions/v1/`; its source is tagged `v1` in Git.

The snapshot is immutable. Do not replace its files when changing the current website. Both versions retain their own styles, scripts and assets so they can be reviewed independently. See `VERSIONS.md` for the source reference.

## Install and run

Requires Node.js 22 LTS (or a compatible current LTS) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

```bash
npm run build
npm run preview
```

`dist/` is the complete static deployment artifact. The build prerenders the complete research content into HTML before React adds interactivity, so the manuscript narrative and values are available without waiting for JavaScript. It works on Sites, GitHub Pages, Cloudflare Pages, Netlify, Vercel static hosting, or an ordinary web server. Vite uses a relative base so assets also work below a repository subpath. No server, API keys, database, or paid service is required.

## Content and project links

Edit **`src/data/project.ts`**:

- `project`: project title, anonymous authors, publication status, Paper / Code / Dataset / arXiv links, headline numbers, provisional BibTeX.
- `signals`, `hardware`, `taskGroups`: modality views, collection equipment, interaction functions and representative tasks.
- `representations`: the three nonverbal representation pathways and their findings.
- `models`, `benchmark`, `failureResults`, `study`: all plotted values and original denominators.
- `draftNotes`: discrepancies that need author confirmation.

The paper link currently opens `public/room-paper.pdf`. Set real code/dataset URLs when released; `null` produces a clear “Coming soon” state. Hero and resource links share this configuration. No accepted venue or publication year is inferred from the PDF filename.

## Assets and videos

- `public/assets/`: optimized WebP crops extracted from the PDF; no generated or unrelated robotics imagery.
- `public/fonts/`: self-hosted DM Sans and IBM Plex Mono plus their OFL licenses.
- `public/room-paper.pdf`: an unmodified copy of the supplied manuscript.
- `public/videos/`: add real, muted-compatible demo footage using these exact filenames:

| Placement | Filename (either extension) |
| --- | --- |
| Hero | `hero.mp4` or `hero.webm` |
| Table Organization | `table-organization.mp4` or `.webm` |
| Seating Assistance | `seating-assistance.mp4` or `.webm` |
| Collaborative Cart Delivery | `collaborative-cart-delivery.mp4` or `.webm` |
| Action Correction | `action-correction.mp4` or `.webm` |

Vite discovers these files automatically on start/build; WebM is preferred if both exist. No JSX edits are needed. Restart the dev server if adding a new filename does not trigger a refresh. Videos play muted, inline, and loop when in view; reduced-motion users get manual playback. A decoding/load error falls back to the paper image. There are no video requests when no matching files exist. Use short, compressed clips; keep native controls accessible and avoid baking text labels into clips.

## Structure

```text
src/
  components/   Navigation, media playback/fallback, shared visual primitives
  sections/     Hero, research narrative, method, benchmark, study, resources
  data/         Editable content and paper-sourced numbers
  styles/       Responsive design system and self-hosted font declarations
public/
  assets/       Real paper figures and clean crops
  fonts/        WOFF2 fonts and licenses
  videos/       Optional experiment footage
scripts/
  extract_assets.py  Reproducible PDF extraction and crop coordinates
```

The page uses native semantic controls, keyboard focus states, a mobile navigation menu, CSS transitions and IntersectionObserver scroll reveals. All animation respects `prefers-reduced-motion`. Graphs include exact text values and an expandable benchmark table. Copy BibTeX uses the Clipboard API; if unavailable, the citation remains selectable.

## Reproduce PDF assets

```bash
python3 -m pip install pymupdf pillow
python3 scripts/extract_assets.py
```

This reads `ICRA_27___HRI_manipulation_dataset.pdf` without modifying it. Crop coordinates are tied to the supplied draft; review them if replacing the manuscript.

## Before a public research release

See **`DESIGN_NOTES.md`** for the narrative, design references, source map and draft inconsistencies. The current anonymous citation is explicitly provisional. Table III contains no ablation results. The page preserves the manuscript's reported numbers and flags the ambiguous 22.9% chart entry.

No license for the research paper, photos, or dataset has been invented. Font licenses are included; the authors should choose the website code and research asset licensing before an open-source release.
