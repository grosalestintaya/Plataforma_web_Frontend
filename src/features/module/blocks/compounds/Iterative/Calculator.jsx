import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";

function formatMoney(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

/**
 * Calculator:
 * - Resume los items seleccionados y el total de gasto.
 * - Expone un boton principal para que el template cierre la accion.
 */
export default function Calculator({
  data,
  items = [],
  total = 0,
  balance = 0,
  onSubmit,
  disabled = false,
}) {
  const submitLabel = data?.submitLabel ?? "Pagar";
  const emptyLabel = data?.emptyLabel ?? "Aun no has seleccionado productos.";

  return (
    <section className="flex h-full min-h-0 flex-col gap-2.5 rounded-2xl p-2.5">
      {data?.title ? (
        <Typography
          content={data.title}
          variant={data?.title?.variant ?? "label"}
          align={data?.title?.align ?? "center"}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-white/12 bg-black/10 p-2.5">
        {items.length === 0 ? (
          <Typography
            content={{ text: emptyLabel, variant: "bodySm", align: "center" }}
          />
        ) : (
          items.map((item) => (
            <div
              key={item?.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-1.5"
            >
              <Typography
                content={item?.title ?? item?.label ?? { text: item?.name, variant: "bodySm" }}
                variant="bodySm"
              />
              <Typography
                content={item?.text ?? { text: formatMoney(item?.price ?? item?.value), variant: "label" }}
                variant="label"
              />
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-white/12 bg-black/10 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <Typography content={{ text: "Suma total", variant: "label" }} />
          <Typography content={{ text: formatMoney(total), variant: "label" }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Typography content={{ text: "Saldo", variant: "label" }} />
          <Typography content={{ text: formatMoney(balance), variant: "label" }} />
        </div>
      </div>

      <Button
        variant="primary"
        label={submitLabel}
        onClick={onSubmit}
        disabled={disabled}
        className="min-h-[44px] shrink-0"
      />
    </section>
  );
}
