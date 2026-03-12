import React from "react";
import { cn } from "@/shared/libs/utils"

/**
 * slotDef soporta:
 * - block: "Title" | "Text" | "Image" | ...
 * - props: (data, ctx) => ({})
 * - children: (data, ctx) => ReactNode
 * - when: (data, ctx) => boolean
 *
 * ✅ NUEVO:
 * - items: [slotDef, slotDef, ...]  -> permite renderizar 1..N componentes dentro del mismo area
 * - stackClassName: estilos del contenedor cuando usas items
 */
export function renderSlot(slotDef, data, Blocks, ctx = {}) {
  if (!slotDef) return null;
  if (slotDef.when && !slotDef.when(data, ctx)) return null;

  // ✅ Caso escalable: slot compuesto (lista de bloques)
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