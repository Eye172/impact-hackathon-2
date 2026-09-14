import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  getOrCreateProfile,
  parseCompletedSteps,
  toProfileData,
} from "@/lib/career/profile-store";
import { profileConfidence } from "@/lib/career/match";
import { MAJOR_MAP } from "@/lib/career/majors";

async function requireUserId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await getOrCreateProfile(userId);
  const data = toProfileData(row);

  return Response.json({
    profile: data,
    completedSteps: parseCompletedSteps(row.completedSteps),
    selectedMajorId: row.selectedMajorId,
    confidence: profileConfidence(data),
  });
}

const JSON_FIELDS = [
  "riasec",
  "values",
  "skills",
  "subjects",
  "culturalSignals",
  "selfPortrait",
  "countries",
  "languages",
  "completedSteps",
] as const;

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  await getOrCreateProfile(userId);

  const data: Record<string, unknown> = {};

  for (const field of JSON_FIELDS) {
    if (body[field] !== undefined) data[field] = JSON.stringify(body[field]);
  }
  if (typeof body.gradeLevel === "number") data.gradeLevel = body.gradeLevel;
  if (typeof body.interviewSummary === "string") data.interviewSummary = body.interviewSummary;
  if (typeof body.selectedMajorId === "string") data.selectedMajorId = body.selectedMajorId;
  if (body.budgetUsdPerYear === null || typeof body.budgetUsdPerYear === "number") {
    data.budgetUsdPerYear = body.budgetUsdPerYear;
  }

  const row = await db.careerProfile.update({ where: { userId }, data });

  if (typeof body.gradeLevel === "number") {
    await db.studentProfile.update({
      where: { userId },
      data: { gradeLevel: body.gradeLevel },
    });
  }

  // Bridge career discovery into university matching. Registration deliberately
  // starts empty; constraints become admissions preferences only after the
  // student has encountered them in the navigator.
  if (Array.isArray(body.countries)) {
    const countries = body.countries.filter((value): value is string => typeof value === "string");
    await db.studentProfile.update({
      where: { userId },
      data: { preferredCountries: JSON.stringify(countries) },
    });
    const category = await db.userPreferenceCategory.upsert({
      where: { userId_categoryKey: { userId, categoryKey: "countries" } },
      create: { userId, categoryKey: "countries", priority: 15 },
      update: {},
    });
    await db.userPreferenceValue.deleteMany({ where: { categoryId: category.id } });
    if (countries.length) {
      await db.userPreferenceValue.createMany({
        data: countries.map((value) => ({ categoryId: category.id, value })),
      });
    }
  }

  if (body.budgetUsdPerYear === null || typeof body.budgetUsdPerYear === "number") {
    await db.studentProfile.update({
      where: { userId },
      data: { budgetUsdPerYear: body.budgetUsdPerYear as number | null },
    });
    const category = await db.userPreferenceCategory.upsert({
      where: { userId_categoryKey: { userId, categoryKey: "budget" } },
      create: { userId, categoryKey: "budget", priority: 14 },
      update: {},
    });
    await db.userPreferenceValue.deleteMany({ where: { categoryId: category.id } });
    if (typeof body.budgetUsdPerYear === "number") {
      await db.userPreferenceValue.create({
        data: { categoryId: category.id, value: String(body.budgetUsdPerYear) },
      });
    }
  }

  if (typeof body.selectedMajorId === "string") {
    const major = MAJOR_MAP.get(body.selectedMajorId);
    if (major) {
      const category = await db.userPreferenceCategory.upsert({
        where: { userId_categoryKey: { userId, categoryKey: "fields" } },
        create: { userId, categoryKey: "fields", priority: 16 },
        update: {},
      });
      await db.userPreferenceValue.deleteMany({ where: { categoryId: category.id } });
      await db.userPreferenceValue.create({
        data: { categoryId: category.id, value: major.name },
      });
      await db.studentProfile.update({
        where: { userId },
        data: { interests: JSON.stringify([major.name]) },
      });
    }
  }

  const profile = toProfileData(row);

  return Response.json({
    profile,
    completedSteps: parseCompletedSteps(row.completedSteps),
    selectedMajorId: row.selectedMajorId,
    confidence: profileConfidence(profile),
  });
}
