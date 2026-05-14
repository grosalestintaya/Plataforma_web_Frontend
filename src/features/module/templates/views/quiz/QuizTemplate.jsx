import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { getQuizRuntime } from "./quiz.config";
import * as Blocks from "@/features/module/blocks";

export default function QuizTemplate({ variant, data, heroApi, view }) {
  const runtime = getQuizRuntime({
    variant,
    data,
    view,
  });

  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  if (!layout || !slots.length) {
    return (
      <div className="grid h-full min-h-0 w-full place-items-center text-white/80">
        Config inválida para QuizTemplate
      </div>
    );
  }

  return (
    <HeroGrid
      layout={layout}
      className="mx-0 w-[calc(100vw-2rem)] min-w-0 max-w-[calc(100vw-2rem)] overflow-visible px-0 sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] sm:px-0 md:w-full md:max-w-full md:px-0 lg:px-12"
    >
      {slots.map((slot, index) => {
        const renderedSlot = renderSlot(slot, payload, Blocks, {
          heroApi,
          view,
          quizVariant: runtime?.variant,
        });

        if (!renderedSlot) return null;

        return (
          <HeroArea
            key={`${slot.area}-${slot.slotId ?? index}`}
            area={slot.area}
            className="w-full min-w-0 max-w-full justify-start overflow-visible"
          >
            {renderedSlot}
          </HeroArea>
        );
      })}
    </HeroGrid>
  );
}
