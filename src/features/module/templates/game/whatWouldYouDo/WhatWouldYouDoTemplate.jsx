import { useEffect, useState } from "react";
import Button from "@/features/module/blocks/base/Action/Button";
import Typography from "@/features/module/blocks/base/Typography";
import Card from "@/features/module/blocks/compounds/container/Card";
import InteractiveInfoAside from "@/features/module/blocks/compounds/grouper/InteractiveInfoAside";
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
          ? "scale-[1.01] border-[#fff1a8] bg-[linear-gradient(180deg,rgba(255,215,95,0.34),rgba(40,91,176,0.24))] ring-4 ring-[#ffe08a]/75 shadow-[0_0_0_2px_rgba(255,240,168,0.55),0_18px_34px_rgba(10,39,98,0.34)]"
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
                  : "Poco claro"}
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
        <div className="mb-2 p-2">
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

export default function WhatWouldYouDoTemplate(props) {
  const model = useWhatWouldYouDoLogic(props);
  const {
    content,
    gameState,
    materialsMessage,
    paymentMessage,
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
    interactiveAsideModel,
    toggleMaterial,
    removeMaterial,
    handleReviewMaterials,
    goToStep,
    handleOpenOffer,
    handleConfirmPaymentStrategy,
    updateDraftPayment,
    adjustDraftPayment,
    handleConfirmWeekPayment,
    handleApplySuggestedPayment,
    handleContinueAfterWeek,
  } = model;

  const copy = content.copy;
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
  const displayWeekAutoCompleted =
    displayWeekIsCurrent && !displayWeekState && debtPending <= 0;
  const displayWeekCompleted = Boolean(displayWeekState) || displayWeekAutoCompleted;
  const currentWeekCompleted =
    Boolean(gameState.weeklyStates[currentWeekIndex]) || debtPending <= 0;
  const displayWeekMessage =
    displayWeekState?.message ?? (displayWeekIsCurrent ? paymentMessage : null);
  const displayWeekInputValue = displayWeekCompleted
    ? String(Number(displayWeekState?.payment ?? 0))
    : displayWeekIsCurrent && strategyExecutionConfig?.mode !== "regulated"
      ? String(Number(strategyExecutionConfig?.suggestedPayment ?? 0))
      : draftPayment;
  const canPayDisplayedWeek =
    displayWeekIsCurrent &&
    !displayWeekCompleted &&
    strategyExecutionConfig?.mode !== "wait";
  const canAdvanceWeek = displayWeekIsCurrent && currentWeekCompleted;
  const step3StrategyId =
    selectedPaymentStrategy?.id ?? gameState.selectedPaymentStrategyId;
  const displayWeekDebt =
    displayWeekCompleted && displayWeekState?.remaining != null
      ? Number(displayWeekState.remaining)
      : debtPending;
  const displayWeekSummaryTitle =
    displayWeekMessage?.title ??
    (displayWeekDebt <= 0
      ? `Semana ${displayWeek.week} registrada`
      : "Pago correspondiente");
  const displayWeekSummaryText =
    displayWeekMessage?.text ??
    (displayWeekDebt <= 0
      ? "Ya no tienes deuda."
      : `Tienes aun una deuda de ${formatCurrency(displayWeekDebt)}`);
  const totalSalesIncome = content.weeks.reduce(
    (total, week) => total + Number(week?.income ?? 0),
    0,
  );
  const extraLoanCost = Math.max(
    0,
    gameState.totalPaid - (selectedOffer?.amount ?? 0),
  );
  const paidWeeksCount = gameState.weeklyStates.filter(Boolean).length;
  const selectedMaterialsCount = gameState.selectedMaterials.length;
  const ventureCardMedia = content.ventureMedia ?? content.products[0]?.media ?? null;
  const plannedUnits = content.products.reduce(
    (total, product) => total + Number(product?.quantity ?? 0),
    0,
  );
  const soldUnits = content.weeks.reduce(
    (total, week) =>
      total +
      week.sales.reduce(
        (weekTotal, sale) => weekTotal + Number(sale?.quantity ?? 0),
        0,
      ),
    0,
  );
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
        ? "Pago según lo acumulado"
        : "Pago al cierre del plazo";

  return (
    <section className="mx-auto flex h-full w-full max-w-[96rem] px-4 py-4 text-white lg:min-h-0">
      <div className="grid h-full min-h-0 w-full gap-4 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
        {interactiveAsideModel ? (
          <InteractiveInfoAside
            title={interactiveAsideModel.title}
            sections={interactiveAsideModel.sections}
          />
        ) : null}

        <main className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto rounded-[2rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]">
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
                  initialBalance={materialsTotal}
                  total={content.ownMoney}
                  balance={Math.max(0, materialsTotal - content.ownMoney)}
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
                        className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]"
                      >
                        <img
                          src={strategy.media?.src}
                          alt={strategy.media?.alt}
                          className="h-44 w-full object-cover"
                        />
                        <div className="space-y-3 p-4">
                          <Typography
                            content={{
                              text: strategy.title,
                              variant: "h3",
                              align: "left",
                            }}
                          />
                          <Typography
                            content={{
                              text: strategy.description,
                              variant: "bodySm",
                              align: "left",
                              color: "secondary",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="primary"
                      label={copy.step3.strategyContinueButton}
                      onClick={() => handleConfirmPaymentStrategy("regulated")}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 min-w-0 flex-col rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-2">
                  <div className="grid min-w-0 gap-2 min-[1180px]:grid-cols-[minmax(0,1.45fr)_minmax(16.5rem,0.78fr)]">
                    <div className="grid min-w-0 gap-2 rounded-[1.35rem] border border-white/12 bg-black/10 p-2">
                      <div className="rounded-[1.2rem] border border-white/12 bg-black/10 px-4 py-3 text-center">
                        <Typography
                          content={{
                            text: `Semana ${displayWeek.week} : ${displayWeek.title}`,
                            variant: "h1",
                            align: "left",
                          }}
                          className="break-words"
                        />
                      </div>
                      <div className="grid min-w-0 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

                      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

                      <div className="rounded-[1.2rem] border border-white/12 bg-black/10 p-1 text-center">
                        <Typography
                          content={{
                            text: `Total:  ${formatCurrency(displayWeekIncome)}`,
                            variant: "h2",
                            align: "center",
                          }}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 space-y-3 rounded-2xl border border-white/12 bg-black/10 p-4">
                      <Typography
                        content={{
                          text: "Resumen",
                          variant: "h2",
                          align: "center",
                        }}
                      />

                      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/10 bg-white/6 p-2">
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
                              className="break-words"
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
                      </div>

                      <div className="space-y-3 rounded-[1.45rem] border border-[#ffd772]/55 bg-[radial-gradient(circle_at_top_left,rgba(255,230,160,0.26),transparent_34%),linear-gradient(180deg,rgba(120,78,8,0.36),rgba(79,43,2,0.26))] p-3 shadow-[0_14px_30px_rgba(90,55,5,0.24),inset_0_1px_0_rgba(255,245,204,0.22)]">
                        <Typography
                          content={{
                            text: displayWeekSummaryTitle,
                            variant: "h2",
                            align: "left",
                          }}
                        />
                        <Typography
                          content={{
                            text: displayWeekSummaryText,
                            variant: "body",
                            align: "left",
                            color: "secondary",
                          }}
                        />

                        <div className="grid min-w-0 grid-cols-[3.25rem_minmax(0,1fr)] gap-2">
                          <div className="flex items-center justify-center rounded-2xl border border-[#ffe08a]/40 bg-[rgba(52,28,2,0.24)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,241,191,0.12)]">
                            <Typography
                              content={{
                                text: "S/",
                                variant: "h3",
                                align: "center",
                              }}
                            />
                          </div>
                          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={displayWeekInputValue}
                              placeholder="0"
                              disabled={
                                !canPayDisplayedWeek ||
                                strategyExecutionConfig?.mode !== "regulated"
                              }
                              onChange={(event) =>
                                updateDraftPayment(event.target.value)
                              }
                              className="h-14 w-full rounded-2xl border border-[#ffe08a]/38 bg-[rgba(49,27,4,0.22)] px-4 text-xl font-black text-white outline-none placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,241,191,0.10)] disabled:cursor-not-allowed disabled:opacity-80"
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
                              fullWidth
                              className="min-w-[6.5rem]"
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
                          className="shadow-[0_16px_30px_rgba(100,58,0,0.22)]"
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
                <div className="grid gap-4 xl:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]">
                  <Card
                    title={{
                      text: copy.step4.ventureCardTitle,
                      variant: "cardTitle",
                      align: "center",
                    }}
                    text={{
                      text: `${plannedUnits} pulseras preparadas para la feria escolar.`,
                      variant: "cardText",
                      align: "center",
                      color: "secondary",
                    }}
                    media={ventureCardMedia}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <SectionCard
                      title={{
                        text: copy.step4.productionTitle,
                        variant: "h2",
                        align: "left",
                      }}
                      className="p-4"
                    >
                      <div className="space-y-3">
                        <Typography
                          content={{
                            text: `${selectedMaterialsCount} materiales listos para producir.`,
                            variant: "body",
                            align: "left",
                          }}
                        />
                        <Typography
                          content={{
                            text: `${plannedUnits} pulseras preparadas para la feria.`,
                            variant: "bodySm",
                            align: "left",
                            color: "secondary",
                          }}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title={{
                        text: copy.step4.ventureSalesTitle,
                        variant: "h2",
                        align: "left",
                      }}
                      className="p-4"
                    >
                      <div className="space-y-3">
                        <Typography
                          content={{
                            text: `${soldUnits} pulseras vendidas.`,
                            variant: "body",
                            align: "left",
                          }}
                        />
                        <Typography
                          content={{
                            text: `Ingresos totales: ${formatCurrency(totalSalesIncome)}.`,
                            variant: "bodySm",
                            align: "left",
                            color: "secondary",
                          }}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title={{
                        text: copy.step4.journeyTitle,
                        variant: "h2",
                        align: "left",
                      }}
                      className="p-4"
                    >
                      <div className="space-y-3">
                        <Typography
                          content={{
                            text: `Aportaste ${formatCurrency(content.ownMoney)} de tu dinero.`,
                            variant: "body",
                            align: "left",
                          }}
                        />
                        <Typography
                          content={{
                            text:
                              debtPending <= 0
                                ? `${paidWeeksCount} semanas registradas. Interes pagado: ${formatCurrency(extraLoanCost)}.`
                                : `Quedo pendiente ${formatCurrency(debtPending)} al cierre.`,
                            variant: "bodySm",
                            align: "left",
                            color: "secondary",
                          }}
                        />
                      </div>
                    </SectionCard>

                    <SectionCard
                      title={{
                        text: copy.step4.closingTitle,
                        variant: "h2",
                        align: "left",
                      }}
                      className="p-4"
                    >
                      <div className="space-y-3">
                        <Typography
                          content={{
                            text: `Caja final: ${formatCurrency(finalAvailableMoney)}.`,
                            variant: "body",
                            align: "left",
                          }}
                        />
                        <Typography
                          content={{
                            text: `Ganancia neta: ${formatCurrency(netProfit)}.`,
                            variant: "bodySm",
                            align: "left",
                            color: "secondary",
                          }}
                        />
                      </div>
                    </SectionCard>
                  </div>
                </div>
              </SectionCard>

            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
