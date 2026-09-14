/**
 * Value cards for the prioritisation funnel.
 *
 * Wording is teen-facing, but every card maps onto a Schwartz basic value so
 * the ranking can be defended as a validated construct rather than a quiz.
 */

export interface ValueCard {
  key: string;
  labelRu: string;
  hintRu: string;
  /** Schwartz basic value this card operationalises */
  schwartz: string;
}

export const VALUE_CARDS: ValueCard[] = [
  { key: "autonomy", labelRu: "Свобода решать самому", hintRu: "Никто не стоит над душой, я сам выбираю как работать", schwartz: "Self-direction" },
  { key: "creation", labelRu: "Создавать новое", hintRu: "Придумывать то, чего до меня не было", schwartz: "Self-direction" },
  { key: "mastery", labelRu: "Стать экспертом", hintRu: "Глубоко разбираться в одном деле лучше многих", schwartz: "Achievement" },
  { key: "recognition", labelRu: "Признание", hintRu: "Чтобы мою работу замечали и ценили", schwartz: "Achievement" },
  { key: "income", labelRu: "Высокий доход", hintRu: "Зарабатывать заметно больше среднего", schwartz: "Power" },
  { key: "influence", labelRu: "Влиять на решения", hintRu: "Быть тем, кто задаёт направление", schwartz: "Power" },
  { key: "stability", labelRu: "Стабильность", hintRu: "Понятный график, надёжность, без сюрпризов", schwartz: "Security" },
  { key: "safety_net", labelRu: "Востребованность", hintRu: "Профессия, с которой я точно не останусь без работы", schwartz: "Security" },
  { key: "helping", labelRu: "Помогать людям", hintRu: "Видеть, что кому-то стало лучше из-за меня", schwartz: "Benevolence" },
  { key: "team", labelRu: "Сильная команда", hintRu: "Работать с людьми, у которых хочется учиться", schwartz: "Benevolence" },
  { key: "impact", labelRu: "Менять мир к лучшему", hintRu: "Решать проблемы, которые касаются многих", schwartz: "Universalism" },
  { key: "nature", labelRu: "Природа и экология", hintRu: "Работа, связанная с планетой и живым миром", schwartz: "Universalism" },
  { key: "variety", labelRu: "Разнообразие задач", hintRu: "Каждый день не похож на предыдущий", schwartz: "Stimulation" },
  { key: "risk", labelRu: "Вызов и риск", hintRu: "Готов рисковать ради большого результата", schwartz: "Stimulation" },
  { key: "balance", labelRu: "Баланс с личной жизнью", hintRu: "Работа не съедает всё время", schwartz: "Hedonism" },
  { key: "enjoyment", labelRu: "Удовольствие от процесса", hintRu: "Важно, чтобы сам процесс нравился", schwartz: "Hedonism" },
  { key: "structure", labelRu: "Чёткие правила", hintRu: "Понятно, что от меня требуется и как это оценят", schwartz: "Conformity" },
  { key: "prestige", labelRu: "Престиж профессии", hintRu: "Чтобы название профессии звучало весомо", schwartz: "Power" },
  { key: "learning", labelRu: "Постоянно учиться", hintRu: "Профессия, где всё время появляется новое", schwartz: "Self-direction" },
  { key: "mobility", labelRu: "Работать откуда угодно", hintRu: "Не быть привязанным к одному городу или офису", schwartz: "Self-direction" },
];

export const VALUE_MAP = new Map(VALUE_CARDS.map((v) => [v.key, v]));

/** Funnel stages: 20 cards → keep 10 → keep 5 → order the 5 by pairwise duels. */
export const FUNNEL_TOP_10 = 10;
export const FUNNEL_TOP_5 = 5;

/** Rank 1 counts far more than rank 5; survivors of the top-10 cut keep a residual weight. */
export function weightForRank(rank: number): number {
  const table = [1, 0.85, 0.7, 0.55, 0.4];
  return table[rank - 1] ?? 0.2;
}

/** All unordered pairs of the finalists — 5 items → 10 duels. */
export function buildPairs<T>(items: T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) pairs.push([items[i], items[j]]);
  }
  return pairs;
}

/**
 * Round-robin ranking: every finalist meets every other, so a strong card can
 * never be knocked out by one unlucky pairing. Ties break on the head-to-head.
 */
export function rankFromDuels(
  keys: string[],
  wins: Record<string, string[]>,
): { key: string; rank: number; weight: number }[] {
  const scored = keys.map((key) => ({
    key,
    wins: (wins[key] ?? []).length,
  }));

  scored.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if ((wins[a.key] ?? []).includes(b.key)) return -1;
    if ((wins[b.key] ?? []).includes(a.key)) return 1;
    return 0;
  });

  return scored.map((s, i) => ({
    key: s.key,
    rank: i + 1,
    weight: weightForRank(i + 1),
  }));
}
