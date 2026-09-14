import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getOrCreateProfile, toProfileData } from "@/lib/career/profile-store";
import { MAJOR_MAP, SUBJECT_LABELS, catalogueFieldsFor } from "@/lib/career/majors";
import { computeMajorFit } from "@/lib/career/match";
import { buildRoadmap } from "@/lib/career/roadmap";
import { hollandCode } from "@/lib/career/riasec";
import { ActionButton } from "@/components/ui/button";
import { Terrain } from "@/components/compass/terrain";
import { CoordinateStamp, Plate, SheetHead } from "@/components/compass/primitives";
import { SelectMajorButton } from "@/components/navigator/select-major-button";

const CATEGORY_LABELS: Record<string, string> = {
  academics: "Учёба",
  skills: "Навыки",
  portfolio: "Проекты",
  admissions: "Поступление",
};

export default async function MajorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const major = MAJOR_MAP.get(id);
  if (!major) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const row = await getOrCreateProfile(userId);
  const profile = toProfileData(row);
  const fit = computeMajorFit(profile, major);
  const roadmap = buildRoadmap(profile, major, fit.skillGaps);

  const matchingUniversities = await db.university.findMany({
    where: {
      programs: { some: { field: { in: catalogueFieldsFor(major) } } },
      ...(profile.constraints.countries.length > 0
        ? { country: { in: profile.constraints.countries } }
        : {}),
    },
    select: { id: true, name: true, city: true, country: true, worldRank: true },
    orderBy: { worldRank: "asc" },
    take: 4,
  });

  return (
    <>
      <Terrain riasec={profile.riasec} interactive={false} />

      <main className="relative z-[1] min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/navigator/results"
            className="mono-label hover:text-[color:var(--color-accent)]"
          >
            ← к списку направлений
          </Link>

          <div className="sheet-head mt-4">
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold tracking-[0.1em] text-[color:var(--color-accent)]">
              ЛИСТ 02
            </span>
            <span className="mono-label">Разбор направления</span>
            <span className="mono-label ml-auto">{profile.gradeLevel} класс</span>
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="display-tight text-[length:var(--text-fluid-3xl)] text-balance">
                {major.nameRu}
              </h1>
              <p className="mt-4 max-w-[60ch] text-[length:var(--text-fluid-base)] text-[color:var(--color-muted)]">
                {major.descriptionRu}
              </p>
            </div>
            <CoordinateStamp
              name={major.nameRu}
              code={hollandCode(profile.riasec)}
              score={fit.score}
              section="4 ОСИ"
              className="shrink-0 bg-[color:var(--color-surface)]"
            />
          </div>

          {/* ── Skills gap ─────────────────────────────────────── */}
          <section className="mt-14">
            <SheetHead
              no="01"
              title="Что нужно развить"
              note={`${fit.skillGaps.length} позиций`}
            />
            <p className="-mt-4 mb-5 max-w-[62ch] text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
              Разрыв между тем, что требует направление, и тем, что ты отметил у себя.
              Заполненные деления — твой уровень, бледные — требуемый.
            </p>

            <div className="space-y-2">
              {fit.skillGaps.length === 0 && (
                <Plate>
                  <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                    По заявленным навыкам критичных пробелов нет — стоит перепроверить
                    самооценку, она редко бывает такой ровной.
                  </p>
                </Plate>
              )}

              {fit.skillGaps.map((g) => (
                <div
                  key={g.key}
                  className="plate flex flex-wrap items-center justify-between gap-4 px-5 py-3"
                >
                  <div>
                    <span className="text-[length:var(--text-fluid-sm)]">{g.labelRu}</span>
                    <span className="mono-label ml-3">
                      {g.type === "hard" ? "профессиональный" : "личное качество"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-[3px]">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className="h-[6px] w-7"
                          style={{
                            background:
                              lvl <= g.current
                                ? "var(--color-accent)"
                                : lvl <= g.required
                                  ? "var(--color-tag-match)"
                                  : "var(--color-border)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="mono-data w-16 shrink-0 text-right text-[11px] text-[color:var(--color-muted)]">
                      {g.current} → {g.required}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Roadmap ────────────────────────────────────────── */}
          <section className="mt-14">
            <SheetHead no="02" title="Твой маршрут" note="из твоих пробелов" />
            <p className="-mt-4 mb-6 max-w-[62ch] text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
              Построен из того, что реально проседает у тебя, а не из общего списка советов.
            </p>

            <div className="relative pl-6">
              {/* the route line */}
              <span
                className="absolute bottom-4 left-[7px] top-4 w-px bg-[color:var(--color-border-strong)]"
                aria-hidden
              />

              <div className="space-y-8">
                {roadmap.map((phase) => (
                  <div key={phase.key} className="relative">
                    <span
                      className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-bg)]"
                      aria-hidden
                    >
                      <span className="h-[5px] w-[5px] rounded-full bg-[color:var(--color-accent)]" />
                    </span>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-[length:var(--text-fluid-lg)] font-extrabold tracking-[-0.02em]">
                        {phase.labelRu}
                      </h3>
                      <span className="mono-label">{phase.timingRu}</span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {phase.items.map((item, i) => (
                        <Plate key={i} className="p-5">
                          <span className="mono-label text-[color:var(--color-accent)]">
                            {CATEGORY_LABELS[item.category]}
                          </span>
                          <p className="mt-2 font-bold">{item.titleRu}</p>
                          <p className="mt-1.5 text-[length:var(--text-fluid-sm)] leading-relaxed text-[color:var(--color-muted)]">
                            {item.detailRu}
                          </p>
                        </Plate>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Universities ───────────────────────────────────── */}
          <section className="mt-14">
            <SheetHead
              no="03"
              title="Где этому учат"
              note={
                profile.constraints.countries.length > 0
                  ? profile.constraints.countries.join(" · ")
                  : "география не задана"
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {matchingUniversities.map((u) => (
                <Link key={u.id} href={`/university/${u.id}`} className="block">
                  <div className="plate h-full p-5 transition-colors hover:border-[color:var(--color-accent)]">
                    <p className="font-bold">{u.name}</p>
                    <p className="mono-label mt-2">
                      {u.city}, {u.country}
                      {u.worldRank ? ` · #${u.worldRank} в мире` : ""}
                    </p>
                  </div>
                </Link>
              ))}

              {matchingUniversities.length === 0 && (
                <Plate>
                  <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                    В базе нет подходящих университетов под выбранные страны — расширь
                    географию в профиле.
                  </p>
                </Plate>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <SelectMajorButton
                majorId={major.id}
                selected={row.selectedMajorId === major.id}
              />
              <ActionButton asChild variant="glass" size="lg">
                <Link href="/feed">Все университеты</Link>
              </ActionButton>
            </div>
          </section>

          <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-[color:var(--color-text)] pt-5">
            <span className="mono-label">
              Профильные предметы: {major.subjects.map((k) => SUBJECT_LABELS[k] ?? k).join(", ")}
            </span>
            <span className="mono-label">Compass · лист 02</span>
          </footer>
        </div>
      </main>
    </>
  );
}
