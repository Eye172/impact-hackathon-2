"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ChevronRight, Lightbulb, X } from "lucide-react";

const HINTS: Record<string, string[]> = {
  navigator: [
    "Заполняй честно: здесь нет правильных ответов.",
    "Можно вернуться только к уже пройденным шагам — данные не потеряются в этом проходе.",
    "Подтверждай догадки об увлечениях: отклонённые сигналы не влияют на результат.",
  ],
  results: [
    "Нажми на направление, чтобы увидеть вклад каждой оси и зоны риска.",
    "Это пять проверяемых гипотез, а не назначение профессии.",
  ],
  major: [
    "Сначала посмотри разрыв навыков, затем выбери направление — так откроется маршрут.",
    "План строится из твоих реальных пробелов, а не из общего чек-листа.",
  ],
  universities: [
    "Разверни вуз: совпадения и расхождения показаны отдельно.",
    "Твои страны, бюджет и выбранное направление уже учтены из профориентации.",
  ],
  profile: ["Здесь можно уточнить admissions-приоритеты после того, как появилась карьерная гипотеза."],
};

function keyFor(pathname: string) {
  if (pathname === "/navigator/results") return "results";
  if (pathname.startsWith("/navigator")) return "navigator";
  if (pathname.startsWith("/major")) return "major";
  if (["/feed", "/search", "/timeline", "/university"].some((p) => pathname.startsWith(p))) {
    return "universities";
  }
  if (pathname.startsWith("/profile")) return "profile";
  return null;
}

export function JourneyHints() {
  const pathname = usePathname();
  const hintKey = keyFor(pathname);
  const [index, setIndex] = React.useState(0);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    setIndex(0);
    setHidden(false);
  }, [hintKey]);

  if (!hintKey || hidden) return null;
  const hints = HINTS[hintKey];
  const hint = hints[index % hints.length];

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-5 right-5 z-[45] w-[min(360px,calc(100vw-96px))] border border-[color:var(--color-accent)] bg-[color:var(--color-surface-frosted)] p-4 shadow-[8px_8px_0_var(--color-tag-match)] backdrop-blur-xl"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" />
          <div className="min-w-0 flex-1">
            <div className="mono-label text-[color:var(--color-accent)]">Подсказка · {index + 1}/{hints.length}</div>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-text)]">{hint}</p>
          </div>
          <button type="button" onClick={() => setHidden(true)} aria-label="Скрыть подсказку" className="text-[color:var(--color-faint)] hover:text-[color:var(--color-text)]">
            <X size={16} />
          </button>
        </div>
        {hints.length > 1 && (
          <button type="button" onClick={() => setIndex((value) => (value + 1) % hints.length)} className="mono-label mt-3 ml-7 inline-flex items-center gap-1 text-[color:var(--color-accent)]">
            Следующая <ChevronRight size={13} />
          </button>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
