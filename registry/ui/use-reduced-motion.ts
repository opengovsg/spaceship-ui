import { useReducedMotion } from "framer-motion";

/** Returns true when the user has enabled "Reduce motion" in system accessibility settings. */
export function useSystemReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}
