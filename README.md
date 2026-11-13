# UNMAKE — research website

**UNMAKE: Language-Agent Planning over Structured World States for Adaptive Dual-arm Robotic Disassembly**

Published site: **https://adipdas11.github.io/language_agent_disassembly_project/**.

## Local development

```bash
npm ci
npm run dev -- --port 5180 --strictPort
```

Local preview: **http://localhost:5180/**. GitHub Pages publishes when `main` is updated. `devel_v3` preserves the reviewed development version; `v1` and `v2` retain earlier designs.

## Research presentation

The page follows overview → system architecture → perception → planning → agent instructions → results → conclusion. The design uses white surfaces with blue, teal, violet and green diagram headings, simple vector symbols, and text-only section headings.

- The architecture preserves three perception lanes, the programmed skill library, dual-arm execution, three device demonstrations and verification feedback to the world state. Only the selected skill video plays, cycling Unscrew → Pick-and-Extract → Flip. The combined execution video shows all devices at a further 2× recording speed. Editing ranges and crops are recorded in the existing media manifests.
- Each model has a two-row collage of ten mixed samples. Detector samples retain supplied dataset segmentation masks; classifier samples are camera images. Samples magnify gently on hover or keyboard focus, without a click-to-zoom viewer.
- The six-stage planning walkthrough animates perception → structured state → prompt context → agent selection → action formatting → execution verification. JSON appears a complete line at a time. Pause, replay, stage selection and previous/next controls support inspection. Automatic playback pauses offscreen, when the document is hidden, or for reduced-motion preferences.
- The four-field state and prompt interfaces are schematic examples based on Section III and Figures 3–5 of `RAL_2026.pdf`. Camera samples and footage are illustrative context, not a synchronised recorded trial. The failure example preserves `last_outcome: failure` and an empty `removed` list.
- Results use zero-based comparisons with separate count, percentage and time scales. Interactive views cover failure metrics, recovery, replanning, additional-HDD transfer, per-skill success/call accounting/duration, and class-wise perception scores. Exact means and sample SD remain visible, with full source tables in expandable references.

The latest PDF informed the wording and interface flow. The numerical data and full prompt templates remain the extracted manuscript records in `src/content/manuscript-results.json`, `src/content/paper-interfaces.json`, and `public/content/system-prompts.txt`. The 45-trial original comparison and ten additional-HDD trials are reported separately. Summary statistics are unweighted device averages; recovery excludes trials without failed invocations. Perception scores use a post-augmentation development split and do not measure independent unseen-image generalisation.

Authors and resource availability are configured in `src/content/research-data.ts`. Paper/code download buttons remain disabled until those resources are released.

## Validation and production preview

```bash
npm test
npm run test:e2e
npm run build
npm run preview -- --port 5181 --strictPort
node scripts/verify-pages.mjs
```

Production assets use the `/language_agent_disassembly_project/` base path. The verification script accepts a live URL as its first argument and checks the site, media, collages, prompts, schemas, results and mobile navigation under that path.

Browser tests cover viewport widths from 320 to 2560 pixels, reduced motion, playback controls and skill cycling, feedback routing, hover magnification, line-by-line JSON, exact result values and denominators, reference panels, and desktop/phone accessibility.
