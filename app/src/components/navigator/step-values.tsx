"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import {
  VALUE_CARDS,
  VALUE_MAP,
  FUNNEL_TOP_10,
  FUNNEL_TOP_5,
  buildPairs,
  rankFromDuels,
} from "@/lib/career/values";
import type { RankedValue } from "@/lib/career/types";

type Phase = "cut10" | "cut5" | "duels";

export function StepValues({
  onComplete,
  onNext,
  completed,
}: {
  onComplete: (values: RankedValue[]) => void;
  onNext: () => void;
  completed: boolean;
}) {
  const [phase, setPhase] = React.useState<Phase>("cut10");
  const [pool10, setPool10] = React.useState<string[]>([]);
  const [pool5, setPool5] = React.useState<string[]>([]);
  const [duelIndex, setDuelIndex] = React.useState(0);
  const [wins, setWins] = React.useState<Record<string, string[]>>({});
  const [ranked, setRanked] = React.useState<RankedValue[]>([]);

  const pairs = React.useMemo(() => (pool5.length ? buildPairs(pool5) : []), [pool5]);

  function toggle(list: string[], setList: (v: string[]) => void, key: string, max: number) {
    if (list.includes(key)) setList(list.filter((k) => k !== key));
    else if (list.length < max) setList([...list, key]);
  }

  function pickWinner(winner: string, loser: string) {
    const next = { ...wins, [winner]: [...(wins[winner] ?? []), loser] };
    setWins(next);

    if (duelIndex + 1 >= pairs.length) {
      const result = rankFromDuels(pool5, next);
      const residual: RankedValue[] = pool10
        .filter((k) => !pool5.includes(k))
        .map((k) => ({ key: k, rank: 99, weight: 0.2 }));
      const final = [...result, ...residual];
      setRanked(final);
      onComplete(final);
    }
    setDuelIndex(duelIndex + 1);
  }

  /* ── Finished ───────────────────────────────────────────────── */
  if (completed && ranked.length > 0) {
    const top = ranked.filter((r) => r.rank <= 5).sort((a, b) => a.rank - b.rank);
    return (
      <StepShell
        eyebrow="Шаг 3 из 7"
        title="Твоя пирамида ценностей"
        subtitle="Каждая ценность из финала сыграла с каждой — сильную не могло выбить одно неудачное сравнение."
        footer={<ActionButton size="lg" onClick={onNext}>Дальше</ActionButton>}
      >
        <div className="space-y-2">
          {top.map((r) => {
            const card = VALUE_MAP.get(r.key)!;
            return (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: r.rank * 0.06 }}
              >
                <Card className="flex items-center gap-4" selected={r.rank === 1}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[color:var(--color-accent)] font-semibold text-white">
                    {r.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[color:var(--color-text)]">{card.labelRu}</p>
                    <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                      {card.hintRu}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                    вес {r.weight.toFixed(2)}
                  </span>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </StepShell>
    );
  }

  /* ── Duels ──────────────────────────────────────────────────── */
  if (phase === "duels") {
    const pair = pairs[duelIndex];
    if (!pair) return null;
    const [a, b] = pair;
    const cardA = VALUE_MAP.get(a)!;
    const cardB = VALUE_MAP.get(b)!;

    return (
      <StepShell
        eyebrow="Шаг 3 из 7"
        title="Что важнее лично тебе?"
        subtitle={`Дуэль ${duelIndex + 1} из ${pairs.length}. Каждая пара встречается один раз — итоговый порядок не зависит от везения жеребьёвки.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: a, card: cardA, other: b },
            { key: b, card: cardB, other: a },
          ].map(({ key, card, other }) => (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => pickWinner(key, other)}
              className="border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-6 text-left ease-snappy hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-tag-match)]"
            >
              <p className="font-display text-[length:var(--text-fluid-lg)] text-[color:var(--color-text)]">
                {card.labelRu}
              </p>
              <p className="mt-2 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                {card.hintRu}
              </p>
            </motion.button>
          ))}
        </div>
      </StepShell>
    );
  }

  /* ── Cuts ───────────────────────────────────────────────────── */
  const isCut10 = phase === "cut10";
  const source = isCut10 ? VALUE_CARDS.map((v) => v.key) : pool10;
  const list = isCut10 ? pool10 : pool5;
  const setList = isCut10 ? setPool10 : setPool5;
  const max = isCut10 ? FUNNEL_TOP_10 : FUNNEL_TOP_5;
  const ready = list.length === max;

  return (
    <StepShell
      eyebrow="Шаг 3 из 7"
      title={isCut10 ? "Что для тебя важно в работе?" : "Теперь оставь только пять"}
      subtitle={
        isCut10
          ? "Отметь 10 карточек, которые про тебя. Формулировки построены на модели базовых ценностей Шварца."
          : "Из десяти выбери пять по-настоящему принципиальных. Дальше они сыграют между собой."
      }
      footer={
        <>
          <ActionButton
            size="lg"
            disabled={!ready}
            onClick={() => (isCut10 ? setPhase("cut5") : setPhase("duels"))}
          >
            {isCut10 ? "Оставить эти 10" : "К дуэлям"}
          </ActionButton>
          <span className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
            выбрано {list.length} из {max}
          </span>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {source.map((key) => {
          const card = VALUE_MAP.get(key)!;
          const selected = list.includes(key);
          return (
            <button key={key} type="button" onClick={() => toggle(list, setList, key, max)}>
              <Card selected={selected} className="h-full text-left">
                <p className="font-medium text-[color:var(--color-text)]">{card.labelRu}</p>
                <p className="mt-1 text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                  {card.hintRu}
                </p>
              </Card>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
