"use client";

import * as React from "react";
import type { RiasecVector } from "@/lib/career/types";

/**
 * The page background is the student's own terrain.
 *
 * Height at any point is value noise seeded by the RIASEC vector, so two
 * students never get the same sheet. Contours are traced with marching
 * squares — the same construction a real topographic map uses, which is why
 * index lines are drawn heavier every fourth level.
 */

function hash2(ix: number, iy: number, seed: number): number {
  let h = (ix * 374761393 + iy * 668265263 + seed * 1013904223) | 0;
  h = (h ^ (h >> 13)) | 0;
  h = Math.imul(h, 1274126177) | 0;
  h = (h ^ (h >> 16)) | 0;
  return (h >>> 0) / 4294967295;
}

function noise2(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, seed: number, t: number): number {
  return (
    0.55 * noise2(x + t, y, seed) +
    0.28 * noise2(x * 2.1 - t * 0.6, y * 2.1, seed + 7) +
    0.17 * noise2(x * 4.3, y * 4.3 + t * 0.4, seed + 19)
  );
}

/** Marching squares over one threshold, stroked as a single path. */
function traceContour(
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  cols: number,
  rows: number,
  cw: number,
  ch: number,
  level: number,
) {
  const cut = (a: number, b: number) => {
    const d = b - a;
    return Math.abs(d) < 1e-6 ? 0.5 : (level - a) / d;
  };

  ctx.beginPath();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * (cols + 1) + x;
      const tl = field[i];
      const tr = field[i + 1];
      const bl = field[i + cols + 1];
      const br = field[i + cols + 2];

      const code =
        (tl > level ? 8 : 0) |
        (tr > level ? 4 : 0) |
        (br > level ? 2 : 0) |
        (bl > level ? 1 : 0);
      if (code === 0 || code === 15) continue;

      const px = x * cw;
      const py = y * ch;
      const T: [number, number] = [px + cw * cut(tl, tr), py];
      const R: [number, number] = [px + cw, py + ch * cut(tr, br)];
      const B: [number, number] = [px + cw * cut(bl, br), py + ch];
      const L: [number, number] = [px, py + ch * cut(tl, bl)];

      let seg: [[number, number], [number, number]] | null = null;
      switch (code) {
        case 1:
        case 14:
          seg = [L, B];
          break;
        case 2:
        case 13:
          seg = [B, R];
          break;
        case 3:
        case 12:
          seg = [L, R];
          break;
        case 4:
        case 11:
          seg = [T, R];
          break;
        case 6:
        case 9:
          seg = [T, B];
          break;
        case 7:
        case 8:
          seg = [L, T];
          break;
        case 5:
          seg = [L, T];
          break;
        case 10:
          seg = [T, R];
          break;
      }
      if (!seg) continue;

      ctx.moveTo(seg[0][0], seg[0][1]);
      ctx.lineTo(seg[1][0], seg[1][1]);

      // Saddle cases carry a second segment.
      if (code === 5) {
        ctx.moveTo(B[0], B[1]);
        ctx.lineTo(R[0], R[1]);
      } else if (code === 10) {
        ctx.moveTo(L[0], L[1]);
        ctx.lineTo(B[0], B[1]);
      }
    }
  }
  ctx.stroke();
}

/** A RIASEC vector collapses into one stable seed per student. */
export function seedFromRiasec(v?: RiasecVector | null): number {
  if (!v) return 41;
  const keys: (keyof RiasecVector)[] = ["R", "I", "A", "S", "E", "C"];
  let s = 7;
  keys.forEach((k, i) => {
    s = (s * 31 + Math.round(v[k] ?? 0) * (i + 3)) | 0;
  });
  return Math.abs(s) % 9973;
}

export function Terrain({
  riasec,
  interactive = true,
  className,
}: {
  riasec?: RiasecVector | null;
  interactive?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const seed = React.useMemo(() => seedFromRiasec(riasec), [riasec]);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;
    let field = new Float32Array(0);
    let time = 0;
    let raf = 0;
    let last = 0;
    const pointer = { x: -9999, y: -9999, amp: 0 };

    const token = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(26, Math.round(width / 16));
      rows = Math.max(18, Math.round(height / 16));
      cw = width / cols;
      ch = height / rows;
      field = new Float32Array((cols + 1) * (rows + 1));
    }

    function build(t: number) {
      const fx = (3.4 / cols) * 1.5;
      const fy = (3.4 / rows) * (rows / cols) * 2.4;
      const mx = pointer.x / cw;
      const my = pointer.y / ch;
      const r2 = Math.pow(Math.max(cols, rows) * 0.13, 2);

      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          let v = fbm(x * fx, y * fy, seed, t);
          if (pointer.amp > 0.01) {
            const dx = x - mx;
            const dy = y - my;
            v += pointer.amp * 0.42 * Math.exp(-(dx * dx + dy * dy) / r2);
          }
          field[y * (cols + 1) + x] = v;
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const minor = token("--color-contour");
      const index = token("--color-contour-index");
      const levels = 13;
      for (let i = 1; i < levels; i++) {
        const level = 0.18 + (i / levels) * 0.68;
        const isIndex = i % 4 === 0;
        ctx!.strokeStyle = isIndex ? index : minor;
        ctx!.lineWidth = isIndex ? 1.1 : 0.65;
        traceContour(ctx!, field, cols, rows, cw, ch, level);
      }
    }

    function frame(now: number) {
      if (now - last > 55) {
        last = now;
        time += 0.0075;
        pointer.amp += ((pointer.x > -9000 ? 1 : 0) - pointer.amp) * 0.09;
        build(time);
        draw();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    build(0);
    draw();

    const onResize = () => {
      resize();
      build(time);
      draw();
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    window.addEventListener("resize", onResize);
    if (interactive && !reduce) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }

    // The palette flips with the theme; the drawing has to follow.
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      observer.disconnect();
    };
  }, [seed, interactive]);

  return <canvas ref={ref} aria-hidden className={className ?? "compass-terrain"} />;
}
