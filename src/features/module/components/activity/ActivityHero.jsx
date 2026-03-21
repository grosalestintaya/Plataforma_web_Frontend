import { templates } from "@/features/module/templates";

export default function Hero({ moduleData, missionKey, viewIndex, heroApi }) {
  const views = moduleData.missions?.[missionKey]?.views ?? [];
  // ✅ si no hay vistas en esa misión
  if (views.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/80">
        No hay vistas en la misión:{" "}
        <span className="font-semibold ml-2">{missionKey}</span>
      </div>
    );
  }

  const view = views[viewIndex];

  // ✅ si viewIndex se salió del rango
  if (!view) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/80">
        Vista no encontrada (index {viewIndex}) en misión {missionKey}
      </div>
    );
  }

  const Template = templates[view.template];
  // ✅ si el template no está registrado
  if (!Template) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/80">
        Template no registrado:{" "}
        <span className="font-semibold ml-2">{view.template}</span>
      </div>
    );
  }

  return (
    <main className="min-h-0 overflow-hidden">
      <Template variant={view.variant} data={view.data} heroApi={heroApi} />
    </main>
  );
}
