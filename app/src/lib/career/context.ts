import { db } from "@/lib/db";
import { getOrCreateProfile, toProfileData } from "./profile-store";
import { RIASEC_KEYS, RIASEC_META, hollandCode, topAxes } from "./riasec";
import { VALUE_MAP } from "./values";
import { MAJOR_MAP, SUBJECT_LABELS, FIELD_LABELS, allSkills } from "./majors";
import { profileConfidence } from "./match";
import type { CareerProfileData, SelfPortrait } from "./types";

/**
 * One briefing, shared by every model call in the product.
 *
 * The point is that the model always sees the same student the rest of the app
 * sees — the saved profile, the computed ranking, what has already been said in
 * earlier steps — instead of whatever fragment a particular request happened to
 * carry. Anything the model is allowed to reason about lives here.
 */

const MEDIA_LABELS: Record<string, string> = {
  games: "игры",
  video_essays: "разборы и лонгриды",
  streams: "стримы",
  series: "сериалы и кино",
  books: "книги",
  podcasts: "подкасты",
  music: "музыка",
  art: "визуал и арт",
  sport: "спорт",
  science: "научпоп",
};

const SKILL_LABELS = new Map(allSkills().map((s) => [s.key, s.labelRu]));

const LEVEL_WORDS = ["нет", "слабо", "базово", "уверенно", "сильно", "экспертно"];

function section(title: string, body: string | null): string {
  return body && body.trim() ? `\n### ${title}\n${body.trim()}` : "";
}

function riasecBlock(p: CareerProfileData): string | null {
  const filled = RIASEC_KEYS.some((k) => p.riasec[k] > 0);
  if (!filled) return null;
  const lines = [...RIASEC_KEYS]
    .sort((a, b) => p.riasec[b] - p.riasec[a])
    .map((k) => `- ${RIASEC_META[k].labelRu} (${k}): ${p.riasec[k]}/100 — ${RIASEC_META[k].descriptionRu}`);
  const lead = topAxes(p.riasec, 2)
    .map((k) => RIASEC_META[k].labelRu.toLowerCase())
    .join(" + ");
  return `Код Холланда: ${hollandCode(p.riasec)}. Ведущие оси: ${lead}.\n${lines.join("\n")}`;
}

function valuesBlock(p: CareerProfileData): string | null {
  if (!p.values.length) return null;
  const ranked = p.values
    .filter((v) => v.rank <= 5)
    .sort((a, b) => a.rank - b.rank)
    .map((v) => {
      const card = VALUE_MAP.get(v.key);
      return `${v.rank}. ${card?.labelRu ?? v.key} — «${card?.hintRu ?? ""}» (вес ${v.weight.toFixed(2)}, ценность Шварца: ${card?.schwartz ?? "—"})`;
    });
  const rest = p.values
    .filter((v) => v.rank > 5)
    .map((v) => VALUE_MAP.get(v.key)?.labelRu ?? v.key);
  return [
    ranked.join("\n"),
    rest.length ? `Прошли в десятку, но не в финал: ${rest.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function subjectsBlock(p: CareerProfileData): string | null {
  if (!p.subjects.length) return null;
  const sorted = [...p.subjects].sort((a, b) => b.grade - a.grade);
  const strong = sorted.filter((s) => s.grade >= 4);
  const weak = sorted.filter((s) => s.grade <= 3);
  return [
    strong.length
      ? `Сильные: ${strong.map((s) => `${SUBJECT_LABELS[s.key] ?? s.key} (${s.grade})`).join(", ")}.`
      : "",
    weak.length
      ? `Проседают: ${weak.map((s) => `${SUBJECT_LABELS[s.key] ?? s.key} (${s.grade})`).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function skillsBlock(p: CareerProfileData): string | null {
  if (!p.skills.length) return null;
  const sorted = [...p.skills].sort((a, b) => b.level - a.level);
  const top = sorted.filter((s) => s.level >= 4);
  const low = sorted.filter((s) => s.level <= 1);
  return [
    top.length
      ? `Оценил высоко: ${top.map((s) => `${SKILL_LABELS.get(s.key) ?? s.key} — ${LEVEL_WORDS[s.level]}`).join(", ")}.`
      : "",
    low.length
      ? `Оценил низко: ${low.map((s) => `${SKILL_LABELS.get(s.key) ?? s.key} — ${LEVEL_WORDS[s.level]}`).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function portraitBlock(portrait: SelfPortrait | null): string | null {
  if (!portrait) return null;
  const bits: string[] = [];
  if (portrait.mediaDiet?.length) {
    bits.push(
      `Медиа-рацион: ${portrait.mediaDiet.map((k) => MEDIA_LABELS[k] ?? k).join(", ")}.`,
    );
  }
  if (portrait.creators?.length) {
    bits.push(`Авторы и каналы, которых смотрит постоянно: ${portrait.creators.join(", ")}.`);
  }
  if (portrait.childhood) bits.push(`Что затягивало в 8–10 лет: «${portrait.childhood}»`);
  if (portrait.nowadays) bits.push(`Что затягивает сейчас: «${portrait.nowadays}»`);
  if (portrait.betterThanPeers) {
    bits.push(`В чём считает себя сильнее ровесников: «${portrait.betterThanPeers}»`);
  }
  if (portrait.futureDay) {
    bits.push(`Как описывает свой обычный день через 10 лет: «${portrait.futureDay}»`);
  }
  return bits.length ? bits.join("\n") : null;
}

function signalsBlock(p: CareerProfileData): string | null {
  if (!p.culturalSignals.length) return null;
  const confirmed = p.culturalSignals.filter((s) => s.confirmed === true);
  const rejected = p.culturalSignals.filter((s) => s.confirmed === false);
  return [
    confirmed.length
      ? `Подтвердил, что про него: ${confirmed
          .map((s) => `${s.title} → ${s.constructs.join(", ")}`)
          .join("; ")}.`
      : "",
    rejected.length
      ? `ОТКЛОНИЛ (не считать это про него): ${rejected.map((s) => s.title).join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export interface StudentContext {
  /** The full briefing, ready to drop into a prompt. */
  brief: string;
  profile: CareerProfileData;
  confidence: ReturnType<typeof profileConfidence>;
  /** Which parts of the profile are still empty — useful for deciding what to ask. */
  missing: string[];
}

export async function buildStudentContext(userId: string): Promise<StudentContext> {
  const row = await getOrCreateProfile(userId);
  const profile = toProfileData(row);
  const confidence = profileConfidence(profile);

  const [user, recommendations, savedUniversities, interview] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, profile: { select: { fullName: true, gpa: true, gpaScale: true, ieltsOverall: true, satTotal: true } } },
    }),
    db.majorRecommendation.findMany({
      where: { profileId: row.id },
      orderBy: { rank: "asc" },
    }),
    db.userUniversity.findMany({
      where: { userId, status: "saved" },
      include: { university: { select: { name: true, country: true, city: true, worldRank: true } } },
      take: 10,
    }),
    db.chatSession.findFirst({
      where: { userId, title: "career-interview" },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    }),
  ]);

  const parts: string[] = [];

  const name = user?.profile?.fullName || user?.name || null;
  parts.push(
    `## Кто перед тобой\n${name ? `${name}, ` : ""}ученик ${profile.gradeLevel} класса.` +
      (user?.profile?.gpa
        ? ` GPA ${user.profile.gpa}/${user.profile.gpaScale}.`
        : "") +
      (user?.profile?.ieltsOverall ? ` IELTS ${user.profile.ieltsOverall}.` : "") +
      (user?.profile?.satTotal ? ` SAT ${user.profile.satTotal}.` : ""),
  );

  parts.push(section("Тип интересов (RIASEC)", riasecBlock(profile)));
  parts.push(section("Ценности в порядке приоритета", valuesBlock(profile)));
  parts.push(section("Школьные предметы", subjectsBlock(profile)));
  parts.push(section("Самооценка навыков (0–5)", skillsBlock(profile)));
  parts.push(section("Что рассказал о себе", portraitBlock(profile.selfPortrait)));
  parts.push(section("Разбор увлечений", signalsBlock(profile)));
  parts.push(section("Итог прошлого интервью", profile.interviewSummary));

  if (interview?.messages.length) {
    parts.push(
      section(
        "Стенограмма разговора с ним",
        interview.messages
          .map((m) => `${m.role === "assistant" ? "Ты" : "Ученик"}: ${m.content}`)
          .join("\n"),
      ),
    );
  }

  if (recommendations.length) {
    const list = recommendations
      .map((r) => {
        const major = MAJOR_MAP.get(r.majorId);
        return `${r.rank}. ${major?.nameRu ?? r.majorId} — ${r.score}/100 (${FIELD_LABELS[major?.field ?? ""] ?? major?.field ?? ""})`;
      })
      .join("\n");
    parts.push(
      section(
        "Уже посчитанный рейтинг направлений",
        `${list}\n\nЭти баллы посчитаны детерминированным движком. Не оспаривай их и не выдумывай другие.`,
      ),
    );
  }

  if (row.selectedMajorId) {
    const major = MAJOR_MAP.get(row.selectedMajorId);
    parts.push(section("Выбранное основное направление", major?.nameRu ?? row.selectedMajorId));
  }

  const constraints: string[] = [];
  if (profile.constraints.countries.length) {
    constraints.push(`Рассматривает страны: ${profile.constraints.countries.join(", ")}.`);
  }
  if (profile.constraints.budgetUsdPerYear) {
    constraints.push(`Бюджет: до $${profile.constraints.budgetUsdPerYear.toLocaleString()} в год.`);
  }
  parts.push(section("Ограничения по поступлению", constraints.join(" ") || null));

  if (savedUniversities.length) {
    parts.push(
      section(
        "Сохранённые университеты",
        savedUniversities
          .map((s) => `${s.university.name} (${s.university.city}, ${s.university.country})`)
          .join("; "),
      ),
    );
  }

  const missing = confidence.blocks.filter((b) => !b.done).map((b) => b.labelRu);
  if (missing.length) {
    parts.push(
      section(
        "Чего система про него пока не знает",
        `${missing.join(", ")}. Уверенность профиля: ${confidence.score}%.`,
      ),
    );
  }

  return {
    brief: parts.filter(Boolean).join("\n"),
    profile,
    confidence,
    missing,
  };
}
