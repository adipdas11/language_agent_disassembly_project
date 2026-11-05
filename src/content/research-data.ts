export type EvidenceSource = 'paper' | 'devel_v1' | 'illustrative'

export interface AuthorConfig {
  name: string
  affiliation: string
  email: { local: string; domain: string }
}

export interface SiteContent {
  title: string
  shortTitle: string
  showAuthors: boolean
  authors: AuthorConfig[]
}

export interface Metric {
  id: string
  value: string
  label: string
  definition: string
  caveat: string
  source: EvidenceSource
}

export interface DeviceRecord {
  id: 'hdd' | 'mini-pc' | 'laptop'
  label: string
  targetSteps: number
  configuredActions: number
  screwTypes: string
  extractedParts: string[]
  reorientation: string
  paperSummary: string
  implementationSequence: string[]
  imagePosition: string
}

export interface PaperWorldState {
  device_id: string
  components: Array<{
    id: string
    type: string
    status: string
    pose: { xyz_mm: number[]; rpy_deg: number[] }
    confidence: number
  }>
  fasteners: Array<{
    id: string
    type: string
    status: string
    confidence: number
  }>
  status: string
  timestamp: string
  history: Array<{ action: string; outcome: string; at: string }>
}

export interface RuntimeAgentState {
  global_view: {
    device: string
    detections: Array<{ label: string; confidence: number; bbox: number[] }>
  }
  local_view: {
    target: string
    tool_center_px: number[]
    target_center_px: number[]
    alignment: string
  }
  assembly_state: {
    held_by: string
    removed: string[]
    last_action: string
    last_outcome: string
  }
  force_torque: { frame: string; force_n: number[]; torque_nm: number[] }
}

export interface SkillDefinition {
  id: string
  label: string
  view: 'paper' | 'devel_v1'
  arm: string
  sensors: string[]
  preconditions: string[]
  success: string
  recovery: string
}

export interface PromptSection {
  title: string
  source: string
  body: string
}

export const siteConfig: SiteContent = {
  title: 'Language-Agent Guided Adaptive Dual-Arm Robotic Disassembly',
  shortTitle: 'Adaptive Disassembly',
  showAuthors: true,
  authors: [
    {
      name: 'Adip Ranjan Das',
      affiliation: 'School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK',
      email: { local: 'ard2000', domain: 'hw.ac.uk' },
    },
    {
      name: 'David Neilan',
      affiliation: 'School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK',
      email: { local: 'ddn4000', domain: 'hw.ac.uk' },
    },
    {
      name: 'Maria Koskinopoulou',
      affiliation: 'School of Engineering and Physical Sciences, Heriot-Watt University, Edinburgh, UK',
      email: { local: 'M.Koskinopoulou', domain: 'hw.ac.uk' },
    },
  ],
}

export const metrics: Metric[] = [
  {
    id: 'agentic-completion', value: '86.0%', label: 'Agentic completion',
    definition: 'Mean target-step completion achieved by the language-agent system across the three device tasks.',
    caveat: 'A system-level result over 45 physical trials; it does not isolate the contribution of any single module.', source: 'paper',
  },
  {
    id: 'scripted-completion', value: '58.1%', label: 'Scripted completion',
    definition: 'Mean target-step completion for the fixed scripted comparison.',
    caveat: 'The baseline is not a state-aware non-LLM planner, so the comparison measures the full agentic stack against a fixed sequence.', source: 'paper',
  },
  {
    id: 'cascade-reduction', value: '≈85%', label: 'Fewer cascade failures',
    definition: 'Approximate reduction in downstream failures after an initial execution error (84.3% before rounding).',
    caveat: 'Derived from a small physical-trial sample and should be read as an observed reduction, not a population estimate.', source: 'paper',
  },
  {
    id: 'recovery', value: '72.2%', label: 'Mean recovery',
    definition: 'Mean share of recoverable failed actions that returned to a successful task trajectory.',
    caveat: 'Recovery opportunities differ by device and action type.', source: 'paper',
  },
  {
    id: 'trials', value: '45', label: 'Physical trials',
    definition: 'Total real-robot trials reported across HDD, Mini PC, and Laptop tasks.',
    caveat: 'One physical unit represented each device class.', source: 'paper',
  },
  {
    id: 'devices', value: '3', label: 'Device classes',
    definition: 'Hard disk drive, Mini PC, and Laptop.',
    caveat: 'Cross-device breadth is demonstrated, but within-class variation is not established.', source: 'paper',
  },
  {
    id: 'steps', value: '32', label: 'Target steps',
    definition: 'Combined paper evaluation targets: 11 HDD + 9 Mini PC + 12 Laptop.',
    caveat: 'These evaluation steps are not the same unit as the grouped devel_v1 configured actions.', source: 'paper',
  },
]

export const devices: DeviceRecord[] = [
  {
    id: 'hdd', label: 'Hard disk drive', targetSteps: 11, configuredActions: 6,
    screwTypes: 'Lid and PCB fasteners; local tool-camera localisation',
    extractedParts: ['Top lid', 'PCB'],
    reorientation: 'Required — the drive is flipped to expose the PCB.',
    paperSummary: 'A two-sided sequence that makes state updates and re-planning visible: lid screws, lid removal, flip, PCB screws, PCB extraction.',
    implementationSequence: ['unscrew lid group', 'pickup_object: lid', 'flip_object', 'unscrew PCB group', 'pickup_object: PCB', 'flip_drop'],
    imagePosition: '0% 0%',
  },
  {
    id: 'mini-pc', label: 'Mini PC', targetSteps: 9, configuredActions: 5,
    screwTypes: 'Component and holder fasteners; mixed scene and local detections',
    extractedParts: ['Heat sink', 'HDD holder', 'Core holder'],
    reorientation: 'Not required in the illustrated sequence.',
    paperSummary: 'Layered extraction alternates between grasping exposed parts and removing newly revealed fasteners.',
    implementationSequence: ['pickup_object: heat sink', 'unscrew HDD-holder group', 'pickup_object: HDD holder', 'unscrew core-holder group', 'pickup_object: core holder'],
    imagePosition: '50% 50%',
  },
  {
    id: 'laptop', label: 'Laptop', targetSteps: 12, configuredActions: 3,
    screwTypes: 'Chassis, heat-sink, and SSD-cover fasteners',
    extractedParts: ['Heat sink', 'SSD cover'],
    reorientation: 'Not required in the illustrated sequence.',
    paperSummary: 'The largest target-step set; the agent revisits perception as internal covers and the cooling assembly become actionable.',
    implementationSequence: ['unscrew grouped targets', 'pickup_object: heat sink', 'pickup_object: SSD cover'],
    imagePosition: '100% 100%',
  },
]

export const architectureNodes = [
  { id: 'perception', label: 'Perception', kicker: 'Sense', color: 'mint', input: 'Global and tool-camera RGB frames', output: 'Objects, fasteners, verification labels', model: 'RF-DETR-Large / Small + YOLOv11-Nano', purpose: 'Turns camera observations into scene- and action-level evidence.' },
  { id: 'state', label: 'Structured World State', kicker: 'Represent', color: 'blue', input: 'Fused detections and execution feedback', output: 'Sₜ = {Oₜ, Fₜ, Eₜ}', model: 'JSON-compatible state representation', purpose: 'Maintains the current objects, fasteners, and execution history.' },
  { id: 'agent', label: 'Language Agent', kicker: 'Reason', color: 'peach', input: 'Mission, state, action history, skill interface', output: 'A grounded next-action proposal', model: 'Prompted language agent', purpose: 'Observes, reasons, plans, and selects the next validated skill.' },
  { id: 'skill', label: 'Validated Skill', kicker: 'Constrain', color: 'lavender', input: 'Action name and typed target', output: 'Executable robot routine', model: 'Finite skill library', purpose: 'Constrains free-form reasoning to a safe, inspectable interface.' },
  { id: 'execute', label: 'Dual-Arm Execution', kicker: 'Act', color: 'rose', input: 'Validated skill and target pose', output: 'Motion and force/torque feedback', model: 'Manipulation arm + tooling arm', purpose: 'Coordinates grasping, support, screwdriver tooling, and reorientation.' },
  { id: 'verify', label: 'Verification', kicker: 'Check', color: 'mint', input: 'Post-action camera view and robot feedback', output: 'Aligned, misaligned, removed, or failed', model: 'YOLOv11-Nano + execution checks', purpose: 'Confirms effects before the system commits the next state.' },
  { id: 'updated', label: 'Updated State', kicker: 'Adapt', color: 'blue', input: 'Prior state + verified outcome', output: 'New objects, statuses, and history', model: 'Deterministic state update', purpose: 'Closes the loop and exposes newly available actions.' },
] as const

const deviceTemplates: Record<DeviceRecord['id'], { paper: PaperWorldState; runtime: RuntimeAgentState }> = {
  hdd: {
    paper: {
      device_id: 'hdd_illustrative_001',
      components: [{ id: 'lid_01', type: 'lid', status: 'installed', pose: { xyz_mm: [18.4, -6.2, 12.1], rpy_deg: [0, 0, 1.2] }, confidence: 0.96 }],
      fasteners: [{ id: 'lid_screw_03', type: 'cross_head', status: 'present', confidence: 0.94 }],
      status: 'operational', timestamp: '2026-01-01T12:00:00.000Z', history: [{ action: 'detect_scene', outcome: 'success', at: 't0' }],
    },
    runtime: {
      global_view: { device: 'HDD', detections: [{ label: 'lid', confidence: 0.96, bbox: [218, 142, 486, 374] }] },
      local_view: { target: 'lid_screw_03', tool_center_px: [318, 204], target_center_px: [321, 207], alignment: 'aligned' },
      assembly_state: { held_by: 'manipulation_arm', removed: [], last_action: 'hold_object', last_outcome: 'success' },
      force_torque: { frame: 'tool0', force_n: [0.1, -0.2, -4.8], torque_nm: [0.01, 0.02, 0.16] },
    },
  },
  'mini-pc': {
    paper: {
      device_id: 'mini_pc_illustrative_001',
      components: [{ id: 'heat_sink_01', type: 'heat_sink', status: 'installed', pose: { xyz_mm: [12.1, -5.2, 18.7], rpy_deg: [0, 0, 0.1] }, confidence: 0.92 }],
      fasteners: [{ id: 'holder_screw_03', type: 'cross_head_m2_5', status: 'present', confidence: 0.94 }],
      status: 'operational', timestamp: '2026-01-01T12:00:00.000Z', history: [{ action: 'detect_scene', outcome: 'success', at: 't0' }],
    },
    runtime: {
      global_view: { device: 'Mini PC', detections: [{ label: 'heat_sink', confidence: 0.92, bbox: [312, 199, 512, 362] }] },
      local_view: { target: 'holder_screw_03', tool_center_px: [317, 205], target_center_px: [320, 206], alignment: 'aligned' },
      assembly_state: { held_by: 'none', removed: [], last_action: 'observe', last_outcome: 'success' },
      force_torque: { frame: 'tool0', force_n: [0, 0, -0.2], torque_nm: [0, 0, 0] },
    },
  },
  laptop: {
    paper: {
      device_id: 'laptop_illustrative_001',
      components: [{ id: 'heat_sink_01', type: 'heat_sink', status: 'installed', pose: { xyz_mm: [42.1, 8.2, 9.7], rpy_deg: [0, 0, -2.1] }, confidence: 0.91 }],
      fasteners: [{ id: 'ssd_screw_01', type: 'cross_head', status: 'present', confidence: 0.93 }],
      status: 'operational', timestamp: '2026-01-01T12:00:00.000Z', history: [{ action: 'detect_scene', outcome: 'success', at: 't0' }],
    },
    runtime: {
      global_view: { device: 'Laptop', detections: [{ label: 'heat_sink', confidence: 0.91, bbox: [122, 91, 502, 251] }] },
      local_view: { target: 'ssd_screw_01', tool_center_px: [315, 208], target_center_px: [327, 212], alignment: 'misaligned' },
      assembly_state: { held_by: 'none', removed: [], last_action: 'observe', last_outcome: 'success' },
      force_torque: { frame: 'tool0', force_n: [0, 0, -0.1], torque_nm: [0, 0, 0] },
    },
  },
}

export const makeWorldState = (device: DeviceRecord['id'], failed = false) => {
  const state = structuredClone(deviceTemplates[device])
  if (failed) {
    state.paper.fasteners[0].status = 'present_retry_required'
    state.paper.status = 'recovery_pending'
    state.paper.history.push({ action: 'unscrew', outcome: 'failed_alignment', at: 't1' })
    state.paper.history.push({ action: 'relocalise', outcome: 'queued', at: 't2' })
    state.runtime.local_view.alignment = 'misaligned'
    state.runtime.assembly_state.last_action = 'unscrew'
    state.runtime.assembly_state.last_outcome = 'failed_alignment'
  }
  return state
}

export const skills: SkillDefinition[] = [
  { id: 'paper-unscrew', label: 'Unscrew', view: 'paper', arm: 'Tooling arm; manipulation arm stabilises when needed', sensors: ['Local RGB', 'Force/torque', 'Joint state'], preconditions: ['Fastener visible', 'Tool/target localisation available', 'Part stabilised'], success: 'Fastener state becomes removed and the next scene observation is requested.', recovery: 'Retract, re-localise the tool and screw centres, then retry or re-plan.' },
  { id: 'paper-pick', label: 'Pick-and-Extract', view: 'paper', arm: 'Manipulation arm', sensors: ['Global RGB', 'Gripper state', 'Force/torque'], preconditions: ['Component exposed', 'Blocking fasteners removed', 'Grasp pose available'], success: 'Component is lifted clear and marked removed after verification.', recovery: 'Release, refresh the scene, choose a new grasp, or defer the component.' },
  { id: 'paper-flip', label: 'Flip', view: 'paper', arm: 'Manipulation arm with tooling arm clear', sensors: ['Global RGB', 'Gripper state'], preconditions: ['Device graspable', 'Workspace clear', 'Current side completed'], success: 'Device orientation changes and the newly exposed side is re-observed.', recovery: 'Return to a stable support pose, regrasp, and repeat with a revised orientation.' },
  { id: 'hold_object', label: 'hold_object', view: 'devel_v1', arm: 'Manipulation arm', sensors: ['Global view', 'Gripper state'], preconditions: ['Object target known', 'Support grasp available'], success: 'Assembly is stabilised for the tooling action.', recovery: 'Open, re-observe, and choose another stabilisation pose.' },
  { id: 'unscrew', label: 'unscrew', view: 'devel_v1', arm: 'Tooling arm', sensors: ['local_view', 'force_torque'], preconditions: ['Sequence target supplied', 'Target aligned'], success: 'Runtime packet records successful fastener removal.', recovery: 'Re-centre from local_view and repeat within retry limits.' },
  { id: 'pickup_object', label: 'pickup_object', view: 'devel_v1', arm: 'Manipulation arm', sensors: ['global_view', 'Gripper state'], preconditions: ['Target named by configured sequence', 'Removal prerequisites met'], success: 'Target is added to assembly_state.removed.', recovery: 'Refresh global_view and adjust the grasp.' },
  { id: 'flip_object', label: 'flip_object', view: 'devel_v1', arm: 'Manipulation arm', sensors: ['global_view', 'Gripper state'], preconditions: ['Configured sequence requests flip', 'Tooling arm clear'], success: 'The opposite face is available for the next action group.', recovery: 'Place safely and retry the reorientation.' },
  { id: 'flip_drop', label: 'flip_drop', view: 'devel_v1', arm: 'Manipulation arm', sensors: ['global_view', 'Gripper state'], preconditions: ['Terminal sequence stage', 'Drop zone clear'], success: 'Object is placed in the configured terminal orientation.', recovery: 'Return to a stable hold and re-plan the place pose.' },
]

export const limitations = [
  'Each device class is represented by a single physical unit, limiting claims about within-class variation.',
  'Training images include the known device instances used in evaluation; this is not an unseen-device study.',
  'The development split was produced after augmentation, so it is not evidence of independent unseen-image generalisation.',
  'The scripted baseline is fixed rather than state-aware, leaving the value of language reasoning only partially isolated.',
  'Reported improvements belong to the integrated system; the experiment does not attribute gains to one module in isolation.',
]

export const datasets = [
  {
    label: 'Local fastener dataset',
    href: 'https://universe.roboflow.com/hard-drive/electronic_devices_local',
    detail: 'Tool-camera localisation',
    description: 'Close-up visual data for locating screw targets and aligning the tooling arm before contact.',
  },
  {
    label: 'Global device dataset',
    href: 'https://universe.roboflow.com/hard-drive/electronic_device_global',
    detail: 'Scene components',
    description: 'Scene-level visual data for detecting device parts, fixtures, and visible fasteners.',
  },
  {
    label: 'Process-state dataset',
    href: 'https://universe.roboflow.com/hard-drive/hdd_process_states',
    detail: 'Alignment and removal verification',
    description: 'Action-state visual data used to distinguish aligned, misaligned, and removed outcomes.',
  },
]

export const chartData = {
  completion: [
    { method: 'Agentic', value: 86.0, fill: '#2563eb' },
    { method: 'Scripted', value: 58.1, fill: '#94a3b8' },
  ],
  resilience: [
    { metric: 'Cascade failure reduction', value: 84.3, fill: '#2563eb' },
    { metric: 'Mean recovery', value: 72.2, fill: '#64748b' },
  ],
  scale: devices.map((device) => ({ device: device.label, targetSteps: device.targetSteps, configuredActions: device.configuredActions })),
}

export const provenance = {
  paper: 'Manuscript evidence',
  devel_v1: 'devel_v1 implementation lens · commit 9cb4555',
  illustrative: 'Constructed example · not an experimental log',
}
