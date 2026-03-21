// Template: las variantes cambian la experiencia, no el layout principal.
import { SCENARIO_EXPLORER_CONFIG } from "./scenarioExplorer.config";
import HeroGrid from "../_core/HeroGrid";
import HeroArea from "../_core/HeroArea";
import { renderSlot } from "../_core/SlotRenderer";
import { normalizeLayout } from "../_core/layouts.helpers";
import * as Blocks from "@/features/module/blocks";

export default function ScenarioExplorerTemplate(props) {
  const variant =
    SCENARIO_EXPLORER_CONFIG.variantMap[props.variant] ??
    props.variant ??
    "numericOutcome";
  const vKey = SCENARIO_EXPLORER_CONFIG.variants[variant]
    ? variant
    : SCENARIO_EXPLORER_CONFIG.fallbackVariant;

  const layout = normalizeLayout(SCENARIO_EXPLORER_CONFIG.layout);
  const slots = SCENARIO_EXPLORER_CONFIG.variants[vKey];

  if (!layout || !slots) {
    return (
      <div className="text-white/80">Config invalida para Scenario Explorer</div>
    );
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
