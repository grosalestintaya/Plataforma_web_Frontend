import { useLayoutEffect, useRef, useState } from "react";
import { templates } from "@/features/module/templates";

/**
 * HeroCanvas:
 * - Mantiene el canvas completo sin scroll.
 * - Solo aplica escalado en contextos responsive.
 * - En desktop deja el contenido a escala real.
 */
function HeroCanvas({ children, onHeightChange }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    let frameId = 0;

    /**
     * Recalcula la altura util del hero y aplica scale solo en responsive.
     */
    function measure() {
      const availableWidth = outer.clientWidth;
      const availableHeight = outer.clientHeight;
      const contentWidth = inner.scrollWidth;
      const contentHeight = inner.scrollHeight;

      onHeightChange?.(availableHeight);

      // Solo activamos el scale en escenarios responsive reales.
      // Desktop se mantiene en tamano 1 para respetar el layout principal.
      const shouldUseResponsiveScale = availableWidth < 768;

      if (!shouldUseResponsiveScale) {
        setScale(1);
        return;
      }

      if (!availableWidth || !availableHeight || !contentWidth || !contentHeight) {
        setScale(1);
        return;
      }

      // Responsive: solo reducimos si el contenido no cabe.
      const nextScale = Math.min(
        1,
        availableWidth / contentWidth,
        availableHeight / contentHeight,
      );

      setScale(nextScale);
    }

    /**
     * Agrupa mediciones en un solo frame para evitar saltos visuales.
     */
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
  }, [children, onHeightChange]);

  return (
    <div ref={outerRef} className="h-full min-h-0 w-full overflow-hidden">
      <div className="flex h-full w-full items-start justify-center overflow-hidden">
        <div
          ref={innerRef}
          className="w-full"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Hero:
 * - Renderiza la vista actual dentro del canvas principal de la mision.
 * - Expone la altura real disponible mediante `--hero-height`.
 * - Deja el escalado unicamente como apoyo responsive.
 */
export default function Hero({ moduleData, missionKey, viewIndex, heroApi }) {
  const views = moduleData.missions?.[missionKey]?.views ?? [];
  const [heroHeight, setHeroHeight] = useState(0);

  // Si no hay vistas, la mision no tiene contenido listo todavia.
  if (views.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/80">
        No hay vistas en la mision:
        <span className="ml-2 font-semibold">{missionKey}</span>
      </div>
    );
  }

  const view = views[viewIndex];

  // Protege el render cuando el indice queda fuera del arreglo.
  if (!view) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/80">
        Vista no encontrada (index {viewIndex}) en mision {missionKey}
      </div>
    );
  }

  const Template = templates[view.template];

  // Muestra el error directamente cuando el tipo de vista no fue registrado.
  if (!Template) {
    return (
      <div className="flex h-full w-full items-center justify-center text-white/80">
        Template no registrado:
        <span className="ml-2 font-semibold">{view.template}</span>
      </div>
    );
  }

  return (
    <main
      className="h-full min-h-0 w-full overflow-hidden px-[var(--activity-shell-gutter)] pb-2"
      style={{
        "--hero-height": heroHeight ? `${heroHeight}px` : undefined,
      }}
    >
      <HeroCanvas onHeightChange={setHeroHeight}>
        <Template variant={view.variant} data={view.data} heroApi={heroApi} view={view} />
      </HeroCanvas>
    </main>
  );
}
