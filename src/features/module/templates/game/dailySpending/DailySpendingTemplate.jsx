import { useEffect, useMemo, useState } from "react";
import * as Blocks from "@/features/module/blocks";
import HeroGrid from "../../_core/HeroGrid";
import HeroArea from "../../_core/HeroArea";
import { renderSlot } from "../../_core/SlotRenderer";
import { normalizeLayout } from "../../_core/layouts.helpers";
import {
  emitDailyResult,
  getDailySpendingRuntime,
  getDailySpendingTemplateRuntime,
  navigateAfterStateCommit,
  resolveShopNextViewId,
} from "./dailySpending.config";

export default function DailySpendingTemplate({
  view,
  data,
  heroApi,
  variant,
}) {
  // Normaliza la vista actual a un runtime común para que el template
  // no dependa del tipo exacto de pantalla (decisión, tienda o evento).
  const baseRuntime = getDailySpendingRuntime({
    view,
    data,
    heroApi,
    variant,
  });
  const {
    templateVariant,
    viewId,
    feedback,
    choiceItems,
    shopItems,
    currentBalance,
  } = baseRuntime;

  // Decisión tomada en pantallas tipo "elige una opción".
  const [selectedDecision, setSelectedDecision] = useState(null);
  // Productos agregados al carrito en la pantalla de kiosko/tienda.
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Si una opción trae feedback propio, tiene prioridad sobre el feedback
  // general configurado en la vista.
  const resolvedFeedback = selectedDecision?.feedback ?? feedback;
  // Reserva espacio para feedback en ChooseOne y así evita saltos de layout
  // al seleccionar la primera opción.
  const shouldReserveFeedback =
    templateVariant !== "shop" &&
    choiceItems.some((item) => Boolean(item?.feedback));
  const canAdvanceDecision = Boolean(selectedDecision);

  // Deriva los productos seleccionados a partir de sus ids para no duplicar
  // estado y mantener una sola fuente de verdad.
  const selectedProducts = useMemo(
    () => shopItems.filter((item) => selectedProductIds.includes(item.id)),
    [selectedProductIds, shopItems],
  );

  // Total de compra del kiosko.
  const totalProducts = selectedProducts.reduce(
    (sum, item) => sum + Number(item?.price ?? 0),
    0,
  );
  // Saldo resultante si se confirma la compra actual.
  const nextBalance = currentBalance - totalProducts;
  // Saldo proyectado al elegir una opción de decisión.
  const decisionBalance = selectedDecision
    ? (selectedDecision?.nextBalance ??
      (selectedDecision?.cost !== undefined
        ? currentBalance - Number(selectedDecision.cost)
        : currentBalance + Number(selectedDecision?.reward ?? 0)))
    : currentBalance;
  // Monto que se muestra en la esquina superior derecha según el tipo
  // de vista activa.
  const displayedBalance =
    templateVariant === "shop" ? nextBalance : decisionBalance;

  // Cada cambio de vista reinicia la interacción local del template.
  useEffect(() => {
    setSelectedDecision(null);
    setSelectedProductIds([]);
  }, [viewId]);

  // Guarda la opción elegida y persiste inmediatamente el resultado parcial
  // para que el saldo y la progresión queden disponibles al avanzar.
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

  // Avanza a la siguiente vista después de que React/heroApi hayan asentado
  // el estado interactivo actual.
  function continueDecisionFlow() {
    if (!selectedDecision) return;
    navigateAfterStateCommit(() => {
      heroApi?.advanceCurrentView?.();
    });
  }

  // Agrega o quita productos del carrito. Se usa en la vista de tienda.
  function toggleProduct(item) {
    if (!item?.id) return;

    setSelectedProductIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  }

  // Permite quitar productos desde el resumen lateral del carrito.
  function removeSelectedProduct(item) {
    if (!item?.id) return;
    setSelectedProductIds((prev) => prev.filter((id) => id !== item.id));
  }

  // Confirma la compra, guarda el resultado y resuelve si la navegación sigue
  // linealmente o si debe saltar a una vista condicional.
  function confirmShopSelection() {
    const resultPayload = {
      selectedProductIds,
      total: totalProducts,
      balance: nextBalance,
      score: nextBalance >= 0 ? 100 : 60,
    };

    emitDailyResult(heroApi, view, resultPayload);

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

  // Une runtime, estado interactivo y handlers en el mismo shape que consumen
  // los slots declarados en el config.
  const runtime = getDailySpendingTemplateRuntime({
    runtime: baseRuntime,
    interaction: {
      selectedDecision,
      selectedProductIds,
      selectedProducts,
      resolvedFeedback,
      shouldReserveFeedback,
      canAdvanceDecision,
      totalProducts,
      nextBalance,
      displayedBalance,
    },
    handlers: {
      onDecisionSelection: handleDecisionSelection,
      onContinueDecisionFlow: continueDecisionFlow,
      onToggleProduct: toggleProduct,
      onRemoveSelectedProduct: removeSelectedProduct,
      onConfirmShopSelection: confirmShopSelection,
    },
    heroApi,
  });

  const layout = normalizeLayout(runtime?.layoutDef);
  const slots = runtime?.slots ?? [];
  const payload = runtime?.payload ?? {};

  // Si el config no pudo construir layout o slots válidos, se muestra un
  // mensaje simple en vez de romper el árbol visual.
  if (!layout || !slots.length) {
    return (
      <div className="text-white/80">
        Config invalida para DailySpendingTemplate
      </div>
    );
  }

  return (
    <section className={runtime?.shellClassName}>
      {/* El template ya no define manualmente el layout: solo renderiza
          el HeroGrid y deja que el config decida áreas y contenido. */}
      <HeroGrid layout={layout} className={runtime?.gridClassName}>
        {slots.map((slot, index) => {
          const renderedSlot = renderSlot(slot, payload, Blocks, {
            heroApi,
            view,
          });

          if (!renderedSlot) return null;

          return (
            <HeroArea
              key={`${slot.area}-${index}`}
              area={slot.area}
              className={slot.className}
            >
              {renderedSlot}
            </HeroArea>
          );
        })}
      </HeroGrid>
    </section>
  );
}
