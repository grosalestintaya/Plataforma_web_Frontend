import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import MemoryPairs from "@/features/module/blocks/compounds/iteractive/MemoryPairs";

/**
 * CollectObjectsTemplate:
 * - Base del template de recoleccion con dinamica tipo pares.
 */
export default function CollectObjectsTemplate({ view, heroApi, data }) {
  const viewId = view?.id ?? view?.viewId;

  return (
    <section className="mx-auto flex h-full w-full max-w-5xl items-center px-6 py-6 text-white">
      <div className="w-full rounded-2xl  p-6">
        <Typography content={data?.title ?? { text: "CollectObjects", variant: "h3" }} />
        <Typography
          content={
            data?.text ?? {
              text: "Template base para recoleccion de objetos.",
              variant: "bodySm",
            }
          }
          className="mt-3"
        />

        <div className="mt-4">
          <MemoryPairs data={data} heroApi={heroApi} view={view} />
        </div>

        <div className="mt-5">
          <Button
            variant="secondary"
            onClick={() =>
              heroApi?.setInteractiveState?.(viewId, {
                completed: true,
                type: "collectObjects",
                score: 100,
              })
            }
          >
            Omitir y completar
          </Button>
        </div>
      </div>
    </section>
  );
}
