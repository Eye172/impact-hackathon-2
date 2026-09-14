"use client";

import * as React from "react";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import { SUBJECT_LABELS, ALL_SUBJECT_KEYS } from "@/lib/career/majors";
import type { SubjectGrade } from "@/lib/career/types";

/** Value is the country name as stored in the university catalogue. */
const COUNTRIES: { value: string; labelRu: string }[] = [
  { value: "Kazakhstan", labelRu: "Казахстан" },
  { value: "USA", labelRu: "США" },
  { value: "UK", labelRu: "Великобритания" },
  { value: "Germany", labelRu: "Германия" },
  { value: "Switzerland", labelRu: "Швейцария" },
  { value: "Singapore", labelRu: "Сингапур" },
  { value: "Japan", labelRu: "Япония" },
  { value: "China", labelRu: "Китай" },
];

export interface BasicsValue {
  gradeLevel: number;
  subjects: SubjectGrade[];
  countries: string[];
  budgetUsdPerYear: number | null;
}

export function StepBasics({
  value,
  onChange,
  onNext,
}: {
  value: BasicsValue;
  onChange: (v: BasicsValue) => void;
  onNext: () => void;
}) {
  const gradeMap = new Map(value.subjects.map((s) => [s.key, s.grade]));

  function setGrade(key: string, grade: number) {
    const next = value.subjects.filter((s) => s.key !== key);
    if (grade > 0) next.push({ key, grade });
    onChange({ ...value, subjects: next });
  }

  function toggleCountry(c: string) {
    const has = value.countries.includes(c);
    onChange({
      ...value,
      countries: has ? value.countries.filter((x) => x !== c) : [...value.countries, c],
    });
  }

  const enoughSubjects = value.subjects.length >= 4;

  return (
    <StepShell
      eyebrow="Шаг 1 из 7"
      title="Начнём с фактов"
      subtitle="Оценки нужны не для оценки тебя, а чтобы понять, какие специальности реально досягаемы и что придётся подтянуть."
      footer={
        <>
          <ActionButton size="lg" disabled={!enoughSubjects} onClick={onNext}>
            Дальше
          </ActionButton>
          {!enoughSubjects && (
            <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
              Отметь оценки хотя бы по 4 предметам
            </span>
          )}
        </>
      }
    >
      <div className="space-y-8">
        <div>
          <h3 className="mb-3 font-medium text-[color:var(--color-text)]">Класс</h3>
          <div className="flex gap-2">
            {[9, 10, 11].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...value, gradeLevel: g })}
                className={`px-5 py-2 text-[length:var(--text-fluid-sm)] font-medium ease-snappy transition-colors ${
                  value.gradeLevel === g
                    ? "bg-[color:var(--color-accent)] text-white"
                    : "border border-[color:var(--color-border-strong)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                }`}
              >
                {g} класс
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-1 font-medium text-[color:var(--color-text)]">Оценки по предметам</h3>
          <p className="mb-3 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            Только те, что помнишь. Пропущенные предметы просто не участвуют в расчёте.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_SUBJECT_KEYS.map((key) => (
              <Card key={key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-[length:var(--text-fluid-sm)]">{SUBJECT_LABELS[key]}</span>
                <div className="flex gap-1">
                  {[2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(key, gradeMap.get(key) === g ? 0 : g)}
                      className={`h-8 w-8 text-[length:var(--text-fluid-xs)] font-semibold ease-snappy transition-colors ${
                        gradeMap.get(key) === g
                          ? "bg-[color:var(--color-accent)] text-white"
                          : "bg-[color:var(--color-tag-neutral)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-medium text-[color:var(--color-text)]">
            Где рассматриваешь учёбу
          </h3>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleCountry(c.value)}
                className={`px-3.5 py-1.5 text-[length:var(--text-fluid-sm)] ease-snappy transition-colors ${
                  value.countries.includes(c.value)
                    ? "bg-[color:var(--color-accent)] text-white"
                    : "border border-[color:var(--color-border-strong)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                }`}
              >
                {c.labelRu}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-medium text-[color:var(--color-text)]">
            Бюджет на год обучения, USD
          </h3>
          <input
            type="number"
            inputMode="numeric"
            placeholder="например, 8000 — можно пропустить"
            value={value.budgetUsdPerYear ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                budgetUsdPerYear: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full max-w-xs border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-2.5 text-[length:var(--text-fluid-sm)] outline-none focus:border-[color:var(--color-accent)]"
          />
        </div>
      </div>
    </StepShell>
  );
}
