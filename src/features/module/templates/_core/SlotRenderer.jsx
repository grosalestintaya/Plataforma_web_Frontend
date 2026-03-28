import React from "react";
import { cn } from "@/shared/libs/utils";

/**
 * renderSlot:
 * - Resuelve un slot definido en config.
 * - Soporta condicionales, slots compuestos e inyeccion de contexto.
 */
export function renderSlot(slotDef, data, Blocks, ctx = {}) {
  if (!slotDef) return null;

  if (slotDef.when && !slotDef.when(data, ctx)) {
    // Algunos slots opcionales deben reservar su area para evitar saltos de layout.
    if (slotDef.reserveSpace && (!slotDef.reserveWhen || slotDef.reserveWhen(data, ctx))) {
      return <div className={cn("w-full", slotDef.placeholderClassName)} aria-hidden="true" />;
    }

    return null;
  }

  if (Array.isArray(slotDef.items)) {
    return (
      <div className={cn("flex flex-col gap-3", slotDef.stackClassName)}>
        {slotDef.items.map((child, index) => (
          <React.Fragment key={index}>
            {renderSlot(child, data, Blocks, ctx)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const Comp = Blocks?.[slotDef.block];
  if (!Comp) return null;

  const props = slotDef.props ? slotDef.props(data, ctx) : {};
  const children = slotDef.children ? slotDef.children(data, ctx) : null;

  return children !== null ? <Comp {...props}>{children}</Comp> : <Comp {...props} />;
}
