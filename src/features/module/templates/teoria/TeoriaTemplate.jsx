// Template base para pantallas teoricas o expositivas.
import HeroGrid from "../_core/HeroGrid";
import HeroArea from "../_core/HeroArea";
import { renderSlot } from "../_core/SlotRenderer";
import { normalizeLayout } from "../_core/layouts.helpers";

import { TEORIA_CONFIG } from "./teoria.config";
import * as Blocks from "@/features/module/blocks";

export default function TeoriaTemplate({ variant = "simple", data }) {
  // Si la variante no existe, usa la expositiva mas simple.
  const vKey = TEORIA_CONFIG.variants[variant]
    ? variant
    : TEORIA_CONFIG.fallbackVariant;

  const layout = normalizeLayout(TEORIA_CONFIG.layouts[vKey]);
  const slots = TEORIA_CONFIG.variants[vKey];

  if (!layout || !slots) {
    return <div className="text-white/80">Config inválida para Teoría</div>;
  }

  return (
    <HeroGrid layout={layout}>
      {slots.map((slot, idx) => (
        <HeroArea
          key={`${slot.area}-${idx}`}
          area={slot.area}
          className={slot.className}
        >
          {renderSlot(slot, data, Blocks)}
        </HeroArea>
      ))}
    </HeroGrid>
  );
}
