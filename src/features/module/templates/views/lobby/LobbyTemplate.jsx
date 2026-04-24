import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { renderSlot } from "../../_core/SlotRenderer";
import { getLobbyRuntime } from "./lobby.config";
import * as Blocks from "@/features/module/blocks";
import { useAvatarStore } from "@/features/dashboard/hooks/useAvatarStore";

/**
 * LobbyTemplate:
 * - Ejecuta el runtime generado por `lobby.config.js`.
 * - No tiene logica de slots; solo renderiza el resultado de config.
 */
export default function LobbyTemplate({ variant, data, heroApi, view }) {
  const { equipped, owned } = useAvatarStore();
  const avatar = equipped || owned;
  // `heroApi` lleva el resumen final del attempt para el postGame.
  const runtime = getLobbyRuntime({ variant, data, heroApi, view, avatar });
  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  if (!layout || !slots.length) {
    return (
      <div className="text-white/80">Config invalida para LobbyTemplate</div>
    );
  }

  return (
    <HeroGrid layout={layout} className="h-full min-h-0 w-full">
      {slots.map((slot, index) => {
        // Evita dejar areas vacias cuando un slot opcional no aplica.
        const renderedSlot = renderSlot(slot, payload, Blocks, { view });

        if (!renderedSlot) return null;

        return (
          <HeroArea
            key={`${slot.area}-${index}`}
            area={slot.area}
            className={slot.className}>
            {renderedSlot}
          </HeroArea>
        );
      })}
    </HeroGrid>
  );
}
