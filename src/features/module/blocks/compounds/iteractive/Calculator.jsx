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
      align: "left",
    }
  );
}

function getItemRemoveLabel(item) {
  const title =
    item?.name ?? item?.title?.text ?? item?.label?.text ?? item?.label;

  return `Quitar ${title || "producto"}`;
}

function SummaryRow({ label, value }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)] items-center gap-3">
      <div className="min-w-0">
        <Typography
          content={{
            text: label,
            variant: "label",
            align: "left",
          }}
          variant="label"
          className="text-left"
        />
      </div>

      <div className="flex min-w-[5.5rem] justify-end whitespace-nowrap [&_*]:whitespace-nowrap">
        <Typography
          content={{
            text: formatMoney(value),
            variant: "label",
            align: "right",
          }}
          variant="label"
          className="text-right whitespace-nowrap"
        />
      </div>
    </div>
  );
}

export default function Calculator({
  data,
  items = [],
  initialBalance = 0,
  total = 0,
  balance = 0,
  errorMessage = null,
  onSubmit,
  onRemoveItem,
  disabled = false,
}) {
  const submitLabel = data?.submitLabel ?? "Pagar";
  const emptyLabel = data?.emptyLabel ?? "Aún no has seleccionado productos.";

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      {data?.title ? (
        <div className="shrink-0">
          <Typography
            content={data.title}
            variant={data?.title?.variant ?? "label"}
            align={data?.title?.align ?? "center"}
          />
        </div>
      ) : null}

      <div className="min-h-[5rem] flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/10 p-2.5">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[5rem] items-center justify-center">
            <Typography
              content={{
                text: emptyLabel,
                variant: "bodySm",
                align: "center",
              }}
            />
          </div>
        ) : (
          <div className="grid h-full min-h-0 auto-rows-min grid-cols-2 gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item?.id}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
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
                    onClick={() => onRemoveItem(item)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 rounded-xl border border-white/10 bg-black/10 p-3">
        <SummaryRow label="Saldo inicial" value={initialBalance} />
        <SummaryRow label="Suma total" value={total} />
        <SummaryRow label="Saldo restante" value={balance} />
      </div>

      {errorMessage ? (
        <div className="shrink-0 rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2">
          <Typography
            content={{
              text: errorMessage,
              variant: "helper",
              tone: "danger",
              align: "center",
            }}
          />
        </div>
      ) : null}

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
