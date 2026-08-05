import { cn } from "@/shared/libs/utils";

const DECORATION_CLASS = {
  badge:
    "right-1 top-1 grid min-h-8 min-w-8 place-items-center rounded-full bg-emerald-600 px-2 text-xs font-black text-white",
  reveal:
    "inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-center text-sm font-bold text-white transition duration-200",
};

export default function CardDecorationInteraction({ interaction }) {
  const content = interaction?.content ?? interaction?.text;
  const decorationClass = DECORATION_CLASS[interaction?.type];

  if (content === undefined || content === null || !decorationClass) {
    return null;
  }

  return (
    <span
      className={cn(
        "pointer-events-none absolute z-30",
        decorationClass,
        interaction.type === "reveal" &&
          interaction.mode === "hoverFocus" &&
          "translate-y-[72%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
        interaction.className,
      )}
    >
      {content}
    </span>
  );
}
