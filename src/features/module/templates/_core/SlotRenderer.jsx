import React from "react";
import { cn } from "@/shared/libs/utils";
import HeroGrid from "./HeroGrid";
import HeroArea from "./HeroArea";
import { normalizeLayout } from "./layouts.helpers";

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
      return (
        <div
          className={cn("w-full max-w-full", slotDef.placeholderClassName)}
          aria-hidden="true"
        />
      );
    }

    return null;
  }

  if (Array.isArray(slotDef.items)) {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 max-w-full flex-col gap-3 md:max-h-full",
          slotDef.stackClassName,
        )}
      >
        {slotDef.items.map((child, index) => (
          <React.Fragment key={index}>
            {renderSlot(child, data, Blocks, ctx)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const nestedLayoutDef =
    typeof slotDef.layoutDef === "function"
      ? slotDef.layoutDef(data, ctx)
      : slotDef.layoutDef;
  const nestedLayout = normalizeLayout(nestedLayoutDef);

  if (nestedLayout && Array.isArray(slotDef.slots) && slotDef.slots.length > 0) {
    return (
      <HeroGrid layout={nestedLayout} className="h-full min-h-0 w-full">
        {slotDef.slots.map((childSlot, index) => {
          const renderedChild = renderSlot(childSlot, data, Blocks, ctx);
          if (!renderedChild) return null;

          return (
            <HeroArea
              key={`${childSlot.area}-${index}`}
              area={childSlot.area}
              className={childSlot.className}
            >
              {renderedChild}
            </HeroArea>
          );
        })}
      </HeroGrid>
    );
  }

  const Comp = Blocks?.[slotDef.block];
  if (!Comp) return null;

  const props = slotDef.props ? slotDef.props(data, ctx) : {};
  const children = slotDef.children ? slotDef.children(data, ctx) : null;

  return children !== null ? <Comp {...props}>{children}</Comp> : <Comp {...props} />;
}
