"use client";

import * as React from "react";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import { RIASEC_STATEMENTS } from "@/lib/career/riasec";

const SCALE = [
  { v: 1, label: "Совсем не про меня" },
  { v: 2, label: "Скорее нет" },
  { v: 3, label: "Нейтрально" },
  { v: 4, label: "Скорее да" },
  { v: 5, label: "Точно про меня" },
];

export function StepInterests({
  value,
  onChange,
  onNext,
}: {
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
  onNext: () => void;
}) {
  const answered = Object.keys(value).length;
  const total = RIASEC_STATEMENTS.length;
  const complete = answered === total;

  return (
    <StepShell
      eyebrow="Шаг 2 из 7"
      title="Как ты любишь работать"
      subtitle="Это короткая версия Interest Profiler по модели Холланда — той же, на которой построена база профессий O*NET. Отвечай про то, как есть сейчас, а не как «правильно»."
      footer={
        <>
          <ActionButton size="lg" disabled={!complete} onClick={onNext}>
            Дальше
          </ActionButton>
          <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            {answered} из {total}
          </span>
        </>
      }
    >
      <div className="space-y-3">
        {RIASEC_STATEMENTS.map((st, i) => (
          <Card key={st.id} selected={Boolean(value[st.id])}>
            <p className="mb-3 text-[length:var(--text-fluid-sm)] text-[color:var(--color-text)]">
              <span className="mr-2 text-[color:var(--color-muted)]">{i + 1}.</span>
              {st.textRu}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SCALE.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  title={s.label}
                  onClick={() => onChange({ ...value, [st.id]: s.v })}
                  className={`px-3 py-1.5 text-[length:var(--text-fluid-xs)] ease-snappy transition-colors ${
                    value[st.id] === s.v
                      ? "bg-[color:var(--color-accent)] text-white"
                      : "bg-[color:var(--color-tag-neutral)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </StepShell>
  );
}
