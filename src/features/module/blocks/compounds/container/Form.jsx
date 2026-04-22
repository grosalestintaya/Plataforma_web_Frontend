import { useEffect, useState } from "react";
import Typography from "../../base/Typography";
import Input from "../../base/Action/Input";

/**
 * Form:
 * - Bloque interactivo para pregunta + opciones + justificacion escrita.
 * - Reporta completitud al flujo global usando `heroApi.setInteractiveState`.
 */
export default function Form({ data, heroApi, view }) {
  const viewId = view?.id ?? view?.viewId;
  const formKey = `${viewId ?? "form"}:${data?.question?.text ?? ""}`;
  const [draft, setDraft] = useState({
    formKey,
    selectedId: null,
    reason: "",
  });

  // Si la vista se reutiliza o se vuelve a entrar, el form debe arrancar limpio.
  useEffect(() => {
    setDraft({
      formKey,
      selectedId: null,
      reason: "",
    });
  }, [formKey]);

  const selectedId = draft.formKey === formKey ? draft.selectedId : null;
  const reason = draft.formKey === formKey ? draft.reason : "";
  const reasonText = reason.trim();
  const reasonRequired = Boolean(
    data?.reasonRequired ?? data?.inputRequired ?? data?.requireReason ?? false,
  );
  const hasPromptInput = Boolean(data?.prompt || data?.placeholder);
  // Cuando la explicacion es obligatoria usamos el minimo configurado.
  const minReasonLength = Number(data?.minReasonLength ?? 8);
  const selectedOption =
    (data?.options ?? []).find((item) => item.id === selectedId) ?? null;
  const selectedOptionLabel =
    typeof selectedOption?.label === "string" || typeof selectedOption?.label === "number"
      ? String(selectedOption?.label)
      : selectedOption?.label?.text ?? null;
  const hasRequiredReason =
    !hasPromptInput || !reasonRequired || reasonText.length >= minReasonLength;
  const isComplete = Boolean(selectedId) && hasRequiredReason;

  useEffect(() => {
    heroApi?.setInteractiveState?.(viewId, {
      completed: isComplete,
      selectedOptionId: selectedId ?? null,
      selectedOptionLabel,
      reasonText,
      reasonLength: reasonText.length,
      reasonRequired,
      score: isComplete ? Number(selectedOption?.score ?? 100) : 0,
      countsTowardScore: isComplete,
      type: "reflectionQuestion",
    });
  }, [
    heroApi,
    isComplete,
    reasonRequired,
    reasonText,
    selectedId,
    selectedOption?.score,
    selectedOptionLabel,
    viewId,
  ]);

  if (!data) return null;

  return (
    <div className="space-y-3 rounded-2xl p-4">
      {data?.question ? (
        <Typography
          content={data.question}
          variant={data?.question?.variant ?? "body"}
          align={data?.question?.align ?? "center"}
        />
      ) : null}

      <Input
        variant="radio"
        name={`form-${viewId ?? "question"}`}
        value={selectedId ?? ""}
        onChange={(value) =>
          setDraft((prev) => ({
            ...prev,
            formKey,
            selectedId: value,
          }))
        }
        options={(data?.options ?? []).map((option) => {
          const normalizedLabel =
            typeof option?.label === "string" || typeof option?.label === "number"
              ? {
                  text: String(option.label),
                  variant: "bodySm",
                }
              : option?.label;

          return {
            id: option.id,
            value: option.id,
            label: normalizedLabel,
          };
        })}
      />

      {data?.prompt ? (
        <Typography
          content={data.prompt}
          variant={data?.prompt?.variant ?? "helper"}
          color={data?.prompt?.color}
          align={data?.prompt?.align}
          component={data?.prompt?.component}
          className={data?.prompt?.className}
        />
      ) : null}

      {hasPromptInput ? (
        <Input
          variant="text"
          value={reason}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              formKey,
              reason: value,
            }))
          }
          placeholder={data?.placeholder ?? "Escribe tu respuesta..."}
          className="w-full"
        />
      ) : null}
    </div>
  );
}
