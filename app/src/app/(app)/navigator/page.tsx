"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ProgressRail } from "@/components/navigator/shell";
import { Terrain } from "@/components/compass/terrain";
import { StepBasics, type BasicsValue } from "@/components/navigator/step-basics";
import { StepInterests } from "@/components/navigator/step-interests";
import { StepValues } from "@/components/navigator/step-values";
import { StepSkills } from "@/components/navigator/step-skills";
import { StepPortrait } from "@/components/navigator/step-portrait";
import { StepSignals } from "@/components/navigator/step-signals";
import {
  StepInterview,
  type InterviewResult,
} from "@/components/navigator/step-interview";
import { addRiasec, normalizeRiasec, scoreStatements } from "@/lib/career/riasec";
import type {
  CulturalSignal,
  RankedValue,
  RiasecVector,
  SelfPortrait,
  StudentSkill,
} from "@/lib/career/types";

const STEPS = [
  { key: "basics", label: "Факты" },
  { key: "interests", label: "Интересы" },
  { key: "values", label: "Ценности" },
  { key: "skills", label: "Навыки" },
  { key: "portrait", label: "Про себя" },
  { key: "signals", label: "Увлечения" },
  { key: "interview", label: "Разговор" },
];

export default function NavigatorPage() {
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const [basics, setBasics] = React.useState<BasicsValue>({
    gradeLevel: 10,
    subjects: [],
    countries: [],
    budgetUsdPerYear: null,
  });
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [values, setValues] = React.useState<RankedValue[]>([]);
  const [skills, setSkills] = React.useState<StudentSkill[]>([]);
  const [portrait, setPortrait] = React.useState<SelfPortrait | null>(null);
  const [signals, setSignals] = React.useState<CulturalSignal[]>([]);
  const [interview, setInterview] = React.useState<InterviewResult | null>(null);

  /** Survey baseline, then confirmed cultural signals, then interview — in that order. */
  function buildRiasec(): RiasecVector {
    let v = scoreStatements(answers);
    for (const s of signals) {
      if (s.confirmed) v = addRiasec(v, s.riasecHint);
    }
    if (interview) v = addRiasec(v, interview.riasecDelta);
    return normalizeRiasec(v);
  }

  async function finish() {
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await fetch("/api/career/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel: basics.gradeLevel,
          subjects: basics.subjects,
          countries: basics.countries,
          budgetUsdPerYear: basics.budgetUsdPerYear,
          riasec: buildRiasec(),
          values,
          skills,
          culturalSignals: signals,
          selfPortrait: portrait,
          interviewSummary: interview?.summary ?? "",
          completedSteps: STEPS.map((s) => s.key),
        }),
      });
      if (!saved.ok) throw new Error("профиль не сохранился");

      const scored = await fetch("/api/career/recommendations", { method: "POST" });
      if (!scored.ok) throw new Error("расчёт не прошёл");

      // A full navigation, not router.push: the wizard holds a lot of state and
      // a soft transition here has been seen to lose the redirect when the dev
      // server hot-reloads mid-save.
      window.location.assign("/navigator/results");
    } catch (err) {
      setSaving(false);
      setSaveError(
        err instanceof Error
          ? `Не получилось собрать маршрут: ${err.message}. Попробуй ещё раз.`
          : "Не получилось собрать маршрут. Попробуй ещё раз.",
      );
    }
  }

  return (
    <>
      <Terrain riasec={Object.keys(answers).length ? buildRiasec() : null} />
      <main className="relative z-[1] min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <ProgressRail steps={STEPS} current={step} onJump={setStep} />
        <div className="mt-3 grid grid-cols-2 gap-px border border-[color:var(--color-border)] bg-[color:var(--color-border)] sm:grid-cols-4">
          {[
            ["01", "RIASEC", "интересы"],
            ["02", "Шварц", "ценности"],
            ["03", "Skills gap", "самооценка"],
            ["04", "AI interview", "контекст"],
          ].map(([no, method, layer]) => (
            <div key={method} className="bg-[color:var(--color-surface-frosted)] px-3 py-2 backdrop-blur-sm">
              <span className="mono-label text-[color:var(--color-accent)]">{no}</span>
              <span className="ml-2 text-[11px] font-bold">{method}</span>
              <span className="mono-label mt-0.5 block">{layer}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepBasics
              key="basics"
              value={basics}
              onChange={setBasics}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepInterests
              key="interests"
              value={answers}
              onChange={setAnswers}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepValues
              key="values"
              completed={values.length > 0}
              onComplete={setValues}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepSkills
              key="skills"
              value={skills}
              onChange={setSkills}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <StepPortrait
              key="portrait"
              value={portrait}
              onChange={setPortrait}
              onNext={async () => {
                // Persist before the next steps run: the signal analyser and the
                // interviewer both read this student from the database.
                await fetch("/api/career/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    gradeLevel: basics.gradeLevel,
                    subjects: basics.subjects,
                    countries: basics.countries,
                    budgetUsdPerYear: basics.budgetUsdPerYear,
                    riasec: buildRiasec(),
                    values,
                    skills,
                    selfPortrait: portrait,
                  }),
                });
                setStep(5);
              }}
            />
          )}
          {step === 5 && (
            <StepSignals
              key="signals"
              signals={signals}
              onChange={setSignals}
              onNext={() => setStep(6)}
            />
          )}
          {step === 6 && (
            <StepInterview
              key="interview"
              result={interview}
              onComplete={setInterview}
              onNext={finish}
            />
          )}
        </AnimatePresence>

        {saving && (
          <p className="mono-label mt-8 text-center">
            Считаю совпадения по специальностям…
          </p>
        )}

        {saveError && (
          <p className="mx-auto mt-8 max-w-3xl border-l-2 border-[color:var(--color-crimson)] pl-4 text-[length:var(--text-fluid-sm)] text-[color:var(--color-crimson)]">
            {saveError}
          </p>
        )}
      </div>
      </main>
    </>
  );
}
