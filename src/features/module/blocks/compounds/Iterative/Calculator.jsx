import { X } from "lucide-react";
import Typography from "../../base/Typography";
import Button from "../../base/Action/Button";

function formatMoney(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function getItemTitle(item) {
  return item?.title ?? item?.label ?? { text: item?.name, variant: "bodySm" };
}

function getItemPrice(item) {
  return (
    item?.text ?? {
      text: formatMoney(item?.price ?? item?.value),
      variant: "label",
    }
  );
}

function getItemRemoveLabel(item) {
  const title =
    item?.name ?? item?.title?.text ?? item?.label?.text ?? item?.label;
  return `Quitar ${title || "producto"}`;
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
  onRemoveItem,
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

      <div className="min-h-0 flex-1 rounded-xl border border-white/12 bg-black/10 p-2.5">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[72px] items-center justify-center">
            <Typography
              content={{ text: emptyLabel, variant: "bodySm", align: "center" }}
            />
          </div>
        ) : (
          <div className="grid h-full auto-rows-min grid-cols-2 gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item?.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-white/10 px-3 py-2"
              >
                <div className="min-w-0">
                  <Typography
                    content={getItemTitle(item)}
                    variant="bodySm"
                    className="text-left"
                  />
                  <Typography
                    content={getItemPrice(item)}
                    variant="label"
                    className="text-left"
                  />
                </div>

                {onRemoveItem ? (
                  <button
                    type="button"
                    aria-label={getItemRemoveLabel(item)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    onClick={() => onRemoveItem(item)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/12 bg-black/10 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <Typography content={{ text: "Suma total", variant: "label" }} />
          <Typography
            content={{ text: formatMoney(total), variant: "label" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Typography content={{ text: "Saldo", variant: "label" }} />
          <Typography
            content={{ text: formatMoney(balance), variant: "label" }}
          />
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
