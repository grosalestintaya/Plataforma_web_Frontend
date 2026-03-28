
import { useEffect, useMemo, useState } from "react";
import Typography from "../../base/Typography";
import Input from "../../base/Action/Input";

/**
 * Form:
 * - Bloque interactivo para pregunta + opciones + justificacion escrita.
 * - Reporta completitud al flujo global usando `heroApi.setInteractiveState`.
 */
export default function Form({ data, heroApi, view }) {
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");

  // Usa un minimo configurable para validar la explicacion del usuario.
  const minReasonLength = Number(data?.minReasonLength ?? 8);
  const selectedOption = useMemo(
    () => (data?.options ?? []).find((item) => item.id === selectedId) ?? null,
    [data?.options, selectedId],
  );

  const isComplete = Boolean(selectedId) && reason.trim().length >= minReasonLength;
  const viewId = view?.id ?? view?.viewId;

  useEffect(() => {
    if (!isComplete) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      selectedOptionId: selectedId,
      reasonLength: reason.trim().length,
      score: Number(selectedOption?.score ?? 100),
      type: "reflectionQuestion",
    });
  }, [heroApi, isComplete, reason, selectedId, selectedOption?.score, viewId]);

  if (!data) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4">
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
        onChange={(value) => setSelectedId(value)}
        options={(data?.options ?? []).map((option) => ({
          id: option.id,
          value: option.id,
          label: option.label,
        }))}
      />

      {data?.prompt ? (
        <Typography content={data.prompt} variant={data?.prompt?.variant ?? "helper"} />
      ) : null}

      <Input
        variant="text"
        value={reason}
        onChange={(value) => setReason(value)}
        placeholder={data?.placeholder ?? "Escribe tu respuesta..."}
        className="w-full"
      />
    </div>
  );
}
