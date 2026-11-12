import { ElementType, PropsWithChildren } from "react";
import { cn } from "#/components/ds/lib/classnames";

interface TitleProps {
  className?: string;
  family?: "sans" | "mono";
  /**
   * The rendered element/tag. Defaults to `"div"` — unchanged from this
   * component's original behavior — rather than defaulting to `"h1"`,
   * because `Title` is used multiple times on the same page in some
   * consumers (e.g. `LandingHeroSection` and `LandingSectionFAQ` both
   * render a `Title` on `src/routes/landing.tsx`'s single landing page);
   * defaulting to `h1` would silently produce two `<h1>`s on that page.
   * Callers that render `Title` as a genuine page title (one per page,
   * e.g. the Problem Statement playground's screens) should opt in with
   * `as="h1"` explicitly.
   */
  as?: ElementType;
}

export const Title = ({
  children,
  className,
  family = "sans",
  as: Component = "div",
}: PropsWithChildren<TitleProps>) => {
  return (
    <Component
      className={cn(
        "text-display text-center",
        family === "mono" ? "font-mono" : "font-sans",
        className,
      )}
    >
      {children}
    </Component>
  );
};
