"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LockKeyhole, Route, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/ui/button";

export const REQUIRED_CAREER_STEPS = [
  "basics",
  "interests",
  "values",
  "skills",
  "portrait",
  "signals",
  "interview",
] as const;

export function isUniversityRoute(pathname: string) {
  return ["/feed", "/search", "/timeline", "/university"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function CareerLockedScreen({ completed }: { completed: number }) {
  const progress = Math.round((completed / REQUIRED_CAREER_STEPS.length) * 100);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 route-grid opacity-60" />
      <div className="relative mx-auto max-w-5xl">
        <div className="sheet-head">
          <span className="mono-label text-[color:var(--color-accent)]">Контрольная точка · 02</span>
          <span className="mono-label ml-auto">доступ закрыт до диагностики</span>
        </div>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <section>
            <div className="mb-7 flex items-center gap-3 text-[color:var(--color-accent)]">
              <span className="grid h-11 w-11 place-items-center border border-current bg-[color:var(--color-tag-match)]">
                <LockKeyhole size={20} />
              </span>
              <span className="mono-label text-[color:var(--color-accent)]">Сначала карта, потом точки</span>
            </div>

            <h1 className="display-tight text-[length:var(--text-fluid-3xl)] text-balance">
              Университеты пока скрыты
            </h1>
            <p className="mt-5 max-w-[58ch] text-[length:var(--text-fluid-lg)] leading-relaxed text-[color:var(--color-muted)]">
              Без профиля каталог превращается в случайный рейтинг. Пройди профориентацию —
              и мы откроем вузы уже с объяснимым совпадением, рисками и следующим шагом.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ActionButton asChild size="lg">
                <Link href="/navigator">Продолжить профориентацию</Link>
              </ActionButton>
              <span className="mono-label">{completed} из 7 слоёв собрано</span>
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="plate p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="mono-label">Надёжность карты</span>
                <div className="mono-data mt-1 text-4xl font-black">{progress}%</div>
              </div>
              <Route className="text-[color:var(--color-accent)]" size={38} strokeWidth={1.2} />
            </div>

            <div className="mt-6 h-2 bg-[color:var(--color-border)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[color:var(--color-accent)]"
              />
            </div>

            <div className="mt-7 grid grid-cols-7 gap-1">
              {REQUIRED_CAREER_STEPS.map((step, index) => (
                <div key={step} className="text-center">
                  <div
                    className={`mx-auto grid h-8 w-full place-items-center border font-[family-name:var(--font-mono)] text-[10px] font-bold ${
                      index < completed
                        ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
                        : "border-[color:var(--color-border-strong)] text-[color:var(--color-faint)]"
                    }`}
                  >
                    {index < completed ? "✓" : String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex gap-3 border-t border-dashed border-[color:var(--color-border)] pt-5">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" />
              <p className="text-[length:var(--text-fluid-sm)] leading-relaxed text-[color:var(--color-muted)]">
                ИИ объясняет результат, но рейтинг считает воспроизводимый движок по RIASEC,
                ценностям, предметам и навыкам.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
