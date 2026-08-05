import {
  COLLECT_OBJECTS_MISSION,
  formatCollectCurrency,
  getRequiredAmount,
} from "./collectObjects.config";

const PRESENTATION = Object.freeze({
  aside:
    "relative h-full gap-3 border-white/30 bg-[linear-gradient(180deg,#1b66de_0%,#0f4fb9_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
  title:
    "mx-auto max-w-[14rem] text-[clamp(1.55rem,1.05rem+1.2vw,2.4rem)] font-black leading-[0.98]",
  targetGroup:
    "min-h-0 rounded-[1.15rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#236fef_0%,#154fae_100%)] p-2.5",
  target:
    "h-full min-h-0 border-[3px] border-white/40 bg-white/8 shadow-[0_14px_28px_rgba(7,31,94,0.24)]",
  targetLabel:
    "rounded-[0.95rem] bg-[linear-gradient(180deg,#3186ff_0%,#2567d3_100%)] px-3 py-2",
  targetBadge:
    "right-1 top-1 rounded-[0.8rem] bg-[linear-gradient(180deg,#42d98f_0%,#19bf6c_100%)] px-3 py-1 text-[0.82rem] shadow-[0_10px_16px_rgba(0,105,64,0.26)]",
  amount:
    "border-[#66beff]/34 bg-[linear-gradient(180deg,#236fef_0%,#154fae_100%)] px-3 py-5",
  primary:
    "min-h-0 overflow-y-auto rounded-[1.7rem] border border-white/20 bg-white/6 p-3",
  opportunity:
    "h-full min-h-[13rem] overflow-hidden border-white/20 bg-white/8",
  summary: "border-white/16 bg-white/8 p-3",
});

function text(content, variant = "body", align = "left") {
  if (!content) return null;
  return typeof content === "object"
    ? content
    : { text: String(content), variant, align };
}

function createInformationSlot(controller) {
  const amount =
    controller.mode === "falling"
      ? controller.engineState.collected
      : controller.surplusResult?.finalSurplusAmount ??
        controller.sourcePayload.surplusAmount;

  return {
    slotId: "collectObjectsInformation",
    area: "heading",
    areaAlign: "stretch",
    block: "InteractiveInfoAside",
    props: () => ({ className: PRESENTATION.aside }),
    child: {
      block: "ComposeGroup",
      props: () => ({
        gap: 3,
        items: [
          {
            block: "Typography",
            shrink: false,
            wrapperClassName:
              "rounded-[1.15rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#2a76ef_0%,#1958c0_100%)] px-3 py-5",
            props: {
              content: { ...controller.sidebarTitle, align: "center" },
              className: PRESENTATION.title,
            },
          },
          {
            block: "ComposeGroup",
            grow: true,
            wrapperClassName: "min-h-[15rem] basis-0",
            props: {
              gap: 2,
              className: PRESENTATION.targetGroup,
              items: [
                {
                  block: "Typography",
                  props: {
                    content: controller.goalLabel,
                    className: PRESENTATION.targetLabel,
                  },
                },
                {
                  block: "Card",
                  grow: true,
                  props: {
                    title: controller.target?.title,
                    media: controller.target?.media,
                    interaction: {
                      type: "badge",
                      content: formatCollectCurrency(controller.target?.amount),
                      className: PRESENTATION.targetBadge,
                    },
                    variant: "ghost",
                    zoomable: false,
                    className: PRESENTATION.target,
                  },
                },
              ],
            },
          },
          {
            block: "Card",
            shrink: false,
            props: {
              title: controller.collectedLabel,
              text: {
                text: formatCollectCurrency(amount),
                variant: "h2",
                align: "center",
              },
              variant: "ghost",
              zoomable: false,
              className: PRESENTATION.amount,
            },
          },
          {
            block: "ProgressBar",
            shrink: false,
            props: {
              mode: "continuous",
              value: amount,
              max:
                controller.mode === "falling"
                  ? controller.targetAmount
                  : Math.max(1, controller.sourcePayload.surplusAmount),
              ariaLabel: "Progreso de la meta",
            },
          },
        ],
      }),
    },
  };
}

function createFallingSlot(controller) {
  return {
    slotId: "fallingObjectsEngine",
    area: "primary",
    areaAlign: "stretch",
    block: "FallingObjects",
    props: () => ({
      items: controller.items,
      rounds: controller.rounds,
      targetAmount: controller.targetAmount,
      minimumCompletionAmount: controller.minimumCompletionAmount,
      ...controller.engine,
      onStateChange: controller.handleEngineStateChange,
    }),
  };
}

function createIntroSlot(controller) {
  const copy = controller.surplus.intro;
  return {
    slotId: "surplusIntro",
    area: "primary",
    areaAlign: "stretch",
    areaClassName: PRESENTATION.primary,
    items: [
      { block: "Typography", props: { content: copy.title } },
      { block: "Typography", props: { content: copy.description } },
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          items: [
            {
              block: "Card",
              props: {
                title: text("Dinero reunido", "helper"),
                text: text(
                  formatCollectCurrency(controller.sourcePayload.collectedAmount),
                  "h3",
                  "center",
                ),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Meta protegida", "helper"),
                text: text(
                  formatCollectCurrency(
                    controller.sourcePayload.protectedGoalAmount,
                  ),
                  "h3",
                  "center",
                ),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Excedente", "helper"),
                text: text(
                  formatCollectCurrency(controller.sourcePayload.surplusAmount),
                  "h3",
                  "center",
                ),
                variant: "ghost",
              },
            },
          ],
        }),
      },
      {
        block: "Button",
        props: () => ({
          label: copy.buttonText ?? "Decidir qué hacer con mi excedente",
          onClick: controller.goToOpportunities,
        }),
      },
    ],
  };
}

function createNoSurplusSlot(controller) {
  const copy = controller.surplus.noSurplus;
  return {
    slotId: "noSurplus",
    area: "primary",
    areaClassName: PRESENTATION.primary,
    items: [
      { block: "Typography", props: { content: copy.title } },
      { block: "Typography", props: { content: copy.description } },
      {
        block: "Button",
        props: () => ({
          label: copy.buttonText ?? "Continuar",
          onClick: controller.finalizeSurplus,
        }),
      },
    ],
  };
}

function createOpportunitiesSlot(controller) {
  const copy = controller.surplus.opportunitiesSection;
  return {
    slotId: "surplusOpportunities",
    area: "primary",
    areaClassName: PRESENTATION.primary,
    items: [
      { block: "Typography", props: { content: copy.title } },
      { block: "Typography", props: { content: copy.description } },
      {
        block: "CollageCard",
        props: () => ({
          items: controller.surplus.opportunities,
          columns: 2,
          rows: 2,
          className: "min-h-[25rem]",
        }),
        renderProps: {
          renderItem: {
            block: "Card",
            props: (_payload, context) => {
              const opportunity = context.renderProp.value.item;
              return {
                title: text(opportunity.title, "h3", "center"),
                text: text(opportunity.possibleResult, "bodySm", "center"),
                media: opportunity.media,
                selected:
                  controller.selectedOpportunityId === opportunity.id,
                interaction: { type: "selectable" },
                onSelect: () => controller.selectOpportunity(opportunity),
                zoomable: false,
                className: PRESENTATION.opportunity,
              };
            },
          },
        },
      },
      {
        when: () => Boolean(controller.validationMessage),
        block: "Typography",
        props: { content: text(controller.validationMessage, "helper") },
      },
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          items: [
            {
              block: "Button",
              props: {
                label: copy.backButtonText ?? "Volver",
                variant: "simple",
                onClick: controller.goToIntro,
              },
            },
            {
              block: "Button",
              props: {
                label: copy.buttonText ?? "Continuar",
                onClick: controller.continueToDistribution,
                disabled: !controller.selectedOpportunity,
              },
            },
          ],
        }),
      },
    ],
  };
}

function createDistributionSlot(controller) {
  const opportunity = controller.selectedOpportunity;
  const requiredAmount = getRequiredAmount(opportunity);
  const remaining = Math.max(
    0,
    controller.sourcePayload.surplusAmount - requiredAmount,
  );
  const copy = controller.surplus.distributionSection;
  return {
    slotId: "surplusDistribution",
    area: "primary",
    areaClassName: PRESENTATION.primary,
    items: [
      { block: "Typography", props: { content: copy.title } },
      { block: "Typography", props: { content: copy.description } },
      {
        block: "Card",
        props: {
          title: text(opportunity?.title, "h2"),
          text: text(opportunity?.description, "body"),
          media: opportunity?.media,
          variant: "ghost",
          zoomable: false,
          className: PRESENTATION.summary,
        },
      },
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          items: [
            {
              block: "Card",
              props: {
                title: text("Monto necesario", "helper"),
                text: text(formatCollectCurrency(requiredAmount), "h3"),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Dinero sin usar", "helper"),
                text: text(formatCollectCurrency(remaining), "h3"),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Riesgo", "helper"),
                text: text(opportunity?.riskLabel ?? "-", "h3"),
                variant: "ghost",
              },
            },
          ],
        }),
      },
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          items: [
            {
              block: "Button",
              props: {
                label: copy.backButtonText ?? "Cambiar oportunidad",
                variant: "simple",
                onClick: controller.goBackToOpportunities,
              },
            },
            {
              block: "Button",
              props: {
                label: copy.buttonText ?? "Ver resultado",
                onClick: controller.resolveOpportunity,
              },
            },
          ],
        }),
      },
    ],
  };
}

function createResultSlot(controller) {
  const result = controller.surplusResult;
  const state = controller.surplus.states[result?.outcome] ?? {};
  return {
    slotId: "surplusResult",
    area: "primary",
    areaClassName: PRESENTATION.primary,
    items: [
      { block: "Typography", props: { content: controller.surplus.resultSection.title } },
      {
        block: "Card",
        props: {
          title: text(result?.title ?? state.label, "h2"),
          text: text(result?.message ?? state.description, "body"),
          variant: "ghost",
          className: PRESENTATION.summary,
        },
      },
      {
        block: "ComposeGroup",
        props: () => ({
          direction: "row",
          items: [
            {
              block: "Card",
              props: {
                title: text("Monto recuperado", "helper"),
                text: text(formatCollectCurrency(result?.returnedAmount), "h3"),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Ganancia", "helper"),
                text: text(formatCollectCurrency(result?.profitAmount), "h3"),
                variant: "ghost",
              },
            },
            {
              block: "Card",
              props: {
                title: text("Nuevo excedente", "helper"),
                text: text(
                  formatCollectCurrency(result?.finalSurplusAmount),
                  "h3",
                ),
                variant: "ghost",
              },
            },
          ],
        }),
      },
      {
        block: "Button",
        props: () => ({
          label:
            controller.surplus.resultSection.finalizeButtonText ??
            "Finalizar actividad",
          onClick: controller.finalizeSurplus,
        }),
      },
    ],
  };
}

function createSurplusSlot(controller) {
  const slots = {
    intro: createIntroSlot,
    noSurplus: createNoSurplusSlot,
    opportunities: createOpportunitiesSlot,
    distribution: createDistributionSlot,
    result: createResultSlot,
  };
  return (slots[controller.surplusStep] ?? createIntroSlot)(controller);
}

export function getCollectObjectsRuntime(controller) {
  return {
    ...COLLECT_OBJECTS_MISSION.runtime,
    slots: [
      createInformationSlot(controller),
      controller.mode === "falling"
        ? createFallingSlot(controller)
        : createSurplusSlot(controller),
    ],
    payload: controller,
  };
}
