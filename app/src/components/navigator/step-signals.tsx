"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import { RIASEC_META } from "@/lib/career/riasec";
import type { CulturalSignal, RiasecKey } from "@/lib/career/types";

export function StepSignals({
  signals,
  onChange,
  onNext,
}: {
  signals: CulturalSignal[];
  onChange: (v: CulturalSignal[]) => void;
  onNext: () => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [titles, setTitles] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  function addTitle() {
    const t = draft.trim();
    if (!t || titles.includes(t) || titles.length >= 6) return;
    setTitles([...titles, t]);
    setDraft("");
  }

  async function analyse() {
    if (titles.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/career/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles }),
      });
      const data = (await res.json()) as { signals: CulturalSignal[] };
      onChange(data.signals ?? []);
    } finally {
      setLoading(false);
    }
  }

  function setConfirmed(title: string, confirmed: boolean) {
    onChange(signals.map((s) => (s.title === title ? { ...s, confirmed } : s)));
  }

  const analysed = signals.length > 0;
  const decided = analysed && signals.every((s) => s.confirmed !== null);

  return (
    <StepShell
      eyebrow="Шаг 6 из 7"
      title="То, во что ты залипаешь"
      subtitle="Игры, блогеры, каналы, книги. Система разберёт, какой тип мышления за этим стоит, и покажет свою логику — ты сам решишь, попала она или нет."
      footer={
        analysed ? (
          <>
            <ActionButton size="lg" disabled={!decided} onClick={onNext}>
              Дальше
            </ActionButton>
            {!decided && (
              <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Подтверди или отклони каждую карточку
              </span>
            )}
          </>
        ) : (
          <>
            <ActionButton size="lg" disabled={titles.length === 0 || loading} onClick={analyse}>
              {loading ? "Разбираю…" : "Разобрать"}
            </ActionButton>
            <button
              type="button"
              onClick={onNext}
              className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
            >
              Пропустить шаг
            </button>
          </>
        )
      }
    >
      {!analysed && (
        <div>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTitle();
                }
              }}
              placeholder="например: Factorio, Kurzgesagt, 3Blue1Brown"
              className="flex-1 border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-2.5 text-[length:var(--text-fluid-sm)] outline-none focus:border-[color:var(--color-accent)]"
            />
            <ActionButton variant="glass" onClick={addTitle} disabled={titles.length >= 6}>
              Добавить
            </ActionButton>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {titles.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTitles(titles.filter((x) => x !== t))}
                className="bg-[color:var(--color-tag-match)] px-3.5 py-1.5 text-[length:var(--text-fluid-sm)] text-[color:var(--color-accent)] ease-snappy hover:bg-[color:var(--color-tag-match)]"
              >
                {t} ×
              </button>
            ))}
          </div>

          {titles.length === 0 && (
            <p className="mt-6 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
              Добавь от одного до шести примеров.
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {analysed && (
          <div className="space-y-3">
            {signals.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card selected={s.confirmed === true}>
                  <p className="font-display text-[length:var(--text-fluid-lg)] text-[color:var(--color-text)]">
                    {s.title}
                  </p>

                  {s.constructs.length > 0 ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.constructs.map((c) => (
                          <span
                            key={c}
                            className="bg-[color:var(--color-tag-match)] px-3 py-1 text-[length:var(--text-fluid-xs)] text-[color:var(--color-accent)]"
                          >
                            {c}
                          </span>
                        ))}
                        {(Object.keys(s.riasecHint) as RiasecKey[]).map((k) => (
                          <span
                            key={k}
                            className="bg-[color:var(--color-accent)] px-3 py-1 text-[length:var(--text-fluid-xs)] text-white"
                          >
                            {RIASEC_META[k].shortRu} +{s.riasecHint[k]}
                          </span>
                        ))}
                      </div>

                      <p className="mt-3 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                        {s.rationaleRu}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmed(s.title, true)}
                          className={`px-4 py-1.5 text-[length:var(--text-fluid-sm)] ease-snappy transition-colors ${
                            s.confirmed === true
                              ? "bg-[color:var(--color-accent)] text-white"
                              : "border border-[color:var(--color-border-strong)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                          }`}
                        >
                          Да, это про меня
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmed(s.title, false)}
                          className={`px-4 py-1.5 text-[length:var(--text-fluid-sm)] ease-snappy transition-colors ${
                            s.confirmed === false
                              ? "bg-[color:var(--color-crimson)] text-white"
                              : "border border-[color:var(--color-border-strong)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-no-match)]"
                          }`}
                        >
                          Мимо
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                      {s.rationaleRu || "Не удалось разобрать этот пример — он не будет учтён."}
                      <button
                        type="button"
                        onClick={() => setConfirmed(s.title, false)}
                        className="ml-2 underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        Понятно
                      </button>
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}

            <p className="pt-2 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Отклонённые карточки не влияют на расчёт — система не настаивает на своей догадке.
            </p>
          </div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
