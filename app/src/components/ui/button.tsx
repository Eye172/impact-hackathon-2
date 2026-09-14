"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none ease-snappy",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-colors will-change-transform",
  ),
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-accent)] text-white transition-colors"
          + " hover:bg-[color:var(--color-accent-secondary)]",
        glass:
          "bg-[color:var(--color-surface)] border border-[color:var(--color-border-strong)]"
          + " text-[color:var(--color-text)] transition-colors"
          + " hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]",
        outline:
          "border border-[color:var(--color-border-strong)] text-[color:var(--color-accent)] bg-transparent"
          + " transition-colors hover:border-[color:var(--color-accent)]"
          + " hover:bg-[color:var(--color-tag-match)]",
      },
      size: {
        sm: "h-8 px-3 text-[length:var(--text-fluid-xs)]",
        md: "h-10 px-5 text-[length:var(--text-fluid-sm)]",
        lg: "h-12 px-6 text-[length:var(--text-fluid-base)]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type MotionButtonProps = HTMLMotionProps<"button">;

export interface ButtonProps
  extends Omit<MotionButtonProps, "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const MotionSlot = motion.create(Slot);

export const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function ActionButton(
    { className, variant, size, asChild = false, children, ...props },
    ref,
  ) {
    const Component = asChild ? MotionSlot : motion.button;

    return (
      <Component
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

ActionButton.displayName = "ActionButton";
