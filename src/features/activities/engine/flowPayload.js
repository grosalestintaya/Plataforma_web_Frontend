import { collectQuestions } from "./flowUtils";

/**
 * Convierte las respuestas del flow al payload final de backend.
 */
export function buildFlowPayload(activityDef, state) {
  const questions = collectQuestions(activityDef);
  const answers = state?.answers || {};

  return {
    answers: questions.map((question) => {
      const answer = answers[question.id] || {};
      const selectedOptionId = answer.value ?? null;
      const ok = selectedOptionId === question.correctOptionId;

      const extra =
        answer.extra && typeof answer.extra === "object" ? answer.extra : {};

      return {
        latuya: question.id,
        ok,
        selectedOptionId,
        ...extra,
      };
    }),
  };
}