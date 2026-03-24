import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Typografia from "../Typografia";
import Image from "../Image";

function formatCurrency(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function resolveBalanceSource(balanceFrom, heroApi) {
  if (!balanceFrom) return null;

  const candidates = Array.isArray(balanceFrom) ? balanceFrom : [balanceFrom];

  for (const candidate of candidates) {
    const viewId =
      typeof candidate === "string" ? candidate : candidate?.viewId;
    const state = heroApi?.getInteractiveState?.(viewId);
    const balance = Number(state?.balance);

    // Usa el primer saldo previo valido para continuar la historia.
    if (Number.isFinite(balance)) return balance;
  }

  return null;
}

function FrameTitle({ title, balance }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/20 px-4 py-3">
      <Typografia
        content={title}
        variant={title?.variant ?? "h5"}
        component={title?.component ?? "h3"}
      />

      <div className="min-w-[132px] rounded-md border-4 border-emerald-500 bg-white/10 px-3 py-2 text-center text-xl font-black text-white">
        {formatCurrency(balance)}
      </div>
    </div>
  );
}

function Surface({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/15 bg-white/10 px-4 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function OptionCard({ option, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-white/10 px-4 py-8 text-center transition",
        isSelected
          ? "border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.35)]"
          : "border-white/20 hover:bg-white/15",
      )}
    >
      <Typografia
        content={{ text: option.title, variant: "h6", align: "center" }}
      />

      <Typografia
        content={{
          text: option.detail,
          variant: "subtitle1",
          align: "center",
          color:
            option.reward > 0
              ? "success"
              : option.cost > 0
                ? "error"
                : "success",
        }}
      />
    </button>
  );
}

function ProductToggle({ product, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-md border px-3 py-2 text-left transition",
        selected
          ? "border-emerald-400 bg-emerald-500/15"
          : "border-white/15 bg-white/5 hover:bg-white/10",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{product.name}</span>
        <span className="text-sm font-bold text-white/85">
          {formatCurrency(product.price)}
        </span>
      </div>
    </button>
  );
}

function SummaryCard({ title, text }) {
  return (
    <Surface className="mx-auto max-w-[560px] text-center">
      <Typografia content={title} variant={title?.variant ?? "h4"} />
      <Typografia
        content={text}
        variant={text?.variant ?? "body1"}
        className="mt-3"
      />
    </Surface>
  );
}

/**
 * Reutiliza un solo canvas para escenas procedimentales con saldo encadenado.
 * Cada variante cambia la interaccion, pero mantiene la misma lectura visual.
 */
export default function SchoolDayBudget({
  variant = "commuteDecision",
  data,
  heroApi,
  view,
  onComplete,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [didPay, setDidPay] = useState(false);

  // Reinicia la interaccion cuando cambia la vista actual.
  useEffect(() => {
    setSelectedOptionId(null);
    setSelectedProductIds([]);
    setDidPay(false);
  }, [view?.id]);

  const options = data?.options ?? [];
  const products = data?.products ?? [];
  const inheritedBalance = resolveBalanceSource(data?.balanceFrom, heroApi);
  const baseBalance = Number(
    inheritedBalance ?? data?.balance ?? 0,
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedOptionId) ?? null,
    [options, selectedOptionId],
  );

  const selectedProducts = useMemo(
    () =>
      products.filter((product) => selectedProductIds.includes(product.id)),
    [products, selectedProductIds],
  );

  const selectedProductsTotal = useMemo(
    () =>
      selectedProducts.reduce(
        (sum, product) => sum + Number(product.price ?? 0),
        0,
      ),
    [selectedProducts],
  );

  // Calcula el saldo mostrado segun el resultado de la escena actual.
  const displayedBalance = useMemo(() => {
    if (variant === "kioskCheckout") {
      return baseBalance - (didPay ? selectedProductsTotal : 0);
    }

    if (selectedOption) {
      if (selectedOption.nextBalance !== undefined) {
        return Number(selectedOption.nextBalance);
      }

      if (selectedOption.reward) {
        return baseBalance + Number(selectedOption.reward);
      }

      if (selectedOption.cost) {
        return baseBalance - Number(selectedOption.cost);
      }
    }

    return baseBalance;
  }, [baseBalance, didPay, selectedOption, selectedProductsTotal, variant]);

  function emitResult(result) {
    // Expone el resultado al player para score, ramas y saldo arrastrado.
    heroApi?.setInteractiveState?.(view?.id, {
      ...result,
      type: "schoolDayBudget",
    });
    onComplete?.(result);
  }

  useEffect(() => {
    if (!selectedOption) return;
    if (!["commuteDecision", "recycleDecision"].includes(variant)) return;

    emitResult({
      completed: true,
      selectedOptionId,
      balance: displayedBalance,
      score: Number(selectedOption.score ?? 100),
    });
  }, [displayedBalance, selectedOption, selectedOptionId, variant]);

  useEffect(() => {
    if (variant !== "kioskCheckout") return;
    if (!didPay) return;

    emitResult({
      completed: true,
      selectedProductIds,
      total: selectedProductsTotal,
      balance: displayedBalance,
      score: 100,
    });
  }, [didPay, displayedBalance, selectedProductIds, selectedProductsTotal, variant]);

  function toggleProduct(productId) {
    // Alterna productos para armar la compra del recreo.
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  if (variant === "summary") {
    const summaryText =
      data?.summaryText?.text ??
      `Completaste la prueba. Te quedaron ${formatCurrency(displayedBalance)}, esto equivale a ${Math.round(displayedBalance * 100)} INTIS para ti.`;

    return (
      <section className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-6 px-6 py-6 text-white">
        <SummaryCard
          title={data?.title}
          text={{ ...data?.summaryText, text: summaryText }}
        />

        <div className="mx-auto w-full max-w-[320px]">
          <Image
            src={data?.image?.src}
            alt={data?.image?.alt ?? "Resumen final"}
            className="aspect-square"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 px-6 py-4 text-white">
      <FrameTitle title={data?.title} balance={displayedBalance} />

      <Surface>
        <Typografia
          content={data?.instruction}
          variant={data?.instruction?.variant ?? "body1"}
          align={data?.instruction?.align ?? "center"}
        />
      </Surface>

      {variant === "kioskCheckout" ? (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
          <Surface className="flex min-h-[260px] items-center justify-center">
            <Image
              src={data?.sceneImage?.src}
              alt={data?.sceneImage?.alt ?? "Escena del kiosko"}
              className="aspect-[4/3] w-full"
            />
          </Surface>

          <Surface className="space-y-3">
            <Typografia
              content={data?.summaryTitle}
              variant={data?.summaryTitle?.variant ?? "subtitle1"}
            />

            <div className="space-y-2">
              {products.map((product) => (
                <ProductToggle
                  key={product.id}
                  product={product}
                  selected={selectedProductIds.includes(product.id)}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))}
            </div>

            <div className="space-y-2 rounded-lg border border-white/10 bg-black/10 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/75">Seleccionados</span>
                <span className="font-bold text-white">
                  {selectedProducts.length
                    ? selectedProducts.map((item) => item.name).join(", ")
                    : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/75">Total</span>
                <span className="font-black text-amber-300">
                  {formatCurrency(selectedProductsTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDidPay(true)}
              disabled={!selectedProductIds.length}
              className="w-full rounded-md border border-amber-300 bg-amber-400 px-4 py-2 text-sm font-black text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              PAGAR
            </button>
          </Surface>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                onClick={() => setSelectedOptionId(option.id)}
              />
            ))}
          </div>

          {selectedOption?.feedback ? (
            <Surface className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
              <Typografia
                content={selectedOption.feedback}
                variant={selectedOption.feedback?.variant ?? "body1"}
                align={selectedOption.feedback?.align ?? "center"}
              />

              <Image
                src={selectedOption.image?.src}
                alt={selectedOption.image?.alt ?? "Resultado de la situacion"}
                className="aspect-[4/3]"
              />
            </Surface>
          ) : null}
        </>
      )}
    </section>
  );
}
