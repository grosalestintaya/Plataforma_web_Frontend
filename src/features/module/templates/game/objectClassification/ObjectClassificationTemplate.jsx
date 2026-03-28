import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";

/**
 * ObjectClassificationTemplate:
 * - Base temporal para el template de clasificacion.
 */
export default function ObjectClassificationTemplate({ view, heroApi, data }) {
  const viewId = view?.id ?? view?.viewId;

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl items-center px-6 py-6 text-white">
      <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-6">
        <Typography
          content={data?.title ?? { text: "ObjectClassification", variant: "h3" }}
        />
        <Typography
          content={
            data?.text ?? {
              text: "Template base listo para integrar la dinamica final de clasificacion.",
              variant: "bodySm",
            }
          }
          className="mt-3"
        />
        <div className="mt-5">
          <Button
            variant="primary"
            onClick={() =>
              heroApi?.setInteractiveState?.(viewId, {
                completed: true,
                type: "objectClassification",
                score: 100,
              })
            }
          >
            Marcar como completado
          </Button>
        </div>
      </div>
    </section>
  );
}
