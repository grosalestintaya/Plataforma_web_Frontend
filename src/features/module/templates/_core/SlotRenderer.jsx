import React from "react";
import { cn } from "@/shared/libs/utils";
import HeroGrid from "./HeroGrid";
import HeroArea from "./HeroArea";
import { normalizeLayout } from "./layouts.helpers";

/**
 * renderSlot:
 * Interpreta un slot definido en la config del template.
 *
 * Permite:
 * - Mostrar u ocultar slots con `when`.
 * - Agrupar varios slots con `items`.
 * - Crear layouts internos con `layoutDef + slots`.
 * - Envolver un bloque con otro usando `child`.
 * - Renderizar el componente final desde `Blocks`.
 */
export function renderSlot(slotDef, data, Blocks, ctx = {}) {
  if (!slotDef) return null;

  /**
   * 1. Condición de renderizado.
   *
   * Si `when` existe y retorna false, el slot no se renderiza.
   */
  if (slotDef.when && !slotDef.when(data, ctx)) {
    /**
     * Si reserveSpace está activo, devuelve un placeholder invisible.
     * Sirve para evitar saltos de layout en slots opcionales.
     */
    if (
      slotDef.reserveSpace &&
      (!slotDef.reserveWhen || slotDef.reserveWhen(data, ctx))
    ) {
      return (
        <div
          className={cn("w-full max-w-full", slotDef.placeholderClassName)}
          aria-hidden="true"
        />
      );
    }

    return null;
  }

  /**
   * 2. Grupo de slots.
   *
   * Se usa cuando un slot contiene varios hijos posibles.
   *
   * Si sólo queda un hijo visible, se devuelve directamente
   * para evitar un div extra que afecte componentes completos
   * como ChooseOne, CollageCard, etc.
   */
  if (Array.isArray(slotDef.items)) {
    const renderedItems = slotDef.items
      .map((child, index) => {
        const renderedChild = renderSlot(child, data, Blocks, ctx);

        if (!renderedChild) return null;

        return (
          <React.Fragment
            key={child.slotId ?? `${child.area ?? "slot"}-${index}`}
          >
            {renderedChild}
          </React.Fragment>
        );
      })
      .filter(Boolean);

    if (renderedItems.length === 0) return null;

    if (renderedItems.length === 1 && !slotDef.forceStackWrapper) {
      return renderedItems[0];
    }

    if (slotDef.isStack === false) {
      return <>{renderedItems}</>;
    }

    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 max-w-full flex-col gap-3 md:max-h-full",
          slotDef.stackClassName,
        )}
      >
        {renderedItems}
      </div>
    );
  }

  /**
   * 3. Layout anidado.
   *
   * Permite que un slot tenga su propio HeroGrid interno.
   *
   * Ejemplo:
   * HeroArea media
   * └── HeroGrid interno
   *     ├── HeroArea image
   *     └── HeroArea text
   */
  const nestedLayoutDef =
    typeof slotDef.layoutDef === "function"
      ? slotDef.layoutDef(data, ctx)
      : slotDef.layoutDef;

  const nestedLayout = normalizeLayout(nestedLayoutDef);

  if (
    nestedLayout &&
    Array.isArray(slotDef.slots) &&
    slotDef.slots.length > 0
  ) {
    return (
      <HeroGrid layout={nestedLayout} className="h-full min-h-0 w-full">
        {slotDef.slots.map((childSlot, index) => {
          const renderedChild = renderSlot(childSlot, data, Blocks, ctx);

          if (!renderedChild) return null;

          return (
            <HeroArea
              key={`${childSlot.area}-${childSlot.slotId ?? index}`}
              area={childSlot.area}
              className={childSlot.areaClassName}
            >
              {renderedChild}
            </HeroArea>
          );
        })}
      </HeroGrid>
    );
  }

  /**
   * 4. Renderizado del bloque final.
   *
   * Busca el componente real dentro de Blocks.
   *
   * Ejemplo:
   * block: "CollageCard"
   * Comp = Blocks.CollageCard
   */
  const Comp = Blocks?.[slotDef.block];

  if (!Comp) return null;

  const props = slotDef.props ? slotDef.props(data, ctx) : {};

  /**
   * 5. Soporte para child.
   *
   * Esto permite que un componente envuelva a otro desde config.
   *
   * Ejemplo:
   * IteractionComplete
   * └── CollageCard
   */
  const childSlot = slotDef.child ?? null;

  const renderedChild = childSlot
    ? renderSlot(childSlot, data, Blocks, ctx)
    : null;

  /**
   * children manual tiene prioridad sobre child.
   * Si no existe children manual, se usa renderedChild.
   */
  const children = slotDef.children
    ? slotDef.children(data, ctx)
    : renderedChild;

  /**
   * className se pasa al componente final.
   * No crea wrapper adicional.
   */
  const mergedProps = {
    ...props,
    className: cn(slotDef.className, props.className),
  };

  if (children !== null) {
    return <Comp {...mergedProps}>{children}</Comp>;
  }

  return <Comp {...mergedProps} />;
}