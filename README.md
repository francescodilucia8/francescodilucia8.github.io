# Francesco Di Lucia's portfolio

A static Astro + TypeScript portfolio with an editorial spectral-field identity. The home page features a controllable thesis workflow, local-AI architecture, bounded-agent flow, two credited collaborative projects, About and email contact. English and Italian editions each include the home page, three case studies and a useful 404, rendered as ten static HTML pages. No backend, model service or API key is required.

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
- `src/data/italian.ts`: Italian copy; `src/lib/i18n.ts`: translations and localized routes.
- `src/styles/global.css`: shared typography, color, spacing and responsive layouts.
- `src/components/ThesisScene.astro`, `FieldGlyph.astro`, `src/scripts/thesis.ts`: editable SVG/DOM scene and its one-shot GSAP controller.
- `animation-source/STORYBOARD.md`: storyboard and source map; `ASSET_CREDITS.md` and `licenses/`: asset provenance.
- `src/components/HomePage.astro` and `CaseStudyPage.astro`: shared localized page templates. `src/pages/` and `src/pages/it/` define both language editions; `src/lib/paths.ts` centralizes base-aware URLs.



## Languages

English uses `/`; Italian uses `/it/`, including localized case studies. On the first JavaScript-enabled visit, the browser's preferred supported language selects the edition. Other languages fall back to English. The header's IT/EN switch keeps the current page, query and section, then remembers the choice in local storage. An explicit `?lang=it` or `?lang=en` also selects and remembers an edition. Storage is optional; no visitor preference is sent to a server. Without JavaScript, both editions and the switch remain ordinary static links. Each page provides language metadata and reciprocal alternate links for search engines.

## GitHub Pages

Portfolio URL: **https://francescodilucia8.github.io/**. Source repository: **francescodilucia8/francescodilucia8.github.io**. The workflow runs **only when manually dispatched**, so a source push alone does not deploy changes. Follow the [Astro Pages guide](https://docs.astro.build/en/guides/deploy/github/) and [GitHub Pages documentation](https://docs.github.com/en/pages).

This folder has its own Git repository. Commit the lockfile and curated source only. `.gitignore` excludes private references, handoff instructions, notes and caches, but cannot remove previously tracked files. Original references need a separate private backup.

Pages uses GitHub Actions as its source. To deploy an update, push the reviewed source and manually run **Publish portfolio to GitHub Pages** from the owner's account on `main`. The workflow derives `/` for this owner site and `/repository-name/` if reused in a project repository. Its owner/repository guard must also be deliberately updated when reusing the workflow elsewhere. Optional repository variables `PORTFOLIO_SITE` and `PORTFOLIO_BASE` override those choices. For a custom domain set the verified origin, base `/`, and the appropriate `public/CNAME` only after the domain is established.

The public repository gives visitors read access; copying or forking it does not grant control of this site. The active **Owner-controlled main** repository ruleset blocks updates, deletion and force pushes on `main` except for repository administrators. The owner's account is currently the sole administrator and collaborator. The `github-pages` environment permits deployment only from `main`; the workflow additionally permits only `francescodilucia8` in this exact repository. Actions are pinned to complete commit hashes, use scoped permissions, and do not persist checkout credentials. CODEOWNERS identifies the owner for reviews; it does not itself enforce permissions. Review these settings if collaborators or administrators are added later.

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

The final URL enables canonical and Open Graph URLs via `PORTFOLIO_SITE`. Without it, the local build deliberately omits absolute social-image/canonical URLs. Private references, PowerPoint notes and raw datasets are never public assets. The header and About section offer the reviewed English CV at `public/Francesco-di-Lucia-CV.pdf`; its phone number and unnecessary metadata have been removed, while professional links remain. Download paths respect the deployment base.

## Verification

`npm run verify` audits the ten static routes, local link/asset destinations, base prefixes, output privacy and total JS budget. Browser checks are in `scripts/browser-check.mjs`; run them against a production preview with `node scripts/browser-check.mjs` (installed Chrome or Edge, or a Playwright Chromium installation). `node scripts/language-check.mjs` checks browser-language selection, remembered choices, switching, Italian motion controls, responsive layouts, no-JavaScript/reduced-motion behavior and Axe on all ten pages using installed Edge. Set `VERIFY_URL` for another preview. Screenshots and detailed results go into ignored `build-notes/`.

This is a partial accessibility and local-browser review, not certification or physical-device/field testing. The Pages workflow checks, builds and audits the static output before deployment. Source-project tests and thesis experiments were not executed for this portfolio.
