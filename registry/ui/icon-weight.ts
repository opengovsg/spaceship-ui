import { cva } from "class-variance-authority";

/** Set text and Lucide weight together. Use this instead of a font-only class
 * when a label has an icon. Descendant controls can set their own pairing. */
export const ICON_TEXT_WEIGHT_CLASSES = {
  regular:
    "[font-weight:var(--font-weight-regular)] [--icon-stroke-width:var(--icon-stroke-regular)]",
  medium:
    "[font-weight:var(--font-weight-medium)] [--icon-stroke-width:var(--icon-stroke-medium)]",
  semibold:
    "[font-weight:var(--font-weight-semibold)] [--icon-stroke-width:var(--icon-stroke-semibold)]",
  bold: "[font-weight:var(--font-weight-bold)] [--icon-stroke-width:var(--icon-stroke-bold)]",
} as const;

export const ICON_WEIGHT_CLASS =
  "[&_.lucide]:[stroke-width:var(--icon-stroke-width)]";

export const iconTextWeightVariants = cva([ICON_WEIGHT_CLASS], {
  variants: { weight: ICON_TEXT_WEIGHT_CLASSES },
  defaultVariants: { weight: "regular" },
});
