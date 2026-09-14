import * as React from "react";

/** Product mark: a survey tick inside a square plate. */
export function CompassMark({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center border border-[color:var(--color-accent)]"
      style={{ width: size, height: size }}
    >
      <span
        className="rotate-45 bg-[color:var(--color-accent)]"
        style={{ width: size * 0.3, height: size * 0.3 }}
      />
    </span>
  );
}

export function CompassWordmark({ size = 34 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <CompassMark size={size} />
      <span
        className="font-extrabold tracking-[-0.02em] text-[color:var(--color-text)]"
        style={{ fontSize: size * 0.55 }}
      >
        Compass
      </span>
    </span>
  );
}
