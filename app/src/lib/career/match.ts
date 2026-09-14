/**
 * Major matching engine.
 *
 * Deterministic on purpose: the LLM extracts features and later narrates the
 * result, but the ranking itself is arithmetic that can be replayed and argued
 * with. Every contribution comes back as evidence the student can read.
 */
import { MAJORS, SUBJECT_LABELS } from "./majors";
import { VALUE_MAP } from "./values";
import { cosineSimilarity, RIASEC_META, topAxes } from "./riasec";
import type {
  CareerProfileData,
  Evidence,
  Major,
  MajorFit,
  SkillGapItem,
} from "./types";

const DIMENSION_WEIGHTS = {
  riasec: 0.4,
  values: 0.25,
  subjects: 0.2,
  skills: 0.15,
} as const;

/** Cosine over positive vectors lives in [0,1] but bunches up high — stretch it. */
function stretch(similarity: number): number {
  return Math.max(0, Math.min(1, (similarity - 0.55) / 0.45));
}

function scoreRiasec(profile: CareerProfileData, major: Major) {
  const raw = cosineSimilarity(profile.riasec, major.riasec);
  return { value: stretch(raw), raw };
}

function scoreValues(profile: CareerProfileData, major: Major) {
  if (profile.values.length === 0) return { value: 0, hits: [] as string[], misses: [] as string[] };

  const satisfied = new Set(major.values);
  let earned = 0;
  let possible = 0;
  const hits: string[] = [];
  const misses: string[] = [];

  for (const v of profile.values) {
    possible += v.weight;
    if (satisfied.has(v.key)) {
      earned += v.weight;
      if (v.rank <= 5) hits.push(v.key);
    } else if (v.rank <= 3) {
      misses.push(v.key);
    }
  }

  return { value: possible > 0 ? earned / possible : 0, hits, misses };
}

function scoreSubjects(profile: CareerProfileData, major: Major) {
  const graded = new Map(profile.subjects.map((s) => [s.key, s.grade]));
  const relevant = major.subjects.filter((k) => graded.has(k));
  if (relevant.length === 0) return { value: 0.5, strong: [] as string[], weak: [] as string[] };

  const strong: string[] = [];
  const weak: string[] = [];
  let total = 0;

  for (const key of relevant) {
    const grade = graded.get(key)!;
    total += (grade - 2) / 3; // 2 → 0, 5 → 1
    if (grade >= 4) strong.push(key);
    if (grade <= 3) weak.push(key);
  }

  return { value: Math.max(0, Math.min(1, total / relevant.length)), strong, weak };
}

function scoreSkills(profile: CareerProfileData, major: Major) {
  const held = new Map(profile.skills.map((s) => [s.key, s.level]));
  let earned = 0;
  let possible = 0;
  const gaps: SkillGapItem[] = [];
  const strengths: string[] = [];

  for (const req of major.skills) {
    const required = req.weight;
    const current = held.get(req.key) ?? 0;
    possible += required;
    earned += Math.min(current, required);

    if (current >= required) strengths.push(req.labelRu);
    else {
      gaps.push({
        key: req.key,
        labelRu: req.labelRu,
        type: req.type,
        required,
        current,
        deficit: required - current,
      });
    }
  }

  gaps.sort((a, b) => b.deficit - a.deficit);
  return { value: possible > 0 ? earned / possible : 0, gaps, strengths };
}

export function computeMajorFit(profile: CareerProfileData, major: Major): MajorFit {
  const riasec = scoreRiasec(profile, major);
  const values = scoreValues(profile, major);
  const subjects = scoreSubjects(profile, major);
  const skills = scoreSkills(profile, major);

  const score = Math.round(
    (riasec.value * DIMENSION_WEIGHTS.riasec +
      values.value * DIMENSION_WEIGHTS.values +
      subjects.value * DIMENSION_WEIGHTS.subjects +
      skills.value * DIMENSION_WEIGHTS.skills) *
      100,
  );

  const evidence: Evidence[] = [];

  const sharedAxes = topAxes(profile.riasec, 2).filter((a) => topAxes(major.riasec, 3).includes(a));
  if (riasec.value >= 0.6 && sharedAxes.length > 0) {
    evidence.push({
      dimension: "riasec",
      polarity: "match",
      weight: DIMENSION_WEIGHTS.riasec,
      labelRu: `Совпадение по типу интересов: ${sharedAxes
        .map((a) => RIASEC_META[a].labelRu.toLowerCase())
        .join(" и ")} — ключевые оси этой специальности`,
    });
  } else if (riasec.value >= 0.3) {
    evidence.push({
      dimension: "riasec",
      polarity: "partial",
      weight: DIMENSION_WEIGHTS.riasec,
      labelRu: `Частичное совпадение интересов: сильна ось «${
        RIASEC_META[topAxes(major.riasec, 1)[0]].labelRu
      }», у тебя она не в топе`,
    });
  } else {
    evidence.push({
      dimension: "riasec",
      polarity: "gap",
      weight: DIMENSION_WEIGHTS.riasec,
      labelRu: `Тип интересов расходится: специальность держится на оси «${
        RIASEC_META[topAxes(major.riasec, 1)[0]].labelRu
      }»`,
    });
  }

  if (values.hits.length > 0) {
    evidence.push({
      dimension: "values",
      polarity: "match",
      weight: DIMENSION_WEIGHTS.values,
      labelRu: `Закрывает твои приоритетные ценности: ${values.hits
        .map((k) => VALUE_MAP.get(k)?.labelRu.toLowerCase() ?? k)
        .join(", ")}`,
    });
  }
  if (values.misses.length > 0) {
    evidence.push({
      dimension: "values",
      polarity: "gap",
      weight: DIMENSION_WEIGHTS.values,
      labelRu: `Слабо закрывает то, что ты поставил в топ-3: ${values.misses
        .map((k) => VALUE_MAP.get(k)?.labelRu.toLowerCase() ?? k)
        .join(", ")}`,
    });
  }

  if (subjects.strong.length > 0) {
    evidence.push({
      dimension: "subjects",
      polarity: "match",
      weight: DIMENSION_WEIGHTS.subjects,
      labelRu: `Опирается на предметы, где ты силён: ${subjects.strong
        .map((k) => SUBJECT_LABELS[k] ?? k)
        .join(", ")}`,
    });
  }
  if (subjects.weak.length > 0) {
    evidence.push({
      dimension: "subjects",
      polarity: "gap",
      weight: DIMENSION_WEIGHTS.subjects,
      labelRu: `Требует предметы, которые пока проседают: ${subjects.weak
        .map((k) => SUBJECT_LABELS[k] ?? k)
        .join(", ")}`,
    });
  }

  if (skills.strengths.length > 0) {
    evidence.push({
      dimension: "skills",
      polarity: "match",
      weight: DIMENSION_WEIGHTS.skills,
      labelRu: `Уже развиты нужные навыки: ${skills.strengths.slice(0, 3).join(", ")}`,
    });
  }
  if (skills.gaps.length > 0) {
    evidence.push({
      dimension: "skills",
      polarity: "gap",
      weight: DIMENSION_WEIGHTS.skills,
      labelRu: `Предстоит подтянуть: ${skills.gaps
        .slice(0, 3)
        .map((g) => g.labelRu.toLowerCase())
        .join(", ")}`,
    });
  }

  const order = { match: 0, partial: 1, gap: 2 } as const;
  evidence.sort((a, b) => order[a.polarity] - order[b.polarity] || b.weight - a.weight);

  return {
    majorId: major.id,
    score,
    breakdown: {
      riasec: riasec.value,
      values: values.value,
      subjects: subjects.value,
      skills: skills.value,
    },
    evidence,
    skillGaps: skills.gaps,
  };
}

export function rankMajors(profile: CareerProfileData, limit = 5): MajorFit[] {
  return MAJORS.map((m) => computeMajorFit(profile, m))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * How much the recommendation can be trusted given what the student has
 * actually filled in. Shown to the user verbatim — it is the honest version of
 * a progress bar and the product's answer to "reduce uncertainty".
 */
export interface ConfidenceBlock {
  key: string;
  labelRu: string;
  weight: number;
  done: boolean;
  actionRu: string;
}

export function profileConfidence(profile: CareerProfileData): {
  score: number;
  blocks: ConfidenceBlock[];
} {
  const blocks: ConfidenceBlock[] = [
    {
      key: "riasec",
      labelRu: "Тип интересов",
      weight: 30,
      done: Object.values(profile.riasec).some((v) => v > 0),
      actionRu: "Пройди блок интересов — 18 утверждений",
    },
    {
      key: "values",
      labelRu: "Ценности",
      weight: 25,
      done: profile.values.length >= 5,
      actionRu: "Проранжируй ценности в воронке",
    },
    {
      key: "subjects",
      labelRu: "Оценки по предметам",
      weight: 20,
      done: profile.subjects.length >= 4,
      actionRu: "Заполни оценки хотя бы по 4 предметам",
    },
    {
      key: "skills",
      labelRu: "Навыки",
      weight: 15,
      done: profile.skills.length >= 5,
      actionRu: "Оцени свои навыки — это уточнит skills gap",
    },
    {
      key: "interview",
      labelRu: "AI-интервью",
      weight: 10,
      done: Boolean(profile.interviewSummary),
      actionRu: "Пройди интервью — оно ловит то, что не видно в анкете",
    },
  ];

  const score = blocks.reduce((sum, b) => sum + (b.done ? b.weight : 0), 0);
  return { score, blocks };
}
