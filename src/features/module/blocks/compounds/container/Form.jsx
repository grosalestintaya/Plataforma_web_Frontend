import { useEffect, useMemo, useState } from "react";
import Typography from "../../base/Typography";
import Input from "../../base/Action/Input";
import { cn } from "@/shared/libs/utils";

function normalizeOptionLabel(option, index) {
  const rawLabel = option?.label ?? option?.text ?? `Opcion ${index + 1}`;

  return typeof rawLabel === "object"
    ? rawLabel
    : { text: String(rawLabel), variant: "bodySm", align: "center" };
}

/**
 * Form:
 * - Default: pregunta + radio + justificacion.
 * - Quiz panel: panel visual para pregunta + opciones, con estado controlado o interno.
 */
export default function Form({
  data,
  heroApi,
  view,
  renderMode = "default",
  selectedId: controlledSelectedId,
  onSelect,
  reason: controlledReason,
  onReasonChange,
  hideReasonField = false,
  showQuestion = true,
  instructionContent = null,
  optionColumns,
}) {
  const viewId = view?.id ?? view?.viewId;
  const formKey = `${viewId ?? "form"}:${data?.question?.text ?? ""}`;
  const [draft, setDraft] = useState({
    formKey,
    selectedId: null,
    reason: "",
  });

  useEffect(() => {
    setDraft({
      formKey,
      selectedId: null,
      reason: "",
    });
  }, [formKey]);

  const isControlledSelection = typeof onSelect === "function";
  const isControlledReason = typeof onReasonChange === "function";

  const selectedId = isControlledSelection
    ? (controlledSelectedId ?? null)
    : draft.formKey === formKey
      ? draft.selectedId
      : null;
  const reason = isControlledReason
    ? (controlledReason ?? "")
    : draft.formKey === formKey
      ? draft.reason
      : "";

  const reasonText = reason.trim();
  const reasonRequired = Boolean(
    data?.reasonRequired ?? data?.inputRequired ?? data?.requireReason ?? false,
  );
  const hasPromptInput = Boolean(data?.prompt || data?.placeholder);
  const minReasonLength = Number(data?.minReasonLength ?? 8);
  const selectedOption =
    (data?.options ?? []).find((item) => item.id === selectedId) ?? null;
  const selectedOptionLabel =
    typeof selectedOption?.label === "string" ||
    typeof selectedOption?.label === "number"
      ? String(selectedOption?.label)
      : (selectedOption?.label?.text ?? null);
  const hasRequiredReason =
    !hasPromptInput || !reasonRequired || reasonText.length >= minReasonLength;
  const isComplete = Boolean(selectedId) && hasRequiredReason;

  useEffect(() => {
    if (renderMode !== "default") return;

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
    renderMode,
    selectedId,
    selectedOption?.score,
    selectedOptionLabel,
    viewId,
  ]);

  function updateSelected(nextSelectedId) {
    if (isControlledSelection) {
      onSelect(nextSelectedId);
      return;
    }

    setDraft((prev) => ({
      ...prev,
      formKey,
      selectedId: nextSelectedId,
    }));
  }

  function updateReason(nextReason) {
    if (isControlledReason) {
      onReasonChange(nextReason);
      return;
    }

    setDraft((prev) => ({
      ...prev,
      formKey,
      reason: nextReason,
    }));
  }

  if (!data) return null;

  if (renderMode === "quizPanel") {
    const options = Array.isArray(data?.options) ? data.options : [];
    const gridColsClass =
      optionColumns === 4
        ? "md:grid-cols-2 xl:grid-cols-4"
        : optionColumns === 3
          ? "md:grid-cols-3"
          : optionColumns === 2 || options.length === 2
            ? "md:grid-cols-2"
            : options.length === 3
              ? "md:grid-cols-3"
              : options.length >= 4
                ? "md:grid-cols-2 xl:grid-cols-4"
                : "grid-cols-1";

    return (
      <section className="flex min-h-0 w-full flex-1 flex-col gap-2 rounded-xl border border-white/15 bg-black/10 p-3 md:gap-3 md:p-4">
        {showQuestion && data?.question ? (
          <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center">
            <Typography
              content={data.question}
              variant={data?.question?.variant ?? "body"}
              align={data?.question?.align ?? "center"}
              className="font-bold leading-tight"
            />
          </div>
        ) : null}

        {instructionContent ? (
          <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-center">
            <Typography
              content={instructionContent}
              variant={instructionContent?.variant ?? "helper"}
              align={instructionContent?.align ?? "center"}
              className="font-semibold leading-tight"
            />
          </div>
        ) : null}

        <div
          className={cn(
            "grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 rounded-lg border border-white/15 bg-white/5 p-3 auto-rows-fr",
            gridColsClass,
          )}
        >
          {options.map((option, index) => {
            const optionId = option?.id ?? `option-${index + 1}`;
            const isSelected = String(selectedId) === String(optionId);
            const optionLabel = normalizeOptionLabel(option, index);

            return (
              <button
                key={optionId}
                type="button"
                onClick={() => updateSelected(optionId)}
                className={cn(
                  "flex min-h-[96px] h-full items-center justify-center rounded-md border px-4 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:min-h-[112px]",
                  isSelected
                    ? "border-cyan-200/90 bg-cyan-300/15 shadow-[0_0_0_2px_rgba(255,255,255,0.14),0_10px_24px_rgba(34,211,238,0.14)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10",
                )}
              >
                <Typography
                  content={optionLabel}
                  variant={optionLabel?.variant ?? "bodySm"}
                  align={optionLabel?.align ?? "center"}
                  className="font-bold leading-tight [text-wrap:balance]"
                />
              </button>
            );
          })}
        </div>

        {!hideReasonField && data?.prompt ? (
          <Typography
            content={data.prompt}
            variant={data?.prompt?.variant ?? "helper"}
            color={data?.prompt?.color}
            align={data?.prompt?.align}
            component={data?.prompt?.component}
            className={data?.prompt?.className}
          />
        ) : null}

        {!hideReasonField && hasPromptInput ? (
          <Input
            variant="text"
            value={reason}
            onChange={updateReason}
            placeholder={data?.placeholder ?? "Escribe tu respuesta..."}
            className="w-full"
          />
        ) : null}
      </section>
    );
  }

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
        onChange={updateSelected}
        options={(data?.options ?? []).map((option, index) => ({
          id: option.id,
          value: option.id,
          label: normalizeOptionLabel(option, index),
        }))}
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
          onChange={updateReason}
          placeholder={data?.placeholder ?? "Escribe tu respuesta..."}
          className="w-full"
        />
      ) : null}
    </div>
  );
}
