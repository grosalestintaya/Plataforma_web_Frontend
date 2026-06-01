import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { getTheoryRuntime } from "./theory.config";
import * as Blocks from "@/features/module/blocks";

function getSlotAreaClassName(slot) {
  if (!slot?.slotId) return "";

  if (
    slot.slotId === "bodyGroup" ||
    slot.slotId === "bodyTitle" ||
    slot.slotId === "supportGroup"
  ) {
    return "items-start justify-start lg:overflow-y-auto";
  }

  if (slot.slotId === "subtitle") {
    return "items-start justify-start";
  }

  return "";
}

/**
 * TheoryTemplate:
 * - No decide estilos visuales.
 * - No decide tamaños de Card, ShowCard, CollageCard, etc.
 * - Solo construye el layout declarado por la config.
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

  if (!layout || !slots.length) {
    return (
      <div className="grid h-full min-h-0 w-full place-items-center text-white/80">
        Config inválida para TheoryTemplate
      </div>
    );
  }

  return (
    <HeroGrid layout={layout}>
      {slots.map((slot, index) => {
        const renderedSlot = renderSlot(slot, payload, Blocks, {
          heroApi,
          view,
        });

        if (!renderedSlot) return null;

        return (
          <HeroArea
            key={`${slot.area}-${slot.slotId ?? index}`}
            area={slot.area}
            className={getSlotAreaClassName(slot)}
          >
            {renderedSlot}
          </HeroArea>
        );
      })}
    </HeroGrid>
  );
}
