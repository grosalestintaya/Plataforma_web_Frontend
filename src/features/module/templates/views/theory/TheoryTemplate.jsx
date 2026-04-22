import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { getTheoryRuntime } from "./theory.config";
import * as Blocks from "@/features/module/blocks";

/**
 * TheoryTemplate:
 * - Componente delgado que solo ejecuta la config.
 * - Layout, slots y reglas se definen en `theory.config.js`.
 */
export default function TheoryTemplate({
  variant = "simple",
  data,
  heroApi,
  view,
}) {
  const runtime = getTheoryRuntime({
    variant,
    data,
    view,
  });

  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  const pruebis = ["explanation", "assessment"].includes(view?.variant)
    ? "h-full min-h-0 w-full rounded-lg bg-black/20 backdrop-blur-sm"
    : "h-full min-h-0 w-full";

  if (!layout || !slots.length) {
    return (
      <div className="text-white/80">Config invalida para TheoryTemplate</div>
    );
  }

  return (
    <HeroGrid layout={layout} className={pruebis}>
      {slots.map((slot, index) => {
        // Solo crea el area del grid cuando el slot realmente renderiza algo.
        const renderedSlot = renderSlot(slot, payload, Blocks, {
          heroApi,
          view,
        });

        if (!renderedSlot) return null;

        return (
          <HeroArea
            key={`${slot.area}-${index}`}
            area={slot.area}
            className={slot.className}
          >
            {renderedSlot}
          </HeroArea>
        );
      })}
    </HeroGrid>
  );
}
