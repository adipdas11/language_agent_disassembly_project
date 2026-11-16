# devel_v3 — local review

Source: `/home/adip/Downloads/RAL_2026.pdf` (13 November 2026), particularly Figures 3–5 and Section III. Start point: local `main`. Do not publish or merge.

## Content and interaction plan

1. Preserve the blue/white identity, existing architecture and verified results. Align the displayed project name with the latest paper: UNMAKE.
2. Replace the single raw/labelled comparisons with two-row, 10-image mixed collages per model (the root paper collages retain 20 samples). Segmentation samples retain their supplied masks; classifier samples remain camera images. Magnify individual tiles slightly on pointer hover or keyboard focus, with no click viewer. Preserve the root paper figures and export separately optimised website assets.
3. Present the perception-to-planning interface as six connected stages: perception, structured world state, prompt context, ReAct selection, action formatting/validation, and physical execution/verification. Animate supplied detection boxes, field assembly, context insertion, brief decision responses, and the returning verification packet. Do not animate or fabricate a private reasoning trace.
4. Use the four runtime fields and the decision/action response schemas specified in Section III. Static system instructions and skill definitions accompany the dynamic state. The planner selects a skill; low-level execution remains programmed. Distinguish the schematic example from measured data and footage.
5. Use the unsuccessful unscrew example already present in the paper's reference interface. The illustrative outcome remains failure, `removed` remains empty, and a new decision uses the verified state. Contact alignment alone does not establish removal.
6. Keep the full JSON and prompt templates available in collapsed reference panels rather than filling the default page with prose.
7. Automatically play the guided sequence only when visible, with pause/resume, replay, stage selection, and previous/next controls. Pause on leaving the viewport or hiding the tab. Reduced-motion mode shows complete, static stage content and uses manual progression.

## Validation

- Build TypeScript and production assets; run existing unit tests and update checks whose intended UI changed.
- Browser-check every stage, transitions, hover-only magnification, template expansion/copy, pause/replay and reduced motion.
- Verify desktop and mobile layouts, no horizontal page overflow, accessible controls and readable code.
- Serve on localhost for review. No commits, pushes, merges or deployment are required.

## Results presentation update

Default views now use zero-based, explicitly labelled comparisons for failure counts, recovery ratios, replanning, original/additional HDD outcomes, skill success and duration, and class-wise perception metrics. Full source tables and metric definitions remain in expandable references. Values are read directly from the existing paper-data file; no new evaluation values are generated. Skill success preserves S₀/N₀, and recovery calls remain separate from internal corrections. Duration whiskers show mean ± sample SD; other bar lengths show means with the reported variation retained in their labels.
