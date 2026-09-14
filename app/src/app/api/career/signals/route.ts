import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/auth";
import { buildStudentContext } from "@/lib/career/context";
import { EMPTY_RIASEC } from "@/lib/career/riasec";
import type { CulturalSignal, RiasecVector } from "@/lib/career/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Pre-seeded mappings for titles a demo is likely to hit. Keeps the immersive
 * step instant and keeps the model from inventing things about known works.
 */
const KNOWN: Record<string, Omit<CulturalSignal, "title" | "confirmed">> = {
  factorio: {
    kind: "game",
    constructs: ["Оптимизация систем", "Долгосрочное планирование", "Автоматизация"],
    riasecHint: { I: 15, C: 12, R: 8 },
    rationaleRu:
      "Factorio — это про построение всё более эффективной производственной системы: люди залипают в неё именно из-за оптимизации и масштабирования, а не из-за сюжета.",
  },
  minecraft: {
    kind: "game",
    constructs: ["Конструирование", "Свободное творчество", "Пространственное мышление"],
    riasecHint: { R: 10, A: 10, I: 6 },
    rationaleRu:
      "Minecraft чаще всего затягивает через строительство и изобретение собственных механизмов — это сочетание работы руками и творческой свободы.",
  },
  "cities skylines": {
    kind: "game",
    constructs: ["Городские системы", "Планирование", "Управление ресурсами"],
    riasecHint: { E: 10, C: 12, I: 8 },
    rationaleRu:
      "Cities: Skylines — симулятор управления сложной инфраструктурой, где интересен баланс потоков, а не соревнование.",
  },
  "kurzgesagt": {
    kind: "creator",
    constructs: ["Научная коммуникация", "Системное объяснение", "Визуализация идей"],
    riasecHint: { I: 14, A: 10, S: 8 },
    rationaleRu:
      "Kurzgesagt объясняет сложные научные темы через визуальные метафоры — интерес к нему обычно означает тягу к пониманию устройства мира.",
  },
  veritasium: {
    kind: "creator",
    constructs: ["Научный скептицизм", "Эксперимент", "Разбор заблуждений"],
    riasecHint: { I: 16, R: 8 },
    rationaleRu:
      "Veritasium строится на проверке интуитивных заблуждений через эксперимент — это ядро исследовательского типа интересов.",
  },
  "3blue1brown": {
    kind: "creator",
    constructs: ["Математическая интуиция", "Визуальное доказательство", "Абстракция"],
    riasecHint: { I: 18, A: 8, C: 8 },
    rationaleRu:
      "3Blue1Brown показывает математику визуально — интерес к нему указывает на комфорт с абстракцией и доказательным мышлением.",
  },
  "the sims": {
    kind: "game",
    constructs: ["Социальная симуляция", "Нарратив", "Дизайн пространства"],
    riasecHint: { S: 10, A: 12 },
    rationaleRu:
      "The Sims — про истории людей и обустройство пространства: сочетание социального интереса и эстетики.",
  },
  "civilization": {
    kind: "game",
    constructs: ["Стратегия", "Историко-экономические системы", "Долгая игра"],
    riasecHint: { E: 12, I: 10, C: 10 },
    rationaleRu:
      "Civilization требует управления экономикой и дипломатией на длинной дистанции — это предпринимательско-аналитический профиль.",
  },
};

function lookupKnown(title: string) {
  const key = title.toLowerCase().trim();
  if (KNOWN[key]) return KNOWN[key];
  const partial = Object.keys(KNOWN).find((k) => key.includes(k) || k.includes(key));
  return partial ? KNOWN[partial] : null;
}

async function analyse(title: string, brief: string): Promise<CulturalSignal> {
  const known = lookupKnown(title);
  if (known) return { title, confirmed: null, ...known };

  if (!process.env.OPENAI_API_KEY) {
    return {
      title,
      kind: "other",
      constructs: [],
      riasecHint: {},
      rationaleRu: "Не удалось разобрать этот пример — опиши своими словами, что тебе в нём нравится.",
      confirmed: null,
    };
  }

  try {
    const { text } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      system: `Ты разбираешь, что именно притягивает конкретного человека в том, что он любит.

Тебе дают профиль ученика. Один и тот же тайтл разные люди любят за разное — опирайся на то, что уже известно про этого, и объясняй так, чтобы он себя узнал. Если про этот тайтл ты не знаешь ничего достоверного, честно верни пустые constructs: догадка хуже, чем её отсутствие.`,
      prompt: `${brief}

---

Школьник назвал это среди любимого: "${title}".

Если ты не знаешь, что это, честно верни constructs: [] — НЕ ВЫДУМЫВАЙ.

Если знаешь, определи, какая деятельность реально притягивает человека в этом произведении/канале/игре. Не пересказывай сюжет — назови тип мышления.

Верни строго JSON без markdown:
{
  "kind": "game" | "creator" | "media" | "other",
  "constructs": ["<2-3 конструкта на русском, например «Оптимизация систем», «Научная коммуникация»>"],
  "riasecHint": { "R": <0-18>, "I": <0-18>, "A": <0-18>, "S": <0-18>, "E": <0-18>, "C": <0-18> },
  "rationaleRu": "<1-2 предложения: что именно в этом притягивает и почему это указывает на такой тип интересов>"
}

Ставь ненулевыми только те оси, которые действительно следуют. R — работа с материальным, I — исследование, A — творчество, S — люди, E — лидерство и влияние, C — порядок и системность.`,
      maxOutputTokens: 400,
      temperature: 0.4,
    });

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      kind?: CulturalSignal["kind"];
      constructs?: string[];
      riasecHint?: Partial<RiasecVector>;
      rationaleRu?: string;
    };

    const hint: Partial<RiasecVector> = {};
    for (const k of Object.keys(EMPTY_RIASEC) as (keyof RiasecVector)[]) {
      const v = Number(parsed.riasecHint?.[k] ?? 0);
      if (Number.isFinite(v) && v > 0) hint[k] = Math.min(18, Math.round(v));
    }

    return {
      title,
      kind: parsed.kind ?? "other",
      constructs: Array.isArray(parsed.constructs) ? parsed.constructs.slice(0, 3) : [],
      riasecHint: hint,
      rationaleRu: parsed.rationaleRu ?? "",
      confirmed: null,
    };
  } catch {
    return {
      title,
      kind: "other",
      constructs: [],
      riasecHint: {},
      rationaleRu: "Не получилось разобрать этот пример.",
      confirmed: null,
    };
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { titles?: string[] };
  const titles = (body.titles ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 6);

  const { brief } = await buildStudentContext(userId);
  const signals = await Promise.all(titles.map((t) => analyse(t, brief)));
  return Response.json({ signals });
}
