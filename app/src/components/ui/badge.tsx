import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/tailwind-utils";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
    "transition-colors ease-snappy border",
  ),
  {
    variants: {
      variant: {
        success: "bg-[color:var(--color-tag-match)] text-[color:var(--color-tag-match-text)] border-[color:var(--color-tag-match-text)]/30",
        warning: "bg-[color:var(--color-amber)]/12 text-[color:var(--color-amber)] border-[color:var(--color-amber)]/35",
        error: "bg-[color:var(--color-tag-no-match)] text-[color:var(--color-tag-no-match-text)] border-[color:var(--color-tag-no-match-text)]/30",
        neutral:
          "bg-[color:var(--color-tag-neutral)] text-[color:var(--color-tag-neutral-text)] border-[color:var(--color-border)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface TagPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const TagPill = React.forwardRef<HTMLSpanElement, TagPillProps>(
  function TagPill({ className, variant, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

TagPill.displayName = "TagPill";
