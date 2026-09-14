# Compass data and AI architecture

## User journey

`Account → 7-layer career discovery → 5 explainable hypotheses → chosen major → university preferences → ranked universities → skills roadmap`

Registration stores only identity and an empty student profile. No country, field, budget or
priority is requested before the student has context for a meaningful answer.

University routes stay locked until all seven career steps are present in
`CareerProfile.completedSteps`.

## Data flow

1. The navigator writes facts, RIASEC answers, values, skills, self-portrait, confirmed cultural
   signals and interview summary to `CareerProfile`.
2. `buildStudentContext` reads the saved profile, prior interview turns, recommendations, the chosen
   major and saved universities. Every model call receives this same briefing.
3. `rankMajors` computes the ranking without an LLM. It combines RIASEC similarity, values,
   subjects and skills. The LLM may explain that result but cannot replace or reorder it.
4. Countries, budget and grade are mirrored to `StudentProfile`. Countries and budget also become
   university preference values. Selecting a major writes its canonical field into the university
   preference system.
5. `computeRS` ranks universities from those accumulated constraints. AI Fit and chat receive the
   same student state and university facts from the database.

## Psychology boundary

The scored core uses vocational interests (RIASEC), Schwartz values, subject evidence and skill
self-assessment. The supplied research notes also recommend DAT, E-SCI, motivation scales, CAAS and
VIA Youth for a fuller battery; the current product does not claim to administer licensed versions
of those instruments.

The interview can use a psychodynamic style of open exploration - personal meaning, recurring
themes and contradictions - only as a source of questions and user-confirmed hypotheses. It is not
psychoanalysis, therapy or diagnosis, and it never contributes an opaque clinical label or an
unreviewed score. MBTI, socionics and DISC are intentionally excluded from the scored core.

## Trust controls

- Unknown cultural references are not invented; known titles use a curated map and model guesses
  require explicit confirmation.
- Rejected cultural signals are kept as rejected context and are excluded from RIASEC scoring.
- Missing profile layers lower the visible confidence score.
- Recommendation evidence exposes positive and negative contributions separately.
- The app remains functional without an API key; deterministic ranking and roadmap generation stay
  available.
