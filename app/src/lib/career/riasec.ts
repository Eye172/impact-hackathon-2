/**
 * RIASEC (Holland codes) — the interest axis shared by the student profile and
 * every major in the catalogue. Same six numbers on both sides means the match
 * is a cosine, not an opinion.
 */
import type { RiasecKey, RiasecVector } from "./types";

export const RIASEC_KEYS: RiasecKey[] = ["R", "I", "A", "S", "E", "C"];

export const RIASEC_META: Record<
  RiasecKey,
  { labelRu: string; shortRu: string; descriptionRu: string; color: string }
> = {
  R: {
    labelRu: "Реалистичный",
    shortRu: "Делать руками",
    descriptionRu: "Механизмы, техника, материальные объекты, работа с осязаемым результатом",
    color: "#E07A5F",
  },
  I: {
    labelRu: "Исследовательский",
    shortRu: "Разбираться",
    descriptionRu: "Анализ, эксперименты, поиск закономерностей, работа с данными и теорией",
    color: "#3D8BFD",
  },
  A: {
    labelRu: "Артистический",
    shortRu: "Создавать",
    descriptionRu: "Самовыражение, эстетика, нестандартные формы, творческие продукты",
    color: "#B07BD6",
  },
  S: {
    labelRu: "Социальный",
    shortRu: "Помогать",
    descriptionRu: "Обучение, забота, консультирование, развитие других людей",
    color: "#3FB98F",
  },
  E: {
    labelRu: "Предприимчивый",
    shortRu: "Вести за собой",
    descriptionRu: "Убеждение, лидерство, переговоры, запуск и продвижение проектов",
    color: "#E9A23B",
  },
  C: {
    labelRu: "Конвенциональный",
    shortRu: "Упорядочивать",
    descriptionRu: "Системность, точность, регламенты, работа с числами и структурами",
    color: "#6C8CA8",
  },
};

export const EMPTY_RIASEC: RiasecVector = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

export function cosineSimilarity(a: RiasecVector, b: RiasecVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k of RIASEC_KEYS) {
    dot += a[k] * b[k];
    magA += a[k] * a[k];
    magB += b[k] * b[k];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Normalise so the strongest axis reads 100 — keeps the profile chart legible. */
export function normalizeRiasec(v: RiasecVector): RiasecVector {
  const max = Math.max(...RIASEC_KEYS.map((k) => v[k]));
  if (max <= 0) return { ...EMPTY_RIASEC };
  const out = { ...EMPTY_RIASEC };
  for (const k of RIASEC_KEYS) out[k] = Math.round((v[k] / max) * 100);
  return out;
}

export function addRiasec(base: RiasecVector, delta: Partial<RiasecVector>): RiasecVector {
  const out = { ...base };
  for (const k of RIASEC_KEYS) out[k] = Math.max(0, out[k] + (delta[k] ?? 0));
  return out;
}

/** Three-letter Holland code, e.g. "IRE". */
export function hollandCode(v: RiasecVector): string {
  return [...RIASEC_KEYS]
    .sort((a, b) => v[b] - v[a])
    .slice(0, 3)
    .join("");
}

export function topAxes(v: RiasecVector, n = 2): RiasecKey[] {
  return [...RIASEC_KEYS].sort((a, b) => v[b] - v[a]).slice(0, n);
}

/* ─── Self-report block ─────────────────────────────────────────── */

export interface RiasecStatement {
  id: string;
  textRu: string;
  axis: RiasecKey;
}

/** Short-form Interest Profiler: 3 statements per axis, rated 1-5. */
export const RIASEC_STATEMENTS: RiasecStatement[] = [
  { id: "r1", axis: "R", textRu: "Мне нравится чинить или собирать вещи своими руками" },
  { id: "r2", axis: "R", textRu: "Я скорее выберу работу на местности, чем в кабинете" },
  { id: "r3", axis: "R", textRu: "Мне интересно, как устроены механизмы и техника" },
  { id: "i1", axis: "I", textRu: "Я люблю докапываться, почему что-то работает именно так" },
  { id: "i2", axis: "I", textRu: "Мне интересно решать задачи, у которых нет готового ответа" },
  { id: "i3", axis: "I", textRu: "Я готов долго возиться с данными, если из них следует вывод" },
  { id: "a1", axis: "A", textRu: "Мне важно, чтобы в работе было место для моего стиля" },
  { id: "a2", axis: "A", textRu: "Я часто придумываю идеи, которые другим не приходят в голову" },
  { id: "a3", axis: "A", textRu: "Меня раздражают задачи, где всё расписано по шаблону" },
  { id: "s1", axis: "S", textRu: "Мне нравится объяснять другим то, что я понял сам" },
  { id: "s2", axis: "S", textRu: "Ко мне часто приходят за советом или поддержкой" },
  { id: "s3", axis: "S", textRu: "Я получаю удовольствие, когда кому-то стало лучше из-за меня" },
  { id: "e1", axis: "E", textRu: "Я легко беру на себя роль организатора в группе" },
  { id: "e2", axis: "E", textRu: "Мне нравится убеждать людей в своей идее" },
  { id: "e3", axis: "E", textRu: "Я хотел бы однажды запустить своё дело" },
  { id: "c1", axis: "C", textRu: "Мне спокойнее, когда есть чёткий план и порядок" },
  { id: "c2", axis: "C", textRu: "Я замечаю ошибки и неточности, которые пропускают другие" },
  { id: "c3", axis: "C", textRu: "Мне нравится доводить систему до состояния, где всё сходится" },
];

/** Likert answers (1-5) → raw 0-100 vector. */
export function scoreStatements(answers: Record<string, number>): RiasecVector {
  const sums = { ...EMPTY_RIASEC };
  const counts = { ...EMPTY_RIASEC };

  for (const st of RIASEC_STATEMENTS) {
    const a = answers[st.id];
    if (!a) continue;
    sums[st.axis] += ((a - 1) / 4) * 100;
    counts[st.axis] += 1;
  }

  const out = { ...EMPTY_RIASEC };
  for (const k of RIASEC_KEYS) out[k] = counts[k] > 0 ? Math.round(sums[k] / counts[k]) : 0;
  return out;
}
