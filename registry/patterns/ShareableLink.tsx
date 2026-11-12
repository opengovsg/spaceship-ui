"use client";

import { useRef } from "react";
import { Globe, Link } from "lucide-react";
import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { Button } from "../ui";
import { cn } from "#/components/ds/lib/classnames";

interface ShareableLinkProps {
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  onShare?: () => void;
  shareLabel?: string;
  className?: string;
}

const FONT_CLASSES = "font-sans text-body";

const SPRING = { type: "spring", stiffness: 200, damping: 30 } as const;

export function ShareableLink({
  value,
  onChange,
  suffix = ".on.spaceship.gov.sg",
  placeholder = "Enter your domain name",
  onShare,
  shareLabel = "Create shareable link",
  className,
}: ShareableLinkProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizerRef, { width: sizerWidth }] = useMeasure();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg shadow-(--shadow-border) bg-(--bg-artifact-address) p-1",
        className,
      )}
    >
      {/* Inner padding wrapper: Globe + text group */}
      <div className="flex items-center gap-2 px-2">
        {/* Globe icon */}
        <Globe className="size-5 text-(--text-secondary) shrink-0" />

        {/* Text group */}
        <div className="flex items-baseline relative">
          {/* Invisible sizer — out of flow, measures text width only */}
          <span
            ref={sizerRef}
            aria-hidden
            className={cn(
              "absolute invisible whitespace-pre pointer-events-none",
              FONT_CLASSES,
            )}
          >
            {value || placeholder}
          </span>

          {/* motion.div in flow — layout FLIP drives width so suffix slides smoothly (B-tier) */}
          <motion.div
            layout
            transition={{ layout: SPRING }}
            className="cursor-text overflow-hidden"
            style={{ width: sizerWidth || undefined }}
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label="Domain name"
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent outline-none px-0",
                "text-(--text-primary) placeholder:text-(--text-placeholder)",
                FONT_CLASSES,
              )}
            />
          </motion.div>

          {/* Suffix — follows motion.div in flex flow */}
          <span
            className={cn(
              "text-(--text-tertiary) whitespace-nowrap shrink-0",
              FONT_CLASSES,
            )}
          >
            {suffix}
          </span>
        </div>
      </div>

      {/* Share button */}
      <Button variant="success" trailingIcon={<Link />} onClick={onShare}>
        {shareLabel}
      </Button>
    </div>
  );
}
