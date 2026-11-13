import { exampleState, dispatchExample, readableJson } from './world-state'

// Schematic teaching example, using the runtime fields in RAL_2026.pdf §III.
// Camera samples and video illustrate the channels; they are not a synchronised trial.
export const demoDecision = {
  observation: 'The previous unscrew invocation failed. The target is still active.',
  state_assessment: 'Removal is unconfirmed; the refreshed state reports aligned contact.',
  next_action: 'unscrew',
  target: 'holder_screw_03',
  rationale: 'Select a further supported invocation using the verified state.',
  confidence: 0.86,
}

export const contextExcerpt = `SYSTEM INSTRUCTION
You are a task-level robotic disassembly planner.
Use the structured world state to select and
parameterise one supported skill at a time.

AVAILABLE SKILLS
unscrew · pickup_object · flip_object

MISSION
Disassemble the observed components using
the validated manipulation skills.

CURRENT OBSERVATIONS
${readableJson(exampleState)}

REASONING REQUEST
Assess the verified outcome, then select
one skill and target with a brief justification.`

export const processStages = [
  { id: 'perception', label: 'Perception', title: 'Observe the physical state', text: 'Scene detections, local alignment and outcome verification supply observations. Force and torque readings enter alongside the visual channels.', file: 'perception_channels.json', accent: '#245bd8', code: readableJson({ scene: { model: 'RF-DETR-Large', writes: 'global_view' }, fastener: { model: 'RF-DETR-Small', writes: 'local_view' }, verification: { model: 'YOLOv11-Nano', writes: 'assembly_state' }, contact_sensor: { writes: 'force_torque' } }) },
  { id: 'state', label: 'World state', title: 'Build one structured record', text: 'The four fields form the planner’s dynamic input. Here, the previous unscrew failed: removal stays unconfirmed even though contact is aligned.', file: 'world_state.json', accent: '#0f766e', code: readableJson(exampleState) },
  { id: 'context', label: 'Prompt context', title: 'Bring observations into the prompt', text: 'Fixed instructions, the mission and three skill descriptions accompany the latest state. No device identity or ordered disassembly sequence is supplied.', file: 'planning_context.txt', accent: '#6d28d9', code: contextExcerpt },
  { id: 'decision', label: 'Agent decision', title: 'Select one supported action', text: 'The LangGraph / GPT-5.1 agent reads the verified state and returns a skill, target and brief justification. This is a schematic response, not an internal reasoning trace.', file: 'decision.json', accent: '#6d28d9', code: readableJson(demoDecision) },
  { id: 'request', label: 'Skill request', title: 'Format and validate the request', text: 'The second prompt formats the decision for the programmed skill interface. Invalid outputs return to the planner; the expected effect remains an intention.', file: 'skill_request.json', accent: '#0369a1', code: readableJson(dispatchExample) },
  { id: 'verify', label: 'Verify & update', title: 'Let the observed outcome guide what follows', text: 'The robot executes the programmed skill, then verification refreshes the state. This failure example leaves removed empty and returns the outcome for a new decision.', file: 'verified_feedback.json', accent: '#367b35', code: readableJson({ assembly_state: exampleState.assembly_state, next_planning_input: 'Refreshed global_view, local_view, assembly_state and force_torque', update: 'Sₜ₊₁ = f(Sₜ, oₜ₊₁, aₜ, yₜ₊₁)' }) },
] as const

export const runtimeFields = [
  { key: 'global_view', symbol: 'Oₜ', name: 'Scene detections', text: 'Labels, confidence and bounding boxes.', colour: 'blue' },
  { key: 'local_view', symbol: 'Fₜ', name: 'Target alignment', text: 'Active target and tool/target centres.', colour: 'teal' },
  { key: 'assembly_state', symbol: 'Eₜ', name: 'Verified outcomes', text: 'Held/removed parts and latest outcome.', colour: 'violet' },
  { key: 'force_torque', symbol: 'Wₜ', name: 'Contact measurements', text: 'Sensor-frame force and torque.', colour: 'amber' },
] as const
