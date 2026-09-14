"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import type { RiasecVector } from "@/lib/career/types";

interface Turn {
  role: "assistant" | "user";
  content: string;
}

export interface InterviewResult {
  summary: string;
  riasecDelta: Partial<RiasecVector>;
  observations: string[];
}

export function StepInterview({
  onComplete,
  onNext,
  result,
}: {
  onComplete: (r: InterviewResult) => void;
  onNext: () => void;
  result: InterviewResult | null;
}) {
  const [history, setHistory] = React.useState<Turn[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState({ n: 0, total: 7 });
  const started = React.useRef(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const ask = React.useCallback(async (turns: Turn[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: turns }),
      });
      const data = await res.json();

      if (data.done) {
        onComplete({
          summary: data.summary,
          riasecDelta: data.riasecDelta ?? {},
          observations: data.observations ?? [],
        });
      } else {
        setProgress({ n: data.questionNumber, total: data.total });
        setHistory([...turns, { role: "assistant", content: data.question }]);
      }
    } finally {
      setLoading(false);
    }
  }, [onComplete]);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ask([]);
  }, [ask]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  function send() {
    const text = draft.trim();
    if (!text || loading) return;
    const turns: Turn[] = [...history, { role: "user", content: text }];
    setHistory(turns);
    setDraft("");
    void ask(turns);
  }

  if (result) {
    return (
      <StepShell
        eyebrow="Шаг 7 из 7"
        title="Что услышала система"
        subtitle="Это интерпретация твоих ответов, а не приговор. Она добавляется к результатам анкеты, а не заменяет их."
        footer={<ActionButton size="lg" onClick={onNext}>Собрать мой маршрут</ActionButton>}
      >
        <Card>
          <p className="text-[length:var(--text-fluid-base)] text-[color:var(--color-text)]">
            {result.summary}
          </p>
          {result.observations.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.observations.map((o, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]"
                >
                  <span className="text-[color:var(--color-accent)]">—</span>
                  {o}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </StepShell>
    );
  }

  return (
    <StepShell
      eyebrow="Шаг 7 из 7"
      title="Разговор"
      subtitle={`Разговор ведёт система: она читает твой профиль, цепляется за сказанное и сама решает, куда копать и когда остановиться. Вопрос ${progress.n}, не больше ${progress.total}.`}
    >
      <div className="space-y-3">
        {history.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={t.role === "assistant" ? "" : "flex justify-end"}
          >
            <div
              className={
                t.role === "assistant"
                  ? "max-w-[85%] rounded-2xl rounded-tl-sm border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-[length:var(--text-fluid-base)]"
                  : "max-w-[85%] rounded-2xl rounded-tr-sm bg-[color:var(--color-accent)] px-4 py-3 text-[length:var(--text-fluid-base)] text-white"
              }
            >
              {t.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
            думает…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-6 flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={3}
          disabled={loading}
          placeholder="Отвечай развёрнуто — короткие ответы система почти не может интерпретировать"
          className="flex-1 resize-none rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-3 text-[length:var(--text-fluid-sm)] outline-none focus:border-[color:var(--color-accent)] disabled:opacity-60"
        />
        <ActionButton size="lg" onClick={send} disabled={loading || !draft.trim()}>
          Ответить
        </ActionButton>
      </div>
    </StepShell>
  );
}
