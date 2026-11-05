# Adaptive Dual-Arm Robotic Disassembly — interactive research site

A React, TypeScript, and Vite research website with an animated architecture, real perception samples, robot action clips, structured-state examples, and system prompt templates.

Website: https://adipdas11.github.io/language_agent_disassembly_project/

## Run locally

```bash
npm ci
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

The development server uses `/`. The production preview uses `/language_agent_disassembly_project/`, matching GitHub Pages.

## GitHub Pages deployment

Push changes to `main` to run `.github/workflows/deploy.yml`. The workflow installs dependencies, runs unit tests, builds `dist`, and deploys the website to GitHub Pages. It can also be run manually from the repository's Actions tab. Pages uses **GitHub Actions** as its publishing source.

Vite's production base and the shared `sitePath` helper keep images, videos, icons, and prompt loading inside the repository's URL path. The workflow uses GitHub's built-in token; no personal access token or application secrets are needed.

## Content controls

- Authors and the `showAuthors` switch live in `src/content/research-data.ts`.
- Runtime-editable prompt templates live in `public/content/system-prompts.txt`.
- Devices, results, limitations, schemas, skills, and author details are centralised in `src/content/research-data.ts`.
- Paper and Code controls intentionally remain disabled and labelled “Coming soon”.
- The three Roboflow dataset controls are live external links supplied by the project owner.

When `showAuthors` is false, author cards, email actions, and author metadata are omitted.

## Verification

```bash
npm test
npm run test:e2e
```

The Playwright suite covers media playback, prompts, keyboard navigation, diagram geometry, eighteen responsive viewport sizes, reduced motion, and accessibility.

To verify a production build under the Pages path, run the preview on port 5181, then:

```bash
node scripts/verify-pages.mjs
```

The same check accepts a live website URL as its first argument.
