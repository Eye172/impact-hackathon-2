/**
 * Career Navigator domain types.
 *
 * The whole product runs on two vectors that both the student and every major
 * are described by: RIASEC (Holland interest codes) and a ranked value profile
 * (Schwartz-derived). Matching is therefore arithmetic, not LLM guesswork.
 */

export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

export type RiasecVector = Record<RiasecKey, number>; // each 0-100

export type SkillType = "hard" | "soft";

export interface SkillRequirement {
  key: string;
  label: string;
  labelRu: string;
  type: SkillType;
  /** How critical for this major, 1-5 */
  weight: number;
}

export interface StudentSkill {
  key: string;
  /** Self-assessed level 0-5 */
  level: number;
}

export interface SubjectGrade {
  key: string;
  /** Grade on a 5-point scale */
  grade: number;
}

export interface CareerOutcome {
  title: string;
  titleRu: string;
  medianSalaryUsd: number;
  demand: "high" | "medium" | "niche";
  onetCode?: string;
}

export interface Major {
  id: string;
  name: string;
  nameRu: string;
  field: string;
  descriptionRu: string;
  riasec: RiasecVector;
  /** Value keys from VALUE_CARDS this major typically satisfies */
  values: string[];
  skills: SkillRequirement[];
  /** School subject keys that matter for admission and for the studies themselves */
  subjects: string[];
  careers: CareerOutcome[];
  /** Fields of study used to bridge into the university catalogue */
  universityFields: string[];
}

export interface CulturalSignal {
  title: string;
  kind: "game" | "creator" | "media" | "other";
  constructs: string[];
  riasecHint: Partial<RiasecVector>;
  rationaleRu: string;
  confirmed: boolean | null;
}

/**
 * Open-ended self-portrait.
 *
 * Childhood-versus-now is asked as a pair on purpose: continuity of interest
 * across years is a stronger signal than a snapshot, and the contrast is what
 * the interviewer digs into afterwards.
 */
export interface SelfPortrait {
  /** Kinds of media the student actually consumes */
  mediaDiet: string[];
  /** Names of creators, channels, studios, authors */
  creators: string[];
  childhood: string;
  nowadays: string;
  betterThanPeers: string;
  futureDay: string;
}

export interface RankedValue {
  key: string;
  /** 1 = most important */
  rank: number;
  /** Derived weight 0-1 */
  weight: number;
}

export interface CareerProfileData {
  gradeLevel: number;
  riasec: RiasecVector;
  values: RankedValue[];
  skills: StudentSkill[];
  subjects: SubjectGrade[];
  culturalSignals: CulturalSignal[];
  selfPortrait: SelfPortrait | null;
  interviewSummary: string | null;
  constraints: {
    countries: string[];
    budgetUsdPerYear: number | null;
    languages: string[];
  };
}

/* ─── Match output ──────────────────────────────────────────────── */

export type EvidencePolarity = "match" | "partial" | "gap";

export interface Evidence {
  dimension: "riasec" | "values" | "subjects" | "skills";
  polarity: EvidencePolarity;
  /** Contribution weight of the dimension, 0-1 */
  weight: number;
  labelRu: string;
}

export interface SkillGapItem {
  key: string;
  labelRu: string;
  type: SkillType;
  required: number;
  current: number;
  deficit: number;
}

export interface MajorFit {
  majorId: string;
  score: number; // 0-100
  breakdown: Record<Evidence["dimension"], number>; // each 0-1
  evidence: Evidence[];
  skillGaps: SkillGapItem[];
}
