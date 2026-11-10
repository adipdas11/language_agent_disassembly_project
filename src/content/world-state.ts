import interfaces from "./paper-interfaces.json";

// Exact example packets from the active V11 listings; values are illustrative.
export const exampleState = interfaces.worldstate_packet;
export const dispatchExample = interfaces.action_response;

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
