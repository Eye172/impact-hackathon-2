"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { Terrain } from "@/components/compass/terrain";
import { EASE, SheetHead } from "@/components/compass/primitives";
import { computeRS, type RSDetail } from "@/lib/rs-score";
import { useSessionStore } from "@/store/useSessionStore";
import type { UserPreferenceData } from "@/lib/preference-categories";
import type { IUniversityProfile } from "@/lib/types";
import type { RiasecVector } from "@/lib/career/types";

interface Row {
  university: IUniversityProfile;
  detail: RSDetail;
}

export default function FeedPage() {
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);

  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [riasec, setRiasec] = React.useState<RiasecVector | null>(null);

  React.useEffect(() => {
    void (async () => {
      const [unis, prefs, career] = await Promise.all([
        fetch("/api/universities")
          .then((r) => (r.ok ? (r.json() as Promise<IUniversityProfile[]>) : []))
          .catch(() => [] as IUniversityProfile[]),
        fetch("/api/preferences")
          .then((r) => (r.ok ? (r.json() as Promise<UserPreferenceData[]>) : []))
          .catch(() => [] as UserPreferenceData[]),
        fetch("/api/career/profile")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      setRiasec(career?.profile?.riasec ?? null);

      const snap = {
        gpa: profile.gpa,
        ielts: profile.ielts,
        sat: profile.sat,
        budgetUsdPerYear: profile.budgetUsdPerYear,
      };

      const computed: Row[] = unis.map((u) => {
        const detail = computeRS(u, prefs, snap);
        // With no preferences set yet, fall back to the catalogue score.
        if (detail.score === 0) {
          detail.score = u.recommendationScore || u.fitScore || 0;
        }
        return { university: u, detail };
      });

      computed.sort((a, b) => b.detail.score - a.detail.score);
      setRows(computed);
      if (computed.length) setOpenId(computed[0].university.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="mono-label">Считаю совпадения по университетам…</span>
      </main>
    );
  }

  const open = rows.find((r) => r.university.id === openId) ?? null;

  return (
    <>
      <Terrain riasec={riasec} />

      <main className="relative z-[1] min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="sheet-head">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[color:var(--color-accent)]">
              ЛИСТ 03
            </span>
            <span className="mono-label">Университеты</span>
            <span className="mono-label ml-auto">{rows.length} в каталоге</span>
          </div>

          <h1 className="display-tight mt-6 text-[length:var(--text-fluid-3xl)] text-balance">
            Куда это ведёт
          </h1>
          <p className="mt-4 max-w-[60ch] text-[length:var(--text-fluid-base)] text-[color:var(--color-muted)]">
            Порядок считает тот же движок, что и направления: твои приоритеты умножаются на
            то, насколько университет им отвечает. Совпадения и расхождения показаны
            построчно.
          </p>

          <div className="mt-10">
            <SheetHead no="01" title="Ранжирование" note="клик — развернуть расчёт" />

            <div className="space-y-2">
              {rows.map((row, i) => {
                const u = row.university;
                const active = u.id === openId;
                return (
                  <div key={u.id}>
                    <motion.button
                      onClick={() => setOpenId(active ? null : u.id)}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className={`plate flex w-full flex-wrap items-center gap-5 px-5 py-4 text-left ${
                        active ? "border-[color:var(--color-accent)]" : ""
                      }`}
                    >
                      <span className="mono-label w-7 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-tight">{u.name}</span>
                        <span className="mono-label mt-1 block">
                          {u.city}, {u.country}
                          {u.worldRank ? ` · #${u.worldRank} в мире` : ""}
                        </span>
                      </span>

                      <span className="flex w-40 shrink-0 items-center gap-3">
                        <span className="h-[7px] flex-1 bg-[color:var(--color-border)]">
                          <motion.span
                            className="block h-full bg-[color:var(--color-accent)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${row.detail.score}%` }}
                            transition={{ duration: 0.7, ease: EASE, delay: i * 0.04 }}
                          />
                        </span>
                        <span className="mono-data w-8 text-right text-[1.1rem] font-bold">
                          {row.detail.score}
                        </span>
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {active && open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="plate mt-2 border-[color:var(--color-accent)] p-6">
                            <div className="grid gap-7 md:grid-cols-2">
                              <div>
                                <div className="mono-label mb-3">Что совпало</div>
                                <ul className="m-0 list-none p-0">
                                  {open.detail.matches.length === 0 && (
                                    <li className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                                      Приоритеты ещё не заданы — задай их в профиле,
                                      и расчёт станет твоим.
                                    </li>
                                  )}
                                  {open.detail.matches.map((m) => (
                                    <li
                                      key={m.category}
                                      className="grid grid-cols-[16px_1fr_auto] gap-3 border-b border-dashed border-[color:var(--color-border)] py-2 text-[length:var(--text-fluid-sm)] last:border-b-0"
                                    >
                                      <span className="font-[family-name:var(--font-mono)] font-bold text-[color:var(--color-accent)]">
                                        ✓
                                      </span>
                                      <span className="text-[color:var(--color-muted)]">
                                        {m.label.replace(/^[✓✗⚠]\s*/, "")}
                                      </span>
                                      <span className="mono-label whitespace-nowrap pt-0.5">
                                        вес {m.weight}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <div className="mono-label mb-3">Что расходится</div>
                                <ul className="m-0 list-none p-0">
                                  {open.detail.mismatches.length === 0 && (
                                    <li className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                                      Расхождений по заданным приоритетам нет.
                                    </li>
                                  )}
                                  {open.detail.mismatches.map((m) => (
                                    <li
                                      key={m.category}
                                      className="grid grid-cols-[16px_1fr_auto] gap-3 border-b border-dashed border-[color:var(--color-border)] py-2 text-[length:var(--text-fluid-sm)] last:border-b-0"
                                    >
                                      <span className="font-[family-name:var(--font-mono)] font-bold text-[color:var(--color-crimson)]">
                                        ✗
                                      </span>
                                      <span className="text-[color:var(--color-muted)]">
                                        {m.label.replace(/^[✓✗⚠]\s*/, "")}
                                      </span>
                                      <span className="mono-label whitespace-nowrap pt-0.5">
                                        вес {m.weight}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="mt-7 flex flex-wrap gap-3">
                              <ActionButton
                                size="lg"
                                onClick={() => router.push(`/university/${open.university.id}`)}
                              >
                                Открыть профиль университета
                              </ActionButton>
                              <ActionButton asChild variant="glass" size="lg">
                                <Link href="/navigator/results">К направлениям</Link>
                              </ActionButton>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-[color:var(--color-text)] pt-5">
            <span className="mono-label">Compass · лист 03</span>
            <span className="mono-label">Приоритеты настраиваются в профиле</span>
          </footer>
        </div>
      </main>
    </>
  );
}
