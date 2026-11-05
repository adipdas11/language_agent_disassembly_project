# Research website redesign

## Design brief

Create a professional, light research project site whose content follows the system's scientific story. Preserve the supplied identities, author configuration, actual vision examples and detections, looping action clips, experimental values, prompt library, and interactive state examples.

The design review used fresh captures of the running site. The strongest issues were competing oversized headings, changing pastel section colours, a weak reading sequence, duplicated supporting content, and architecture animation positioned over a raster figure. These findings informed the implementation.

## Reading sequence

1. **Project introduction — resolved.** Equal visual emphasis for the institutional identities, a measured title hierarchy, author contacts, a shared affiliation, and consistent resource controls. The starting image remains omitted.
2. **Overview and experiment — resolved.** A readable abstract explains the problem and five-stage loop; the embedded full experiment follows immediately.
3. **Architecture — rebuilt.** A native interactive pipeline presents three parallel raw-image → model → annotated-output lanes feeding a JSON state. That state feeds a circular three-node Observe/Think/Act ReAct loop, which selects one validated skill before execution and cross-device evaluation. Real perception examples and videos accompany animated example JSON and reasoning. The layout wraps into connected tablet and phone flows, with connector endpoints measured from actual panel geometry. The original research figure remains available in a keyboard-dismissable modal. See `architecture-media-qa.md` for media and playback validation.
4. **Perception, state, planning, and action — reorganised.** Camera examples, annotation masks, predictions, verification outcomes, formatted state, scenario playback, and skill contracts now appear together in the order they contribute to the system. Supporting research figures use expandable disclosures. The three actual action clips remain visible together.
5. **Evaluation and resources — resolved.** Device-specific context precedes the completion and resilience results. Charts use the same blue and slate palette and retain their accessible tables. Prompts, scope, and a light footer complete the page. The earlier removed comparison and repeated figure are not reintroduced.

## Visual system

- White and soft grey surfaces; navy text; cobalt blue for emphasis and selected controls.
- A single system sans-serif stack and a consistent type hierarchy.
- A centred 1180px content grid, a compact navigation bar, restrained borders, and small corner radii.
- Numbered narrative sections with common heading, introduction, content, and supporting-detail placement.
- No decorative bubbles, multi-colour gradients, serif display headings, or repeated detection lists.

## Verification

- Production build and eight existing component tests.
- Browser checks for core story order, galleries, all nine diagram blocks using the keyboard, figure modal, mobile navigation, prompt loading, expanded state, clip decoding, looping, pause, and reduced motion.
- Responsive browser checks at 360, 768, 1280, and 1600px; additional visual captures at 390 and 1440px.
- Zero horizontal document overflow at the inspected widths.
- Automated axe audit excluding the existing chart rendering wrappers and third-party video iframe. These checks do not establish full accessibility compliance or verify third-party YouTube behaviour.

## Review artifacts

Fresh before and after captures are stored in `/tmp/disassembly-redesign-before/`, `/tmp/disassembly-redesign-refined/`, and `/tmp/disassembly-redesign-completed/`. Recreate captures with `node scripts/redesign-review.mjs completed` while the local app is running on port 5180.

The work remains local. No deployment was performed.
