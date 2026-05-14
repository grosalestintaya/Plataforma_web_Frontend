import { templates } from "@/features/module/templates";

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
    <main className="h-full min-h-0 w-full overflow-x-hidden overflow-y-auto px-4 py-1 sm:px-6 md:px-8 lg:overflow-hidden lg:px-10">
      <Template
        variant={view.variant}
        data={view.data}
        heroApi={heroApi}
        view={view}
      />
    </main>
  );
}