import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typografia from "../Typografia";

function OptionButton({ option, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-center transition",
        isSelected
          ? "border-amber-400 bg-white/15"
          : "border-white/15 bg-white/5 hover:bg-white/10",
      )}
    >
      <Typografia
        content={{ text: option.label, variant: "subtitle1", align: "center" }}
      />
    </button>
  );
}

/**
 * Recoge una respuesta reflexiva simple y la reporta al player.
 * La vista se completa cuando hay opcion elegida y una breve explicacion.
 */
export default function ReflectionQuestion({
  data,
  heroApi,
  view,
  onComplete,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [reason, setReason] = useState("");

  const options = data?.options ?? [];
  const minLength = Number(data?.minReasonLength ?? 8);

  // Reinicia la respuesta cuando cambia de vista.
  useEffect(() => {
    setSelectedOptionId(null);
    setReason("");
  }, [view?.id]);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedOptionId) ?? null,
    [options, selectedOptionId],
  );

  const isComplete =
    Boolean(selectedOptionId) && reason.trim().length >= minLength;

  useEffect(() => {
    if (!isComplete) return;

    const result = {
      completed: true,
      selectedOptionId,
      // Solo guarda el tamano de la respuesta; el texto completo no afecta score ni ramas.
      reasonLength: reason.trim().length,
      score: Number(selectedOption?.score ?? 100),
      type: "reflectionQuestion",
    };

    // Entrega la respuesta al player para habilitar la navegacion.
    heroApi?.setInteractiveState?.(view?.id, result);
    onComplete?.(result);
  }, [heroApi, isComplete, onComplete, reason, selectedOption?.score, selectedOptionId, view?.id]);

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 px-6 py-5 text-white">
      <div className="mx-auto w-full max-w-[620px] rounded-xl border border-white/20 bg-white/10 px-6 py-3">
        <Typografia
          content={data?.title}
          variant={data?.title?.variant ?? "h4"}
          align={data?.title?.align ?? "center"}
        />
      </div>

      <div className="mx-auto w-full max-w-[620px] rounded-xl border border-white/15 bg-white/10 px-6 py-5">
        <Typografia
          content={data?.question}
          variant={data?.question?.variant ?? "body1"}
          align={data?.question?.align ?? "center"}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3 rounded-xl border border-white/15 bg-white/10 px-6 py-5">
        {options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            onClick={() => setSelectedOptionId(option.id)}
          />
        ))}

        <Typografia
          content={data?.prompt}
          variant={data?.prompt?.variant ?? "subtitle2"}
          className="pt-2"
        />

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder={data?.placeholder ?? "Escribe tu razon aqui..."}
          className="w-full rounded-lg border border-white/15 bg-black/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
        />
      </div>
    </section>
  );
}
