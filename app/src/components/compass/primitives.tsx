"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/tailwind-utils";
import { RIASEC_KEYS, RIASEC_META, hollandCode } from "@/lib/career/riasec";
import type { Evidence, RiasecVector } from "@/lib/career/types";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Sheet chrome ──────────────────────────────────────────────── */

export function SheetHead({
  no,
  title,
  note,
}: {
  no: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="sheet-head mb-7">
      <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[color:var(--color-accent)]">
        {no}
      </span>
      <h2 className="m-0 text-[length:var(--text-fluid-lg)] font-extrabold tracking-[-0.01em]">
        {title}
      </h2>
      {note && <span className="mono-label ml-auto">{note}</span>}
    </div>
  );
}

export function Plate({
  label,
  children,
  className,
  active,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "plate p-5",
        active && "border-[color:var(--color-accent)]",
        className,
      )}
    >
      {label && <div className="mono-label mb-3">{label}</div>}
      {children}
    </div>
  );
}

/** The coordinate block that marks a major as a surveyed location. */
export function CoordinateStamp({
  name,
  code,
  score,
  section,
  className,
}: {
  name: string;
  code: string;
  score: number;
  section?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-[color:var(--color-border)] px-4 py-3",
        "font-[family-name:var(--font-mono)] text-[11.5px] leading-[1.9]",
        "text-[color:var(--color-muted)]",
        className,
      )}
    >
      <div className="font-bold uppercase text-[color:var(--color-text)]">{name}</div>
      <div>
        КОД ХОЛЛАНДА · <span className="text-[color:var(--color-accent)]">{code}</span>
      </div>
      <div>
        ВЫСОТА · <span className="mono-data text-[color:var(--color-text)]">{score}</span>
        <span className="text-[color:var(--color-faint)]"> / 100</span>
      </div>
      {section && <div>СЕЧЕНИЕ · {section}</div>}
    </div>
  );
}

/* ─── Radial match dial ─────────────────────────────────────────── */

/**
 * Blue is who the student is, amber is what they have built so far.
 * Crimson never appears here — it is reserved for gaps.
 */
const DIMENSION_ORDER: {
  key: string;
  labelRu: string;
  radius: number;
  color: string;
  opacity: number;
}[] = [
  { key: "riasec", labelRu: "интересы", radius: 62, color: "var(--color-accent)", opacity: 1 },
  { key: "values", labelRu: "ценности", radius: 52, color: "var(--color-accent)", opacity: 0.55 },
  { key: "subjects", labelRu: "предметы", radius: 42, color: "var(--color-amber)", opacity: 1 },
  { key: "skills", labelRu: "навыки", radius: 32, color: "var(--color-amber)", opacity: 0.55 },
];

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function MatchDial({
  score,
  breakdown,
  size = 150,
}: {
  score: number;
  breakdown: Record<string, number>;
  size?: number;
}) {
  const cx = 75;
  const cy = 75;
  const START = -Math.PI / 2;
  const SWEEP = Math.PI * 1.85;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 150 150"
        role="img"
        aria-label={`Совпадение ${score} из 100`}
      >
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
          const r1 = 68;
          const r2 = i % 4 === 0 ? 62 : 65.5;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}

        {DIMENSION_ORDER.map((d, i) => {
          const value = Math.max(0, Math.min(1, breakdown?.[d.key] ?? 0));
          return (
            <g key={d.key}>
              <path
                d={arcPath(cx, cy, d.radius, START, START + SWEEP)}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={5}
                opacity={0.5}
              />
              <motion.path
                d={arcPath(cx, cy, d.radius, START, START + SWEEP * Math.max(value, 0.001))}
                fill="none"
                stroke={d.color}
                strokeOpacity={d.opacity}
                strokeWidth={5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.1 }}
              />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={3} fill="var(--color-text)" />
      </svg>

      <div>
        <div className="mono-data text-[2.6rem] font-bold leading-none">{score}</div>
        <div className="mono-label mt-1.5">из 100</div>
        <ul className="mt-4 space-y-1">
          {DIMENSION_ORDER.map((d) => (
            <li key={d.key} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-[3px] w-4"
                style={{ background: d.color, opacity: d.opacity }}
              />
              <span className="text-[color:var(--color-muted)]">{d.labelRu}</span>
              <span className="mono-data ml-auto text-[color:var(--color-text)]">
                {Math.round((breakdown?.[d.key] ?? 0) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Compass rose · six RIASEC rays ────────────────────────────── */

export function CompassRose({
  riasec,
  size = 132,
}: {
  riasec: RiasecVector;
  size?: number;
}) {
  const cx = 66;
  const cy = 66;
  const max = Math.max(...RIASEC_KEYS.map((k) => riasec[k]), 1);
  const leadIndex = RIASEC_KEYS.reduce(
    (best, k, i) => (riasec[k] > riasec[RIASEC_KEYS[best]] ? i : best),
    0,
  );
  // The needle points at the student's leading axis, so no two roses match.
  const needleAngle = (leadIndex / 6) * 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 132 132"
      role="img"
      aria-label={`Роза интересов, ведущая ось ${RIASEC_META[RIASEC_KEYS[leadIndex]].labelRu}`}
    >
      <circle cx={cx} cy={cy} r={54} fill="none" stroke="var(--color-border)" />
      <circle cx={cx} cy={cy} r={40} fill="none" stroke="var(--color-border)" opacity={0.5} />

      {RIASEC_KEYS.map((k, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const r = 14 + (riasec[k] / max) * 38;
        const lead = i === leadIndex;
        return (
          <g key={k}>
            <motion.line
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(a)}
              y2={cy + r * Math.sin(a)}
              stroke={lead ? "var(--color-accent)" : "var(--color-faint)"}
              strokeWidth={lead ? 2 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
            />
            <text
              x={cx + 62 * Math.cos(a)}
              y={cy + 62 * Math.sin(a) + 3.5}
              textAnchor="middle"
              fill={lead ? "var(--color-accent)" : "var(--color-faint)"}
              fontFamily="var(--font-mono)"
              fontSize={9}
            >
              {k}
            </text>
          </g>
        );
      })}

      <motion.polygon
        points={`${cx},${cy - 46} ${cx - 5},${cy} ${cx},${cy + 10} ${cx + 5},${cy}`}
        fill="var(--color-accent)"
        initial={{ rotate: 0 }}
        animate={{ rotate: needleAngle }}
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
      />
      <circle cx={cx} cy={cy} r={3.5} fill="var(--color-bg)" stroke="var(--color-text)" />
    </svg>
  );
}

/* ─── RIASEC profile bars ───────────────────────────────────────── */

export function RiasecBars({ riasec }: { riasec: RiasecVector }) {
  const peak = Math.max(...RIASEC_KEYS.map((k) => riasec[k]), 1);

  return (
    <div className="space-y-2">
      {RIASEC_KEYS.map((k, i) => {
        // Height reads as ink density, the way a contour map shades elevation.
        const lead = riasec[k] === peak;
        const alpha = 0.32 + (riasec[k] / peak) * 0.68;
        return (
          <div key={k} className="flex items-center gap-3">
            <span
              className={cn(
                "w-32 shrink-0 text-[11px]",
                lead
                  ? "font-semibold text-[color:var(--color-text)]"
                  : "text-[color:var(--color-muted)]",
              )}
            >
              {RIASEC_META[k].labelRu}
            </span>
            <div className="h-[7px] flex-1 bg-[color:var(--color-border)]">
              <motion.div
                className="h-full bg-[color:var(--color-accent)]"
                style={{ opacity: alpha }}
                initial={{ width: 0 }}
                animate={{ width: `${riasec[k]}%` }}
                transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
              />
            </div>
            <span className="mono-data w-8 shrink-0 text-right text-[11px] text-[color:var(--color-text)]">
              {riasec[k]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HollandBadge({ riasec }: { riasec: RiasecVector }) {
  return (
    <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.14em] text-[color:var(--color-accent)]">
      КОД {hollandCode(riasec)}
    </span>
  );
}

/* ─── Evidence: the annotation layer of a section drawing ───────── */

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {evidence.map((e, i) => {
        const gap = e.polarity === "gap";
        const partial = e.polarity === "partial";
        const mark = gap ? "✗" : partial ? "~" : "✓";
        const color = gap
          ? "var(--color-crimson)"
          : partial
            ? "var(--color-amber)"
            : "var(--color-accent)";
        return (
          <motion.li
            key={i}
            className="grid grid-cols-[16px_1fr_auto] items-start gap-3 border-b border-dashed border-[color:var(--color-border)] py-2.5 text-[length:var(--text-fluid-sm)] last:border-b-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.1 + i * 0.05 }}
          >
            <span
              className="font-[family-name:var(--font-mono)] font-bold"
              style={{ color }}
            >
              {mark}
            </span>
            <span className="text-[color:var(--color-muted)]">{e.labelRu}</span>
            <span className="mono-label whitespace-nowrap pt-0.5">
              {Math.round(e.weight * 100)}%
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}

/* ─── Profile confidence ────────────────────────────────────────── */

export function ConfidenceMeter({
  score,
  blocks,
}: {
  score: number;
  blocks: { key: string; labelRu: string; done: boolean; actionRu: string }[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="mono-label">Уверенность профиля</span>
        <span className="mono-data text-[length:var(--text-fluid-xl)] font-bold text-[color:var(--color-accent)]">
          {score}%
        </span>
      </div>
      <div className="mt-2 h-[6px] bg-[color:var(--color-border)]">
        <motion.div
          className="h-full bg-[color:var(--color-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
      <ul className="mt-4 space-y-1.5">
        {blocks.map((b) => (
          <li
            key={b.key}
            className="flex gap-2 text-[11.5px] text-[color:var(--color-muted)]"
          >
            <span
              className="font-[family-name:var(--font-mono)]"
              style={{ color: b.done ? "var(--color-accent)" : "var(--color-faint)" }}
            >
              {b.done ? "✓" : "○"}
            </span>
            {b.done ? b.labelRu : b.actionRu}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Magnetic primary action ───────────────────────────────────── */

export function MagneticButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setOffset({
          x: ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 7,
          y: ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 7,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      className={cn(
        "inline-flex items-center gap-2.5 bg-[color:var(--color-accent)] px-6 py-3",
        "text-[length:var(--text-fluid-sm)] font-semibold text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-text)]",
        "disabled:opacity-50",
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
