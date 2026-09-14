import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/auth";
import { buildStudentContext } from "@/lib/career/context";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  messages: UIMessage[];
}

/**
 * The advisor sees exactly what every other model call sees, so a student can
 * pick up a conversation about a recommendation without re-explaining
 * themselves — the ranking, the interview and the profile are all already there.
 */
const ADVISOR_SYSTEM = `Ты — карьерный навигатор Compass. Разговариваешь со школьником, который выбирает, куда идти после школы.

Тебе дают всё, что система про него знает: тип интересов, ценности, оценки, навыки, что он написал о себе, стенограмму разговора с ним и уже посчитанный рейтинг направлений. Пользуйся этим свободно и не спрашивай того, что там уже есть.

Как себя вести:
- говори на «ты», просто и по делу, без канцелярита и без пафоса
- опирайся на его конкретику: его слова, его оценки, его баллы. Общие советы бесполезны
- если он спрашивает «почему именно это направление» — объясни через его профиль, а не через описание профессии
- баллы направлений посчитаны движком: объясняй их, но не переоценивай и не выдумывай новые
- если данных для ответа не хватает — скажи, чего не хватает, и предложи это заполнить
- не бойся возражать: если его план расходится с тем, что видно в профиле, скажи об этом прямо и объясни, на чём основано

Решение всегда за ним. Твоя работа — показать варианты и снизить неопределённость, а не назначить судьбу.`;

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!Array.isArray(body?.messages)) {
    return Response.json({ error: "'messages' must be a UIMessage[] array." }, { status: 400 });
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const context = userId
    ? (await buildStudentContext(userId)).brief
    : "Ученик не вошёл в аккаунт — профиля нет. Отвечай общо и предложи пройти навигатор.";

  const result = streamText({
    model: openai(process.env.OPENAI_CHAT_MODEL ?? "gpt-4o"),
    system: `${ADVISOR_SYSTEM}

---

${context}`,
    messages: await convertToModelMessages(body.messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
