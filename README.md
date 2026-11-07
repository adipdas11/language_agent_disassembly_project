# UNMAKE

**Language-Agent-Guided Adaptive Dual-Arm Robotic Disassembly**

A React, TypeScript, and Vite research website. The redesign uses a light editorial layout, a responsive hybrid SVG/video architecture, real annotated perception samples, and manuscript-based evaluation tables.

Website: https://adipdas11.github.io/language_agent_disassembly_project/

The reviewed redesign is published through the GitHub Pages workflow on `main`.

## Local review

```bash
npm ci
npm run dev -- --port 5180 --strictPort
```

Open http://localhost:5180/.

```bash
npm test
npm run test:e2e
npm run build
npm run preview -- --port 5181 --strictPort
node scripts/verify-pages.mjs
```

Production preview uses `/language_agent_disassembly_project/`; development uses `/`. Asset paths and runtime prompt loading use the shared `sitePath` helper.

## Content and provenance

- `src/content/research-data.ts`: title, authors, author visibility, dataset links.
- `src/content/world-state.ts`: illustrative four-field runtime packet and paper dispatch example. Pixel measurements are not six-dimensional poses.
- `src/content/manuscript-results.json`: all seven active result tables extracted from `RAL-mainV10.tex`. Commented-out earlier drafts are excluded.
- `src/components/DevicesResultsSection.tsx`: perception tables, controller comparisons, metric definitions, skill breakdown, and additional-HDD example. Repeated cross-device metrics appear once; unique replanning values are included in the controller cards.
- `public/content/system-prompts.txt`: editable generic prompt templates. These are interface templates, not recorded agent reasoning.
- `public/assets/vision/samples.json`: real input imagery, labels, and saved model predictions. The architecture uses prediction coordinates; the separate sample matrix uses supplied dataset annotations.

**Data status matters:** V10 explicitly describes controller, skill, and additional-HDD numbers as generated numerical examples, not measured robot outcomes. The page preserves this qualification. Perception metrics are supplied development-set results from a split performed after augmentation. Do not relabel either as independently validated physical performance.

To regenerate result data from a revised manuscript:

```bash
python3 scripts/extract-paper-results.py /path/to/RAL-mainV10.tex
```

Review provenance and copy if the status of those tables changes. Older commented tables have different recovery values and must not be substituted for active V10 tables.

## Media and animation

The primary film is the original YouTube experiment, trimmed from 21.2s to 142.5s. Opening title/architecture slides and closing result/title slides are removed. It retains the multi-view composition and demonstration timing, without audio. Edit provenance is in `public/assets/experiment-edit.json`.

Seven unique, previously reviewed action and evaluation snippets are kept under `public/assets/actions/` and `public/assets/architecture/`, with crop and timing metadata. All skills and devices are shown together; narrow screens stack them without tabs. Reduced motion starts the animation paused. Offscreen or hidden-page media pauses automatically.

The architecture is one compact scientific figure, following the original four-column composition: perception; world state, ReAct, and skills; dual-arm execution; cross-device evaluation. Highlighted title strips and outlined groups follow the ASPIRE reference. The original arm illustrations are displayed through clipped SVG viewports, alongside seven real video windows. Measured SVG connectors, detection overlays, camera scans, image packets, a circular reasoning orbit, and cycling skill selection animate the loop. Execution feedback returns directly to the four-field world state. Tablets use two columns and phones follow a continuous vertical flow; no views are hidden in tabs.

The visual direction draws on [ASPIRE](https://research.nvidia.com/labs/gear/aspire/) and [Agentic World Action Models](https://agentic-wam.github.io/); the scientific flow remains UNMAKE’s.

## Publishing

The GitHub Actions workflow deploys pushes to `main`, running unit tests and a production build before publishing. Develop and review future changes locally before publishing. Paper and research Code buttons remain “Coming soon”; the website repository is not presented as a release of the robotics implementation.
