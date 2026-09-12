# ROOM — design and research notes

## Version 3 — current design

Visual reference: https://behavior-robot-suite.github.io/. V3 adopts the reference’s reading rhythm: a large experiment-led opening, centered academic project information, an image-led interaction gallery, and clearly separated research questions. No reference-site source code, template, imagery, results, institutional marks or author identities were copied.

ROOM has its own composition: one framed panoramic experiment image with an editorial research question, a three-signal strip, a large ROOM wordmark, deep-teal and sage colors, serif display typography, and a split task viewer that connects human cues to robot responses. The reference’s video mosaic, maroon palette and exact layout are not reproduced. Available manuscript frames are shown honestly as images; no fabricated demo videos or decorative playback controls are added.

The entire page has a new responsive style sheet, including the existing dataset explorer, representation selector, benchmark charts, failure analysis and human study. All numerical data and source caveats remain unchanged. V2 is preserved as Git tag `v2` and an offline protected Worker archive. Only V3 is deployed, with the existing server-side password, asset checks and PDF/archive exclusion. The password gate uses the new palette.

V3 validation: production build and eight access-control tests pass. Browser review covers the 1470 px desktop layout, 390 px mobile layout and 768 px tablet width; task selection, gallery arrows, model changes, human-signal selection and mobile navigation work. Page width stays within the viewport; original scientific data are unchanged. Secondary study labels and baseline values were darkened after visual review.

## Version 2 — preserved design

Version 1 is retained as the Git tag `v1` and an independent static snapshot under `archive/versions/v1/`. Research claims, all numerical results, source images and the original caveats remain unchanged.

The new visual thesis is a robotics research instrument under cool studio light: silver and ice-blue surfaces, ink-blue typography, a restrained cobalt accent, and deep-blue technical sections. The hero now combines the research question with a small, explicitly conceptual diagram of gaze / gesture / body behavior feeding ROOM and informing robot action. A faint coordinate grid gives the hero and method section spatial structure. It is a visual explanation, not a simulated recording or a measured trajectory.

Dataset and benchmark sections use brighter surfaces to separate quantitative evidence from technical explanation. Collection photography sits on a cool gray background. The method and failure analysis sections use layered navy surfaces rather than pure black. The human study uses a richer blue field with clearly differentiated verbal and nonverbal values. Framed images, subtle inner highlights, small corner radii and consistent blue focus/selection states connect the page. Supporting text has a 12px minimum; ordinary body text keeps its larger sizes.

The new design uses only existing assets and CSS/HTML geometry. It adds no image-generation, animation or UI package dependencies, and preserves the existing reduced-motion behavior. Source styles are formatted for subsequent editing.

## Core narrative

The research question is “Can humanoids read the room?” The distinction is between executing a manipulation trajectory and interpreting the human behavior that makes a particular target, response, or action time appropriate. ROOM records both sides of the interaction: human gaze, gestures, body motion and egocentric video, aligned with humanoid observations and actions.

The most communicable story is: a human points → the robot identifies **what**; a human begins to sit → the robot determines **when**; a corrective gesture arrives → the robot changes **how** it responds. The policy must use changing nonverbal cues under the same goal-level instruction. This narrative deliberately differs from the manuscript's section order.

Five supported headlines:

1. Can humanoids read the room?
2. Human signals. Robot responses.
3. 40 ways to read the room.
4. Not every robot failure is a control failure.
5. Less talking. More understanding.

ROOM's distinguishing contribution is systematic nonverbal grounding in paired human–humanoid manipulation data, spanning referential and interaction-state requirements, tabletop manipulation and loco-manipulation. This is broader than measuring whether a robot is physically capable of completing a motion. Avoid calling it the first or largest dataset without a defensible comparative claim.

## Visual direction — version 1

A dark editorial research journal: charcoal (#080a09), warm white, restrained orange drawn from the ROOM title in Fig. 1. Desaturated green functions as a neutral supporting tone, including the light human-study section. DM Sans supplies large, tightly spaced but non-overlapping headings; IBM Plex Mono marks provenance, signal identities and experimental metadata. No illustration, invented robot scene, decorative particle system, or color inversion is used.

The hero uses a clean crop of the real Fig. 1 experiment panorama, with a light readability overlay and large question-led typography. It omits Fig. 1's title panel and disputed participant count. The visual rhythm alternates spacious typography, research photography, a timeline, compact technical diagrams, paired bars, and one light human-centered section. The page favors open rows and divided editorial layouts over repeated cards.

## Information architecture and each section's purpose

| Section | Purpose | Evidence |
| --- | --- | --- |
| Hero | Establish the question, human–humanoid setting, real scenes, and paper access immediately. | Title, §I, Fig. 1 |
| Why ROOM | Explain why instructions alone do not fully specify the intended action. Sticky WHAT / WHEN / HOW narrative on larger screens. | §I, §III-B |
| Dataset / signals | Establish scale, browse gaze/gesture/body/ego/robot views, and visualize synchronization. Timeline is explicitly schematic. | §III-A, C–D; Fig. 1–2 |
| Interaction tasks | Explore two requirements and four functions through the four evaluation groups. Does not fabricate a list of all 40 tasks. | §III-B, §V-A/C |
| Data collection | Let readers focus hardware and see its recorded outputs. Separate rich training supervision from onboard inference. | §III-C–D, §IV-B; Fig. 2 |
| Nonverbal → action | Translate ordinary human behavior into intuitive intent, then show three representation/integration paths. | §IV, §V-D; Fig. 3 |
| Benchmark | Compare TG and ROOM+TG in an accessible, responsive paired-bar chart for all three policies and eight conditions. | §V-A/B; Fig. 4 |
| Failure analysis | Distinguish incorrect target/response/timing from failed physical execution; compare exact first-failure counts. | §V-C; Fig. 5 |
| Human study | Show human coordination cost, decision accuracy, task success, and adapted NASA-TLX. | §V-E; Table II |
| Takeaways / ablation | Explain research implications without claiming unreported gaze benefits. | §VI; §V-F; Table III |
| Resources / citation | Provide the actual manuscript, truthful release states and an anonymous provisional citation with copy. | PDF title and author line |

## Design references reviewed online

These are structural influences, not copied templates or sources of ROOM's scientific numbers. No external project images or videos are used.

- [Physical Intelligence — π0.5](https://www.pi.website/blog/pi05): question-led framing, demonstration evidence before deeper technical explanation, heterogeneous inputs expressed as a readable research narrative.
- [Physical Intelligence](https://www.pi.website/): restrained identity and research-led typographic hierarchy.
- [OpenVLA](https://openvla.github.io/): immediate paper/code/model access, clear model overview, named rollout examples, task-specific comparisons and an accessible BibTeX endpoint.
- [DROID](https://droid-dataset.github.io/): dataset identity, strong scale framing, collection context and research assets as the page's core evidence.
- [Google DeepMind — RT-2](https://deepmind.google/blog/rt-2-new-model-translates-vision-and-language-into-action/): explain the capability in plain language before introducing the model mechanism.

ROOM extends those patterns with interactive grounding functions, synchronized multimodal channels, model-selectable quantitative comparisons, and a distinct error taxonomy.

## Figures and asset decisions

- **Fig. 1**: strongest human–humanoid imagery; main panorama becomes the hero, with separate body, gaze, handover, cart and tabletop crops. The teaser is a composition of experiments, not evidence that all depicted actions occurred simultaneously.
- **Fig. 2**: extract the left collection photograph and inset camera views. Omit the undefined Category A–D pie distribution. Smaller task crops are illustrative manuscript scenes; the timeline and cue sequence are explanatory schematics, not measured playback.
- **Fig. 3**: re-express the main architecture in responsive HTML; retain the original in an expandable white figure surface with a caption noting the draft labeling issue.
- **Fig. 4**: accurately transcribe all labeled values, retain them in `project.ts`, and redraw them as paired horizontal bars. The average gain is explicitly the prose's reported +32.6 percentage points, not a newly claimed result.
- **Fig. 5**: sum the explicitly labeled first-failure leaves into referential / state / execution categories. Totals equal 75 per task and setting. Preserve the success numerators 20/52 and 17/44; do not combine them with Fig. 4's per-condition denominator.
- **Fig. 6**: rely on unambiguous prose when summarizing representation results. Do not silently correct the duplicate final failure label.

## Video replacement plan

The initial directory contained only a PDF. No random robot footage, synthetic experiment videos, fake play buttons, or claims of live capture are introduced.

Use `public/videos/hero.mp4` for a short montage or continuous interaction showing both the human cue and robot response. Add the four named task clips documented in README. In particular, Action Correction should show pointing followed by a corrective gesture and handover; Seating Assistance should show wave → pull out, stand → wait, sit onset → push in. Video playback is muted, looping, inline, viewport-aware and reduced-motion-aware. The existing paper images remain stable posters/fallbacks.

## Draft inconsistencies requiring author confirmation

1. **Dataset participants: 12 vs 15.** Abstract and §III-A state 12; Introduction and Fig. 1 state 15. Dataset participant count is omitted from headline statistics. The user-study count is separately and consistently 12 in §V-E.
2. **Collection distribution.** Fig. 2 is labeled “Draft Version”; Category A/B/C/D percentages 40/30/20/10 have no established taxonomy mapping in the prose. No category shares are displayed.
3. **Architecture row C.** Fig. 3 repeats “Spatiotemporal Behavior Tokens” for the semantic branch. Follow §IV-B's “Semantic Language Tokens” in the new diagram and disclose the original figure discrepancy.
4. **Model names.** Fig. 4 uses OpenVLA / GR00T shorthand; §V-A specifically names OpenVLA-OFT / GR00T N1.7. Use the prose names without changing claimed model versions based on outside knowledge.
5. **22.9% Cart Delivery entry.** Fig. 4 reports π0.5 ROOM+TG = 22.9%, which does not correspond to an integer success count out of 25. Preserve the reported value and flag it with †. Do not guess 20%, 24%, or another denominator. The reported +32.6 pp average is consistent with the chart to rounding.
6. **Distinct experiment denominators.** Fig. 4 uses 25 rollouts per condition; Fig. 5 reports 75 trials in the stage analysis; Fig. 6 uses 25 per variant. Keep each visualization separate and labeled.
7. **Fig. 6 duplicate State Fail label.** The final Seating Assistance cluster repeats State Fail instead of clearly naming execution failure. No reinterpretation is displayed.
8. **Table II fractions vs percentage note.** Cells give /50 counts, while the caption note calls them rates. Percentages displayed on the site are verified against §V-E: table organization decision 64→72%, success 52→64%; seating decision 56→80%, success 48→72%.
9. **Repeated NASA-TLX summaries.** Both tasks report verbal 46.7±13.3 and nonverbal 25.0±6.7. Retained exactly with a visible note. Do not claim different task-specific workload measurements, statistical significance, or p-values.
10. **Gaze/gesture ablation is unfilled.** Table III contains only dashes. Present the study design, explicitly state that results are not reported, and make no quantitative or synergy claim. Gaze exists in the dataset but the main benchmark and user study center on gesture/posture.
11. **Publication metadata is absent.** Authors are anonymous. No arXiv/code/dataset URL or official BibTeX was found. PDF metadata creation time and filename are not evidence of an accepted conference or publication year. Citation is a clearly provisional `@misc`, with no fabricated year or venue.

All uncertain content is editable in `src/data/project.ts`. No scientific conclusions are inferred from decorative schematics.

## Accessibility and implementation

Vite + React + TypeScript was chosen because there was no existing website and the deliverable is static. There are no animation, charting or UI framework dependencies. Production builds prerender the full page to static HTML and hydrate it in the browser. Charts are HTML with readable numeric values; a native table retains the complete benchmark. Controls are real buttons with pressed states, visible keyboard focus, touch sizing, and live descriptions. The mobile nav supports Escape and closes on navigation. Reduced-motion preferences disable transitions/reveals and autoplay. Fonts are self-hosted WOFF2 with swap and OFL notices. Images use explicit sizing or stable media containers, modern WebP and lazy loading; the hero is prioritized.

A server-password-protected Sites preview is used for review. Public paper/code/dataset release is controlled by the author; the site does not announce acceptance or invent release destinations.


## Password-protected V2 preview

Only the current silver-blue design is shared, behind a server-validated password. The entry screen follows its silver/blue palette and contains only a password form. V2 retains its research narrative and numerical data. Paper download actions are removed; the manuscript and the immutable V1 snapshot have moved to the offline archive. The deployment has no public static asset directory: all bundled page, image, CSS and JavaScript requests pass through the same password/session check.
