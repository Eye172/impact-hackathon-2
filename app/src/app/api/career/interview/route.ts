import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { buildStudentContext } from "@/lib/career/context";
import { EMPTY_RIASEC, RIASEC_META } from "@/lib/career/riasec";
import type { RiasecVector } from "@/lib/career/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** A hard ceiling, not a target — the interviewer stops earlier when it has enough. */
const MAX_QUESTIONS = 7;
const MIN_QUESTIONS = 4;

interface Turn {
  role: "assistant" | "user";
  content: string;
}

/**
 * The interviewer is given the whole student and a goal, not a script.
 *
 * Earlier versions listed rules for every turn and produced obedient, generic
 * questions. What actually digs is telling the model what it is looking for and
 * letting it choose the route.
 */
const SYSTEM = `Ты ведёшь разговор со школьником, который пытается понять, куда ему идти после школы.

Ты не анкета и не тест. Ты — внимательный взрослый, который умеет заметить то, чего человек сам про себя не говорит: где он оживает, где выгорает, что делает по-настоящему хорошо, а что о себе придумал.

Тебе дают всё, что система уже знает об этом ученике: его тип интересов, ценности, оценки, самооценку навыков, что он написал о себе и о своих увлечениях. Пользуйся этим свободно. Самое ценное — противоречия: когда написанное о себе расходится с оценками, с выбранными ценностями или с тем, что он говорит сейчас. Иди туда.

Ты сам решаешь, о чём спрашивать, и сам ведёшь линию разговора:
- если ответ размытый или общий — не иди дальше, переспроси и вытяни конкретику: случай, момент, цифру, имя
- если ответ зацепил — копай в ту же точку несколько вопросов подряд, пока не дойдёшь до сути
- если линия исчерпана или человек явно закрывается — меняй направление, заходи с другой стороны
- возвращайся к сказанному раньше и сталкивай это с новым ответом («ты говорил X, а сейчас звучит как Y — как это вместе?»)

Один вопрос за раз, живым языком, на «ты».

Границы: это профориентационная беседа, не психотерапия и не клиническая диагностика. Можно
бережно исследовать повторяющиеся темы, противоречия и личные смыслы как гипотезы, но нельзя
ставить диагнозы, объяснять ответы травмой, бессознательными конфликтами или семейной динамикой.
Такие интерпретации не добавляют баллы и не влияют на детерминированный рейтинг.

Чего делать нельзя: спрашивать «кем ты хочешь стать», предлагать профессии, оценивать и хвалить, задавать вопрос, ответ на который уже есть в контексте.`;

const OPENING =
  "Расскажи про задачу или проект за последний год, над которым ты залип так, что забыл про время. Что это было?";

function transcriptOf(history: Turn[]): string {
  return history
    .map((t) => `${t.role === "assistant" ? "Ты" : "Ученик"}: ${t.content}`)
    .join("\n");
}

function fallbackQuestion(history: Turn[], index: number): string {
  const last = [...history].reverse().find((t) => t.role === "user")?.content ?? "";
  const anchor = last.trim().split(/\s+/).slice(0, 6).join(" ") || "этот опыт";
  const templates = [
    `Ты сказал про «${anchor}» — что было самым сложным, и что чуть не заставило бросить?`,
    `А что в «${anchor}» нравилось меньше всего, но делать приходилось?`,
    `Ты в этом предпочитал разбираться один или обсуждать с кем-то?`,
    `Что бы ты сделал иначе, если бы начинал «${anchor}» заново?`,
  ];
  return templates[Math.min(index, templates.length - 1)];
}

interface NextTurn {
  question: string;
  enough: boolean;
}

async function nextQuestion(
  history: Turn[],
  brief: string,
): Promise<NextTurn> {
  const asked = history.filter((t) => t.role === "assistant").length;
  const answered = history.filter((t) => t.role === "user").length;

  if (!process.env.OPENAI_API_KEY) {
    return {
      question: asked === 0 ? OPENING : fallbackQuestion(history, asked - 1),
      enough: answered >= MIN_QUESTIONS + 1,
    };
  }

  const task =
    asked === 0
      ? `Начни разговор. Задай первый вопрос — такой, который цепляется за что-то конкретное из контекста выше, а не общий.`
      : `Разговор пока такой:\n${transcriptOf(history)}\n\nЗадай следующий вопрос.`;

  const budget =
    answered >= MIN_QUESTIONS
      ? `\n\nТы задал уже ${asked} вопросов. Если картина сложилась и новый вопрос ничего не добавит — верни "enough": true и пустой вопрос. Предел — ${MAX_QUESTIONS} вопросов.`
      : "";

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      system: SYSTEM,
      prompt: `${brief}\n\n---\n\n${task}${budget}\n\nВерни строго JSON без markdown: {"question": "<текст вопроса или пустая строка>", "enough": <true|false>}`,
      maxOutputTokens: 300,
      temperature: 0.85,
    });

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      question?: string;
      enough?: boolean;
    };
    const question = (parsed.question ?? "").trim().replace(/^["«]|["»]$/g, "");

    if (parsed.enough && answered >= MIN_QUESTIONS) return { question: "", enough: true };
    if (!question) {
      return {
        question: asked === 0 ? OPENING : fallbackQuestion(history, asked - 1),
        enough: false,
      };
    }
    return { question, enough: false };
  } catch {
    return {
      question: asked === 0 ? OPENING : fallbackQuestion(history, asked - 1),
      enough: false,
    };
  }
}

interface Extraction {
  summary: string;
  riasecDelta: Partial<RiasecVector>;
  observations: string[];
  /** Skills the conversation revealed, keyed the same way the profile is. */
  skillHints: { key: string; level: number; whyRu: string }[];
  contradictions: string[];
}

function fallbackExtraction(history: Turn[]): Extraction {
  const answers = history.filter((t) => t.role === "user").map((t) => t.content);
  const joined = answers.join(" ").toLowerCase();

  const delta: Partial<RiasecVector> = {};
  const bump = (k: keyof RiasecVector, by: number) => {
    delta[k] = (delta[k] ?? 0) + by;
  };

  if (/собра|почини|устройств|железк|робот|схем/.test(joined)) bump("R", 12);
  if (/почему|разобрат|исследов|данн|эксперимент|алгоритм/.test(joined)) bump("I", 12);
  if (/придума|нарисов|дизайн|музык|написа|сочин/.test(joined)) bump("A", 12);
  if (/объясн|помог|научи|команд|друз|волонт/.test(joined)) bump("S", 12);
  if (/организ|запусти|продал|убеди|возглав|бизнес/.test(joined)) bump("E", 12);
  if (/таблиц|поряд|систематиз|план|структур|учёт/.test(joined)) bump("C", 12);

  return {
    summary: `Ученик описал ${answers.length} эпизода личного опыта. Разбор выполнен по ключевым маркерам ответов — языковая модель была недоступна.`,
    riasecDelta: delta,
    observations: answers.slice(0, 3).map((a) => a.trim().slice(0, 120)),
    skillHints: [],
    contradictions: [],
  };
}

async function extract(history: Turn[], brief: string): Promise<Extraction> {
  if (!process.env.OPENAI_API_KEY) return fallbackExtraction(history);

  const axes = Object.entries(RIASEC_META)
    .map(([k, v]) => `${k} — ${v.labelRu}: ${v.descriptionRu}`)
    .join("\n");

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      prompt: `${brief}

---

Оси интересов Холланда:
${axes}

Разговор, который только что состоялся:
${transcriptOf(history)}

Сопоставь разговор со всем, что система знала о нём раньше. Особенно интересны места, где сказанное сейчас расходится с анкетой, с оценками или с тем, что он писал о себе.

Верни строго JSON без markdown:
{
  "summary": "<3-4 предложения в третьем лице: как он любит работать, что его включает, где проседает. Опирайся на конкретику разговора, не на общие слова>",
  "riasecDelta": { "R": <0-20>, "I": <0-20>, "A": <0-20>, "S": <0-20>, "E": <0-20>, "C": <0-20> },
  "observations": ["<наблюдение с опорой на то, что он реально сказал>", "…"],
  "skillHints": [{ "key": "<ключ навыка, если разговор его выявил>", "level": <0-5>, "whyRu": "<на основании чего>" }],
  "contradictions": ["<расхождение между его словами и профилем, если заметил>"]
}

riasecDelta — добавка к анкете, а не полная оценка: ненулевые значения только там, где в разговоре есть прямое подтверждение. Пустые массивы допустимы. Ничего не выдумывай.`,
      maxOutputTokens: 900,
      temperature: 0.3,
    });

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as Partial<Extraction>;
    if (!parsed.summary || !parsed.riasecDelta) return fallbackExtraction(history);

    const delta: Partial<RiasecVector> = {};
    for (const k of Object.keys(EMPTY_RIASEC) as (keyof RiasecVector)[]) {
      const v = Number(parsed.riasecDelta[k] ?? 0);
      if (Number.isFinite(v) && v > 0) delta[k] = Math.min(20, Math.round(v));
    }

    return {
      summary: parsed.summary,
      riasecDelta: delta,
      observations: Array.isArray(parsed.observations) ? parsed.observations.slice(0, 4) : [],
      skillHints: Array.isArray(parsed.skillHints) ? parsed.skillHints.slice(0, 6) : [],
      contradictions: Array.isArray(parsed.contradictions)
        ? parsed.contradictions.slice(0, 3)
        : [],
    };
  } catch {
    return fallbackExtraction(history);
  }
}

const INTERVIEW_TITLE = "career-interview";

/** One durable transcript per student, reused across reloads. */
async function interviewSession(userId: string) {
  const existing = await db.chatSession.findFirst({
    where: { userId, title: INTERVIEW_TITLE },
    orderBy: { createdAt: "desc" },
  });
  return existing ?? db.chatSession.create({ data: { userId, title: INTERVIEW_TITLE } });
}

/** Append only what is new, so replays and retries do not duplicate turns. */
async function persist(sessionId: string, history: Turn[], nextQuestionText?: string) {
  const stored = await db.chatMessage.count({ where: { sessionId } });
  const rows = history.slice(stored).map((t) => ({
    sessionId,
    role: t.role === "assistant" ? "assistant" : "user",
    content: t.content,
  }));
  if (nextQuestionText) {
    rows.push({ sessionId, role: "assistant", content: nextQuestionText });
  }
  if (rows.length) await db.chatMessage.createMany({ data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { history?: Turn[] };
  const history = Array.isArray(body.history) ? body.history : [];
  const answered = history.filter((t) => t.role === "user").length;

  // Everything the model knows comes from the database, not from the client.
  const { brief } = await buildStudentContext(userId);
  const chat = await interviewSession(userId);

  if (answered >= MAX_QUESTIONS) {
    await persist(chat.id, history);
    return Response.json({ done: true, ...(await extract(history, brief)) });
  }

  const turn = await nextQuestion(history, brief);

  if (turn.enough) {
    await persist(chat.id, history);
    return Response.json({ done: true, ...(await extract(history, brief)) });
  }

  await persist(chat.id, history, turn.question);

  return Response.json({
    done: false,
    question: turn.question,
    questionNumber: answered + 1,
    total: MAX_QUESTIONS,
  });
}
