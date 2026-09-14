import { db } from "@/lib/db";
import { EMPTY_RIASEC } from "./riasec";
import type { CareerProfileData } from "./types";

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type CareerProfileRow = Awaited<ReturnType<typeof getOrCreateProfile>>;

export async function getOrCreateProfile(userId: string) {
  const existing = await db.careerProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.careerProfile.create({ data: { userId } });
}

export function toProfileData(row: {
  gradeLevel: number;
  riasec: string;
  values: string;
  skills: string;
  subjects: string;
  culturalSignals: string;
  selfPortrait: string | null;
  interviewSummary: string | null;
  countries: string;
  languages: string;
  budgetUsdPerYear: number | null;
}): CareerProfileData {
  return {
    gradeLevel: row.gradeLevel,
    riasec: { ...EMPTY_RIASEC, ...parse(row.riasec, {}) },
    values: parse(row.values, []),
    skills: parse(row.skills, []),
    subjects: parse(row.subjects, []),
    culturalSignals: parse(row.culturalSignals, []),
    selfPortrait: parse(row.selfPortrait, null),
    interviewSummary: row.interviewSummary,
    constraints: {
      countries: parse(row.countries, []),
      languages: parse(row.languages, []),
      budgetUsdPerYear: row.budgetUsdPerYear,
    },
  };
}

export function parseCompletedSteps(raw: string): string[] {
  return parse(raw, [] as string[]);
}
