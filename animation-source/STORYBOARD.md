# Thesis workflow · editable source map

Revised 2026-10-04. The web sequence uses original generated hazelnut imagery, editable HTML/SVG overlays, and one lazily loaded GSAP clock. No video decoding, frame cache, WebGL or model runs on the visitor's device. Duration is 19.2 seconds, extended to explain the additional technical stages requested in the revision.

Sources: `src/components/ThesisScene.astro`, `src/styles/thesis.css`, `src/scripts/thesis.ts`, `src/data/portfolio.ts` (`thesisBeats`, `thesisDuration`). Original image and exact generation prompt: `animation-source/assets/`. All image paths honor the Pages base.

| Scene | Visual story | Website copy | Evidence |
| --- | --- | --- | --- |
| 0–2.4 s | Acquisition sweep across a natural-textured hazelnut orchard; select one crown | Spectral inputs | Defense slides 8, 13; separate RGB reference + B/G/R/RE/NIR |
| 2.4–4.8 s | Push into the same crown; an offset monochrome view settles to shared coordinates | Align the bands | Slide 14; optical-center metadata + translation-only ECC, NIR reference |
| 4.8–7.2 s | Reveal a schematic, imperfect vegetation region; square-crop outline and exact NDVI equation | Region & mask | Slides 13, 15–17; normalization, NDVI threshold/morphology, central region and square-crop alternatives |
| 7.2–9.6 s | Divide the crown into nine tiles and spread them apart | Extract image patches | Slides 9, 13; 3 × 3 grid and 224 × 224 resized patches |
| 9.6–12 s | Carry the patches into five assembled feature planes | Feature channels | Slides 6, 13, 22; per-patch GNDVI, GCI, NDREI, NRI, GI; input representations vary by experiment |
| 12–14.4 s | Separate training groups, validation selection and the trained-model artifact | Train & select offline | Report ch. 5 and training code; field + plant group key; training-only statistics |
| 14.4–16.8 s | Isolate one patch; a signal moves through the frozen model to a patch prediction | Classify prepared patches | Slides 19–22; inference uses previously fitted weights |
| 16.8–19.2 s | Separate train/validation/test groups; compare test predictions with reference labels | Held-out evaluation | Report ch. 5, slides 24–29; evaluation remains a distinct process |

The NDVI region is a hand-authored schematic overlay, not the output of segmentation. Monochrome and color overlays illustrate stages, not actual spectral values. No invented prediction, confidence score, chart or result mask appears. Original thesis samples remain private. The image caption and persistent disclaimer identify synthetic imagery and schematic processing. Manual-crop diagnostics remain explained in the case-study narrative.

Motion guidance inspected read-only in Motion-reel-designer: `skills/motion-reel/SKILL.md`, `references/RULES.md`, `references/CRITIQUE.md`, `skills/motion-review/SKILL.md`, `skills/motion-brand/SKILL.md`. Applied purposeful camera continuity, meaningful events every 2.4 seconds, non-bouncy critically damped settling, time-based seeking and phone-size frame review. The standalone film/audio/render workflow does not apply to this silent interactive website.

All layers paint from absolute time; a GSAP linear clock drives the closed-form critically damped settling function. No CSS transitions govern scene state. The local `thesis:seek` event uses the same painter for capture. Stage selectors pause on a settled frame. Playback runs once on visibility and pauses offscreen or on document hiding. Reduced motion never imports GSAP; buttons switch still stages. No-JavaScript users receive the poster and complete eight-step list. Phones get a larger image with diagrams below it; desktop preserves a side-by-side composition.
