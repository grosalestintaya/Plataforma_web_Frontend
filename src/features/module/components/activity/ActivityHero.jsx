import { useLayoutEffect, useRef, useState } from "react";
import { templates } from "@/features/module/templates";

const HERO_VIEWPORT_CLASS =
  "h-full min-h-0 w-full overflow-x-hidden overflow-y-auto px-10 py-1";
const HERO_CANVAS_CLASS = "min-h-full w-full will-change-transform md:h-full";
const HERO_MESSAGE_CLASS =
  "flex h-full w-full items-center justify-center px-6 text-center text-white/80";
const HERO_MESSAGE_LABEL_CLASS = "ml-2 font-semibold";
const DEFAULT_HERO_LAYOUT = {
  height: 0,
  scale: 1,
  scaledContentHeight: null,
};

function getNextHeroLayout({ availableWidth, availableHeight, contentWidth, contentHeight }) {
  const shouldScaleToViewport = availableWidth > 0 && availableWidth < 768;
  const scale =
    shouldScaleToViewport && contentWidth > 0
      ? Math.min(1, availableWidth / contentWidth)
      : 1;

  return {
    height: availableHeight,
    scale,
    scaledContentHeight:
      shouldScaleToViewport && scale < 1 && contentHeight > 0
        ? Math.ceil(contentHeight * scale)
        : null,
  };
}

function isSameHeroLayout(prev, next) {
  return (
    prev.height === next.height &&
    prev.scale === next.scale &&
    prev.scaledContentHeight === next.scaledContentHeight
  );
}

/**
 * Hero:
 * - Renderiza la vista actual dentro del canvas principal de la mision.
 * - Expone la altura real disponible mediante `--hero-height`.
 * - Integra aqui mismo el escalado responsive para evitar wrappers extra.
 */
export default function Hero({ moduleData, missionKey, viewIndex, heroApi }) {
  const views = moduleData.missions?.[missionKey]?.views ?? [];
  const view = views[viewIndex];
  const Template = view ? templates[view.template] : null;
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [layout, setLayout] = useState(DEFAULT_HERO_LAYOUT);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    outer.scrollTop = 0;

    let frameId = 0;

    /**
     * Recalcula la altura util del hero y aplica scale solo en responsive.
     * Desktop se mantiene a escala real.
     */
    function measure() {
      const nextLayout = getNextHeroLayout({
        availableWidth: outer.clientWidth,
        availableHeight: outer.clientHeight,
        contentWidth: inner.scrollWidth,
        contentHeight: inner.scrollHeight,
      });

      setLayout((currentLayout) =>
        isSameHeroLayout(currentLayout, nextLayout)
          ? currentLayout
          : nextLayout,
      );
    }

    function scheduleMeasure() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measure);
    }

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(outer);
    observer.observe(inner);
    scheduleMeasure();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [
    missionKey,
    viewIndex,
    view?.id,
    view?.viewId,
    view?.template,
    view?.variant,
  ]);

  // Si no hay vistas, la mision no tiene contenido listo todavia.
  if (views.length === 0) {
    return (
      <div className={HERO_MESSAGE_CLASS}>
        No hay vistas en la mision:
        <span className={HERO_MESSAGE_LABEL_CLASS}>{missionKey}</span>
      </div>
    );
  }

  // Protege el render cuando el indice queda fuera del arreglo.
  if (!view) {
    return (
      <div className={HERO_MESSAGE_CLASS}>
        Vista no encontrada (index {viewIndex}) en mision {missionKey}
      </div>
    );
  }

  // Muestra el error directamente cuando el tipo de vista no fue registrado.
  if (!Template) {
    return (
      <div className={HERO_MESSAGE_CLASS}>
        Template no registrado:
        <span className={HERO_MESSAGE_LABEL_CLASS}>{view.template}</span>
      </div>
    );
  }

  return (
    <main
      ref={outerRef}
      className={HERO_VIEWPORT_CLASS}
      style={{
        // La variable debe ser una longitud CSS valida porque varios bloques
        // calculan su alto con `calc(var(--hero-height) * ...)`.
        "--hero-height": layout.height ? `${layout.height}px` : "50px",
      }}
    >
      {/* ELIMAR EN UN FUTURO ESTE DIV, LOS COMPONENTES DEBEN DE SER RESPONSIVOS POR SI SOLOS Y ACOMODARSE */}
      <div
        ref={innerRef}
        className={HERO_CANVAS_CLASS}
        style={{
          height: layout.scaledContentHeight
            ? `${layout.scaledContentHeight}px`
            : undefined,
          transform: `scale(${layout.scale})`,
          transformOrigin: "top center",
        }}
      >
        <Template
          variant={view.variant}
          data={view.data}
          heroApi={heroApi}
          view={view}
        />
      </div>{/* ELIMAR EN UN FUTURO ESTE DIV, LOS COMPONENTES DEBEN DE SER RESPONSIVOS POR SI SOLOS Y ACOMODARSE */}

    </main>
  );
}
