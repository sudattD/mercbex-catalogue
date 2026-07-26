# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MERCBEX Product Catalogue — a standalone front-end UI for browsing and previewing product labels for MERCBEX Chemical Science LLP, an agrochemical company. The catalogue displays products by category (insecticide, fungicide, herbicide, PGR, bio, micronutrients, adjuvants), renders SVG print-ready front labels, bottle mockups, and supports download/print.

No build system, no bundler, no dependencies. Open `catalogue/index.html` in a browser to use.

## Commands

- **Serve locally**: `python3 -m http.server -d /Users/shraddhapeswani/Documents/mercbex-catalogue-1.1 8080` then open `http://localhost:8080/catalogue/index.html` (a static server is needed for SVG/image assets to load properly)
- **Generate raster label assets**: `node catalogue/scripts/generate-label-assets.mjs` — produces `{slug}-front-label.svg` and `{slug}-front-label.png` (300 dpi) from the ACEMAN master SVG using string replacement + sharp
- **New product template**: add an entry to the `products` array in `catalogue/app.js`, add a matching `{id}-front-label.svg` to `catalogue/assets/labels/`, and add a bottle mockup to `catalogue/assets/mockups/`

## Architecture

### `catalogue/` — the web application

- **`index.html`** — Single HTML shell with three-column layout: sidebar (categories), product grid, label preview pane. Print stylesheet at the bottom.
- **`app.js`** — Vanilla JS (~360 lines, no framework). All data (categories, products) is inline as arrays. The `labelSvg()` function generates the SVG document on the fly as a template literal rather than loading an external file — it constructs the full label with embedded CSS, category color, product name, active ingredient, mode-of-action, benefit icons, net content, and QR code. SVG sizing adapts to product name length via `productSize` logic.
- **`styles.css`** — Three-column grid layout (sidebar / product panel / label stage), responsive at 1180px and 760px breakpoints. Uses CSS custom properties for theming (`--category-color`, `--mercbex-*`). Print styles isolate the SVG label.
- **`scripts/generate-label-assets.mjs`** — A Node.js script for generating raster PNGs from the master ACEMAN SVG. Reads `brand-system/mercbex-aceman-front-label.svg`, does string replacement of product fields, writes SVG copies, then rasterises to 300 dpi PNG via `sharp`. Requires Node.js and the `sharp` npm package (installed at a hardcoded path — see below).

### `catalogue/assets/` — static assets

- `labels/` — Pre-generated SVG + 300 dpi PNG label files per product
- `mockups/` — Realistic bottle mockup PNGs per product

### `brand-system/` — design source files

- `mercbex-brand-system.md` — Full brand guide: colour palette, typography, label architecture (three zones), category colour mapping, print rules, CSS token reference
- `mercbex-logo.png`, `mercbex-qr-code.png`, `mercbex-family-system.svg`, label templates, etc.

## Key Patterns

- **No framework**: Everything is plain HTML/CSS/JS. To add a product, push an object to the `products` array in `app.js` with `id`, `categoryId`, `name`, `active`, `concentration`, `formula`, `mode`, and optional `mockup` path. The SVG renders automatically.
- **Category system**: 7 categories, each with a `color` hex and `colorName`. The active category color is set as `--category-color` on the document root and used throughout for sidebar selection, product cards, and the label's main panel.
- **SVG label generation**: The `labelSvg(product, category)` function in `app.js` produces a self-contained inline SVG. To modify label structure, edit this function. The `generate-label-assets.mjs` script uses a separate SVG file as a template source — any structural changes to the label design must be made in both places.
- **Label zones**: The SVG label has three zones (matching the brand system): top white zone (logo + category badge), main colour field (curved panel with product info), bottom technical zone (icons, net content, QR code, regulatory footer).
- **Label field flexibility**: Some label properties (category name, concentration) vary per product directly. Others like the benefit icons (High Efficacy, Broad Spectrum, Long Control) and "SYSTEMIC CROP PROTECTION" subtitle are hardcoded in the SVG template — these are currently not data-driven and would need code changes to vary per product.

## Notes

- The `generate-label-assets.mjs` script imports `sharp` from a hardcoded absolute path (`/Users/shraddhapeswani/.cache/codex-runtimes/...`) — it will only run on the original author's machine without modification.
- No `package.json` or lockfile — `sharp` is expected at a toolchain-specific cache path. Adding a `package.json` with `sharp` as a devDependency is the first step before making this script portable.
- All asset paths in the SVG (logo, QR code) use relative references (`../brand-system/`) — a static HTTP server is required; opening `index.html` directly from the filesystem will fail to load these.
- The git repository has a single commit (`709eb05`).
