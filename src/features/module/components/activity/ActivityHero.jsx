import { templates } from "@/features/module/templates";

export default function Hero({ moduleData, missionKey, viewIndex, heroApi }) {
  const views = moduleData.missions?.[missionKey]?.views ?? [];

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
    <main className="min-h-0 overflow-hidden">
      <Template variant={view.variant} data={view.data} heroApi={heroApi} view={view} />
    </main>
  );
}
