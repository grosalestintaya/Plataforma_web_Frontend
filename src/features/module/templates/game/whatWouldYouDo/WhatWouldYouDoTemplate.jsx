import { useEffect, useMemo, useState } from "react";

import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import { cn } from "@/shared/libs/utils";

function getViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

function getOptionLabel(option, fallbackIndex) {
  if (typeof option?.label === "string" || typeof option?.label === "number") {
    return String(option.label);
  }

  if (typeof option?.text === "string" || typeof option?.text === "number") {
    return String(option.text);
  }

  return `Opcion ${fallbackIndex + 1}`;
}

function normalizeParagraphs(textContent) {
  if (Array.isArray(textContent?.paragraphs)) {
    return textContent.paragraphs;
  }

  if (
    typeof textContent?.text === "string" ||
    typeof textContent?.text === "number"
  ) {
    return [String(textContent.text)];
  }

  if (typeof textContent === "string" || typeof textContent === "number") {
    return [String(textContent)];
  }

  return [];
}

/**
 * WhatWouldYouDoTemplate:
 * - Escenario simple de decision con seleccion unica.
 * - Usa Typography para textos y Button para acciones.
 */
export default function WhatWouldYouDoTemplate({ view, heroApi, data }) {
  const viewId = getViewId(view);
  const options = Array.isArray(data?.options) ? data.options : [];
  const initialState = heroApi?.getInteractiveState?.(viewId);
  const [selectedId, setSelectedId] = useState(
    initialState?.selectedOptionId ?? null,
  );

  useEffect(() => {
    setSelectedId(initialState?.selectedOptionId ?? null);
  }, [initialState?.selectedOptionId, viewId]);

  const paragraphs = useMemo(() => normalizeParagraphs(data?.text), [data?.text]);
  const selectedOption = useMemo(
    () => options.find((option) => option?.id === selectedId) ?? null,
    [options, selectedId],
  );
  const selectedOptionLabel = useMemo(
    () =>
      selectedOption
        ? getOptionLabel(
            selectedOption,
            Math.max(
              options.findIndex((option) => option?.id === selectedOption?.id),
              0,
            ),
          )
        : null,
    [options, selectedOption],
  );

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: false,
      type: "whatWouldYouDo",
      selectedOptionId: selectedId ?? null,
      selectedOptionLabel,
      score: 0,
      countsTowardScore: false,
      payload: {
        scenarioType: data?.scenarioType ?? null,
        caseFacts: data?.caseFacts ?? null,
        expectedDecision: data?.expectedDecision ?? null,
      },
    });
  }, [
    data?.caseFacts,
    data?.expectedDecision,
    data?.scenarioType,
    heroApi,
    selectedId,
    selectedOptionLabel,
    viewId,
  ]);

  async function handleConfirmDecision() {
    if (!viewId || !selectedOption) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed: true,
      type: "whatWouldYouDo",
      selectedOptionId: selectedOption.id,
      selectedOptionLabel,
      score: Number(selectedOption?.score ?? 100),
      countsTowardScore: true,
      payload: {
        scenarioType: data?.scenarioType ?? null,
        caseFacts: data?.caseFacts ?? null,
        expectedDecision: data?.expectedDecision ?? null,
      },
    });

    await heroApi?.advanceCurrentView?.();
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl items-center px-6 py-6 text-white">
      <div className="w-full rounded-2xl p-6">
        <Typography
          content={data?.title ?? { text: "WhatWouldYouDo", variant: "h1" }}
        />

        <div className="mt-5 space-y-5">
          {paragraphs.map((paragraph, index) => (
            <Typography
              key={`${paragraph}-${index}`}
              content={{
                text: paragraph,
                variant: data?.text?.variant ?? "body1",
                align: data?.text?.align ?? "left",
                color: data?.text?.color ?? "primary",
              }}
            />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {options.map((option, index) => {
            const optionLabel = getOptionLabel(option, index);
            const isSelected = selectedId === option?.id;

            return (
              <Button
                key={option?.id ?? index}
                variant={isSelected ? "secondary" : "simple"}
                size="lg"
                fullWidth
                onClick={() => setSelectedId(option?.id ?? null)}
                className={cn(
                  "justify-start rounded-2xl border px-5 py-4 text-left",
                  isSelected
                    ? "border-sky-300/70 bg-sky-500/20 shadow-[0_0_0_1px_rgba(125,211,252,0.28)]"
                    : "border-white/20 bg-white/10",
                )}
              >
                <Typography
                  content={{
                    text: optionLabel,
                    variant: "body1",
                    align: "left",
                    color: "primary",
                  }}
                  className="font-semibold"
                />
              </Button>
            );
          })}
        </div>

        <div className="mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleConfirmDecision}
            disabled={!selectedOption}
            className="rounded-2xl px-6"
          >
            <Typography
              content={{
                text: "Confirmar decision",
                variant: "label",
                align: "center",
                color: "primary",
              }}
            />
          </Button>
        </div>
      </div>
    </section>
  );
}
