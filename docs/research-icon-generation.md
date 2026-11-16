# UNMAKE research artwork

Design update: the generated illustrations below are retained as an exploration. Following review, the website now renders simpler purpose-specific SVG symbols from `src/components/ResearchIcons.tsx`; colour comes primarily from the diagram headings.

Generated with the built-in `image_gen.imagegen` tool for the `devel_v3` localhost redesign. The six assets are decorative illustrations, separate from research photographs, dataset masks and experimental evidence. Original generated PNGs are retained in the tool's generated-images directory; optimised 512 × 512 RGBA WebP copies are in the project.

## Saved website assets

- `public/assets/research-icons/perception.webp`
- `public/assets/research-icons/state.webp`
- `public/assets/research-icons/context.webp`
- `public/assets/research-icons/agent.webp`
- `public/assets/research-icons/skills.webp`
- `public/assets/research-icons/execution.webp`

Transparent backgrounds are preserved. The complete set is approximately 378 KiB. `src/components/ResearchIcons.tsx` provides the illustrations and custom vector hardware/control symbols, replacing the generic icon-library imports throughout the website.

## Prompt set

Each generation used `transparent_background: true`, with the following shared prompt followed by its subject prompt.

### Shared prompt

Use case: stylized-concept. Asset type: a premium scientific website stage icon, single isolated object on genuinely transparent background, square composition. A sophisticated miniature industrial product render, crisp isometric 3/4 view, satin white ceramic and dark midnight navy metal, restrained brushed aluminium, vivid cobalt blue, aqua teal and electric lime detail accents. Clean studio light, soft precise ambient shadows within the object, realistic engineered components with elegant softened edges. Professional robotics research identity, beautifully crafted rather than cartoon, legible at 80px. One centred tightly composed object occupying 85% of frame, generous transparent edge, no square backing tile, no background, no environment, no floating particles, no text, no labels, no letters, no watermark.

### Perception

A compact industrial RGB depth camera with two optical apertures and a vivid cobalt lens, on a short precision mount, projecting a small translucent aqua rectangular detection frame enclosing a tiny silver screw in front of it. Recognisable real machine vision hardware, not a consumer photo camera or a generic outline camera.

### World state

An elegant miniature structured semantic world-state assembly: four translucent aqua and cobalt horizontal glass circuit plates precisely aligned in a vertical stack, tiny connected component nodes embedded into the plates, three short lime interconnect pins, a small solid navy central spine. Resembles structured observations being fused into one clean data packet. Not a database cylinder, not a generic document icon.

### Prompt context

A carefully engineered miniature prompt context assembly: two white and translucent violet instruction panels standing in a neat slightly offset stack, abstract horizontal embossed lines without readable text, and a tiny aqua state-data cartridge visibly slotting into the lower panel with cobalt connector pins. Sophisticated tangible modular information design, not a generic clipboard.

### Agent

A beautiful compact robotics planning compute module: a precise layered violet and midnight navy processor with a luminous aqua central crystalline core and three branching circuit routes ending in cobalt, teal and lime terminals. A restrained orbital segmented ring around the processor suggests observe think act. Not a brain icon, not a sparkle, no face, no robot mascot.

### Skills

A miniature reusable robotic tool kit: a precision stainless steel screwdriver bit with cobalt collar, a small open white robotic parallel-jaw gripper with aqua pads, and a tiny dark device plate tilted for reorientation, composed as one balanced engineered assemblage with lime fastener details. Recognisably unscrew, extract and flip; no crossed generic spanners.

### Execution

A precise small scale dual-arm robotic disassembly cell: two elegant white articulated industrial robot arms with navy joint collars facing inward over a navy rectangular work fixture with a small green circuit board; one arm has a parallel jaw gripper, the other has a slender screwdriver tool. Aqua joints and a few lime locator details, no people or surrounding room. Clearly show both complete arms.
