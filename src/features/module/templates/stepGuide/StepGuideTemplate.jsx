// Template: resuelve la variante, pero renderiza siempre sobre el mismo layout base.
import { STEP_GUIDE_CONFIG } from "./stepGuide.config";
import HeroGrid from "../_core/HeroGrid";
import HeroArea from "../_core/HeroArea";
import { renderSlot } from "../_core/SlotRenderer";
import { normalizeLayout } from "../_core/layouts.helpers";
import * as Blocks from "@/features/module/blocks";

export default function StepGuideTemplate(props) {
  const variant =
    STEP_GUIDE_CONFIG.variantMap[props.variant] ?? props.variant ?? "modalDetail";
  const vKey = STEP_GUIDE_CONFIG.variants[variant]
    ? variant
    : STEP_GUIDE_CONFIG.fallbackVariant;

  const layout = normalizeLayout(STEP_GUIDE_CONFIG.layout);
  const slots = STEP_GUIDE_CONFIG.variants[vKey];

  if (!layout || !slots) {
    return <div className="text-white/80">Config invalida para Step Guide</div>;
  }

  return (
    <HeroGrid layout={layout}>
      {slots.map((slot, idx) => (
        <HeroArea
          key={`${slot.area}-${idx}`}
          area={slot.area}
          className={slot.className}
        >
          {renderSlot(slot, props.data, Blocks)}
        </HeroArea>
      ))}
    </HeroGrid>
  );
}
