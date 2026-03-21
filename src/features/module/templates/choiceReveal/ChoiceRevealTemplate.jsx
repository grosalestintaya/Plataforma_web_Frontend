// Template: revela feedback dentro de la misma vista despues de elegir una opcion.
import { useMemo, useState } from "react";
import Typografia from "@/features/module/blocks/Typografia";
import Image from "@/features/module/blocks/Image";
import { CHOICE_REVEAL_CONFIG } from "./choiceReveal.config";
import { cn } from "@/shared/libs/utils";

function ChoiceCard({ option, active, onSelect, compact = false }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border border-white/20 px-4 py-4 text-left transition hover:border-white/40 hover:bg-white/5",
        active ? "border-white/55 bg-white/5" : "",
      )}
    >
      {option?.image && (
        <Image
          src={option.image?.src}
          alt={option.image?.alt ?? option?.label?.text ?? "Opcion"}
          placeholderLabel={option.image?.placeholderLabel}
          className={cn("pb-3", compact ? "min-h-[120px]" : "min-h-[150px]")}
        />
      )}

      <Typografia
        content={option?.label}
        variant={option?.label?.variant ?? "label"}
        align={option?.label?.align ?? "center"}
        className="py-0"
      />
    </button>
  );
}

export default function ChoiceRevealTemplate({ variant = "default", data = {} }) {
  const resolvedVariant =
    CHOICE_REVEAL_CONFIG.variantMap[variant] ?? variant ?? "binaryChoice";
  const variantConfig = CHOICE_REVEAL_CONFIG.variants[resolvedVariant]
    ? CHOICE_REVEAL_CONFIG.variants[resolvedVariant]
    : CHOICE_REVEAL_CONFIG.variants[CHOICE_REVEAL_CONFIG.fallbackVariant];
  const options = Array.isArray(data.options) ? data.options : [];
  const [selectedId, setSelectedId] = useState(null);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.id) === String(selectedId)) ?? null,
    [options, selectedId],
  );

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-5",
        CHOICE_REVEAL_CONFIG.layout.maxWidth,
      )}
    >
      {data.title && (
        <Typografia
          content={data.title}
          variant={data.title?.variant ?? "section"}
          containerClassName={cn(
            "mx-auto rounded-xl border border-white/20 px-6 py-3",
            CHOICE_REVEAL_CONFIG.layout.titleWidth,
            data.title?.containerClassName,
          )}
        />
      )}

      {data.text && (
        <Typografia
          content={data.text}
          variant={data.text?.variant ?? "body"}
          align={data.text?.align ?? "center"}
          className="py-0"
          containerClassName={cn(
            "mx-auto rounded-xl border border-white/15 px-5 py-4",
            CHOICE_REVEAL_CONFIG.layout.textWidth,
            data.text?.containerClassName,
          )}
        />
      )}

      <div className={variantConfig.optionsClassName}>
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            option={option}
            active={String(option.id) === String(selectedId)}
            onSelect={() => setSelectedId(option.id)}
            compact={variantConfig.compact}
          />
        ))}
      </div>

      {selectedOption?.feedback && (
        <Typografia
          content={selectedOption.feedback}
          variant={selectedOption.feedback?.variant ?? "supporting"}
          align={selectedOption.feedback?.align ?? "center"}
          className="py-0"
          containerClassName={cn(
            "mx-auto rounded-xl border border-white/15 px-5 py-4",
            CHOICE_REVEAL_CONFIG.layout.feedbackWidth,
          )}
        />
      )}
    </div>
  );
}
