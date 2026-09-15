# ROOM — research project website

A responsive, research-first project page for **ROOM: A Human–Humanoid Interaction Manipulation Dataset for Nonverbal Behavior Grounding**. Built with Vite, React and TypeScript. All research claims and experimental figures are sourced from the supplied anonymous manuscript.


## Design versions

- **Version 3 (current):** a warm home-centered design: large ROOM identity, a full-screen household video with overlaid titles, cream surfaces, walnut type, terracotta accents and an interactive task gallery. Inspired by the research reading rhythm of Behavior Robot Suite; visual composition and assets are ROOM’s own.
- **Version 2 (preserved):** silver-blue hero, a nonverbal-to-action diagram, alternating light research panels and deep-blue technical sections. Its protected Worker snapshot is in `archive/versions/v2/`; source is tagged `v2`.
- **Version 1 (preserved):** the original charcoal/orange design, kept offline. The complete static snapshot is in `archive/versions/v1/`; its source is tagged `v1` in Git.

The snapshot is immutable. Do not replace its files when changing the current website. The archived versions retain their own styles, scripts and assets so they can be reviewed independently. See `VERSIONS.md` for the source reference.

## Install and run

Requires Node.js 22 LTS (or a compatible current LTS) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by the preview server. It serves the same public read-only page as production. `npm run dev:ui` is a loopback-only UI editing server; never use it for sharing.

```bash
npm run build
npm run preview
```

`dist/server/index.js` is the complete Cloudflare-compatible Worker. The page is prerendered and bundled together with its allowed images, scripts and fonts inside the Worker; there is no separately served static directory. The current page and its required assets are public. PDFs, old versions and local source files are excluded from the deployment.

## GitHub Pages deployment

The primary public website is published by GitHub Pages from `docs/` on the `main` branch. The Pages workflow rebuilds and checks that publishable output after every push.

```bash
npm run build:pages
npm run test:pages
```

The static output is written to `docs/`. Relative image and video paths keep the website working under both the GitHub Pages repository path and an Anonymous GitHub `/w/<id>/` path. The stylesheet, browser module and web fonts are also embedded in `index.html` so the same page retains its design and interactions inside Anonymous GitHub's opaque-origin sandbox. The offline manuscript and archived website versions remain outside the published output.

## Public access

The deployed site is intentionally public and read-only. Visitors can open the research page and its required images, scripts, fonts and videos without a password or sign-in. The Worker serves only the current-design asset inventory; it does not expose arbitrary project files.

Run `npm run build` followed by `npm test` to verify public page and asset access, video byte ranges, method restrictions, and PDF/archived-version exclusion.

## Content and project links

Edit **`src/data/project.ts`**:

- `project`: project title, anonymous authors, publication status, Paper / Code / Dataset / arXiv links, headline numbers, provisional BibTeX.
- `signals`, `hardware`, `taskGroups`: modality views, collection equipment, interaction functions and representative tasks.
- `representations`: the three nonverbal representation pathways and their findings.
- `models`, `benchmark`, `failureResults`, `study`: all plotted values and original denominators.
- `draftNotes`: discrepancies that need author confirmation.

The manuscript is not shared in this preview: `project.links.paper` is null, and the copy is kept outside public assets at `archive/room-paper.pdf`. Paper download links have been removed. Code and dataset links remain unreleased. No accepted venue or publication year is inferred from the PDF filename.

## Assets and videos

The homepage now plays the supplied 15-second, 1280 × 720 H.264 video at `public/videos/hero.mp4`. It is muted, begins at second 5, loops the 5–15 second segment while visible, and hides native playback controls as requested. The video fills the first viewport edge to edge, with ROOM and navigation overlaid. Cover sizing adapts to the screen; portrait and very wide screens crop the sides or top/bottom. The homepage has no progress bar or player buttons. Its poster is extracted at second 5 of that same video. Public video requests support byte ranges for playback and seeking. The original uploaded file remains untouched in the workspace.

- `public/assets/`: optimized WebP crops extracted from the PDF; no generated or unrelated robotics imagery.
- `public/fonts/`: self-hosted DM Sans and IBM Plex Mono plus their OFL licenses.
- `archive/room-paper.pdf`: an unmodified offline copy of the supplied manuscript; never deployed.
- `public/videos/`: add real, muted-compatible demo footage using these exact filenames:

| Placement | Filename (either extension) |
| --- | --- |
| Hero | `hero.mp4` or `hero.webm` |
| Table Organization | `table-organization.mp4` or `.webm` |
| Seating Assistance | `seating-assistance.mp4` or `.webm` |
| Collaborative Cart Delivery | `collaborative-cart-delivery.mp4` or `.webm` |
| Action Correction | `action-correction.mp4` or `.webm` |

Vite discovers these files automatically on start/build; WebM is preferred if both exist. No JSX edits are needed. Restart the dev server if adding a new filename does not trigger a refresh. Videos play muted, inline, and loop when in view; reduced-motion users get a still poster on the homepage and manual playback for other media. A decoding/load error falls back to the paper image. There are no video requests when no matching files exist. Use short, compressed clips; keep native controls accessible and avoid baking text labels into clips.

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
server/         Public Worker responses and explicit asset routing
archive/        Offline V1/V2 snapshots and manuscript; never packaged
tests/          Public-access and deployment-boundary checks
scripts/
  build-public.mjs  Bundle allowed current-design assets inside the Worker
  preview.mjs   Run the same Worker locally
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
