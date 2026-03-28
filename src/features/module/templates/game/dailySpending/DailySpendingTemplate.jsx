import { useMemo, useState } from "react";
import Typography from "@/features/module/blocks/base/Typography";
import Image from "@/features/module/blocks/base/Media/Image";
import Button from "@/features/module/blocks/base/Action/Button";
import ChooseOne from "@/features/module/blocks/compounds/Iterative/ChooseOne";
import CollageCard from "@/features/module/blocks/compounds/grouper/CollageCard";
import Calculator from "@/features/module/blocks/compounds/Iterative/Calculator";

const VARIANT_BY_TEMPLATE = {
  decisionDailySpending: "decision",
  shopDailySpending: "shop",
  eventDailySpending: "event",
  assessmentDailySpending: "assessment",
};

const ENGINE_TO_VARIANT = {
  commuteDecision: "decision",
  kioskCheckout: "shop",
  recycleDecision: "event",
  summary: "assessment",
};

/**
 * Busca un compuesto por nombre dentro de la vista.
 */
function findCompound(view, targetType) {
  const compounds = Array.isArray(view?.elements?.compound) ? view.elements.compound : [];
  return compounds.find((item) => (item?.component ?? item?.type) === targetType) ?? null;
}

/**
 * Mantiene compatibilidad con el formato legacy mientras migramos modulo 1.
 */
function getLegacyDailyElement(view, data) {
  if (Array.isArray(view?.elements?.compound)) {
    const fromDoc = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "dailySpending",
    );
    if (fromDoc) return fromDoc;
  }

  return data?.dailySpending ?? null;
}

/**
 * Formatea dinero de forma uniforme en el minijuego.
 */
function formatMoney(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

/**
 * Normaliza un nodo tipografico simple sin anidar objetos dentro de `text`.
 */
function normalizeTextNode(value, fallbackVariant = "label") {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    return { text: String(value), variant: fallbackVariant, align: "center" };
  }
  return value;
}

/**
 * Resuelve la variante usando variant, engineVariant o template.
 */
function resolveVariant(view, variant, legacyElement) {
  if (variant) return variant;
  const fromEngine = ENGINE_TO_VARIANT[legacyElement?.engineVariant];
  if (fromEngine) return fromEngine;
  return VARIANT_BY_TEMPLATE[view?.template] ?? "decision";
}

/**
 * Normaliza una opcion visual de ChooseOne.
 */
function normalizeChoiceItem(option, index) {
  const amountValue =
    option?.detail ??
    (option?.cost !== undefined
      ? `- ${formatMoney(option.cost)}`
      : option?.reward !== undefined
        ? `+ ${formatMoney(option.reward)}`
        : "");

  return {
    id: option?.id ?? `choice-${index + 1}`,
    title: normalizeTextNode(option?.title ?? option?.label, "label"),
    detail: typeof amountValue === "string" ? { text: amountValue, variant: "label" } : amountValue,
    media: option?.media ?? option?.image ?? { src: option?.src, alt: option?.alt ?? "Opcion" },
    feedback:
      option?.feedback ??
      (option?.reveal?.text
        ? { text: option.reveal.text, variant: "helper", align: "center" }
        : null),
    score: Number(option?.score ?? 100),
    nextBalance: option?.nextBalance,
    cost: Number(option?.cost ?? 0),
    reward: Number(option?.reward ?? 0),
    correct: option?.correct,
  };
}

/**
 * Adapta la vista a un conjunto de opciones para ChooseOne.
 */
function getChoiceItems(view, legacyElement) {
  const chooseOne = findCompound(view, "chooseOne");
  if (Array.isArray(chooseOne?.items) && chooseOne.items.length > 0) {
    return chooseOne.items.map(normalizeChoiceItem);
  }

  return Array.isArray(legacyElement?.options)
    ? legacyElement.options.map(normalizeChoiceItem)
    : [];
}

/**
 * Adapta productos para la variante shop.
 */
function getShopItems(view, legacyElement) {
  const collageCard = findCompound(view, "collageCard");
  if (Array.isArray(collageCard?.items) && collageCard.items.length > 0) {
    return collageCard.items.map((item, index) => ({
      id: item?.id ?? `product-${index + 1}`,
      title: item?.title ?? item?.label,
      text: item?.text,
      media: item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt },
      price: Number(item?.price ?? item?.value ?? 0),
    }));
  }

  return Array.isArray(legacyElement?.products)
    ? legacyElement.products.map((item, index) => ({
      id: item?.id ?? `product-${index + 1}`,
      title: { text: item?.name, variant: "label", align: "center" },
      text: { text: formatMoney(item?.price), variant: "label", align: "center" },
      media: item?.media ?? item?.image ?? { src: item?.src, alt: item?.alt ?? item?.name },
      price: Number(item?.price ?? 0),
    }))
    : [];
}

/**
 * Emite el estado interactivo final al flujo principal.
 */
function emitDailyResult(heroApi, view, payload) {
  heroApi?.setInteractiveState?.(view?.id ?? view?.viewId, {
    completed: true,
    type: "dailySpending",
    ...payload,
  });
}

/**
 * Cabecera reutilizable del template: titulo a la izquierda y saldo a la derecha.
 */
function DailyHeader({ title, amount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
        {title ? (
          <Typography
            content={title}
            variant={title?.variant ?? "h1"}
          />
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 md:min-w-[180px]">
        <Typography
          content={{
            text: `${amount?.label ?? "Saldo"}: ${formatMoney(amount?.value ?? 0)}`,
            variant: "label",
            align: "center",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Boton principal del template:
 * - Replica la accion verde definida en las variantes del documento.
 * - El avance queda dentro del template en vistas procedimentales.
 */
function DailyAdvanceButton({ label = "Continuar", onClick, disabled = false }) {
  return (
    <div className="flex justify-center">
      <Button
        variant="primary"
        label={label}
        onClick={onClick}
        disabled={disabled}
        className="min-w-[180px] border-yellow-300 bg-emerald-500 text-white hover:bg-emerald-600"
      />
    </div>
  );
}

/**
 * Template DailySpending alineado al documento de variantes.
 */
export default function DailySpendingTemplate({ view, data, heroApi, variant }) {
  const legacyElement = getLegacyDailyElement(view, data);
  const resolvedVariant = resolveVariant(view, variant, legacyElement);

  const title = view?.slots?.title ?? data?.title;
  const amount = view?.slots?.amount ?? data?.amount ?? { label: "Saldo", value: legacyElement?.balance ?? 0 };
  const assessment = view?.slots?.assessment ?? data?.assessment;
  const situation = view?.slots?.situation ?? data?.situation ?? assessment;
  const feedback = view?.slots?.feedback ?? data?.feedback;
  const media = view?.slots?.media ?? data?.media;

  const choiceItems = getChoiceItems(view, legacyElement);
  const shopItems = getShopItems(view, legacyElement);
  const calculatorData = findCompound(view, "calculator") ?? data?.calculator ?? {};

  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const currentBalance = Number(legacyElement?.balance ?? amount?.value ?? 0);
  const resolvedFeedback = selectedDecision?.feedback ?? feedback;
  const shouldReserveFeedback =
    resolvedVariant !== "shop" &&
    choiceItems.some((item) => Boolean(item?.feedback));
  const canAdvanceDecision = Boolean(selectedDecision);

  const selectedProducts = useMemo(
    () => shopItems.filter((item) => selectedProductIds.includes(item.id)),
    [selectedProductIds, shopItems],
  );

  const totalProducts = selectedProducts.reduce((sum, item) => sum + Number(item?.price ?? 0), 0);
  const nextBalance = currentBalance - totalProducts;

  /**
   * Registra una decision simple tomada por el usuario.
   */
  function handleDecisionSelection(item) {
    setSelectedDecision(item);

    const resolvedBalance =
      item?.nextBalance ??
      (item?.cost !== undefined
        ? currentBalance - Number(item.cost)
        : currentBalance + Number(item?.reward ?? 0));

    emitDailyResult(heroApi, view, {
      selectedOptionId: item?.id,
      balance: resolvedBalance,
      score: Number(item?.score ?? 100),
    });
  }

  /**
   * Continua a la siguiente pantalla una vez resuelta la decision.
   */
  function continueDecisionFlow() {
    if (!selectedDecision) return;
    heroApi?.next?.();
  }

  /**
   * Alterna productos dentro de la compra del kiosko.
   */
  function toggleProduct(item) {
    if (!item?.id) return;

    setSelectedProductIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
    );
  }

  /**
   * Confirma la compra y reporta el total gastado.
   */
  function confirmShopSelection() {
    emitDailyResult(heroApi, view, {
      selectedProductIds,
      total: totalProducts,
      balance: nextBalance,
      score: nextBalance >= 0 ? 100 : 60,
    });

    // En la practica procedimental, el boton verde del kiosko tambien avanza.
    heroApi?.next?.();
  }

  if (resolvedVariant === "shop") {
    return (
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 overflow-hidden px-4 py-3 text-white md:px-5 md:py-4">
        <DailyHeader title={title} amount={amount} />

        {situation ? (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <Typography content={situation} variant={situation?.variant ?? "body"} />
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.55fr_0.9fr]">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <CollageCard
              items={shopItems}
              selectable
              selectedIds={selectedProductIds}
              onSelect={toggleProduct}
              columns={3}
              className="gap-2.5"
              style={{
                // La grilla del kiosko necesita cards mas compactas para no empujar el footer.
                "--card-media-max-height": "min(118px, calc(var(--hero-height, 100vh) * 0.14))",
              }}
            />
          </div>

          <Calculator
            data={calculatorData}
            items={selectedProducts}
            total={totalProducts}
            balance={nextBalance}
            onSubmit={confirmShopSelection}
            disabled={selectedProducts.length === 0}
          />
        </div>

        {feedback ? (
          <div className="flex min-h-[56px] items-center rounded-2xl border border-white/15 bg-white/10 p-3">
            <Typography content={feedback} variant={feedback?.variant ?? "helper"} />
          </div>
        ) : shouldReserveFeedback ? (
          <div className="min-h-[56px]" aria-hidden="true" />
        ) : null}
      </section>
    );
  }

  const decisionContent = (
    <ChooseOne
      data={{
        instruction: situation,
        items: choiceItems,
      }}
      onSelection={handleDecisionSelection}
    />
  );

  return (
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-5 overflow-hidden px-6 py-6 text-white">
      <DailyHeader title={title} amount={amount} />

      <div className={resolvedVariant === "event" || media ? "grid gap-5 lg:grid-cols-[1.2fr_0.8fr]" : "grid gap-5"}>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
          {decisionContent}
        </div>

        {media ? (
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <Image
              src={media?.src}
              alt={media?.alt ?? "Situacion"}
              // Esta media lateral se controla por la altura del hero
              // para no empujar el resto de la vista fuera del canvas.
              className="w-full"
              imgClassName="max-h-[min(260px,calc(var(--hero-height,100vh)*0.34))] max-w-full object-contain"
            />
          </div>
        ) : null}
      </div>

      {resolvedFeedback ? (
        <div className="flex min-h-[72px] items-center rounded-2xl border border-white/15 bg-white/10 p-4">
          <Typography
            content={resolvedFeedback}
            variant={resolvedFeedback?.variant ?? "helper"}
          />
        </div>
      ) : shouldReserveFeedback ? (
        <div className="min-h-[72px]" aria-hidden="true" />
      ) : null}

      <DailyAdvanceButton
        label="Continuar"
        onClick={continueDecisionFlow}
        disabled={!canAdvanceDecision}
      />
    </section>
  );
}
