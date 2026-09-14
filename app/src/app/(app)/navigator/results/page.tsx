"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { Terrain } from "@/components/compass/terrain";
import {
  CompassRose,
  ConfidenceMeter,
  CoordinateStamp,
  EASE,
  EvidenceList,
  HollandBadge,
  MatchDial,
  Plate,
  RiasecBars,
  SheetHead,
} from "@/components/compass/primitives";
import { hollandCode } from "@/lib/career/riasec";
import { FIELD_LABELS } from "@/lib/career/majors";
import type { Evidence, Major, MajorFit, RiasecVector } from "@/lib/career/types";

interface Recommendation extends MajorFit {
  rank: number;
  narrative: string | null;
  major: Major;
}

interface Confidence {
  score: number;
  blocks: { key: string; labelRu: string; weight: number; done: boolean; actionRu: string }[];
}

export default function ResultsPage() {
  const [recs, setRecs] = React.useState<Recommendation[] | null>(null);
  const [riasec, setRiasec] = React.useState<RiasecVector | null>(null);
  const [confidence, setConfidence] = React.useState<Confidence | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/career/profile"),
        fetch("/api/career/recommendations"),
      ]);
      const p = await pRes.json();
      const r = await rRes.json();
      setRiasec(p.profile?.riasec ?? null);
      setConfidence(p.confidence ?? null);
      setRecs(r.recommendations ?? []);
      if (r.recommendations?.length) setOpenId(r.recommendations[0].majorId);
    })();
  }, []);

  if (!recs || !riasec) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="mono-label">Читаю лист профиля…</span>
      </main>
    );
  }

  if (recs.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6">
        <p className="text-[color:var(--color-muted)]">Лист профиля ещё не заполнен.</p>
        <ActionButton asChild size="lg">
          <Link href="/navigator">Пройти навигатор</Link>
        </ActionButton>
      </main>
    );
  }

  const open = recs.find((r) => r.majorId === openId) ?? null;

  return (
    <>
      <Terrain riasec={riasec} />

      <main className="relative z-[1] min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {/* ── Sheet header ─────────────────────────────────── */}
          <div className="sheet-head">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[color:var(--color-accent)]">
              ЛИСТ 01
            </span>
            <span className="mono-label">Твой рельеф</span>
            <span className="mono-label ml-auto">
              КОД {hollandCode(riasec)} · СЕЧЕНИЕ 4 ОСИ
            </span>
          </div>

          <h1 className="display-tight mt-6 text-[length:var(--text-fluid-3xl)] text-balance">
            Пять направлений
            <br />
            на твоей местности
          </h1>
          <p className="mt-4 max-w-[60ch] text-[length:var(--text-fluid-base)] text-[color:var(--color-muted)]">
            Это гипотезы, а не приговор. Порядок посчитан арифметикой по твоему профилю —
            каждую строчку расчёта можно развернуть и оспорить.
          </p>

          {/* ── Profile plates ───────────────────────────────── */}
          <div className="mt-9 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <Plate label="Профиль интересов">
              <HollandBadge riasec={riasec} />
              <div className="mt-4">
                <RiasecBars riasec={riasec} />
              </div>
            </Plate>

            <Plate label="Роза интересов">
              <div className="flex items-center justify-center py-2">
                <CompassRose riasec={riasec} />
              </div>
            </Plate>
          </div>

          {confidence && (
            <div className="mt-4">
              <Plate label="Насколько можно доверять расчёту">
                <ConfidenceMeter score={confidence.score} blocks={confidence.blocks} />
              </Plate>
            </div>
          )}

          {/* ── Ranked deck ──────────────────────────────────── */}
          <div className="mt-12">
            <SheetHead no="02" title="Направления" note="клик — развернуть разбор" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recs.map((rec) => {
                const active = rec.majorId === openId;
                return (
                  <motion.button
                    key={rec.majorId}
                    onClick={() => setOpenId(active ? null : rec.majorId)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={`plate relative p-5 text-left ${
                      active ? "border-[color:var(--color-accent)]" : ""
                    }`}
                  >
                    <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.14em] text-[color:var(--color-accent)]">
                      {String(rec.rank).padStart(2, "0")}
                    </span>
                    <span className="mono-data absolute right-5 top-5 text-[1.5rem] font-bold leading-none">
                      {rec.score}
                    </span>

                    <h2 className="mt-2 text-[length:var(--text-fluid-base)] font-extrabold leading-tight tracking-[-0.01em]">
                      {rec.major.nameRu}
                    </h2>
                    <span className="mono-label mt-1.5 block">
                      {FIELD_LABELS[rec.major.field] ?? rec.major.field} · вклад 4 осей
                    </span>

                    <span className="mt-4 block h-[3px] bg-[color:var(--color-border)]">
                      <motion.span
                        className="block h-full bg-[color:var(--color-accent)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.score}%` }}
                        transition={{ duration: 0.8, ease: EASE, delay: rec.rank * 0.05 }}
                      />
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* ── Section drawing for the open major ─────────── */}
            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  key={open.majorId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="plate mt-4 border-[color:var(--color-accent)] p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="min-w-0">
                      <h3 className="display-tight text-[length:var(--text-fluid-xl)]">
                        {open.major.nameRu}
                      </h3>
                      <p className="mt-3 max-w-[58ch] text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                        {open.major.descriptionRu}
                      </p>
                    </div>
                    <CoordinateStamp
                      name={open.major.nameRu}
                      code={hollandCode(riasec)}
                      score={open.score}
                      section="4 ОСИ"
                      className="shrink-0"
                    />
                  </div>

                  {open.narrative && (
                    <p className="editorial mt-6 border-l-2 border-[color:var(--color-accent)] pl-5 text-[length:var(--text-fluid-lg)] leading-snug">
                      {open.narrative}
                    </p>
                  )}

                  <div className="mt-8 grid gap-8 lg:grid-cols-[auto_1fr]">
                    <div>
                      <div className="mono-label mb-3">Из чего сложился балл</div>
                      <MatchDial score={open.score} breakdown={open.breakdown} />
                    </div>

                    <div>
                      <div className="mono-label mb-3">Почему именно это</div>
                      <EvidenceList evidence={open.evidence as Evidence[]} />

                      <div className="mono-label mb-3 mt-7">Кем можно работать</div>
                      <ul className="m-0 list-none p-0">
                        {open.major.careers.map((c) => (
                          <li
                            key={c.title}
                            className="flex items-baseline justify-between gap-4 border-b border-dashed border-[color:var(--color-border)] py-2 text-[length:var(--text-fluid-sm)] last:border-b-0"
                          >
                            <span>{c.titleRu}</span>
                            {c.medianSalaryUsd > 0 && (
                              <span className="mono-data shrink-0 text-[11px] text-[color:var(--color-faint)]">
                                ${(c.medianSalaryUsd / 1000).toFixed(0)}k/год
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <ActionButton asChild size="lg">
                      <Link href={`/major/${open.majorId}`}>Разобрать маршрут</Link>
                    </ActionButton>
                    <ActionButton asChild variant="glass" size="lg">
                      <Link href="/feed">Университеты</Link>
                    </ActionButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-[color:var(--color-text)] pt-5">
            <span className="mono-label">Compass · лист профиля 01</span>
            <span className="mono-label">Расчёт воспроизводим · AI объясняет, но не решает</span>
          </footer>
        </div>
      </main>
    </>
  );
}
