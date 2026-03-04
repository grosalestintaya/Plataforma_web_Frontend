export function collectQuestions(activityDef) {
  const scenes = activityDef?.scenes || [];
  const questions = [];
  for (const s of scenes) {
    const qs = s?.data?.questions;
    if (Array.isArray(qs)) questions.push(...qs);
  }
  return questions;
}
