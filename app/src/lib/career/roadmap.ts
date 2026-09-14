/**
 * Roadmap generator.
 *
 * Derived from the student's actual gaps rather than a generic checklist: the
 * same deficits that produced the skills-gap list become dated actions, so the
 * answer to "what do I do now" is traceable to the diagnosis.
 */
import { SUBJECT_LABELS } from "./majors";
import type { CareerProfileData, Major, SkillGapItem } from "./types";

export interface RoadmapItem {
  titleRu: string;
  detailRu: string;
  category: "academics" | "skills" | "portfolio" | "admissions";
}

export interface RoadmapPhase {
  key: string;
  labelRu: string;
  timingRu: string;
  items: RoadmapItem[];
}

const CATEGORY_ORDER: RoadmapItem["category"][] = [
  "academics",
  "skills",
  "portfolio",
  "admissions",
];

function weakSubjects(profile: CareerProfileData, major: Major): string[] {
  const grades = new Map(profile.subjects.map((s) => [s.key, s.grade]));
  return major.subjects.filter((k) => (grades.get(k) ?? 5) <= 3);
}

export function buildRoadmap(
  profile: CareerProfileData,
  major: Major,
  gaps: SkillGapItem[],
): RoadmapPhase[] {
  const grade = profile.gradeLevel;
  const weak = weakSubjects(profile, major);
  const hardGaps = gaps.filter((g) => g.type === "hard").slice(0, 3);
  const softGaps = gaps.filter((g) => g.type === "soft").slice(0, 2);

  const phases: RoadmapPhase[] = [];

  const now: RoadmapItem[] = [];

  if (weak.length > 0) {
    now.push({
      category: "academics",
      titleRu: `Подтянуть ${weak.map((k) => SUBJECT_LABELS[k] ?? k).join(" и ")}`,
      detailRu:
        "Это профильные предметы для поступления на эту специальность — именно они сейчас сильнее всего снижают твои шансы.",
    });
  } else {
    now.push({
      category: "academics",
      titleRu: "Удержать уровень по профильным предметам",
      detailRu: `Для этого направления ключевые предметы — ${major.subjects
        .map((k) => SUBJECT_LABELS[k] ?? k)
        .join(", ")}. Они у тебя в порядке, задача — не просесть.`,
    });
  }

  if (hardGaps.length > 0) {
    now.push({
      category: "skills",
      titleRu: `Начать с одного навыка: ${hardGaps[0].labelRu.toLowerCase()}`,
      detailRu: `Сейчас у тебя ${hardGaps[0].current} из ${hardGaps[0].required}. Не берись за всё сразу — один навык за раз даёт результат быстрее.`,
    });
  }

  now.push({
    category: "portfolio",
    titleRu: "Сделать один маленький проект по теме",
    detailRu:
      "Не «выучить теорию», а довести до конца что-то маленькое и показываемое. Это одновременно проверка гипотезы: понравится ли тебе процесс.",
  });

  phases.push({
    key: "now",
    labelRu: "Прямо сейчас",
    timingRu: "ближайшие 1-2 месяца",
    items: now,
  });

  if (grade <= 9) {
    phases.push({
      key: "grade10",
      labelRu: "10 класс",
      timingRu: "год до финального рывка",
      items: [
        {
          category: "academics",
          titleRu: "Определиться с профилем и набором экзаменов",
          detailRu: `Для ${major.nameRu} обычно нужны ${major.subjects
            .slice(0, 3)
            .map((k) => SUBJECT_LABELS[k] ?? k)
            .join(", ")}. Выбор профиля в 10 классе почти определяет, куда ты сможешь подать документы.`,
        },
        ...hardGaps.slice(1).map<RoadmapItem>((g) => ({
          category: "skills",
          titleRu: `Довести навык «${g.labelRu.toLowerCase()}» до рабочего уровня`,
          detailRu: `Нужный уровень — ${g.required} из 5, сейчас ${g.current}.`,
        })),
        {
          category: "portfolio",
          titleRu: "Проверить профессию изнутри",
          detailRu:
            "Олимпиада, летняя школа, стажировка или разговор с человеком из профессии. Цель — снять розовые очки до того, как ты подашь документы.",
        },
      ],
    });
  }

  if (grade <= 10) {
    phases.push({
      key: "grade11",
      labelRu: "11 класс",
      timingRu: "год поступления",
      items: [
        {
          category: "admissions",
          titleRu: "Собрать список университетов: мечта / реальные / запасные",
          detailRu:
            "По 2-3 в каждой категории. Опирайся на подбор в разделе «Университеты» — он уже учитывает твой бюджет и страны.",
        },
        {
          category: "admissions",
          titleRu: "Языковой экзамен и документы",
          detailRu:
            "IELTS/TOEFL сдают заранее — пересдача занимает недели, а дедлайны не двигаются.",
        },
        ...softGaps.map<RoadmapItem>((g) => ({
          category: "skills",
          titleRu: `Развить «${g.labelRu.toLowerCase()}»`,
          detailRu:
            "Это качество почти не проверяют на экзамене, но оно определяет, насколько тяжело тебе будет на первом курсе.",
        })),
        {
          category: "portfolio",
          titleRu: "Мотивационное эссе на основе своего опыта",
          detailRu:
            "Опирайся на реальные проекты из своего профиля, а не на общие слова о любви к науке.",
        },
      ],
    });
  }

  phases.push({
    key: "university",
    labelRu: "После поступления",
    timingRu: "1-2 курс",
    items: [
      {
        category: "skills",
        titleRu: "Закрыть оставшиеся профессиональные пробелы",
        detailRu:
          gaps.length > 0
            ? `К этому моменту стоит выйти на рабочий уровень по: ${gaps
                .slice(0, 4)
                .map((g) => g.labelRu.toLowerCase())
                .join(", ")}.`
            : "Углубляй специализацию внутри направления.",
      },
      {
        category: "portfolio",
        titleRu: "Первая практика или стажировка",
        detailRu: `Типичные роли на выходе: ${major.careers
          .map((c) => c.titleRu)
          .join(", ")}. Первый реальный опыт лучше получить до выпускного курса.`,
      },
    ],
  });

  for (const p of phases) {
    p.items.sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
    );
  }

  return phases;
}
