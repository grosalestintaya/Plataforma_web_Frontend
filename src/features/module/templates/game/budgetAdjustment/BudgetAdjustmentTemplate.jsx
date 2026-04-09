import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import Calculator from "@/features/module/blocks/compounds/Iterative/Calculator";

/**
 * BudgetAdjustmentTemplate:
 * - Base del template de practica para ajuste de presupuesto.
 * - Usa `Calculator` como bloque interactivo principal.
 */
export default function BudgetAdjustmentTemplate({ view, heroApi, data }) {
  const viewId = view?.id ?? view?.viewId;

  return (
    <section className="mx-auto flex h-full w-full max-w-4xl items-center px-6 py-6 text-white">
      <div className="w-full rounded-2xl  p-6">
        <Typography content={data?.title ?? { text: "BudgetAdjustment", variant: "h3" }} />
        <Typography
          content={
            data?.text ?? {
              text: "Template base para ajuste de presupuesto.",
              variant: "bodySm",
            }
          }
          className="mt-3"
        />

        <div className="mt-4">
          <Calculator data={data?.calculator ?? data} heroApi={heroApi} view={view} />
        </div>

        <div className="mt-5">
          <Button
            variant="primary"
            onClick={() =>
              heroApi?.setInteractiveState?.(viewId, {
                completed: true,
                type: "budgetAdjustment",
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
