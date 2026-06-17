// JSX renderers live in registry_impl.tsx so this .ts file stays JSX-free.
// All consumers keep importing from "./registry" — this re-export is transparent.
export type { Axis, DiffOp } from "./registry_impl";
export { TIME_OPS, SPACE_OPS, spaceOpsForAxes } from "./registry_impl";
