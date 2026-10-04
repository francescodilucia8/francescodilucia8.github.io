# Francesco Di Lucia's portfolio

A static Astro + TypeScript portfolio with an editorial spectral-field identity. The home page features a controllable thesis workflow, local-AI architecture, bounded-agent flow, two credited collaborative projects, About and email contact. Three case-study pages and a useful 404 are rendered as HTML. No backend, model service or API key is required.

## Run locally

Use Node.js **22.19+**, preferably Node 24 LTS, and npm. On this Windows desktop the commands automatically use the available bundled Node runtime when the system installation is too old; they do not change the system installation. Astro telemetry is disabled by the local runner.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run verify
npm run preview
```

Default development: `http://127.0.0.1:4321/`. Production output: `dist/`. Preview serves the production output at the same port when it is free. Astro permits one preview supervisor per project. Stop it with `node scripts/run-astro.mjs preview stop` before starting another configuration; `node scripts/run-astro.mjs preview --host 127.0.0.1 --port 4322` chooses another port.

## Edit

- `src/data/portfolio.ts`: typed profile, project text, source links and thesis beats.
- `src/styles/global.css`: shared typography, color, spacing and responsive layouts.
- `src/components/ThesisScene.astro`, `FieldGlyph.astro`, `src/scripts/thesis.ts`: editable SVG/DOM scene and its one-shot GSAP controller.
- `animation-source/STORYBOARD.md`: storyboard and source map; `ASSET_CREDITS.md` and `licenses/`: asset provenance.
- `src/pages/work/[slug].astro`: the static case studies; `src/lib/paths.ts`: centralized base-aware URLs.

The thesis scene has an immediate still, pause/replay, offscreen and hidden-document pausing, and step selectors on the expanded page. Reduced motion uses stills and manual stage changes without loading GSAP. Core content and navigation remain available without JavaScript. All diagrams are explanatory rather than live demos.

## GitHub Pages

Portfolio URL: **https://francescodilucia8.github.io/**. Source repository: **francescodilucia8/francescodilucia8.github.io**. The workflow runs **only when manually dispatched**, so a source push alone does not deploy changes. Follow the [Astro Pages guide](https://docs.astro.build/en/guides/deploy/github/) and [GitHub Pages documentation](https://docs.github.com/en/pages).

This folder has its own Git repository. Commit the lockfile and curated source only. `.gitignore` excludes private references, handoff instructions, notes and caches, but cannot remove previously tracked files. Original references need a separate private backup.

Pages uses GitHub Actions as its source. To deploy an update, push the reviewed source and manually run **Publish portfolio to GitHub Pages**. The workflow derives `/` for this owner site and `/repository-name/` if reused in a project repository. Optional repository variables `PORTFOLIO_SITE` and `PORTFOLIO_BASE` override those choices. For a custom domain set the verified origin, base `/`, and the appropriate `public/CNAME` only after the domain is established.

To verify a project prefix in PowerShell:

```powershell
$env:PORTFOLIO_BASE = '/portfolio-test/'
$env:PORTFOLIO_OUT_DIR = './dist-base'
npm run build
npm run verify
node scripts/run-astro.mjs preview --host 127.0.0.1 --port 4322
# When done:
Remove-Item Env:PORTFOLIO_BASE, Env:PORTFOLIO_OUT_DIR
```

Stop the existing preview before serving the alternate configuration. `node scripts/base-check.mjs` alternatively tests `dist-base` under `/portfolio-test/` on a temporary plain file server and leaves the root preview untouched.

The final URL enables canonical and Open Graph URLs via `PORTFOLIO_SITE`. Without it, the local build deliberately omits absolute social-image/canonical URLs. Private PDFs, PowerPoint notes and raw datasets are never public assets. There is no public CV download because public-distribution intent was not established.

## Verification

`npm run verify` audits the static routes, local link/asset destinations, base prefixes, output privacy and total JS budget. Browser checks are in `scripts/browser-check.mjs`; run them against a production preview with `node scripts/browser-check.mjs` (installed Chrome or Edge, or a Playwright Chromium installation). Set `VERIFY_URL` for another local preview. Screenshots and detailed results go into ignored `build-notes/`.

This is a partial accessibility and local-browser review, not certification or physical-device/field testing. The Pages workflow checks, builds and audits the static output before deployment. Source-project tests and thesis experiments were not executed for this portfolio.
