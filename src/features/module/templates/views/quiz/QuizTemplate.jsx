import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { renderSlot } from "../../_core/SlotRenderer";
import { getQuizRuntime } from "./quiz.config";
import * as Blocks from "@/features/module/blocks";

/**
 * QuizTemplate:
 * - Usa `quiz.config.js` como fuente unica de layout/slots.
 * - Mantiene el componente principal liviano y facil de mantener.
 */
export default function QuizTemplate({ variant, data, heroApi, view }) {
  const runtime = getQuizRuntime({ variant, data, view });
  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  if (!layout || !slots.length) {
    return <div className="text-white/80">Config invalida para QuizTemplate</div>;
  }

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-5xl items-center px-6 py-6 text-white">
      <HeroGrid layout={layout} className="h-full min-h-0 w-full">
        {slots.map((slot, index) => {
          // Evita montar wrappers vacios dentro del canvas.
          const renderedSlot = renderSlot(slot, payload, Blocks, { heroApi, view });

          if (!renderedSlot) return null;

          return (
            <HeroArea key={`${slot.area}-${index}`} area={slot.area} className={slot.className}>
              {renderedSlot}
            </HeroArea>
          );
        })}
      </HeroGrid>
    </section>
  );
}
