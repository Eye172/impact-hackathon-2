/**
 * Major catalogue.
 *
 * RIASEC vectors follow O*NET interest profiles for the occupations each major
 * feeds; salaries are O*NET/BLS medians rounded to the nearest thousand.
 */
import type { Major } from "./types";

const S = (
  key: string,
  label: string,
  labelRu: string,
  type: "hard" | "soft",
  weight: number,
) => ({ key, label, labelRu, type, weight });

export const MAJORS: Major[] = [
  {
    id: "computer-science",
    name: "Computer Science",
    nameRu: "Компьютерные науки",
    field: "Computer Science",
    descriptionRu:
      "Алгоритмы, системы и данные. Учишься не «программировать на языке», а строить решения, которые масштабируются.",
    riasec: { R: 45, I: 95, A: 40, S: 20, E: 35, C: 70 },
    values: ["learning", "income", "autonomy", "mobility", "safety_net", "creation"],
    skills: [
      S("logic", "Logical reasoning", "Логическое мышление", "hard", 5),
      S("math", "Discrete math", "Дискретная математика", "hard", 4),
      S("coding", "Programming", "Программирование", "hard", 5),
      S("persistence", "Debugging persistence", "Усидчивость в отладке", "soft", 4),
      S("systems", "Systems thinking", "Системное мышление", "hard", 4),
    ],
    subjects: ["math", "informatics", "physics", "english"],
    careers: [
      { title: "Software Engineer", titleRu: "Инженер-программист", medianSalaryUsd: 133000, demand: "high", onetCode: "15-1252.00" },
      { title: "Data Engineer", titleRu: "Дата-инженер", medianSalaryUsd: 131000, demand: "high" },
      { title: "Security Analyst", titleRu: "Аналитик по кибербезопасности", medianSalaryUsd: 124000, demand: "high" },
    ],
    universityFields: ["Computer Science", "Software Engineering", "Information Technology"],
  },
  {
    id: "data-science",
    name: "Data Science & AI",
    nameRu: "Data Science и ИИ",
    field: "Data Science",
    descriptionRu:
      "Статистика плюс код. Превращаешь сырые данные в выводы, на которые люди опираются при решениях.",
    riasec: { R: 25, I: 100, A: 35, S: 25, E: 40, C: 80 },
    values: ["learning", "income", "mastery", "impact", "autonomy"],
    skills: [
      S("stats", "Statistics", "Статистика", "hard", 5),
      S("coding", "Programming", "Программирование", "hard", 4),
      S("math", "Linear algebra", "Линейная алгебра", "hard", 4),
      S("communication", "Explaining findings", "Объяснение результатов", "soft", 4),
      S("skepticism", "Critical scrutiny", "Критичность к данным", "soft", 5),
    ],
    subjects: ["math", "informatics", "english", "physics"],
    careers: [
      { title: "Data Scientist", titleRu: "Дата-сайентист", medianSalaryUsd: 112000, demand: "high", onetCode: "15-2051.00" },
      { title: "ML Engineer", titleRu: "ML-инженер", medianSalaryUsd: 141000, demand: "high" },
      { title: "Quantitative Analyst", titleRu: "Квант-аналитик", medianSalaryUsd: 152000, demand: "medium" },
    ],
    universityFields: ["Data Science", "Artificial Intelligence", "Computer Science", "Mathematics"],
  },
  {
    id: "electrical-engineering",
    name: "Electrical Engineering",
    nameRu: "Электротехника и электроника",
    field: "Engineering",
    descriptionRu:
      "От микросхем до энергосетей. Физика, которую можно потрогать, и устройства, которые реально работают.",
    riasec: { R: 90, I: 85, A: 25, S: 15, E: 30, C: 60 },
    values: ["mastery", "stability", "income", "safety_net", "creation"],
    skills: [
      S("physics", "Physics", "Физика", "hard", 5),
      S("math", "Calculus", "Высшая математика", "hard", 5),
      S("hands_on", "Hands-on prototyping", "Работа руками, прототипы", "hard", 4),
      S("precision", "Precision", "Точность", "soft", 4),
      S("systems", "Systems thinking", "Системное мышление", "hard", 3),
    ],
    subjects: ["physics", "math", "informatics"],
    careers: [
      { title: "Electrical Engineer", titleRu: "Инженер-электроник", medianSalaryUsd: 106000, demand: "high", onetCode: "17-2071.00" },
      { title: "Robotics Engineer", titleRu: "Инженер-робототехник", medianSalaryUsd: 104000, demand: "medium" },
      { title: "Power Systems Engineer", titleRu: "Инженер энергосистем", medianSalaryUsd: 101000, demand: "medium" },
    ],
    universityFields: ["Electrical Engineering", "Engineering", "Robotics"],
  },
  {
    id: "mechanical-engineering",
    name: "Mechanical Engineering",
    nameRu: "Машиностроение",
    field: "Engineering",
    descriptionRu:
      "Проектируешь то, что движется и держит нагрузку: от двигателей до промышленных линий.",
    riasec: { R: 95, I: 80, A: 30, S: 15, E: 35, C: 55 },
    values: ["mastery", "stability", "safety_net", "creation", "structure"],
    skills: [
      S("physics", "Mechanics", "Механика", "hard", 5),
      S("math", "Calculus", "Высшая математика", "hard", 4),
      S("cad", "CAD modelling", "3D-моделирование, CAD", "hard", 4),
      S("hands_on", "Hands-on prototyping", "Работа руками, прототипы", "hard", 4),
      S("precision", "Precision", "Точность", "soft", 4),
    ],
    subjects: ["physics", "math", "geometry"],
    careers: [
      { title: "Mechanical Engineer", titleRu: "Инженер-механик", medianSalaryUsd: 99000, demand: "high", onetCode: "17-2141.00" },
      { title: "Aerospace Engineer", titleRu: "Инженер-авиаконструктор", medianSalaryUsd: 130000, demand: "medium" },
      { title: "Manufacturing Engineer", titleRu: "Инженер производства", medianSalaryUsd: 96000, demand: "high" },
    ],
    universityFields: ["Mechanical Engineering", "Engineering", "Aerospace"],
  },
  {
    id: "civil-engineering",
    name: "Civil Engineering",
    nameRu: "Строительство и инфраструктура",
    field: "Engineering",
    descriptionRu:
      "Мосты, здания, транспорт, вода. Результат твоей работы стоит десятилетиями и виден из окна.",
    riasec: { R: 90, I: 70, A: 35, S: 35, E: 45, C: 75 },
    values: ["stability", "impact", "safety_net", "structure", "mastery"],
    skills: [
      S("physics", "Structural mechanics", "Строительная механика", "hard", 5),
      S("math", "Applied math", "Прикладная математика", "hard", 4),
      S("cad", "CAD modelling", "3D-моделирование, CAD", "hard", 4),
      S("responsibility", "Responsibility", "Ответственность за результат", "soft", 5),
      S("teamwork", "Teamwork", "Командная работа", "soft", 4),
    ],
    subjects: ["physics", "math", "geometry"],
    careers: [
      { title: "Civil Engineer", titleRu: "Инженер-строитель", medianSalaryUsd: 95000, demand: "high", onetCode: "17-2051.00" },
      { title: "Structural Engineer", titleRu: "Инженер-конструктор", medianSalaryUsd: 102000, demand: "medium" },
      { title: "Urban Planner", titleRu: "Градостроитель", medianSalaryUsd: 81000, demand: "medium" },
    ],
    universityFields: ["Civil Engineering", "Engineering", "Architecture"],
  },
  {
    id: "medicine",
    name: "Medicine",
    nameRu: "Медицина, лечебное дело",
    field: "Medicine",
    descriptionRu:
      "Длинный путь с высокой ценой ошибки и прямым результатом: конкретному человеку стало лучше.",
    riasec: { R: 55, I: 95, A: 20, S: 95, E: 35, C: 65 },
    values: ["helping", "prestige", "mastery", "safety_net", "impact"],
    skills: [
      S("biology", "Biology", "Биология", "hard", 5),
      S("chemistry", "Chemistry", "Химия", "hard", 5),
      S("memory", "Volume memorisation", "Работа с большими объёмами", "hard", 5),
      S("empathy", "Empathy", "Эмпатия", "soft", 5),
      S("stress", "Stress resilience", "Устойчивость к стрессу", "soft", 5),
    ],
    subjects: ["biology", "chemistry", "math"],
    careers: [
      { title: "Physician", titleRu: "Врач", medianSalaryUsd: 239000, demand: "high", onetCode: "29-1210.00" },
      { title: "Surgeon", titleRu: "Хирург", medianSalaryUsd: 340000, demand: "medium" },
      { title: "Clinical Researcher", titleRu: "Клинический исследователь", medianSalaryUsd: 108000, demand: "medium" },
    ],
    universityFields: ["Medicine", "Pharmacy", "Biology"],
  },
  {
    id: "biotechnology",
    name: "Biotechnology",
    nameRu: "Биотехнологии",
    field: "Science",
    descriptionRu:
      "Биология как инженерия: клетки, ферменты и организмы становятся инструментом для лекарств, еды и материалов.",
    riasec: { R: 60, I: 100, A: 30, S: 45, E: 30, C: 70 },
    values: ["learning", "impact", "creation", "nature", "mastery"],
    skills: [
      S("biology", "Molecular biology", "Молекулярная биология", "hard", 5),
      S("chemistry", "Chemistry", "Химия", "hard", 5),
      S("lab", "Lab technique", "Лабораторная работа", "hard", 4),
      S("stats", "Statistics", "Статистика", "hard", 3),
      S("persistence", "Persistence", "Усидчивость", "soft", 4),
    ],
    subjects: ["biology", "chemistry", "math"],
    careers: [
      { title: "Biotechnologist", titleRu: "Биотехнолог", medianSalaryUsd: 92000, demand: "medium" },
      { title: "Bioinformatician", titleRu: "Биоинформатик", medianSalaryUsd: 105000, demand: "high" },
      { title: "Research Scientist", titleRu: "Научный сотрудник", medianSalaryUsd: 89000, demand: "medium" },
    ],
    universityFields: ["Biotechnology", "Biology", "Chemistry"],
  },
  {
    id: "psychology",
    name: "Psychology",
    nameRu: "Психология",
    field: "Psychology",
    descriptionRu:
      "Наука о поведении, а не «умение слушать». Много статистики и исследований, а не только консультирование.",
    riasec: { R: 15, I: 85, A: 50, S: 95, E: 45, C: 50 },
    values: ["helping", "learning", "impact", "autonomy", "variety"],
    skills: [
      S("empathy", "Empathy", "Эмпатия", "soft", 5),
      S("stats", "Statistics", "Статистика", "hard", 4),
      S("writing", "Academic writing", "Академическое письмо", "hard", 4),
      S("listening", "Active listening", "Активное слушание", "soft", 5),
      S("skepticism", "Critical scrutiny", "Критичность к данным", "soft", 4),
    ],
    subjects: ["biology", "math", "english", "history"],
    careers: [
      { title: "Clinical Psychologist", titleRu: "Клинический психолог", medianSalaryUsd: 92000, demand: "high", onetCode: "19-3033.00" },
      { title: "UX Researcher", titleRu: "UX-исследователь", medianSalaryUsd: 108000, demand: "high" },
      { title: "Organisational Psychologist", titleRu: "Организационный психолог", medianSalaryUsd: 109000, demand: "niche" },
    ],
    universityFields: ["Psychology", "Social Sciences", "Medicine"],
  },
  {
    id: "business-administration",
    name: "Business Administration",
    nameRu: "Бизнес и менеджмент",
    field: "Business",
    descriptionRu:
      "Как устроены компании: деньги, люди, процессы, рынки. Широкая база для запуска своего дела или роста в найме.",
    riasec: { R: 20, I: 50, A: 40, S: 60, E: 100, C: 75 },
    values: ["income", "influence", "recognition", "variety", "team"],
    skills: [
      S("communication", "Communication", "Коммуникация", "soft", 5),
      S("negotiation", "Negotiation", "Переговоры", "soft", 4),
      S("finance_basics", "Financial literacy", "Финансовая грамотность", "hard", 4),
      S("leadership", "Leadership", "Лидерство", "soft", 5),
      S("analysis", "Business analysis", "Бизнес-анализ", "hard", 4),
    ],
    subjects: ["math", "english", "history", "geography"],
    careers: [
      { title: "Product Manager", titleRu: "Продакт-менеджер", medianSalaryUsd: 132000, demand: "high" },
      { title: "Management Consultant", titleRu: "Консультант по управлению", medianSalaryUsd: 101000, demand: "high" },
      { title: "Founder / Operator", titleRu: "Предприниматель", medianSalaryUsd: 0, demand: "niche" },
    ],
    universityFields: ["Business Administration", "Economics", "Finance"],
  },
  {
    id: "finance",
    name: "Finance",
    nameRu: "Финансы",
    field: "Business",
    descriptionRu:
      "Оценка риска и стоимости. Работа с числами, где ошибка измеряется в деньгах, а результат виден быстро.",
    riasec: { R: 15, I: 75, A: 20, S: 30, E: 85, C: 100 },
    values: ["income", "prestige", "structure", "mastery", "stability"],
    skills: [
      S("math", "Quantitative math", "Количественная математика", "hard", 5),
      S("finance_basics", "Financial modelling", "Финансовое моделирование", "hard", 5),
      S("precision", "Precision", "Точность", "soft", 5),
      S("stress", "Stress resilience", "Устойчивость к стрессу", "soft", 4),
      S("analysis", "Analysis", "Аналитика", "hard", 4),
    ],
    subjects: ["math", "english", "informatics"],
    careers: [
      { title: "Investment Analyst", titleRu: "Инвестиционный аналитик", medianSalaryUsd: 99000, demand: "medium", onetCode: "13-2051.00" },
      { title: "Financial Controller", titleRu: "Финансовый контролёр", medianSalaryUsd: 106000, demand: "high" },
      { title: "Risk Manager", titleRu: "Риск-менеджер", medianSalaryUsd: 104000, demand: "medium" },
    ],
    universityFields: ["Finance", "Economics", "Business Administration"],
  },
  {
    id: "economics",
    name: "Economics",
    nameRu: "Экономика",
    field: "Economics",
    descriptionRu:
      "Почему рынки и государства ведут себя именно так. Ближе к исследованию и данным, чем к бухгалтерии.",
    riasec: { R: 15, I: 90, A: 30, S: 45, E: 70, C: 80 },
    values: ["learning", "impact", "influence", "income", "mastery"],
    skills: [
      S("math", "Econometrics math", "Математика для эконометрики", "hard", 5),
      S("stats", "Statistics", "Статистика", "hard", 5),
      S("writing", "Analytical writing", "Аналитическое письмо", "hard", 4),
      S("skepticism", "Critical scrutiny", "Критичность к данным", "soft", 4),
      S("analysis", "Analysis", "Аналитика", "hard", 4),
    ],
    subjects: ["math", "english", "history", "geography"],
    careers: [
      { title: "Economist", titleRu: "Экономист", medianSalaryUsd: 115000, demand: "medium", onetCode: "19-3011.00" },
      { title: "Policy Analyst", titleRu: "Аналитик государственной политики", medianSalaryUsd: 92000, demand: "medium" },
      { title: "Data Analyst", titleRu: "Аналитик данных", medianSalaryUsd: 85000, demand: "high" },
    ],
    universityFields: ["Economics", "Finance", "Business Administration"],
  },
  {
    id: "law",
    name: "Law",
    nameRu: "Юриспруденция",
    field: "Law",
    descriptionRu:
      "Работа с текстом, нормой и аргументом. Побеждает не тот, кто громче, а тот, кто точнее.",
    riasec: { R: 10, I: 70, A: 40, S: 65, E: 90, C: 90 },
    values: ["influence", "prestige", "structure", "income", "impact"],
    skills: [
      S("writing", "Legal writing", "Юридическое письмо", "hard", 5),
      S("argument", "Argumentation", "Аргументация", "soft", 5),
      S("memory", "Volume memorisation", "Работа с большими объёмами", "hard", 5),
      S("precision", "Precision", "Точность", "soft", 5),
      S("communication", "Communication", "Коммуникация", "soft", 4),
    ],
    subjects: ["history", "english", "geography", "math"],
    careers: [
      { title: "Corporate Lawyer", titleRu: "Корпоративный юрист", medianSalaryUsd: 145000, demand: "medium", onetCode: "23-1011.00" },
      { title: "Compliance Officer", titleRu: "Комплаенс-менеджер", medianSalaryUsd: 79000, demand: "high" },
      { title: "Legal Counsel", titleRu: "Юрисконсульт", medianSalaryUsd: 120000, demand: "medium" },
    ],
    universityFields: ["Law", "International Relations", "Political Science"],
  },
  {
    id: "international-relations",
    name: "International Relations",
    nameRu: "Международные отношения",
    field: "Social Sciences",
    descriptionRu:
      "Как государства, организации и рынки договариваются. Языки, история и переговоры как рабочие инструменты.",
    riasec: { R: 10, I: 75, A: 45, S: 80, E: 85, C: 55 },
    values: ["impact", "influence", "variety", "mobility", "prestige"],
    skills: [
      S("languages", "Foreign languages", "Иностранные языки", "hard", 5),
      S("writing", "Analytical writing", "Аналитическое письмо", "hard", 4),
      S("communication", "Communication", "Коммуникация", "soft", 5),
      S("history_knowledge", "Historical context", "Историко-политический контекст", "hard", 4),
      S("negotiation", "Negotiation", "Переговоры", "soft", 4),
    ],
    subjects: ["history", "english", "geography"],
    careers: [
      { title: "Diplomat", titleRu: "Дипломат", medianSalaryUsd: 88000, demand: "niche" },
      { title: "Policy Analyst", titleRu: "Аналитик по политике", medianSalaryUsd: 92000, demand: "medium" },
      { title: "International Project Manager", titleRu: "Менеджер международных проектов", medianSalaryUsd: 97000, demand: "medium" },
    ],
    universityFields: ["International Relations", "Political Science", "Social Sciences"],
  },
  {
    id: "graphic-design",
    name: "Design & Visual Communication",
    nameRu: "Дизайн и визуальные коммуникации",
    field: "Design",
    descriptionRu:
      "Решение задач через форму: интерфейсы, айдентика, графика. Вкус, помноженный на понимание пользователя.",
    riasec: { R: 35, I: 45, A: 100, S: 45, E: 55, C: 45 },
    values: ["creation", "autonomy", "enjoyment", "mobility", "recognition" ],
    skills: [
      S("visual", "Visual composition", "Визуальная композиция", "hard", 5),
      S("tools_design", "Design tools", "Figma и графические редакторы", "hard", 4),
      S("empathy", "User empathy", "Эмпатия к пользователю", "soft", 4),
      S("feedback", "Taking critique", "Работа с критикой", "soft", 5),
      S("communication", "Communication", "Коммуникация", "soft", 4),
    ],
    subjects: ["art", "informatics", "english", "geometry"],
    careers: [
      { title: "Product Designer", titleRu: "Продуктовый дизайнер", medianSalaryUsd: 105000, demand: "high" },
      { title: "Brand Designer", titleRu: "Бренд-дизайнер", medianSalaryUsd: 78000, demand: "medium" },
      { title: "Motion Designer", titleRu: "Моушн-дизайнер", medianSalaryUsd: 76000, demand: "medium" },
    ],
    universityFields: ["Design", "Architecture", "Art"],
  },
  {
    id: "architecture",
    name: "Architecture",
    nameRu: "Архитектура",
    field: "Architecture",
    descriptionRu:
      "На стыке искусства и инженерии: здание должно быть красивым, но при этом стоять и соответствовать нормам.",
    riasec: { R: 70, I: 65, A: 95, S: 35, E: 50, C: 70 },
    values: ["creation", "recognition", "mastery", "impact", "enjoyment"],
    skills: [
      S("visual", "Spatial composition", "Пространственная композиция", "hard", 5),
      S("cad", "CAD modelling", "3D-моделирование, CAD", "hard", 5),
      S("physics", "Structural basics", "Основы конструкций", "hard", 3),
      S("drawing", "Drawing", "Рисунок", "hard", 4),
      S("persistence", "Persistence", "Усидчивость", "soft", 4),
    ],
    subjects: ["art", "geometry", "physics", "math"],
    careers: [
      { title: "Architect", titleRu: "Архитектор", medianSalaryUsd: 93000, demand: "medium", onetCode: "17-1011.00" },
      { title: "Interior Architect", titleRu: "Архитектор интерьеров", medianSalaryUsd: 71000, demand: "medium" },
      { title: "Urban Designer", titleRu: "Городской проектировщик", medianSalaryUsd: 85000, demand: "niche" },
    ],
    universityFields: ["Architecture", "Design", "Civil Engineering"],
  },
  {
    id: "media-journalism",
    name: "Media & Journalism",
    nameRu: "Медиа и журналистика",
    field: "Media",
    descriptionRu:
      "Находить, проверять и рассказывать. Сегодня это одинаково про текст, видео и умение держать аудиторию.",
    riasec: { R: 20, I: 70, A: 90, S: 70, E: 75, C: 40 },
    values: ["creation", "impact", "variety", "recognition", "autonomy"],
    skills: [
      S("writing", "Writing", "Письменная речь", "hard", 5),
      S("research", "Fact-checking", "Проверка фактов", "hard", 5),
      S("communication", "Interviewing", "Умение брать интервью", "soft", 5),
      S("visual", "Visual storytelling", "Визуальный сторителлинг", "hard", 3),
      S("resilience", "Deadline resilience", "Работа в дедлайне", "soft", 4),
    ],
    subjects: ["english", "history", "art"],
    careers: [
      { title: "Journalist", titleRu: "Журналист", medianSalaryUsd: 57000, demand: "medium", onetCode: "27-3023.00" },
      { title: "Content Strategist", titleRu: "Контент-стратег", medianSalaryUsd: 82000, demand: "high" },
      { title: "Documentary Producer", titleRu: "Продюсер документалистики", medianSalaryUsd: 79000, demand: "niche" },
    ],
    universityFields: ["Journalism", "Media", "Social Sciences"],
  },
  {
    id: "game-development",
    name: "Game Development",
    nameRu: "Разработка игр",
    field: "Computer Science",
    descriptionRu:
      "Инженерия плюс художественная задача: заставить систему правил ощущаться интересно для живого человека.",
    riasec: { R: 45, I: 85, A: 90, S: 30, E: 45, C: 55 },
    values: ["creation", "enjoyment", "learning", "team", "recognition"],
    skills: [
      S("coding", "Programming", "Программирование", "hard", 5),
      S("math", "Vector math", "Векторная математика", "hard", 4),
      S("visual", "Visual sense", "Визуальное чутьё", "hard", 3),
      S("systems", "Systems design", "Проектирование систем", "hard", 5),
      S("teamwork", "Teamwork", "Командная работа", "soft", 4),
    ],
    subjects: ["informatics", "math", "art", "physics"],
    careers: [
      { title: "Gameplay Programmer", titleRu: "Геймплей-программист", medianSalaryUsd: 105000, demand: "medium" },
      { title: "Technical Artist", titleRu: "Технический художник", medianSalaryUsd: 98000, demand: "niche" },
      { title: "Game Designer", titleRu: "Гейм-дизайнер", medianSalaryUsd: 89000, demand: "medium" },
    ],
    universityFields: ["Computer Science", "Software Engineering", "Design"],
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    nameRu: "Науки об окружающей среде",
    field: "Science",
    descriptionRu:
      "Климат, вода, почва, энергия. Много полевой работы и данных, результат измеряется в реальных изменениях.",
    riasec: { R: 75, I: 95, A: 30, S: 60, E: 40, C: 65 },
    values: ["nature", "impact", "learning", "variety", "helping"],
    skills: [
      S("biology", "Ecology", "Экология", "hard", 4),
      S("chemistry", "Chemistry", "Химия", "hard", 4),
      S("stats", "Data analysis", "Анализ данных", "hard", 4),
      S("fieldwork", "Fieldwork", "Полевая работа", "hard", 4),
      S("communication", "Communication", "Коммуникация", "soft", 3),
    ],
    subjects: ["biology", "chemistry", "geography", "math"],
    careers: [
      { title: "Environmental Scientist", titleRu: "Эколог-исследователь", medianSalaryUsd: 78000, demand: "medium", onetCode: "19-2041.00" },
      { title: "Sustainability Analyst", titleRu: "Аналитик по устойчивому развитию", medianSalaryUsd: 84000, demand: "high" },
      { title: "Renewable Energy Specialist", titleRu: "Специалист по возобновляемой энергетике", medianSalaryUsd: 92000, demand: "high" },
    ],
    universityFields: ["Environmental Science", "Biology", "Geography"],
  },
  {
    id: "education",
    name: "Education",
    nameRu: "Педагогика и образование",
    field: "Education",
    descriptionRu:
      "Профессия про то, как знание попадает в другого человека. Сейчас всё чаще пересекается с продуктами и технологиями.",
    riasec: { R: 25, I: 60, A: 60, S: 100, E: 60, C: 55 },
    values: ["helping", "impact", "stability", "team", "balance"],
    skills: [
      S("communication", "Explaining", "Умение объяснять", "soft", 5),
      S("empathy", "Empathy", "Эмпатия", "soft", 5),
      S("patience", "Patience", "Терпение", "soft", 5),
      S("subject_depth", "Subject depth", "Глубина предмета", "hard", 4),
      S("organisation", "Organisation", "Организованность", "soft", 4),
    ],
    subjects: ["english", "history", "biology", "math"],
    careers: [
      { title: "Teacher", titleRu: "Учитель", medianSalaryUsd: 62000, demand: "high", onetCode: "25-2031.00" },
      { title: "Instructional Designer", titleRu: "Методист образовательных программ", medianSalaryUsd: 79000, demand: "high" },
      { title: "EdTech Product Manager", titleRu: "Продакт-менеджер в EdTech", medianSalaryUsd: 118000, demand: "medium" },
    ],
    universityFields: ["Education", "Psychology", "Social Sciences"],
  },
  {
    id: "marketing",
    name: "Marketing & Communications",
    nameRu: "Маркетинг и коммуникации",
    field: "Business",
    descriptionRu:
      "Понять, чего хочет человек, и донести ценность продукта. Половина работы — данные, половина — креатив.",
    riasec: { R: 15, I: 60, A: 80, S: 65, E: 95, C: 55 },
    values: ["creation", "variety", "income", "recognition", "team"],
    skills: [
      S("communication", "Communication", "Коммуникация", "soft", 5),
      S("analysis", "Analytics", "Аналитика", "hard", 4),
      S("writing", "Copywriting", "Копирайтинг", "hard", 4),
      S("visual", "Visual sense", "Визуальное чутьё", "hard", 3),
      S("empathy", "Audience empathy", "Понимание аудитории", "soft", 4),
    ],
    subjects: ["english", "math", "art", "history"],
    careers: [
      { title: "Growth Marketer", titleRu: "Growth-маркетолог", medianSalaryUsd: 94000, demand: "high" },
      { title: "Brand Manager", titleRu: "Бренд-менеджер", medianSalaryUsd: 89000, demand: "medium" },
      { title: "Marketing Analyst", titleRu: "Маркетинговый аналитик", medianSalaryUsd: 78000, demand: "high" },
    ],
    universityFields: ["Business Administration", "Media", "Economics"],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    nameRu: "Математика",
    field: "Mathematics",
    descriptionRu:
      "Самая «переносимая» база: открывает финансы, ИИ, криптографию и науку. Требует терпения к абстракции.",
    riasec: { R: 25, I: 100, A: 45, S: 20, E: 25, C: 85 },
    values: ["mastery", "learning", "autonomy", "safety_net", "income"],
    skills: [
      S("math", "Abstract math", "Абстрактная математика", "hard", 5),
      S("logic", "Proof reasoning", "Доказательное мышление", "hard", 5),
      S("persistence", "Persistence", "Усидчивость", "soft", 5),
      S("coding", "Programming", "Программирование", "hard", 3),
      S("precision", "Precision", "Точность", "soft", 4),
    ],
    subjects: ["math", "physics", "informatics"],
    careers: [
      { title: "Quantitative Analyst", titleRu: "Квант-аналитик", medianSalaryUsd: 152000, demand: "medium" },
      { title: "Cryptographer", titleRu: "Криптограф", medianSalaryUsd: 132000, demand: "niche" },
      { title: "Actuary", titleRu: "Актуарий", medianSalaryUsd: 120000, demand: "medium", onetCode: "15-2011.00" },
    ],
    universityFields: ["Mathematics", "Data Science", "Computer Science"],
  },
  {
    id: "physics",
    name: "Physics",
    nameRu: "Физика",
    field: "Science",
    descriptionRu:
      "Фундаментальные законы и эксперимент. Долгий горизонт результата, но самая глубокая инженерная база.",
    riasec: { R: 70, I: 100, A: 40, S: 20, E: 25, C: 70 },
    values: ["learning", "mastery", "autonomy", "creation", "impact"],
    skills: [
      S("physics", "Physics", "Физика", "hard", 5),
      S("math", "Advanced math", "Высшая математика", "hard", 5),
      S("lab", "Experimental technique", "Экспериментальная работа", "hard", 4),
      S("coding", "Scientific computing", "Научные вычисления", "hard", 3),
      S("persistence", "Persistence", "Усидчивость", "soft", 5),
    ],
    subjects: ["physics", "math", "informatics"],
    careers: [
      { title: "Research Physicist", titleRu: "Физик-исследователь", medianSalaryUsd: 145000, demand: "niche", onetCode: "19-2012.00" },
      { title: "Photonics Engineer", titleRu: "Инженер-фотоник", medianSalaryUsd: 118000, demand: "medium" },
      { title: "Quantitative Researcher", titleRu: "Квант-исследователь", medianSalaryUsd: 165000, demand: "medium" },
    ],
    universityFields: ["Physics", "Engineering", "Mathematics"],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    nameRu: "Кибербезопасность",
    field: "Computer Science",
    descriptionRu:
      "Мышление «где это сломается». Постоянная гонка с реальным противником и высокая цена невнимательности.",
    riasec: { R: 55, I: 95, A: 35, S: 25, E: 40, C: 90 },
    values: ["safety_net", "income", "learning", "mastery", "autonomy"],
    skills: [
      S("coding", "Programming", "Программирование", "hard", 4),
      S("systems", "Networks & systems", "Сети и системы", "hard", 5),
      S("skepticism", "Adversarial thinking", "Мышление злоумышленника", "soft", 5),
      S("precision", "Precision", "Точность", "soft", 5),
      S("persistence", "Persistence", "Усидчивость", "soft", 4),
    ],
    subjects: ["informatics", "math", "english"],
    careers: [
      { title: "Security Engineer", titleRu: "Инженер по безопасности", medianSalaryUsd: 124000, demand: "high", onetCode: "15-1212.00" },
      { title: "Penetration Tester", titleRu: "Пентестер", medianSalaryUsd: 119000, demand: "high" },
      { title: "Security Architect", titleRu: "Архитектор безопасности", medianSalaryUsd: 153000, demand: "medium" },
    ],
    universityFields: ["Cybersecurity", "Computer Science", "Information Technology"],
  },
  {
    id: "logistics",
    name: "Logistics & Supply Chain",
    nameRu: "Логистика и цепи поставок",
    field: "Business",
    descriptionRu:
      "Оптимизация реального мира: маршруты, склады, сроки. Очень заметная профессия для Казахстана и транзитных стран.",
    riasec: { R: 60, I: 70, A: 20, S: 40, E: 75, C: 95 },
    values: ["structure", "stability", "safety_net", "income", "impact"],
    skills: [
      S("analysis", "Optimisation analysis", "Оптимизационный анализ", "hard", 5),
      S("math", "Applied math", "Прикладная математика", "hard", 4),
      S("organisation", "Organisation", "Организованность", "soft", 5),
      S("communication", "Communication", "Коммуникация", "soft", 4),
      S("systems", "Systems thinking", "Системное мышление", "hard", 4),
    ],
    subjects: ["math", "geography", "informatics", "english"],
    careers: [
      { title: "Supply Chain Analyst", titleRu: "Аналитик цепей поставок", medianSalaryUsd: 82000, demand: "high", onetCode: "13-1081.00" },
      { title: "Logistics Manager", titleRu: "Менеджер по логистике", medianSalaryUsd: 99000, demand: "high" },
      { title: "Operations Manager", titleRu: "Операционный менеджер", medianSalaryUsd: 101000, demand: "high" },
    ],
    universityFields: ["Business Administration", "Economics", "Engineering"],
  },
];

export const MAJOR_MAP = new Map(MAJORS.map((m) => [m.id, m]));

/**
 * The university catalogue stores coarse fields (Computer Science, Engineering,
 * Business, Science, Humanities), so a major's finer `universityFields` have to
 * be widened before querying programs.
 */
const CATALOGUE_FIELDS: Record<string, string> = {
  "Computer Science": "Computer Science",
  "Software Engineering": "Computer Science",
  "Information Technology": "Computer Science",
  "Cybersecurity": "Computer Science",
  "Data Science": "Computer Science",
  "Artificial Intelligence": "Computer Science",
  "Engineering": "Engineering",
  "Electrical Engineering": "Engineering",
  "Mechanical Engineering": "Engineering",
  "Civil Engineering": "Engineering",
  "Robotics": "Engineering",
  "Aerospace": "Engineering",
  "Architecture": "Engineering",
  "Business Administration": "Business",
  "Finance": "Business",
  "Economics": "Business",
  "Media": "Business",
  "Mathematics": "Science",
  "Physics": "Science",
  "Biology": "Science",
  "Chemistry": "Science",
  "Biotechnology": "Science",
  "Medicine": "Science",
  "Pharmacy": "Science",
  "Environmental Science": "Science",
  "Geography": "Science",
  "Law": "Humanities",
  "International Relations": "Humanities",
  "Political Science": "Humanities",
  "Social Sciences": "Humanities",
  "Psychology": "Humanities",
  "Journalism": "Humanities",
  "Education": "Humanities",
  "Design": "Humanities",
  "Art": "Humanities",
};

export function catalogueFieldsFor(major: Major): string[] {
  const set = new Set<string>();
  for (const f of major.universityFields) {
    const coarse = CATALOGUE_FIELDS[f];
    if (coarse) set.add(coarse);
  }
  return [...set];
}

export const SUBJECT_LABELS: Record<string, string> = {
  math: "Математика",
  physics: "Физика",
  chemistry: "Химия",
  biology: "Биология",
  informatics: "Информатика",
  english: "Английский язык",
  history: "История",
  geography: "География",
  geometry: "Геометрия",
  art: "Изобразительное искусство",
};

export const ALL_SUBJECT_KEYS = Object.keys(SUBJECT_LABELS);

/** Russian names for the broad field a major belongs to. */
export const FIELD_LABELS: Record<string, string> = {
  "Computer Science": "Компьютерные науки",
  "Data Science": "Данные и ИИ",
  Engineering: "Инженерия",
  Medicine: "Медицина",
  Science: "Естественные науки",
  Psychology: "Психология",
  Business: "Бизнес",
  Economics: "Экономика",
  Law: "Право",
  "Social Sciences": "Социальные науки",
  Design: "Дизайн",
  Architecture: "Архитектура",
  Media: "Медиа",
  Education: "Образование",
  Mathematics: "Математика",
};

/** Every distinct skill across the catalogue, for the self-assessment step. */
export function allSkills() {
  const map = new Map<string, { key: string; labelRu: string; type: "hard" | "soft" }>();
  for (const major of MAJORS) {
    for (const s of major.skills) {
      if (!map.has(s.key)) map.set(s.key, { key: s.key, labelRu: s.labelRu, type: s.type });
    }
  }
  return [...map.values()];
}
