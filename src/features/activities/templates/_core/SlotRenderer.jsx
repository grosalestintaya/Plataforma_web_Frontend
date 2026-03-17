import React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * renderSlot:
 * - Renderiza un slot desde config (block + props + children).
 * - Soporta `when` (condicional) y `items` (slot compuesto).
 */
export function renderSlot(slotDef, data, Blocks, ctx = {}) {

  if (!slotDef) return null;
  //Render condicional
  if (slotDef.when && !slotDef.when(data, ctx)) return null;

  // Slot compuesto: varios bloques dentro del mismo area
    if (Array.isArray(slotDef.items)) {
    return (
      <div className={cn("flex flex-col gap-3", slotDef.stackClassName)}>
        {slotDef.items.map((child, i) => (
          <React.Fragment key={i}>
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