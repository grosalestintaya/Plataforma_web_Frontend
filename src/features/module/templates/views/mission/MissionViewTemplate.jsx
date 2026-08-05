import React from "react";
import * as Blocks from "@/features/module/blocks";
import HeroArea from "../../_core/HeroArea";
import HeroGrid from "../../_core/HeroGrid";
import { normalizeLayout } from "../../_core/layouts.helpers";
import { cn } from "@/shared/libs/utils";
import { resolveMissionLayout } from "./missionView.layouts";
import { getMissionViewDefinition } from "./missionView.registry";

function getMissionViewRuntime(props) {
  const definition = getMissionViewDefinition(props?.view?.template);
  return definition.createRuntime?.(props) ?? null;
}

function renderAreaSlot(slot, payload, context, index) {
  const renderedSlot = renderSlot(slot, payload, context);

  if (!renderedSlot) return null;

  return (
    <HeroArea
      key={`${slot.area}-${slot.slotId ?? index}`}
      area={slot.area}
      align={slot.areaAlign}
      className={slot.areaClassName}
    >
      {renderedSlot}
    </HeroArea>
  );
}

function renderSlot(slotDef, payload, context = {}) {
  if (!slotDef) return null;

  if (slotDef.when && !slotDef.when(payload, context)) {
    if (
      slotDef.reserveSpace &&
      (!slotDef.reserveWhen || slotDef.reserveWhen(payload, context))
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

  if (typeof slotDef.render === "function") {
    return slotDef.render(payload, context);
  }

  if (Array.isArray(slotDef.items)) {
    const renderedItems = slotDef.items
      .map((child, index) => {
        const renderedChild = renderSlot(child, payload, context);

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
    if (slotDef.isStack === false) return <>{renderedItems}</>;

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

  const nestedLayoutDef = slotDef.layoutVariant
    ? resolveMissionLayout({
        layoutVariant:
          typeof slotDef.layoutVariant === "function"
            ? slotDef.layoutVariant(payload, context)
            : slotDef.layoutVariant,
        slots: slotDef.slots ?? [],
        payload,
        context,
      })
    : typeof slotDef.layoutDef === "function"
      ? slotDef.layoutDef(payload, context)
      : slotDef.layoutDef;
  const nestedLayout = normalizeLayout(nestedLayoutDef);

  if (
    nestedLayout &&
    Array.isArray(slotDef.slots) &&
    slotDef.slots.length > 0
  ) {
    return (
      <HeroGrid
        layout={nestedLayout}
        className={cn("h-full min-h-0 w-full", slotDef.gridClassName)}
      >
        {slotDef.slots.map((childSlot, index) =>
          renderAreaSlot(childSlot, payload, context, index),
        )}
      </HeroGrid>
    );
  }

  const Component = Blocks?.[slotDef.block];
  if (!Component) return null;

  const props =
    typeof slotDef.props === "function"
      ? slotDef.props(payload, context)
      : (slotDef.props ?? {});
  const renderedChild = slotDef.child
    ? renderSlot(slotDef.child, payload, context)
    : null;
  const children = slotDef.children
    ? slotDef.children(payload, context)
    : renderedChild;
  const declarativeRenderProps = Object.fromEntries(
    Object.entries(slotDef.renderProps ?? {}).map(
      ([propName, renderSlotDef]) => [
        propName,
        (...args) =>
          renderSlot(renderSlotDef, payload, {
            ...context,
            renderProp: {
              name: propName,
              value: args[0],
              args,
            },
          }),
      ],
    ),
  );
  const mergedProps = {
    ...props,
    ...declarativeRenderProps,
    className: cn(slotDef.className, props.className),
  };

  if (children !== null) {
    return <Component {...mergedProps}>{children}</Component>;
  }

  return <Component {...mergedProps} />;
}

function getMissionInstanceKey(view) {
  return view?.id ?? view?.viewId ?? view?.template ?? "mission-view";
}

function MissionViewRenderer({
  variant,
  data,
  heroApi,
  view,
  runtime: providedRuntime,
}) {
  const runtime =
    providedRuntime ??
    getMissionViewRuntime({
      variant,
      data,
      heroApi,
      view,
    });

  const slots = runtime?.slots ?? [];
  const overlays = runtime?.overlays ?? [];
  const payload = runtime?.payload ?? {};
  const runtimeContext = {
    heroApi,
    view,
    variant: runtime?.variant,
  };
  const layoutDef = runtime?.layoutVariant
    ? resolveMissionLayout({
        layoutVariant: runtime.layoutVariant,
        slots,
        payload,
        context: runtimeContext,
      })
    : runtime?.layoutDef;
  const layout = normalizeLayout(layoutDef);

  if (!layout || !slots.length) {
    return (
      <div className="grid h-full min-h-0 w-full place-items-center text-white/80">
        Config inválida para MissionViewTemplate
      </div>
    );
  }

  const missionContent = (
    <HeroGrid layout={layout} className={runtime?.gridClassName}>
      {slots.map((slot, index) =>
        renderAreaSlot(slot, payload, runtimeContext, index),
      )}
    </HeroGrid>
  );

  const missionOverlays = overlays.map((overlay, index) => {
    const renderedOverlay = renderSlot(overlay, payload, runtimeContext);

    if (!renderedOverlay) return null;

    return (
      <React.Fragment key={overlay.slotId ?? `overlay-${index}`}>
        {renderedOverlay}
      </React.Fragment>
    );
  });

  if (!runtime?.stageClassName) {
    return (
      <>
        {missionContent}
        {missionOverlays}
      </>
    );
  }

  return (
    <>
      <section className={cn(runtime.stageClassName)}>{missionContent}</section>
      {missionOverlays}
    </>
  );
}

export default function MissionViewTemplate(props) {
  const { runtime, view } = props;
  const definition = getMissionViewDefinition(view?.template);
  const Controller = !runtime ? definition.Controller : null;

  if (Controller) {
    return (
      <Controller
        key={getMissionInstanceKey(view)}
        {...props}
        renderRuntime={(controlledRuntime) => (
          <MissionViewRenderer {...props} runtime={controlledRuntime} />
        )}
      />
    );
  }

  return <MissionViewRenderer {...props} />;
}
