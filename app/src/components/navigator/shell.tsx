"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import { EASE } from "@/components/compass/primitives";

export function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="sheet-head">
        <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[color:var(--color-accent)]">
          {eyebrow}
        </span>
        <span className="mono-label ml-auto">Compass · лист профиля</span>
      </div>

      <h1 className="display-tight mt-5 text-[length:var(--text-fluid-2xl)] text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-[62ch] text-[length:var(--text-fluid-base)] text-[color:var(--color-muted)]">
          {subtitle}
        </p>
      )}

      <div className="mt-8">{children}</div>
      {footer && <div className="mt-10 flex flex-wrap items-center gap-4">{footer}</div>}
    </motion.section>
  );
}

export function ProgressRail({
  steps,
  current,
  onJump,
}: {
  steps: { key: string; label: string }[];
  current: number;
  onJump?: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-stretch border border-[color:var(--color-border)]">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <button
            key={s.key}
            type="button"
            disabled={!onJump || i > current}
            onClick={() => onJump?.(i)}
            className={cn(
              "flex-1 border-r border-[color:var(--color-border)] px-3 py-2 text-left last:border-r-0",
              "font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em]",
              "transition-colors",
              active && "bg-[color:var(--color-accent)] text-white",
              done && !active && "text-[color:var(--color-accent)]",
              !active && !done && "text-[color:var(--color-faint)]",
              onJump && i <= current && !active && "hover:bg-[color:var(--color-tag-match)]",
            )}
          >
            <span className="block opacity-70">{String(i + 1).padStart(2, "0")}</span>
            <span className="block">
              {done ? "✓ " : ""}
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Card({
  children,
  className,
  selected,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }) {
  return (
    <div
      className={cn(
        "border p-4 transition-colors",
        selected
          ? "border-[color:var(--color-accent)] bg-[color:var(--color-tag-match)]"
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Square selector used for grades, Likert scales and skill levels. */
export function Ticks({
  values,
  current,
  onPick,
  labels,
}: {
  values: number[];
  current?: number;
  onPick: (v: number) => void;
  labels?: string[];
}) {
  return (
    <div className="flex gap-[2px]">
      {values.map((v, i) => (
        <button
          key={v}
          type="button"
          title={labels?.[i]}
          onClick={() => onPick(v)}
          className={cn(
            "h-8 w-8 font-[family-name:var(--font-mono)] text-[11px] font-bold transition-colors",
            current === v
              ? "bg-[color:var(--color-accent)] text-white"
              : "bg-[color:var(--color-tag-neutral)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
