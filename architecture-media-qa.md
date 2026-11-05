# Architecture and content review

The website follows overview → complete experiment → visual architecture → additional perception samples → formatted state examples → decision cases → results → prompts → limitations.

Each subject has one home. The architecture holds the only skill clips and their three visible contracts, and the only three evaluation clips with device facts. The separate action gallery, device explorer, repeated reasoning diagrams, model-role disclosure, and footer author/logo/resource blocks were removed. Dataset links appear once per model. The data gallery adds five samples rather than repeating the three examples in the architecture. Each sample shows input, annotations where available, and output together. Three fully expanded state trees, four decision cases, and five prompt templates remain visible without tabs or disclosures.

The architecture uses measured SVG connections, three raw/model/output perception lanes, a JSON preview, a circular Observe → Think → Act agent, the skill row, physical execution, and device evaluation. Skill selection updates the one validated command and its illustrative JSON example without hiding any skill information. JSON and reasoning are explanatory examples, not inference calls or experimental logs.

The JSON panel fits its code instead of stretching to perception's full height. On desktop, the agent sits directly below it in the right-hand column; smaller screens keep the same order in one column. A hidden sizing layer reserves only the complete JSON's text height while typing, preventing layout jumps. ReAct uses three separated circular arcs and fixed-size filled arrowheads, with labels outside the arcs. The extra rotating ring was removed. Geometry checks verify arrow/label clearance at four screen widths and compact state/agent alignment on desktop.

Physical execution now occupies its own full-width stage, followed by the equally wide cross-device stage below. The execution clip scales to 800×600 on desktop and fits the available width on smaller screens. Feedback exits from the execution stage's left edge to avoid overlapping the forward connector to evaluation. Geometry checks verify stage order, matching outer widths, and the enlarged desktop video.

Perception boxes use saved prediction coordinates with non-scaling SVG strokes and display-size labels. The local example uses the supplied naturally exposed 1a8913548a40f204ac42c11f8f1ebcd4 image variant; its predictions were recomputed with the supplied RF-DETR-Small checkpoint. No colour or exposure adjustment is applied. Reproduce that export using scripts/refresh-local-sample.py in the inference environment.

| Architecture excerpt | Source start | Source end | Duration |
| --- | --- | --- | --- |
| Physical execution: Mini PC holder removal | 01:20.0 | 01:32.0 | 12.0 s |
| HDD evaluation: PCB extraction | 00:54.4 | 01:00.6 | 6.2 s |
| Mini PC evaluation: heat-sink extraction | 01:06.6 | 01:13.2 | 6.6 s |
| Laptop evaluation: heat-sink extraction | 02:14.4 | 02:22.2 | 7.8 s |

The HDD and execution excerpts replace footage repeated from the individual skills. Every video source appears once. Source: https://www.youtube.com/watch?v=lEE3qmOJsXo. Exports preserve source demonstration speed and use the reviewed 688:516:0:148 workspace crop, 768×576 H.264, 25 fps, muted, fast-start metadata. Per-second contact sheets were inspected to confirm the crop and visible actions. Reproduce these exports with python3 scripts/prepare-architecture-clips.py /path/to/experiment.mp4.

The global Play/Pause governs all architecture media. Clips pause offscreen and when the document is hidden. Reduced motion starts playback paused and disables decorative transitions. On narrow screens, content stacks without being hidden.

Connector gutters now provide 72px between desktop rows, 64px on tablets, and 48px on phones. Arrow strokes are 2.6px (3.2px active), with explicit 12px arrowheads, clear block-edge margins, and rounded bends. The feedback loop stays visible on phones. Navigation collapses below 950px; prompt headers wrap before their controls can clip.

Validation: production build, eight unit tests, and thirty-five browser tests pass. The responsive matrix covers eighteen portrait/landscape viewports from 320×568 to 2560×1440, including common laptop resolutions and iPad sizes. Checks cover whole-page overflow, clipped card/header content, connector visibility and spacing, perception geometry and stored coordinates, selection/state agreement, playback and pause of all seven unique clips, fully expanded content, unique resource links, keyboard navigation, figure expansion, and accessibility. Desktop, tablet, and phone screenshots were visually inspected.
