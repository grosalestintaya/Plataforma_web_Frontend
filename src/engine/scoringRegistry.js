import { collectQuestions } from "./flowUtils";

export const SCORING_REGISTRY = {
  "mcq.v1": (activityDef, state) => {
    const questions = collectQuestions(activityDef);
    const total = questions.length || 1;
    let okCount = 0;

    for (const q of questions) {
      const picked = state?.answers?.[q.id]?.value ?? null;
      if (picked && picked === q.correctOptionId) okCount += 1;
    }

    const score = Math.round((okCount / total) * 100);
    return { score, okCount, total };
  },
};

export function computeResult(activityDef, state) {
  const strategy = activityDef?.scoring?.strategy || "mcq.v1";
  const fn = SCORING_REGISTRY[strategy];
  if (!fn) throw new Error(`Scoring strategy no registrada: ${strategy}`);
  return fn(activityDef, state);
}
