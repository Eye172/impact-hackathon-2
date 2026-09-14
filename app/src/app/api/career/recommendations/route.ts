import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getOrCreateProfile, toProfileData } from "@/lib/career/profile-store";
import { buildStudentContext } from "@/lib/career/context";
import { rankMajors } from "@/lib/career/match";
import { MAJOR_MAP } from "@/lib/career/majors";
import type { MajorFit } from "@/lib/career/types";

async function requireUserId() {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

/**
 * The LLM never ranks anything — it receives the already-computed score and
 * evidence and turns it into a paragraph a 16-year-old will actually read.
 */
async function narrate(
  brief: string,
  fit: MajorFit,
): Promise<string | null> {
  const major = MAJOR_MAP.get(fit.majorId);
  if (!major || !process.env.OPENAI_API_KEY) return null;

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      system: `Ты объясняешь школьнику, почему конкретное направление оказалось у него в списке.

Тебе дают всё, что система знает про этого человека, и уже посчитанный балл с разбором. Балл менять нельзя — твоя работа объяснить его так, чтобы человек узнал себя.

Пиши как человек, а не как отчёт: обращайся на «ты», опирайся на его собственные слова и факты из профиля, называй вещи своими именами. Обязательно скажи, что здесь будет тяжело или чего не хватает — без этого объяснение не стоит доверия.

Ничего не выдумывай: только то, что есть в контексте. Без markdown, без заголовков, без «ты обязательно добьёшься».`,
      prompt: `${brief}

---

Направление: ${major.nameRu}
Итоговое совпадение: ${fit.score}/100 (посчитано движком, не оспаривай)

Из чего сложился балл:
${fit.evidence.map((e) => `- [${e.polarity}] ${e.labelRu} (вклад ${Math.round(e.weight * 100)}%)`).join("\n")}

Что предстоит подтянуть:
${fit.skillGaps.slice(0, 4).map((g) => `- ${g.labelRu}: сейчас ${g.current} из ${g.required}`).join("\n") || "— существенных пробелов нет"}

Напиши 3-4 предложения.`,
      maxOutputTokens: 450,
      temperature: 0.75,
    });
    return text.trim();
  } catch (err) {
    console.error("[career/narrate]", err);
    return null;
  }
}

export async function POST() {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await getOrCreateProfile(userId);
  const profile = toProfileData(row);
  const { brief } = await buildStudentContext(userId);

  const fits = rankMajors(profile, 5);

  const narratives = await Promise.all(fits.map((f) => narrate(brief, f)));

  await db.majorRecommendation.deleteMany({ where: { profileId: row.id } });
  await db.majorRecommendation.createMany({
    data: fits.map((fit, i) => ({
      profileId: row.id,
      majorId: fit.majorId,
      rank: i + 1,
      score: fit.score,
      evidence: JSON.stringify(fit.evidence),
      breakdown: JSON.stringify(fit.breakdown),
      skillGaps: JSON.stringify(fit.skillGaps),
      narrative: narratives[i],
    })),
  });

  return Response.json({
    recommendations: fits.map((fit, i) => ({
      ...fit,
      rank: i + 1,
      narrative: narratives[i],
      major: MAJOR_MAP.get(fit.majorId),
    })),
  });
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await getOrCreateProfile(userId);
  const saved = await db.majorRecommendation.findMany({
    where: { profileId: row.id },
    orderBy: { rank: "asc" },
  });

  return Response.json({
    recommendations: saved.map((r) => ({
      majorId: r.majorId,
      rank: r.rank,
      score: r.score,
      evidence: JSON.parse(r.evidence),
      breakdown: JSON.parse(r.breakdown),
      skillGaps: JSON.parse(r.skillGaps),
      narrative: r.narrative,
      major: MAJOR_MAP.get(r.majorId),
    })),
  });
}
