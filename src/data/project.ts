export const asset = (path: string) => /^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL === "/" ? "./" : import.meta.env.BASE_URL}${path}`;

export const project = {
  name: 'ROOM',
  title: 'ROOM: A Human–Humanoid Interaction Manipulation Dataset for Nonverbal Behavior Grounding',
  expansion: 'Referential and Ongoing-interaction Observations for Manipulation',
  authors: 'Anonymous Authors',
  status: 'Research manuscript',
  links: { paper: null as string | null, code: null as string | null, dataset: null as string | null, arxiv: null as string | null },
  stats: [
    { value: '2.5k', label: 'Demonstrations', source: '§III-A' },
    { value: '40', label: 'Interaction tasks', source: '§III-A' },
    { value: '30', unit: 'Hz', label: 'Synchronized streams', source: '§III-D' },
  ],
  media: { hero: 'hero', heroPoster: 'assets/hero-scene.webp' },
  citation: '@misc{room,\n  title = {ROOM: A Human–Humanoid Interaction\n           Manipulation Dataset for Nonverbal\n           Behavior Grounding},\n  author = {{Anonymous Authors}},\n  note = {Research manuscript; publication details pending}\n}',
};

export const signals = [
  { id: 'gaze', label: 'Gaze', title: 'Attention becomes a referent.', description: 'Timestamped gaze from Project Aria connects what the person looks at with the objects in the interaction.', image: 'gaze', annotation: 'GAZE + HAND LANDMARKS', detail: 'Human egocentric observation · Fig. 1', source: '§III-D / §IV-B' },
  { id: 'gesture', label: 'Gesture', title: 'A pointing hand changes the target.', description: 'Hand landmarks and pointing direction make the intended object explicit. Corrective gestures can redirect an ongoing action.', image: 'gesture', annotation: 'HAND BEHAVIOR', detail: 'Robot-view interaction crop · Fig. 2', source: '§III-B / §IV-B' },
  { id: 'body', label: 'Body pose', title: 'Posture tells the robot when.', description: 'Full-body motion captures readiness and activity. In Seating Assistance, the onset of sitting signals when to push the chair in.', image: 'body', annotation: 'FULL-BODY KEYPOINTS', detail: 'Body-pose overlay from the paper · Fig. 1', source: '§III-D / §V-C' },
  { id: 'ego', label: 'Ego view', title: 'The interaction, from the human side.', description: 'The participant’s egocentric video provides a first-person view of the shared workspace, alongside gaze and hand motion.', image: 'gaze', annotation: 'PROJECT ARIA', detail: 'Human egocentric observation · Fig. 1', source: '§III-C' },
  { id: 'robot', label: 'Robot view', title: 'See the task. See the person.', description: 'Head-mounted RGB observes the manipulation workspace; chest-mounted RGB captures the human partner’s gestures and posture.', image: 'chest-view', annotation: 'CHEST RGB', detail: 'Onboard camera crop · Fig. 2', source: '§III-C' },
];

export const taskGroups = [
  { id: 'referent', family: 'Referential grounding', function: 'Referent identification', question: 'Which one?', name: 'Table Organization', cue: 'Point toward an object', response: 'Select the intended target', description: 'The same instruction can refer to different objects. Gaze and pointing resolve what the person means, even among similar-looking distractors.', image: 'tabletop', video: 'table-organization', sequence: ['Human indicates', 'Robot identifies', 'Object is organized'], source: '§III-B / §V-A' },
  { id: 'anticipation', family: 'Interaction-state grounding', function: 'Anticipatory assistance', question: 'What comes next?', name: 'Seating Assistance', cue: 'Beckon, then begin to sit', response: 'Pull out, wait, then push in', description: 'The robot must interpret the person’s activity and posture to offer the appropriate help. Pulling out a chair is only part of the interaction.', image: 'seating', video: 'seating-assistance', sequence: ['Wave → pull out', 'Stand → wait', 'Sit → push in'], source: '§III-B / §V-C' },
  { id: 'coordination', family: 'Interaction-state grounding', function: 'Action coordination', question: 'Ready now?', name: 'Collaborative Cart Delivery', cue: 'Partner progress and readiness', response: 'Act, wait, or resume together', description: 'Whole-body collaboration requires the robot to coordinate its actions with the person’s progress and readiness as the interaction unfolds.', image: 'cart', video: 'collaborative-cart-delivery', sequence: ['Observe partner', 'Coordinate timing', 'Move together'], source: '§III-B / §V-A' },
  { id: 'feedback', family: 'Interaction-state grounding', function: 'Feedback & steering', question: 'Change the plan?', name: 'Action Correction', cue: 'Point, then give a corrective gesture', response: 'Switch from placement to handover', description: 'Understanding a target is not enough. When the person changes the signal, the robot must revise an action already in progress.', image: 'handover', video: 'action-correction', sequence: ['Point → pick', 'Wave → revise', 'Handover'], source: '§III-B / §V-C' },
];

export const hardware = [
  { id: 'aria', name: 'Project Aria', owner: 'HUMAN', outputs: ['Egocentric video', 'Gaze direction', '21-point hand landmarks'], description: 'Wearable observations are processed with Machine Perception Services to recover timestamped gaze and hand motion.', source: '§III-C–D' },
  { id: 'mocap', name: 'Markerless motion capture', owner: 'WORKSPACE', outputs: ['Full-body joint trajectories', 'Participant, operator & robot positions'], description: 'Multiple external cameras capture full-body motion and recover joints that are occluded from onboard robot views.', source: '§III-C–D' },
  { id: 'g1', name: 'Unitree G1', owner: 'HUMANOID', outputs: ['Head & chest RGB', 'Robot state', 'Action trajectories'], description: 'Inspire dexterous hands and two Intel RealSense D455 cameras support tabletop and whole-body interaction.', source: '§III-C / Fig. 3' },
  { id: 'operator', name: 'Teleoperation', owner: 'OPERATOR', outputs: ['Whole-body control', 'Retargeted arm & hand motion'], description: 'SONIC with PICO VR supports loco-manipulation. Meta Quest 3 hand tracking and inverse kinematics capture finer tabletop motions.', source: '§III-C' },
];

export const representations = [
  { id: 'visual', name: 'Visual prompting', label: 'Prompted image tokens', input: 'RGB + hand / body overlays', encoding: 'Existing visual encoder', integration: 'VLM visual input', conclusion: 'Make the spatial signal explicit.', description: 'Overlay hand landmarks, body keypoints and pointing directions on the scene. The pretrained visual pathway processes the augmented images without architectural changes.', finding: 'In Action Correction, referential failures fall from 10/25 to 4/25. Interaction-state failures rise from 4/25 to 7/25: a sharper target cue does not solve every interaction.', source: '§IV-B–C / §V-D' },
  { id: 'semantic', name: 'Semantic prompting', label: 'Semantic language tokens', input: 'Robot-view skeletons', encoding: 'Behavior classifier → text', integration: 'VLM language input', conclusion: 'Give behavior a meaning.', description: 'A lightweight classifier translates recognized gestures and posture into descriptions, updating the task instruction as human behavior changes. At inference, it uses onboard camera observations.', finding: 'The strongest representation variant in both evaluated tasks: 15/25 successes in Action Correction and 17/25 in Seating Assistance.', source: '§IV-B–C / §V-D' },
  { id: 'tokens', name: 'Behavior tokens', label: 'Spatiotemporal behavior tokens', input: 'Hand & body keypoint sequences', encoding: 'Two-layer MLP', integration: 'VLM context or action expert', conclusion: 'Where a signal enters matters.', description: 'Encode recent keypoint sequences, sampled at four-frame intervals. Compare insertion at the VLM input, VLM output, or a separate cross-attention branch in the action expert.', finding: 'VLM input/output integration brings little benefit; action-expert integration brings modest gains, but remains less effective than prompting in these experiments.', source: '§IV-B–C / §V-D' },
];

// All percentages below are transcribed from the labeled bars of Fig. 4, p. 5.
// The π0.5 cart value 22.9 is preserved, not rounded to a guessed /25 count.
export const models = ['OpenVLA-OFT', 'π0.5', 'GR00T N1.7'] as const;
export const benchmark = {
  averageGain: 32.6, source: '§V-B / Fig. 4', rollouts: 25,
  conditions: [
    { task: 'Table Organization', condition: 'Clutter', values: [[8,44],[20,64],[28,72]] },
    { task: 'Table Organization', condition: 'Distractors', values: [[4,24],[12,52],[16,68]] },
    { task: 'Table Organization', condition: 'Unseen objects', values: [[8,36],[16,56],[24,64]] },
    { task: 'Action Correction', condition: 'Clutter', values: [[16,40],[28,64],[24,64]] },
    { task: 'Action Correction', condition: 'Distractors', values: [[8,24],[16,52],[20,76]] },
    { task: 'Action Correction', condition: 'Unseen objects', values: [[12,32],[24,64],[28,68]] },
    { task: 'Seating Assistance', condition: 'Whole-body', values: [[8,24],[16,36],[24,60]] },
    { task: 'Collaborative Cart Delivery', condition: 'Whole-body', values: [[4,24],[12,22.9],[16,44]] },
  ],
};

export const failureTypes = [
  { name: 'Referential', title: 'The wrong target.', description: 'The robot selects an object or location the person did not intend.', css: 'referential' },
  { name: 'Interaction-state', title: 'The wrong moment.', description: 'The robot chooses the wrong response, acts too early, or misses the cue to change.', css: 'state' },
  { name: 'Physical execution', title: 'The right idea. A failed action.', description: 'The decision is correct, but grasping, transport, placement or handover fails.', css: 'execution' },
];
export const failureResults = [
  { name: 'Action Correction', total: 75, tg: { success: 20, ref: 14, state: 24, exec: 17 }, room: { success: 52, ref: 5, state: 10, exec: 8 } },
  { name: 'Seating Assistance', total: 75, tg: { success: 17, ref: 0, state: 43, exec: 15 }, room: { success: 44, ref: 0, state: 23, exec: 8 } },
];
export const study = {
  participants: 12, trials: 50, source: 'Table II / §V-E',
  tasks: [
    { name: 'Table Organization', decision: [64,72], success: [52,64], decisionCounts: [32,36], successCounts: [26,32] },
    { name: 'Seating Assistance', decision: [56,80], success: [48,72], decisionCounts: [28,40], successCounts: [24,36] },
  ],
  tlx: [46.7,25.0], tlxSd: [13.3,6.7],
};

export const draftNotes = [
  'Dataset participant count: Abstract and §III-A say 12; Introduction and Fig. 1 say 15. Not used as a headline statistic.',
  'Fig. 2 is explicitly marked Draft Version. Category A–D percentages lack task definitions and are omitted; only the real collection photographs are used.',
  'Fig. 3 row C is labeled Spatiotemporal Behavior Tokens, but §IV-B calls this Semantic Language Tokens. The site follows the prose.',
  'Fig. 4 labels use OpenVLA and GR00T shorthand. Model names follow §V-A: OpenVLA-OFT and GR00T N1.7.',
  'Fig. 4 π0.5 ROOM+TG Collaborative Cart Delivery is 22.9%, inconsistent with 25-rollout increments. Preserved with a visible footnote; denominator needs confirmation.',
  'Fig. 5 aggregates 75 trials per task and training setting; §V-C describes GR00T N1.7. These are kept separate from Fig. 4 (25 rollouts per condition) and Fig. 6 (25 per variant).',
  'Fig. 6 repeats State Fail for the last Seating Assistance group; the site does not reinterpret that ambiguous label.',
  'Table II cells are fractions although its note calls them rates (%). The site uses percentages confirmed in §V-E and shows the corresponding /50 counts.',
  'Table II reports identical TLX values for both tasks; preserved as reported, subject to author confirmation.',
  'Table III gaze/gesture ablation cells are all dashes. No numerical ablation result or complementary-modality claim is presented.',
  'Authors are anonymous; no verified arXiv, code, dataset URL, venue acceptance, publication year or canonical BibTeX is supplied.',
];
