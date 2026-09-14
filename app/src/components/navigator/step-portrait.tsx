"use client";

import * as React from "react";
import { ActionButton } from "@/components/ui/button";
import { StepShell, Card } from "./shell";
import { cn } from "@/lib/tailwind-utils";
import type { SelfPortrait } from "@/lib/career/types";

/** What the student actually consumes, not what sounds impressive. */
const MEDIA_KINDS: { key: string; labelRu: string; hintRu: string }[] = [
  { key: "games", labelRu: "Игры", hintRu: "стратегии, песочницы, сюжетные" },
  { key: "video_essays", labelRu: "Разборы и лонгриды", hintRu: "видео, где что-то объясняют" },
  { key: "streams", labelRu: "Стримы", hintRu: "смотрю, как кто-то что-то делает вживую" },
  { key: "series", labelRu: "Сериалы и кино", hintRu: "истории и персонажи" },
  { key: "books", labelRu: "Книги", hintRu: "художественные или нон-фикшн" },
  { key: "podcasts", labelRu: "Подкасты", hintRu: "разговоры и интервью" },
  { key: "music", labelRu: "Музыка", hintRu: "слушаю или делаю сам" },
  { key: "art", labelRu: "Визуал и арт", hintRu: "иллюстрации, дизайн, комиксы" },
  { key: "sport", labelRu: "Спорт", hintRu: "смотрю или занимаюсь" },
  { key: "science", labelRu: "Научпоп", hintRu: "как устроен мир" },
];

interface Question {
  key: keyof Pick<SelfPortrait, "childhood" | "nowadays" | "betterThanPeers" | "futureDay">;
  labelRu: string;
  hintRu: string;
  placeholderRu: string;
  minLength: number;
}

const QUESTIONS: Question[] = [
  {
    key: "childhood",
    labelRu: "Что тебя затягивало лет в 8–10?",
    hintRu: "Интерес, который держится с детства, надёжнее свежего увлечения.",
    placeholderRu:
      "Например: разбирал технику, чтобы посмотреть, что внутри; строил города в Minecraft; сочинял истории…",
    minLength: 40,
  },
  {
    key: "nowadays",
    labelRu: "А что затягивает сейчас?",
    hintRu: "Не «чем занимаюсь», а на чём реально теряешь счёт времени.",
    placeholderRu: "Например: разбираюсь, как работают нейросети; монтирую видео; спорю на дебатах…",
    minLength: 40,
  },
  {
    key: "betterThanPeers",
    labelRu: "В чём ты объективно сильнее большинства ровесников?",
    hintRu:
      "Без скромности и без преувеличений. Подойдёт то, за чем к тебе приходят другие.",
    placeholderRu:
      "Например: быстро нахожу ошибку в чужом рассуждении; могу объяснить сложное простыми словами…",
    minLength: 30,
  },
  {
    key: "futureDay",
    labelRu: "Каким ты видишь свой обычный день через десять лет?",
    hintRu:
      "Именно день, а не должность. Где ты, с кем, что делаешь руками и головой.",
    placeholderRu:
      "Например: работаю из дома над своим проектом, во второй половине дня созвон с командой из разных стран…",
    minLength: 40,
  },
];

const EMPTY: SelfPortrait = {
  mediaDiet: [],
  creators: [],
  childhood: "",
  nowadays: "",
  betterThanPeers: "",
  futureDay: "",
};

export function StepPortrait({
  value,
  onChange,
  onNext,
}: {
  value: SelfPortrait | null;
  onChange: (v: SelfPortrait) => void;
  onNext: () => void;
}) {
  const portrait = value ?? EMPTY;
  const [creatorDraft, setCreatorDraft] = React.useState("");

  function patch(part: Partial<SelfPortrait>) {
    onChange({ ...portrait, ...part });
  }

  function toggleMedia(key: string) {
    const has = portrait.mediaDiet.includes(key);
    patch({
      mediaDiet: has
        ? portrait.mediaDiet.filter((k) => k !== key)
        : [...portrait.mediaDiet, key],
    });
  }

  function addCreator() {
    const name = creatorDraft.trim();
    if (!name || portrait.creators.includes(name) || portrait.creators.length >= 8) return;
    patch({ creators: [...portrait.creators, name] });
    setCreatorDraft("");
  }

  const answered = QUESTIONS.filter((q) => portrait[q.key].trim().length >= q.minLength);
  const ready = answered.length >= 3 && portrait.mediaDiet.length > 0;

  return (
    <StepShell
      eyebrow="Шаг 5 из 7"
      title="Про себя"
      subtitle="Пять коротких ответов, которые анкета не вытащит. Пиши как есть — эти тексты читает только система, чтобы задать тебе более точные вопросы дальше."
      footer={
        <>
          <ActionButton size="lg" disabled={!ready} onClick={onNext}>
            Дальше
          </ActionButton>
          <span className="mono-label">
            {answered.length} из {QUESTIONS.length} · нужно минимум 3 и один тип медиа
          </span>
        </>
      }
    >
      <div className="space-y-8">
        {/* ── Media diet ─────────────────────────────────────── */}
        <div>
          <h3 className="mb-1 font-bold">Что ты вообще смотришь, читаешь и играешь</h3>
          <p className="mb-4 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
            Отметь то, на что реально уходит время, а не то, что звучит солиднее.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {MEDIA_KINDS.map((m) => {
              const on = portrait.mediaDiet.includes(m.key);
              return (
                <button key={m.key} type="button" onClick={() => toggleMedia(m.key)}>
                  <Card selected={on} className="h-full text-left">
                    <span className="block font-medium">{m.labelRu}</span>
                    <span className="mono-label mt-1 block">{m.hintRu}</span>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Creators ───────────────────────────────────────── */}
        <div>
          <h3 className="mb-1 font-bold">Любимые авторы, каналы, студии</h3>
          <p className="mb-4 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
            Кого ты смотришь или читаешь постоянно. На следующем шаге система разберёт,
            какой тип мышления за этим стоит.
          </p>
          <div className="flex gap-2">
            <input
              value={creatorDraft}
              onChange={(e) => setCreatorDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCreator();
                }
              }}
              placeholder="например: Kurzgesagt, Веритасиум, Wylsacom"
              className="flex-1 border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-2.5 text-[length:var(--text-fluid-sm)] outline-none focus:border-[color:var(--color-accent)]"
            />
            <ActionButton
              variant="glass"
              onClick={addCreator}
              disabled={portrait.creators.length >= 8}
            >
              Добавить
            </ActionButton>
          </div>
          {portrait.creators.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {portrait.creators.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => patch({ creators: portrait.creators.filter((x) => x !== c) })}
                  className="bg-[color:var(--color-tag-match)] px-3.5 py-1.5 text-[length:var(--text-fluid-sm)] text-[color:var(--color-accent)]"
                >
                  {c} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Open questions ─────────────────────────────────── */}
        <div className="space-y-5">
          {QUESTIONS.map((q, i) => {
            const text = portrait[q.key];
            const enough = text.trim().length >= q.minLength;
            return (
              <div key={q.key}>
                <label
                  htmlFor={`portrait-${q.key}`}
                  className="mb-1 block font-bold"
                >
                  <span className="mono-label mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {q.labelRu}
                </label>
                <p className="mb-2 text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                  {q.hintRu}
                </p>
                <textarea
                  id={`portrait-${q.key}`}
                  rows={3}
                  value={text}
                  onChange={(e) => patch({ [q.key]: e.target.value } as Partial<SelfPortrait>)}
                  placeholder={q.placeholderRu}
                  className={cn(
                    "w-full resize-none border bg-[color:var(--color-surface)] px-4 py-3",
                    "text-[length:var(--text-fluid-sm)] outline-none transition-colors",
                    enough
                      ? "border-[color:var(--color-accent)]"
                      : "border-[color:var(--color-border-strong)] focus:border-[color:var(--color-accent)]",
                  )}
                />
                <div className="mono-label mt-1 text-right">
                  {text.trim().length} / {q.minLength} знаков
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StepShell>
  );
}
