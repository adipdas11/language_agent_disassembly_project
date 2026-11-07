// Illustrative values in the four runtime fields described in RAL-mainV10.tex.
// Pixel locations are image measurements, not six-dimensional poses.
export const exampleState = {
  global_view: {
    detections: [
      { label: "lid", confidence: 0.99, bbox_px: [72, 85, 975, 1010] },
      { label: "screw", confidence: 0.98, bbox_px: [343, 211, 365, 238] },
    ],
  },
  local_view: {
    target_id: "holder_screw_03",
    tool_center_px: [318, 302],
    target_center_px: [321, 306],
    alignment: "contact_aligned",
  },
  assembly_state: {
    held_by: "manipulation_arm",
    removed: ["holder_screw_03"],
    last_action: "unscrew",
    last_outcome: "success",
  },
  force_torque: {
    frame: "tool_sensor",
    force_N: [0.1, 0.2, 2.4],
    torque_Nm: [0.01, 0.02, 0.03],
  },
};
export const dispatchExample = {
  skill: "unscrew",
  target: "holder_screw_03",
  arm: "tooling_arm",
  parameters: { rotation_direction: "counterclockwise", retry_limit: 2 },
  expected_effect: "holder_screw_03 becomes removed",
  verification: "confirm fastener removal and refresh the global scene",
  on_failure: "retract, re-localise the tool and target centres, then retry",
};

export function readableJson(value: unknown, depth = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (
    Array.isArray(value) &&
    value.every((item) => item === null || typeof item !== "object")
  )
    return JSON.stringify(value);
  if (depth > 2 && JSON.stringify(value).length < 115)
    return JSON.stringify(value);
  const indent = "  ".repeat(depth);
  const entries = Object.entries(value);
  const array = Array.isArray(value);
  return `${array ? "[" : "{"}\n${entries.map(([key, item]) => `${indent}  ${array ? "" : `${JSON.stringify(key)}: `}${readableJson(item, depth + 1)}`).join(",\n")}\n${indent}${array ? "]" : "}"}`;
}
