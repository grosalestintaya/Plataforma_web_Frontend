import HeroGrid from "@/features/module/engine/HeroGrid";
import HeroArea from "@/features/module/engine/HeroArea";
import { normalizeLayout } from "../_core/layouts.helpers";
import { TEORIA_CONFIG } from "./teoria.config";
import * as Blocks from "@/features/module/blocks";
import { renderSlot } from "../_core/SlotRenderer";


export default function TeoriaTemplate({ variant = "simple", data }) {
  const vKey = TEORIA_CONFIG.variants[variant] ? variant : TEORIA_CONFIG.fallbackVariant;

  const layout = normalizeLayout(TEORIA_CONFIG.layouts[vKey]);
  const slots = TEORIA_CONFIG.variants[vKey];

  if (!layout || !slots) {
    return <div className="text-white/80">Config inválida para Teoría</div>;
  }

  return (
    <HeroGrid layout={layout}>
      {slots.map((slot, idx) => (
        <HeroArea key={`${slot.area}-${idx}`} area={slot.area} className={slot.className}>
          {renderSlot(slot, data, Blocks)}
        </HeroArea>
      ))}
    </HeroGrid>
  );
}