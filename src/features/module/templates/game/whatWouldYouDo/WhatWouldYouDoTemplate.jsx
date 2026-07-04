import { useEffect, useState } from "react";
import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import Card from "@/features/module/blocks/compounds/container/Card";
import Shopping from "@/features/module/blocks/compounds/iteractive/Shopping";
import { cn } from "@/shared/libs/utils";

import {
  formatCurrency,
  useWhatWouldYouDoLogic,
} from "./useWhatWouldYouDoLogic";

function SidebarRow({ label, value, tone = "secondary", valueClassName = "" }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] items-start gap-3 rounded-2xl bg-white/6 px-4 py-3">
      <div className="min-w-0">
        <Typography
          content={{
            text: label,
            variant: "helper",
            align: "left",
            color: "secondary",
          }}
        />
      </div>
      <div className="min-w-0">
        <Typography
          content={{
            text: value,
            variant: "label",
            align: "right",
            color: tone,
          }}
          className={cn(
            "break-normal whitespace-normal [overflow-wrap:normal]",
            valueClassName,
          )}
        />
      </div>
    </div>
  );
}

function LoanOfferCard({ offer, isActive, isSelected, onOpen }) {
  const riskToneClass =
    offer.risk === "Alto"
      ? "bg-[#ff7c5b] text-white"
      : offer.risk === "Medio"
        ? "bg-[#ffb11f] text-[#6b3b00]"
        : "bg-[#2ac27d] text-white";

  return (
    <button
      type="button"
      onClick={() => onOpen?.(offer.id)}
      className={cn(
        "group relative flex min-h-[14rem] min-w-0 overflow-hidden rounded-[1.35rem] border text-left transition duration-150",
        isSelected || isActive
          ? "border-[#ffe08a] bg-[linear-gradient(180deg,rgba(255,215,95,0.24),rgba(40,91,176,0.2))] shadow-[0_16px_30px_rgba(10,39,98,0.26)]"
          : "border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/28 hover:bg-white/10",
      )}
    >
      <img
        src={offer.media?.src}
        alt={offer.media?.alt}
        className="absolute inset-0 h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,66,0.08),rgba(7,24,66,0.5)_48%,rgba(7,24,66,0.84))]" />

      <div className="relative z-10 flex w-full flex-col justify-between p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.04em]",
              riskToneClass,
            )}
          >
            Riesgo {offer.risk}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[0.9rem] bg-[rgba(9,29,78,0.78)] px-3 py-2 text-white shadow-[0_10px_20px_rgba(7,24,66,0.16)]">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.04em] text-white/72">
                Monto
              </div>
              <div className="text-[1rem] font-black">
                {formatCurrency(offer.amount)}
              </div>
            </div>
            <div className="rounded-[0.9rem] bg-[rgba(9,29,78,0.78)] px-3 py-2 text-white shadow-[0_10px_20px_rgba(7,24,66,0.16)]">
              <div className="text-[0.62rem] font-black uppercase tracking-[0.04em] text-white/72">
                Plazo
              </div>
              <div className="text-[1rem] font-black">
                {offer.termWeeks != null
                  ? `${offer.termWeeks} semanas`
                  : "No claro"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1rem] bg-[linear-gradient(180deg,rgba(33,44,76,0.30),rgba(33,44,76,0.58))] px-4 py-3 backdrop-blur-[1px]">
          <Typography
            content={{
              text: offer.name,
              variant: "h2",
              align: "left",
              color: "primary",
            }}
          />
          <Typography
            content={{
              text: offer.summary,
              variant: "bodySm",
              align: "left",
              color: "secondary",
            }}
            className="mt-1"
          />
        </div>
      </div>
    </button>
  );
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={cn(
        "rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-2",
        className,
      )}
    >
      {title?.text || subtitle?.text ? (
        <div className="mb-2">
          {title?.text ? <Typography content={title} /> : null}
          {subtitle?.text ? (
            <Typography content={subtitle} className="mt-2" />
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function InfoBanner({ message }) {
  if (!message?.text) return null;

  const toneClass =
    message.tone === "success"
      ? "border-emerald-300/45 bg-emerald-500/12"
      : "border-amber-300/35 bg-amber-500/10";

  return (
    <div className={cn("rounded-2xl border px-3.5 py-2", toneClass)}>
      {message.title ? (
        <Typography
          content={{
            text: message.title,
            variant: "h3",
            align: "left",
            color: "primary",
          }}
        />
      ) : null}
      <Typography
        content={{
          text: message.text,
          variant: "bodySm",
          align: "left",
          color: "secondary",
        }}
        className={message.title ? "mt-2" : ""}
      />
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12">
      <div
        className="grid bg-white/10"
        style={{
          gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
        }}
      >
        {headers.map((header) => (
          <div
            key={header}
            className="border-r border-white/8 px-3 py-3 last:border-r-0"
          >
            <Typography
              content={{ text: header, variant: "label", align: "left" }}
            />
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid border-t border-white/8 bg-black/10"
          style={{
            gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
          }}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`cell-${rowIndex}-${cellIndex}`}
              className="border-r border-white/8 px-3 py-3 last:border-r-0"
            >
              <Typography
                content={{
                  text: cell,
                  variant: "bodySm",
                  align: "left",
                  color: "secondary",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function WhatWouldYouDoTemplate(props) {
  const model = useWhatWouldYouDoLogic(props);
  const {
    content,
    gameState,
    materialsMessage,
    paymentMessage,
    offerFeedback,
    draftPayment,
    materialsTotal,
    fundingNeeded,
    materialShopItems,
    selectedMaterialItems,
    materialsCalculatorData,
    activeOffer,
    selectedOffer,
    selectedPaymentStrategy,
    selectedStrategyDetails,
    strategyExecutionConfig,
    loanTotalToRepay,
    loanTermWeeks,
    initialReserve,
    earlyPayoffWeek,
    currentWeekIndex,
    currentWeek,
    currentWeekSalesSummary,
    previousArrears,
    plannedWeekPayment,
    availableThisWeek,
    maxAllowedPayment,
    planSpread,
    planTotal,
    totalScore,
    debtPending,
    isApproved,
    finalAvailableMoney,
    netProfit,
    finalStateLabel,
    finalMessage,
    currentStepTitle,
    toggleMaterial,
    removeMaterial,
    handleReviewMaterials,
    goToStep,
    handleOpenOffer,
    handleChooseOffer,
    handleOpenPaymentStrategy,
    handleConfirmPaymentStrategy,
    updateDraftPayment,
    adjustDraftPayment,
    handleConfirmWeekPayment,
    handleApplySuggestedPayment,
    handleContinueAfterWeek,
    handleFinishMission,
  } = model;

  const copy = content.copy;
  const sidebarTitle =
    gameState.step === 3 && !gameState.paymentPlanConfirmed
      ? copy.step3.sidebarHeroTitle
      : currentStepTitle;
  const [displayWeekIndex, setDisplayWeekIndex] = useState(
    Math.max(0, gameState.currentWeek - 1),
  );

  useEffect(() => {
    if (gameState.step !== 3 || !gameState.paymentPlanConfirmed) return;
    setDisplayWeekIndex(Math.max(0, gameState.currentWeek - 1));
  }, [gameState.currentWeek, gameState.paymentPlanConfirmed, gameState.step]);

  const maxVisibleWeekIndex = Math.max(0, gameState.currentWeek - 1);
  const safeDisplayWeekIndex = Math.min(displayWeekIndex, maxVisibleWeekIndex);
  const displayWeek = content.weeks[safeDisplayWeekIndex] ?? currentWeek;
  const displayWeekState = gameState.weeklyStates[safeDisplayWeekIndex] ?? null;
  const displayWeekIsCurrent = safeDisplayWeekIndex === currentWeekIndex;
  const displayWeekSalesSummary = displayWeek.sales
    .map((sale) => `${sale.quantity} ${sale.product.toLowerCase()}`)
    .join(", ");
  const displayWeekPlannedPayment = Number(
    (gameState.paymentPlanConfirmed
      ? gameState.paymentPlan[safeDisplayWeekIndex]
      : 0) ?? 0,
  );
  const displayWeekIncome = Number(displayWeek?.income ?? 0);
  const accumulatedIncomeThroughDisplay = content.weeks
    .slice(0, safeDisplayWeekIndex + 1)
    .reduce((total, week) => total + Number(week?.income ?? 0), 0);
  const accumulatedPaymentsThroughDisplay = gameState.weeklyPayments
    .slice(0, safeDisplayWeekIndex + 1)
    .reduce((total, payment) => total + Number(payment ?? 0), 0);
  const displayWeekCash = Math.max(
    0,
    initialReserve + accumulatedIncomeThroughDisplay - accumulatedPaymentsThroughDisplay,
  );
  const displayWeekGain = accumulatedIncomeThroughDisplay;
  const displayWeekPayment = displayWeekIsCurrent
    ? draftPayment
    : Number(displayWeekState?.payment ?? 0);
  const canGoPrevWeek = safeDisplayWeekIndex > 0;
  const canGoNextWeek = safeDisplayWeekIndex < maxVisibleWeekIndex;
  const displayWeekCompleted = Boolean(displayWeekState);
  const currentWeekCompleted = Boolean(
    gameState.weeklyStates[currentWeekIndex],
  );
  const paymentGuideText =
    strategyExecutionConfig?.helper ??
    strategyExecutionConfig?.description ??
    "";
  const displayWeekInputValue = displayWeekCompleted
    ? Number(displayWeekState?.payment ?? 0)
    : displayWeekIsCurrent && strategyExecutionConfig?.mode !== "regulated"
      ? Number(strategyExecutionConfig?.suggestedPayment ?? 0)
      : Number(draftPayment ?? 0);
  const canPayDisplayedWeek = displayWeekIsCurrent && !displayWeekCompleted;
  const canAdvanceWeek = displayWeekIsCurrent && currentWeekCompleted;
  const step3StrategyId =
    selectedPaymentStrategy?.id ?? gameState.selectedPaymentStrategyId;
  const showWeeklyApproximation = step3StrategyId === "regulated";
  const approximateWeeklyFee =
    loanTermWeeks > 0
      ? formatCurrency(loanTotalToRepay / loanTermWeeks)
      : "S/ 0.00";
  const displayWeekDebt =
    displayWeekCompleted && displayWeekState?.remaining != null
      ? Number(displayWeekState.remaining)
      : debtPending;
  const currentWeekSaleCards =
    displayWeek?.sales?.map((sale) => {
      const product = content.products.find(
        (item) =>
          item.sidebarLabel?.toLowerCase() === sale.product?.toLowerCase() ||
          item.label?.toLowerCase() === sale.product?.toLowerCase(),
      );

      return {
        id: `sale-${displayWeek.week}-${sale.product}`,
        title: product?.label ?? sale.product,
        text: `${sale.quantity} vendidas · ${formatCurrency(sale.income)}`,
        media: product?.media,
      };
    }) ?? [];
  const weeklyLogicTitle =
    selectedPaymentStrategy?.id === "regulated"
      ? "Cuota aproximada por semana"
      : selectedPaymentStrategy?.id === "early"
        ? "Pago segun lo acumulado"
        : "Pago al cierre del plazo";

  return (
    <section className="mx-auto flex h-full w-full max-w-[90rem] px-4 py-4 text-white lg:min-h-0">
      <div className="grid h-full min-h-0 w-full gap-4 lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-2 overflow-y-auto rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] p-4">
          <Typography
            content={{
              text: sidebarTitle,
              variant: "h1",
              align: "left",
            }}
          />

          {gameState.step === 1 ? (
            <SectionCard
              title={{
                text: copy.step1.asideTitle,
                variant: "h3",
                align: "left",
              }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden p-4"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <Typography
                  content={{
                    text: copy.step1.asideText,
                    variant: "bodySm",
                    align: "left",
                    color: "secondary",
                  }}
                />

                <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1">
                  {content.products.map((product) => (
                    <Card
                      key={product.id}
                      title={{
                        text: product.sidebarLabel ?? product.label,
                        variant: "cardTitle",
                        align: "center",
                      }}
                      text={{
                        text: `${product.quantity} unidades`,
                        variant: "cardText",
                        align: "center",
                        color: "secondary",
                      }}
                      media={product.media}
                      variant="solid"
                      size="normal"
                    />
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {gameState.step === 2 ? (
            <SectionCard className="flex min-h-0 flex-1 flex-col">
              <div className="rounded-[1.35rem] border border-[#ffe08a]/55 bg-[linear-gradient(180deg,rgba(255,224,138,0.18),rgba(255,255,255,0.08))] px-4 py-4 shadow-[0_12px_24px_rgba(30,20,70,0.2)]">
                <Typography
                  content={{
                    text: copy.step2.neededMoneyLabel,
                    variant: "helper",
                    align: "left",
                    color: "secondary",
                  }}
                />
                <Typography
                  content={{
                    text: formatCurrency(
                      gameState.fundingNeeded || fundingNeeded,
                    ),
                    variant: "h1",
                    align: "left",
                  }}
                  className="mt-2"
                />
              </div>

              {activeOffer ? (
                <div className="relative mt-4 flex min-h-0 flex-1 flex-col rounded-[1.2rem] border border-white/14 bg-black/10 p-3 overflow-hidden">
                  <Typography
                    content={{
                      text: activeOffer.name,
                      variant: "h3",
                      align: "left",
                    }}
                  />

                  <div className="mt-3 grid gap-2 min-[380px]:grid-cols-2">
                    {[
                      ["Monto prestado", formatCurrency(activeOffer.amount)],
                      [
                        "Total a devolver",
                        activeOffer.totalToRepay != null
                          ? formatCurrency(activeOffer.totalToRepay)
                          : "No dice",
                      ],
                      [
                        "Interes",
                        activeOffer.extraCost != null
                          ? formatCurrency(activeOffer.extraCost)
                          : "No dice",
                      ],
                      [
                        "Plazo",
                        activeOffer.termWeeks != null
                          ? `${activeOffer.termWeeks} semanas`
                          : "No claro",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-2xl border border-white/10 bg-white/6 p-2"
                      >
                        <Typography
                          content={{
                            text: label,
                            variant: "helper",
                            align: "left",
                            color: "secondary",
                          }}
                        />
                        <Typography
                          content={{
                            text: value,
                            variant: "h3",
                            align: "left",
                          }}
                          className="mt-2 break-words"
                        />
                      </div>
                    ))}
                  </div>

                  {offerFeedback?.offerId === activeOffer.id ? (
                    <div className="mt-3 [@media(max-height:700px)]:hidden">
                      <InfoBanner message={offerFeedback} />
                    </div>
                  ) : null}

                  <div className="mt-auto pt-3">
                    <Button
                      variant="primary"
                      label={copy.step2.chooseButton}
                      onClick={() => handleChooseOffer(activeOffer.id)}
                      fullWidth
                    />
                  </div>

                  {offerFeedback?.offerId === activeOffer.id ? (
                    <div className="pointer-events-none absolute inset-x-3 top-[4.65rem] z-20 hidden [@media(max-height:700px)]:block">
                      <div className="rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_78%_30%,rgba(214,197,255,0.16),transparent_28%),radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.12),transparent_26%),linear-gradient(180deg,rgba(20,13,48,0.50),rgba(20,13,48,0.72))] p-1.5 shadow-[0_16px_30px_rgba(12,8,34,0.28)] backdrop-blur-[10px]">
                        <InfoBanner message={offerFeedback} />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          {gameState.step === 3 ? (
            <SectionCard className="flex min-h-0 flex-1 flex-col p-0 gap-2">
              {selectedOffer ? (
                <div className="gap-2">
                  <div className=" mb-2 rounded-[1rem] border border-white/12 bg-white/8 px-4 py-3">
                    <Typography
                      content={{
                        text: "Información previa",
                        variant: "h3",
                        align: "left",
                      }}
                      className="leading-none"
                    />
                  </div>

                  <div className="grid gap-2 min-[380px]:grid-cols-2">
                    {[
                      ["Préstamo (P)", formatCurrency(selectedOffer.amount)],
                      [
                        "Plazo",
                        selectedOffer.termWeeks != null
                          ? `${selectedOffer.termWeeks} semanas`
                          : "No claro",
                      ],
                      [
                        "Interés (I)",
                        selectedOffer.extraCost != null
                          ? formatCurrency(selectedOffer.extraCost)
                          : "No dice",
                      ],
                      [
                        "Gastado (G)",
                        formatCurrency(
                          gameState.fundingNeeded || fundingNeeded,
                        ),
                      ],
                      [
                        "Total (P + I)",
                        selectedOffer.totalToRepay != null
                          ? formatCurrency(selectedOffer.totalToRepay)
                          : "No dice",
                      ],
                      ["Sobrante (P - G)", formatCurrency(initialReserve)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-[1.05rem] border border-white/12 bg-white/6 p-2.5"
                      >
                        <Typography
                          content={{
                            text: label,
                            variant: "helper",
                            align: "left",
                            color: "secondary",
                          }}
                        />

                        <Typography
                          content={{
                            text: value,
                            variant: "h3",
                            align: "left",
                          }}
                          className="mt-2 break-words"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showWeeklyApproximation ? (
                <div className="rounded-[1.2rem] border border-white/12 bg-black/10 px-4 py-4">
                  <Typography
                    content={{
                      text: "Cuota aproximada por semana",
                      variant: "h2",
                      align: "left",
                    }}
                  />
                  <Typography
                    content={{
                      text: `Se divide el total a pagar (${formatCurrency(
                        loanTotalToRepay,
                      )}) entre el plazo (${loanTermWeeks} semanas) ${approximateWeeklyFee} aprox.`,
                      variant: "bodySm",
                      align: "left",
                      color: "secondary",
                    }}
                    className="mt-3"
                  />
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          {gameState.step === 4 ? (
            <SectionCard
              title={{ text: "Resultado final", variant: "h3", align: "left" }}
              className="p-4"
            >
              <div className="space-y-2">
                <SidebarRow label="Puntaje" value={`${totalScore} / 100`} />
                <SidebarRow label="Estado" value={finalStateLabel} />
                <SidebarRow
                  label="Deuda pendiente"
                  value={formatCurrency(debtPending)}
                />
                <SidebarRow
                  label="Ganancia neta"
                  value={formatCurrency(netProfit)}
                />
              </div>
            </SectionCard>
          ) : null}
        </aside>

        <main className="min-h-0 overflow-auto rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] p-2">
          {gameState.step === 1 ? (
            <SectionCard
              title={{
                text: copy.step1.mainTitle,
                variant: "h3",
                align: "left",
              }}
              subtitle={{
                text: copy.step1.mainSubtitle,
                variant: "body",
                align: "left",
                color: "secondary",
              }}
              className="flex h-full min-h-0 flex-col p-2"
            >
              <div className="min-h-0 flex-1">
                <Shopping
                  items={materialShopItems}
                  selectedIds={gameState.selectedMaterials}
                  selectedItems={selectedMaterialItems}
                  calculatorData={materialsCalculatorData}
                  initialBalance={content.ownMoney}
                  total={materialsTotal}
                  balance={Math.max(0, content.ownMoney - materialsTotal)}
                  errorMessage={
                    materialsMessage?.tone === "warning"
                      ? materialsMessage.text
                      : null
                  }
                  onToggleItem={(item) => toggleMaterial(item?.id)}
                  onRemoveItem={
                    gameState.materialsValidated ? null : removeMaterial
                  }
                  onSubmit={
                    gameState.materialsValidated
                      ? () => goToStep(2)
                      : handleReviewMaterials
                  }
                  disabled={
                    gameState.materialsValidated
                      ? false
                      : selectedMaterialItems.length === 0
                  }
                  columns={3}
                  rows={3}
                  layout="balanced"
                />
              </div>
            </SectionCard>
          ) : null}

          {gameState.step === 2 ? (
            <div className="space-y-5">
              <SectionCard
                title={{
                  text: copy.step2.mainTitle,
                  variant: "h1",
                  align: "left",
                }}
                subtitle={{
                  text: copy.step2.mainSubtitle,
                  variant: "body",
                  align: "left",
                  color: "secondary",
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {content.loanOffers.map((offer) => (
                    <LoanOfferCard
                      key={offer.id}
                      offer={offer}
                      isActive={activeOffer?.id === offer.id}
                      isSelected={gameState.selectedOfferId === offer.id}
                      onOpen={handleOpenOffer}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {gameState.step === 3 ? (
            <>
              {!gameState.paymentPlanConfirmed ? (
                <div className="flex min-h-0 flex-col rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4">
                  <div className="mb-4">
                    <Typography
                      content={{
                        text: copy.step3.planTitle,
                        variant: "h1",
                        align: "left",
                      }}
                    />
                    <Typography
                      content={{
                        text: copy.step3.planSubtitle,
                        variant: "body",
                        align: "left",
                        color: "secondary",
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {content.paymentStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="rounded-[1.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-2"
                      >
                        <Card
                          title={{
                            text: strategy.title,
                            variant: "cardTitle",
                            align: "center",
                          }}
                          text={null}
                          media={strategy.media}
                          interaction={{ type: "selectable" }}
                          selected={selectedPaymentStrategy?.id === strategy.id}
                          onSelect={() =>
                            handleOpenPaymentStrategy(strategy.id)
                          }
                          variant="solid"
                        />
                      </div>
                    ))}
                  </div>

                  {selectedStrategyDetails ? (
                    <div className="mt-2 rounded-[1.35rem] border border-white/12 bg-black/10 p-4">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
                        <div>
                          <Typography
                            content={{
                              text: copy.step3.strategyDetailsTitle,
                              variant: "h3",
                              align: "left",
                            }}
                          />
                          <Typography
                            content={{
                              text: selectedStrategyDetails.title,
                              variant: "label",
                              align: "left",
                            }}
                            className="mt-2 text-white"
                          />
                          <Typography
                            content={{
                              text: selectedStrategyDetails.description,
                              variant: "helper",
                              align: "left",
                              color: "secondary",
                            }}
                            className="mt-2"
                          />

                          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                            {selectedStrategyDetails.conditions.map(
                              (condition) => (
                                <div
                                  key={condition}
                                  className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                                >
                                  <Typography
                                    content={{
                                      text: condition,
                                      variant: "helper",
                                      align: "left",
                                      color: "secondary",
                                    }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="flex h-full flex-col justify-end">
                          <Button
                            variant="primary"
                            label={copy.step3.strategyContinueButton}
                            onClick={handleConfirmPaymentStrategy}
                            disabled={!selectedPaymentStrategy}
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-0 flex-col rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-2">
                  <div className="grid gap-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.78fr)]">
                    <div className="grid gap-2 rounded-[1.35rem] border border-white/12 bg-black/10 p-2">
                      <div className="rounded-[1.2rem] border border-white/12 bg-black/10 px-4 py-3 text-center">
                        <Typography
                          content={{
                            text: `Semana ${displayWeek.week} : ${displayWeek.title}`,
                            variant: "h1",
                            align: "left",
                          }}
                        />
                      </div>
                      <div className="grid items-start gap-3 sm:grid-cols-3 xl:grid-cols-3">
                        {displayWeek.sales.map((sale, index) => {
                          const saleCard = currentWeekSaleCards[index];

                          return (
                            <Card
                              key={
                                saleCard?.id ??
                                `${displayWeek.week}-${sale.product}`
                              }
                              title={{
                                text: saleCard?.title ?? sale.product,
                                variant: "h3",
                                align: "center",
                              }}
                              text={{
                                text: formatCurrency(sale.unitPrice),
                                variant: "cardText",
                                align: "center",
                                color: "secondary",
                              }}
                              media={saleCard?.media}
                              variant="solid"
                            />
                          );
                        })}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                        {displayWeek.sales.map((sale, index) => {
                          const saleCard = currentWeekSaleCards[index];

                          return (
                            <Card
                              key={`sold-${displayWeek.week}-${sale.product}`}
                              title={{
                                text: `Vendiste x${sale.quantity}`,
                                variant: "h3",
                                align: "center",
                              }}
                              text={{
                                text: formatCurrency(sale.income),
                                variant: "h2",
                                align: "center",
                                color: "secondary",
                              }}
                            />
                          );
                        })}
                      </div>

                      <div className="rounded-[1.2rem] border border-white/12 bg-black/10 px-4 py-3 text-center">
                        <Typography
                          content={{
                            text: `Total:  ${formatCurrency(displayWeekIncome)}`,
                            variant: "h1",
                            align: "center",
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-white/12 bg-black/10 p-4">
                      <Typography
                        content={{
                          text: "Resumen",
                          variant: "h2",
                          align: "center",
                        }}
                      />

                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/10 bg-white/6 p-2">
                        <Button
                          variant="simple"
                          label="<"
                          onClick={() =>
                            canGoPrevWeek &&
                            setDisplayWeekIndex((prev) => Math.max(0, prev - 1))
                          }
                          disabled={!canGoPrevWeek}
                        />
                        <div className="rounded-xl bg-white/6 px-3 py-3 text-center">
                          <Typography
                            content={{
                              text: `Semana ${displayWeek.week}`,
                              variant: "label",
                              align: "center",
                            }}
                          />
                        </div>
                        <Button
                          variant="simple"
                          label=">"
                          onClick={() =>
                            canGoNextWeek &&
                            setDisplayWeekIndex((prev) =>
                              Math.min(maxVisibleWeekIndex, prev + 1),
                            )
                          }
                          disabled={!canGoNextWeek}
                        />
                      </div>

                      <div className="space-y-2">
                        <SidebarRow
                          label="Ingresos Totales"
                          value={formatCurrency(accumulatedIncomeThroughDisplay)}
                        />
                        <SidebarRow
                          label="Dinero en caja"
                          value={formatCurrency(displayWeekCash)}
                        />
                        <SidebarRow
                          label="Ganancia total"
                          value={
                            displayWeekGain == null
                              ? "S/ ---"
                              : formatCurrency(displayWeekGain)
                          }
                        />
                      </div>

                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/6 p-3">
                        {paymentMessage?.text ? (
                          <InfoBanner message={paymentMessage} />
                        ) : (
                          <>
                            <Typography
                              content={{
                                text: "Pago correspondiente",
                                variant: "h2",
                                align: "left",
                              }}
                            />
                            <Typography
                              content={{
                                text: `Tienes aun una deuda de ${formatCurrency(displayWeekDebt)}`,
                                variant: "body",
                                align: "left",
                                color: "secondary",
                              }}
                            />
                          </>
                        )}

                        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                          <div className="flex items-center justify-center rounded-2xl border border-white/12 bg-black/20 px-3 py-3">
                            <Typography
                              content={{
                                text: "S/",
                                variant: "h3",
                                align: "center",
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                            <input
                              type="number"
                              min={0}
                              max={maxAllowedPayment}
                              step="0.01"
                              value={displayWeekInputValue}
                              disabled={
                                !canPayDisplayedWeek ||
                                strategyExecutionConfig?.mode !== "regulated"
                              }
                              onChange={(event) =>
                                updateDraftPayment(event.target.value)
                              }
                              className="h-14 w-full rounded-2xl border border-white/16 bg-black/20 px-4 text-xl font-black text-white outline-none disabled:cursor-not-allowed disabled:opacity-80"
                            />
                            <Button
                              variant="secondary"
                              size="lg"
                              label="Pagar"
                              onClick={() => {
                                if (
                                  strategyExecutionConfig?.mode === "regulated"
                                ) {
                                  handleConfirmWeekPayment();
                                  return;
                                }

                                handleApplySuggestedPayment(
                                  strategyExecutionConfig?.suggestedPayment ??
                                    0,
                                );
                              }}
                              disabled={!canPayDisplayedWeek}
                            />
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="lg"
                          label={
                            currentWeekIndex < content.weeks.length - 1
                              ? copy.step3.continueButton
                              : copy.step3.reviewResultButton
                          }
                          onClick={handleContinueAfterWeek}
                          disabled={!canAdvanceWeek}
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {gameState.step === 4 ? (
            <div className="space-y-5">
              <SectionCard
                title={{
                  text: copy.step4.mainTitle,
                  variant: "h1",
                  align: "left",
                }}
                subtitle={{
                  text: copy.step4.mainSubtitle,
                  variant: "body",
                  align: "left",
                  color: "secondary",
                }}
              >
                <div className="space-y-5">
                  <SectionCard
                    title={{
                      text: copy.step4.materialsTitle,
                      variant: "h2",
                      align: "left",
                    }}
                    className="p-4"
                  >
                    <Table
                      headers={["Concepto", "Resultado"]}
                      rows={[
                        [
                          "Costo de materiales",
                          formatCurrency(
                            gameState.materialsTotal || materialsTotal,
                          ),
                        ],
                        [
                          "Dinero propio utilizado",
                          formatCurrency(content.ownMoney),
                        ],
                        [
                          "Dinero que faltaba",
                          formatCurrency(
                            gameState.fundingNeeded || fundingNeeded,
                          ),
                        ],
                        [
                          "Materiales seleccionados correctamente",
                          gameState.materialsValidated ? "Si" : "Debo reforzar",
                        ],
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title={{
                      text: copy.step4.loanTitle,
                      variant: "h2",
                      align: "left",
                    }}
                    className="p-4"
                  >
                    <Table
                      headers={["Concepto", "Resultado"]}
                      rows={[
                        [
                          "Monto recibido",
                          formatCurrency(selectedOffer?.amount ?? 0),
                        ],
                        ["Total devuelto", formatCurrency(gameState.totalPaid)],
                        [
                          "Costo adicional",
                          formatCurrency(
                            Math.max(
                              0,
                              gameState.totalPaid -
                                (selectedOffer?.amount ?? 0),
                            ),
                          ),
                        ],
                        ["Plazo", `${selectedOffer?.termWeeks ?? 0} semanas`],
                        ["Condiciones", selectedOffer?.conditions ?? "-"],
                        ["Riesgo", selectedOffer?.risk ?? "-"],
                        [
                          "Excedente inicial del prestamo",
                          formatCurrency(initialReserve),
                        ],
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title={{
                      text: copy.step4.paymentsTitle,
                      variant: "h2",
                      align: "left",
                    }}
                    className="p-4"
                  >
                    <Table
                      headers={[
                        "Semana",
                        "Ingreso por ventas",
                        "Pago realizado",
                        "Atraso al cerrar",
                        "Estado",
                      ]}
                      rows={content.weeks.map((week, index) => {
                        const weekState = gameState.weeklyStates[index];
                        return [
                          String(week.week),
                          formatCurrency(week.income),
                          formatCurrency(weekState?.payment ?? 0),
                          formatCurrency(weekState?.arrears ?? 0),
                          weekState?.status ?? "Pendiente",
                        ];
                      })}
                    />
                  </SectionCard>

                  <SectionCard
                    title={{
                      text: copy.step4.financialTitle,
                      variant: "h2",
                      align: "left",
                    }}
                    className="p-4"
                  >
                    <Table
                      headers={["Concepto", "Monto"]}
                      rows={[
                        ["Total obtenido por ventas", formatCurrency(63)],
                        [
                          "Costo de materiales",
                          `-${formatCurrency(gameState.materialsTotal || materialsTotal)}`,
                        ],
                        [
                          "Ganancia antes del costo del prestamo",
                          formatCurrency(
                            63 - (gameState.materialsTotal || materialsTotal),
                          ),
                        ],
                        [
                          "Costo adicional del prestamo",
                          `-${formatCurrency(
                            Math.max(
                              0,
                              gameState.totalPaid -
                                (selectedOffer?.amount ?? 0),
                            ),
                          )}`,
                        ],
                        [
                          "Ganancia neta del emprendimiento",
                          formatCurrency(netProfit),
                        ],
                        [
                          "Excedente inicial del prestamo no usado",
                          formatCurrency(initialReserve),
                        ],
                        [
                          "Saldo final disponible",
                          formatCurrency(finalAvailableMoney),
                        ],
                        [
                          "Estado de aprobacion",
                          isApproved ? "Aprobado" : "En refuerzo",
                        ],
                      ]}
                    />
                  </SectionCard>

                  <InfoBanner message={finalMessage} />
                </div>
              </SectionCard>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  label="Finalizar mision"
                  onClick={handleFinishMission}
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
