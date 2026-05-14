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

function getNextHeroLayout({
  availableWidth,
  availableHeight,
  contentWidth,
  contentHeight,
}) {
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

  if (views.length === 0) {
    return (
      <main className="flex h-full min-h-0 w-full items-center justify-center px-6 text-center text-white/80">
        No hay vistas en la misión:
        <span className="ml-2 font-semibold">{missionKey}</span>
      </main>
    );
  }

  if (!view) {
    return (
      <main className="flex h-full min-h-0 w-full items-center justify-center px-6 text-center text-white/80">
        Vista no encontrada (index {viewIndex}) en misión
        <span className="ml-2 font-semibold">{missionKey}</span>
      </main>
    );
  }

  if (!Template) {
    return (
      <main className="flex h-full min-h-0 w-full items-center justify-center px-6 text-center text-white/80">
        Template no registrado:
        <span className="ml-2 font-semibold">{view.template}</span>
      </main>
    );
  }

  return (
    <main
      ref={outerRef}
      className={HERO_VIEWPORT_CLASS + "pt-0"}
      style={{
        // La variable debe ser una longitud CSS valida porque varios bloques
        // calculan su alto con `calc(var(--hero-height) * ...)`.
        "--hero-height": layout.height ? `${layout.height}px` : "50px",
      }}>
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
        }}>
        <Template
          variant={view.variant}
          data={view.data}
          heroApi={heroApi}
          view={view}
        />
      </div>
      {/* ELIMAR EN UN FUTURO ESTE DIV, LOS COMPONENTES DEBEN DE SER RESPONSIVOS POR SI SOLOS Y ACOMODARSE */}
    </main>
  );
}