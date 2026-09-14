"use client";

import * as React from "react";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import { allSkills } from "@/lib/career/majors";
import type { StudentSkill } from "@/lib/career/types";

const LEVELS = ["нет", "слабо", "базово", "уверенно", "сильно", "экспертно"];

export function StepSkills({
  value,
  onChange,
  onNext,
}: {
  value: StudentSkill[];
  onChange: (v: StudentSkill[]) => void;
  onNext: () => void;
}) {
  const skills = React.useMemo(() => allSkills(), []);
  const levels = new Map(value.map((s) => [s.key, s.level]));

  function setLevel(key: string, level: number) {
    const next = value.filter((s) => s.key !== key);
    next.push({ key, level });
    onChange(next);
  }

  const hard = skills.filter((s) => s.type === "hard");
  const soft = skills.filter((s) => s.type === "soft");
  const enough = value.length >= 8;

  function renderGroup(list: typeof skills, title: string) {
    return (
      <div>
        <h3 className="mb-3 font-medium text-[color:var(--color-text)]">{title}</h3>
        <div className="space-y-2">
          {list.map((s) => (
            <Card key={s.key} selected={levels.has(s.key)} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[length:var(--text-fluid-sm)]">{s.labelRu}</span>
                <div className="flex gap-1">
                  {LEVELS.map((label, lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      title={label}
                      onClick={() => setLevel(s.key, lvl)}
                      className={`h-7 w-7 text-[length:var(--text-fluid-xs)] font-semibold ease-snappy transition-colors ${
                        levels.get(s.key) === lvl
                          ? "bg-[color:var(--color-accent)] text-white"
                          : "bg-[color:var(--color-tag-neutral)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-tag-match)]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StepShell
      eyebrow="Шаг 4 из 7"
      title="Что у тебя уже есть"
      subtitle="Оцени честно: 0 — не про меня, 5 — делаю лучше большинства ровесников. Заниженная оценка просто раздует список того, что «надо подтянуть»."
      footer={
        <>
          <ActionButton size="lg" disabled={!enough} onClick={onNext}>
            Дальше
          </ActionButton>
          <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            оценено {value.length}, нужно минимум 8
          </span>
        </>
      }
    >
      <div className="space-y-8">
        {renderGroup(hard, "Профессиональные навыки")}
        {renderGroup(soft, "Личные качества")}
      </div>
    </StepShell>
  );
}
