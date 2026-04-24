import { useEffect, useMemo, useState } from "react";
import Typography from "@/features/module/blocks/base/Typography";
import Image from "@/features/module/blocks/base/Media/Image";
import Button from "@/features/module/blocks/base/Action/Button";
import Card from "@/features/module/blocks/compounds/container/Card";
import ChooseOne from "@/features/module/blocks/compounds/Iterative/ChooseOne";
import CollageCard from "@/features/module/blocks/compounds/grouper/CollageCard";
import Calculator from "@/features/module/blocks/compounds/Iterative/Calculator";
import { cn } from "@/shared/libs/utils";

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
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
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
 * Toma el saldo inicial de la mision desde la primera vista que lo declare.
 * Asi evitamos depender de montos fijos repetidos en cada situacion.
 */
function getInitialMissionBalance(heroApi, fallbackBalance) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];

  for (const item of missionViews) {
    const amountValue = Number(item?.slots?.amount?.value);
    if (Number.isFinite(amountValue)) {
      return amountValue;
    }
  }

  return fallbackBalance;
}

/**
 * Busca el ultimo saldo interactivo valido antes de la vista actual.
 * Esto permite que las ramas del minijuego hereden el dinero restante
 * en vez de depender del valor fijo que vino en el JSON.
 */
function getInheritedBalance(heroApi, viewId, fallbackBalance) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];
  const currentIndex = missionViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === viewId,
  );

  if (currentIndex <= 0) return fallbackBalance;

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const candidateViewId =
      missionViews[index]?.id ?? missionViews[index]?.viewId;
    if (!candidateViewId) continue;

    const candidateState = heroApi?.getInteractiveState?.(candidateViewId);
    const candidateBalance = Number(candidateState?.balance);

    if (Number.isFinite(candidateBalance)) {
      return candidateBalance;
    }
  }

  return fallbackBalance;
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
    detail:
      typeof amountValue === "string"
        ? { text: amountValue, variant: "label" }
        : amountValue,
    media: option?.media ??
      option?.image ?? { src: option?.src, alt: option?.alt ?? "Opcion" },
    feedback:
      option?.feedback ??
      (option?.reveal?.text
        ? { text: option.reveal.text, variant: "helper", align: "center" }
        : null),
    score: Number(option?.score ?? 100),
    nextBalance: option?.nextBalance,
    // Conservamos `undefined` para distinguir entre gastar y recuperar dinero.
    cost: option?.cost !== undefined ? Number(option.cost) : undefined,
    reward: option?.reward !== undefined ? Number(option.reward) : undefined,
    correct: option?.correct,
  };
}

/**
 * Resuelve la siguiente vista del flujo shop respetando la regla del documento:
 * solo aparece la situacion extra si se compro gaseosa o agua.
 */
function resolveShopNextViewId(heroApi, currentViewId, selectedIds) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];
  const currentIndex = missionViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === currentViewId,
  );

  if (currentIndex < 0) return null;

  const hasPlasticBottle = selectedIds.some(
    (item) => item === "gaseosa" || item === "agua",
  );

  for (let index = currentIndex + 1; index < missionViews.length; index += 1) {
    const candidate = missionViews[index];
    const candidateId = candidate?.id ?? candidate?.viewId;
    const branchRule = candidate?.availability?.dependsOn ?? candidate?.when;

    if (
      branchRule?.viewId === currentViewId &&
      branchRule?.stateKey === "selectedProductIds"
    ) {
      if (hasPlasticBottle) return candidateId;
      continue;
    }

    return candidateId;
  }

  return null;
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
        text: {
          text: formatMoney(item?.price),
          variant: "label",
          align: "center",
        },
        media: item?.media ??
          item?.image ?? { src: item?.src, alt: item?.alt ?? item?.name },
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
 * Espera un frame antes de navegar para que la siguiente vista ya pueda
 * leer el estado interactivo recien guardado.
 */
function navigateAfterStateCommit(navigate) {
  if (typeof window === "undefined") {
    navigate?.();
    return;
  }

  window.requestAnimationFrame(() => {
    navigate?.();
  });
}

/**
 * Cabecera reutilizable del template: titulo a la izquierda y saldo a la derecha.
 */
function DailyHeader({ title, subtitle, amount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
      <div className="rounded-2xl content-center p-3">
        <div className="flex flex-col gap-3">
          {title ? (
            <Typography
              content={{
                ...title,
                variant: title?.variant ?? "h3",
              }}
            />
          ) : null}

          {subtitle ? (
            <Typography
              content={{
                ...subtitle,
                variant: subtitle?.variant ?? "h3",
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="md:min-w-[190px]">
        <Card
          title={{
            text: amount?.label ?? "Saldo",
            variant: "label",
            align: "center",
          }}
          text={{
            text: formatMoney(amount?.value ?? 0),
            variant: "h2",
            align: "center",
          }}
          className="justify-center gap-1.5 px-4 py-3"
        />
      </div>
    </div>
  );
}

/**
 * Cabecera especifica para shop:
 * - Agrupa titulo + descripcion en una sola columna.
 * - Mantiene el saldo en la columna lateral.
 */
function DailyShopHeader({ title, situation, amount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
      <div className="rounded-2xl p-3">
        <div className="flex flex-col gap-3">
          {title ? (
            <Typography
              content={{
                ...title,
                variant: title?.variant ?? "h3",
              }}
            />
          ) : null}

          {situation ? (
            <Typography
              content={{
                ...situation,
                variant: situation?.variant ?? "h2",
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="md:min-w-[190px]">
        <Card
          title={{
            text: amount?.label ?? "Saldo",
            variant: "label",
            align: "center",
          }}
          text={{
            text: formatMoney(amount?.value ?? 0),
            variant: "h2",
            align: "center",
          }}
          className="justify-center gap-1.5 px-4 py-3"
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
function DailyAdvanceButton({
  label = "Continuar",
  onClick,
  disabled = false,
}) {
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
export default function DailySpendingTemplate({
  view,
  data,
  heroApi,
  variant,
}) {
  const legacyElement = getLegacyDailyElement(view, data);
  const resolvedVariant = resolveVariant(view, variant, legacyElement);
  const viewId = view?.id ?? view?.viewId;

  const title = view?.slots?.title ?? data?.title;
  const amount = view?.slots?.amount ??
    data?.amount ?? { label: "Saldo", value: legacyElement?.balance ?? 0 };
  const assessment = view?.slots?.assessment ?? data?.assessment;
  const situation = view?.slots?.situation ?? data?.situation ?? assessment;
  const feedback = view?.slots?.feedback ?? data?.feedback;
  const media = view?.slots?.media ?? data?.media;

  const choiceItems = getChoiceItems(view, legacyElement);
  const shopItems = getShopItems(view, legacyElement);
  const calculatorData =
    findCompound(view, "calculator") ?? data?.calculator ?? {};

  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const initialBalance = getInitialMissionBalance(
    heroApi,
    Number(legacyElement?.balance ?? amount?.value ?? 0),
  );
  const baseBalance = Number.isFinite(initialBalance) ? initialBalance : 0;
  const currentBalance = getInheritedBalance(heroApi, viewId, baseBalance);
  const resolvedFeedback = selectedDecision?.feedback ?? feedback;
  const shouldReserveFeedback =
    resolvedVariant !== "shop" &&
    choiceItems.some((item) => Boolean(item?.feedback));
  const canAdvanceDecision = Boolean(selectedDecision);

  const selectedProducts = useMemo(
    () => shopItems.filter((item) => selectedProductIds.includes(item.id)),
    [selectedProductIds, shopItems],
  );

  const totalProducts = selectedProducts.reduce(
    (sum, item) => sum + Number(item?.price ?? 0),
    0,
  );
  const nextBalance = currentBalance - totalProducts;
  const decisionBalance = selectedDecision
    ? (selectedDecision?.nextBalance ??
      (selectedDecision?.cost !== undefined
        ? currentBalance - Number(selectedDecision.cost)
        : currentBalance + Number(selectedDecision?.reward ?? 0)))
    : currentBalance;
  const displayedBalance =
    resolvedVariant === "shop" ? nextBalance : decisionBalance;
  const displayedAmount = {
    ...(amount ?? {}),
    value: displayedBalance,
  };

  useEffect(() => {
    // Cada situacion debe iniciar con su propio estado local limpio.
    // Si no lo hacemos, una decision previa puede contaminar la siguiente vista.
    setSelectedDecision(null);
    setSelectedProductIds([]);
  }, [viewId]);

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
    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  /**
   * Alterna productos dentro de la compra del kiosko.
   */
  function toggleProduct(item) {
    if (!item?.id) return;

    setSelectedProductIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  }

  /**
   * Quita un producto desde el resumen de compra.
   */
  function removeSelectedProduct(item) {
    if (!item?.id) return;

    setSelectedProductIds((prev) => prev.filter((id) => id !== item.id));
  }

  /**
   * Confirma la compra y reporta el total gastado.
   */
  function confirmShopSelection() {
    const resultPayload = {
      selectedProductIds,
      total: totalProducts,
      balance: nextBalance,
      score: nextBalance >= 0 ? 100 : 60,
    };

    emitDailyResult(heroApi, view, resultPayload);

    // La situacion extra solo aparece si se compro una botella plastica.
    const nextViewId = resolveShopNextViewId(
      heroApi,
      viewId,
      selectedProductIds,
    );

    if (heroApi?.isBeforePostGame) {
      navigateAfterStateCommit(() => {
        heroApi?.advanceCurrentView?.();
      });
      return;
    }

    if (nextViewId) {
      navigateAfterStateCommit(() => {
        heroApi?.goToViewId?.(nextViewId);
      });
      return;
    }

    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  if (resolvedVariant === "shop") {
    return (
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 overflow-hidden px-4 py-3 text-white md:px-5 md:py-4">
        <DailyShopHeader
          title={title}
          situation={situation}
          amount={displayedAmount}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.55fr_0.9fr]">
            <div className="min-h-0 overflow-hidden rounded-2xl p-2.5 md:p-3">
              <CollageCard
                items={shopItems}
                selectable
                selectedIds={selectedProductIds}
                onSelect={toggleProduct}
                columns={3}
                rows={2}
                className="h-full content-start gap-3"
                style={{
                  "--card-slot-height":
                    "min(300px, calc(var(--hero-height, 100vh) * 0.33))",
                  "--card-media-max-height":
                    "min(190px, calc(var(--hero-height, 100vh) * 0.21))",
                  "--card-content-reserve": "108px",
                }}
              />
            </div>

            <div className="min-h-0 overflow-hidden rounded-2xl p-2.5 md:p-3">
              <Calculator
                data={calculatorData}
                items={selectedProducts}
                total={totalProducts}
                balance={nextBalance}
                onSubmit={confirmShopSelection}
                onRemoveItem={removeSelectedProduct}
                disabled={selectedProducts.length === 0}
              />
            </div>
          </div>

          <div className="shrink-0">
            {feedback ? (
              <div className="flex min-h-[56px] items-center rounded-2xl border border-white/15 p-3">
                <Typography
                  content={feedback}
                  variant={feedback?.variant ?? "helper"}
                />
              </div>
            ) : shouldReserveFeedback ? (
              <div className="min-h-[56px]" aria-hidden="true" />
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const decisionContent = (
    <ChooseOne
      data={{
        instruction: null,
        items: choiceItems,
      }}
      onSelection={handleDecisionSelection}
    />
  );
  const hasDecisionMedia = Boolean(media);
  const shouldUseCompactDecisionMedia =
    hasDecisionMedia && choiceItems.length <= 2;
  const decisionGridClass = shouldUseCompactDecisionMedia
    ? "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_5.5rem] gap-2 md:grid-cols-[1.2fr_0.8fr] md:gap-3"
    : hasDecisionMedia
      ? "grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]"
      : "grid min-h-0 flex-1 gap-3";

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 overflow-hidden px-4 py-2 text-white md:gap-3 md:px-5 md:py-4">
      <DailyHeader
        title={title}
        subtitle={situation}
        amount={displayedAmount}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className={decisionGridClass}>
          <div
            className={cn(
              "min-h-0 overflow-hidden rounded-2xl px-3 py-1",
              hasDecisionMedia
                ? "[--card-slot-height:min(334px,calc(var(--hero-height,100vh)*0.38))] [--card-media-max-height:min(250px,calc(var(--hero-height,100vh)*0.28))]"
                : "[--card-slot-height:min(430px,calc(var(--hero-height,100vh)*0.48))] [--card-media-max-height:min(350px,calc(var(--hero-height,100vh)*0.38))]",
            )}
          >
            {decisionContent}
          </div>

          {hasDecisionMedia ? (
            <div
              className={cn(
                "flex min-h-0 items-center justify-center overflow-hidden rounded-2xl",
                shouldUseCompactDecisionMedia
                  ? "p-1.5 md:p-3"
                  : "max-h-[260px] p-2 md:max-h-none md:p-3",
              )}
            >
              <Image
                src={media?.src}
                alt={media?.alt ?? "Situacion"}
                mode="slot"
                // La imagen lateral debe ocupar su slot sin salirse,
                // priorizando verse completa antes que recortarse.
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  shouldUseCompactDecisionMedia
                    ? ""
                    : "max-h-[240px] md:max-h-full",
                )}
                imgClassName="h-auto w-auto max-h-full max-w-full object-contain"
                zoomable={media?.zoomable !== false}
              />
            </div>
          ) : null}
        </div>

        <div className="shrink-0">
          {resolvedFeedback ? (
            <div className="flex min-h-[56px] items-center rounded-2xl border border-white/15 p-3">
              <Typography
                content={resolvedFeedback}
                variant={resolvedFeedback?.variant ?? "helper"}
              />
            </div>
          ) : shouldReserveFeedback ? (
            <div className="hidden min-h-[56px] md:block" aria-hidden="true" />
          ) : null}
        </div>

        <div className="shrink-0">
          <DailyAdvanceButton
            label={heroApi?.advanceLabel ?? "Continuar"}
            onClick={continueDecisionFlow}
            disabled={!canAdvanceDecision}
          />
        </div>
      </div>
    </section>
  );
}
