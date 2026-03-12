import HeroGrid from "@/features/module/engine/HeroGrid";
import HeroArea from "@/features/module/engine/HeroArea";
import { normalizeLayout } from "@/features/module/templates/_core/layouts.helpers";
import { renderSlot } from "@/features/module/templates/_core/SlotRenderer";
import * as Blocks from "@/features/module/blocks";
import { MEMORY_PAIRS_CONFIG } from "./memoryPairs.config";

export default function MemoryPairsTemplate({ variant = "board", data, heroApi, view }) {
  const vKey = MEMORY_PAIRS_CONFIG.variants[variant] ? variant : MEMORY_PAIRS_CONFIG.fallbackVariant;

  const layout = normalizeLayout(MEMORY_PAIRS_CONFIG.layouts[vKey]);
  const slots = MEMORY_PAIRS_CONFIG.variants[vKey];

  const ctx = { heroApi, view };

  return (
    <HeroGrid layout={layout}>
      {slots.map((slot, idx) => (
        <HeroArea key={`${slot.area}-${idx}`} area={slot.area} className={slot.className}>
          {renderSlot(slot, data, Blocks, ctx)}
        </HeroArea>
      ))}
    </HeroGrid>
  );
}