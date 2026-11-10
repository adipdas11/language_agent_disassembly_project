# REMAKE — research website (`v1` local review)

**REMAKE: Language-Agent Planning over Structured World States for Adaptive Dual-arm Robotic Disassembly**

This branch combines the first deployment's white-and-blue design with the animated architecture from `v2`. Content, tables, runtime prompts, and JSON examples follow `RAL-mainV11.tex`.

## Review locally

```bash
npm ci
npm run dev -- --port 5180 --strictPort
```

Open **http://localhost:5180/**. This branch has not been deployed.

- `v1`: this review version, based on the first deployment (`0e47c1d`).
- `v2`: preserved UNMAKE redesign (`a942e23`).
- `main`: unchanged deployed version. Its existing workflow publishes on pushes to `main`; no push is needed for local review.

## Presentation

The six architecture headers use distinct blue, teal, violet, green, cyan, and rose accents on white surfaces.

The page follows overview → architecture → perception → world state → results → agent instructions. Sections have short headings and brief explanations, without numbering or information tabs.

The architecture keeps all three perception lanes, skills, and evaluated devices visible. Skills offer two modes: **Play on click** plays the chosen skill once, and **Loop all skills** plays Unscrew → Pick-and-Extract → Flip in sequence and repeats. Only one skill plays at a time; the green border follows it. Selecting a skill switches to manual mode. The animation pauses when offscreen, when the page is hidden, or for reduced-motion preferences; its control can explicitly resume it. Verified execution connects back to the world state.

The execution block contains all three recorded device sequences at **2× recording speed**, using a wider crop without the separate static arm drawings. The evaluation videos contain each complete recorded device segment at the recording's playback speed. These are edited demonstrations, not uncut footage of every target step. Native video controls and timelines are hidden to keep the figure clean; playback follows the diagram animation control. It shows both arms and retains the recording's original tool-camera inset; it is not footage from a new external camera. Crop coordinates and time ranges are recorded in `public/assets/architecture/clips.json` and `public/assets/actions/clips.json`. Opening and summary slides are excluded. The source already contains accelerated passages; the combined video applies a further 2× speed-up. No experiment video appears above the method.

## Paper content

The source manuscript stays outside the repository. To regenerate its active tables, four prompt listings, and three JSON examples:

```bash
python3 scripts/extract-paper-results.py /home/adip/Downloads/RAL-mainV11.tex
```

Generated files:

- `src/content/manuscript-results.json`: all seven V11 result tables.
- `src/content/paper-interfaces.json`: world-state, decision, and action-request examples.
- `public/content/system-prompts.txt`: the four prompt listings, loaded at runtime.

Controller results are the physical-trial summaries reported in V11: 45 original trials and ten additional HDD trials, reported separately. Charts compare autonomous completion and elapsed time on their own scales; labels show mean ± sample SD. Summary statistics are unweighted device averages. Recovery excludes trials without failed invocations. Perception scores use the paper's post-augmentation development split and are not independent unseen-image validation.

JSON values are illustrative interface examples. The world-state example records a failed invocation with an empty removed list, exactly as the paper does. The website does not present it as a successful removal or a recorded trial trace.

Authors and links are configured in `src/content/research-data.ts`. Paper and code links remain disabled until publication. The `showAuthors` switch also controls author metadata and email actions.

## Checks

```bash
npm test
npm run test:e2e
npm run build
npm run preview -- --port 5181 --strictPort
```

Production builds use `/language_agent_disassembly_project/`. To check the local production preview, including all media, prompt loading, image expansion, and the project base path:

```bash
node scripts/verify-pages.mjs
```

Browser checks cover 17 viewport sizes from 320 to 2560 pixels, reduced motion, manual playback, end-driven skill cycling, full-sequence duration and seeking, feedback connector geometry, seven video decodes, keyboard navigation, and desktop/phone accessibility.
