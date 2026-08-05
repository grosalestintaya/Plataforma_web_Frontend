const DEFAULT_VARIANT = "decision";
const DEFAULT_CURRENCY_SYMBOL = "S/";

const VARIANT_BY_TEMPLATE = Object.freeze({
  decisionDailySpending: "decision",
  shopDailySpending: "shop",
  eventDailySpending: "event",
  assessmentDailySpending: "assessment",
  DailySpending: "decision",
});

// Adaptador para documentos anteriores a la estructura actual de vistas.
const LEGACY_VARIANT_BY_ENGINE = Object.freeze({
  commuteDecision: "decision",
  kioskCheckout: "shop",
  recycleDecision: "event",
  summary: "assessment",
});

function findCompound(view, targetType) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];

  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

function getLegacyDailyElement(view, data) {
  const fromDocument = findCompound(view, "dailySpending");
  return fromDocument ?? data?.dailySpending ?? null;
}

function normalizeTextNode(value, fallbackVariant = "label") {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return {
      text: String(value),
      variant: fallbackVariant,
      align: "center",
    };
  }

  return value;
}

function formatMoney(value, currencySymbol = DEFAULT_CURRENCY_SYMBOL) {
  return `${currencySymbol} ${Number(value ?? 0).toFixed(2)}`;
}

function normalizeChoiceItem(option, index, currencySymbol) {
  const cost =
    option?.cost !== undefined && option?.cost !== null
      ? Number(option.cost)
      : undefined;
  const reward =
    option?.reward !== undefined && option?.reward !== null
      ? Number(option.reward)
      : undefined;
  const amountText =
    option?.detail ??
    (cost !== undefined
      ? formatMoney(cost, currencySymbol)
      : reward !== undefined
        ? `+ ${formatMoney(reward, currencySymbol)}`
        : "");
  const detail =
    typeof amountText === "string" && amountText.length > 0
      ? {
          text: amountText,
          variant: "label",
          align: "center",
        }
      : null;

  return {
    id: option?.id ?? `choice-${index + 1}`,
    title: normalizeTextNode(option?.title ?? option?.label, "label"),
    text: detail,
    detail,
    media:
      option?.media ??
      option?.image ?? {
        src: option?.src,
        alt: option?.alt ?? "Opción",
      },
    interaction: option?.interaction ?? { type: "selectable" },
    feedback:
      option?.feedback ??
      (option?.reveal?.text
        ? {
            text: option.reveal.text,
            variant: "helper",
            align: "center",
          }
        : null),
    score: Number(option?.score ?? 100),
    nextBalance:
      option?.nextBalance !== undefined && option?.nextBalance !== null
        ? Number(option.nextBalance)
        : undefined,
    cost,
    reward,
    correct: option?.correct,
  };
}

function normalizeShopItem(item, index, currencySymbol) {
  const title =
    item?.title ??
    item?.label ??
    (item?.name
      ? {
          text: item.name,
          variant: "label",
          align: "center",
        }
      : null);
  const price = Number(item?.price ?? item?.value ?? 0);
  const text =
    item?.text ??
    (item?.name
      ? {
          text: formatMoney(price, currencySymbol),
          variant: "label",
          align: "center",
        }
      : null);

  return {
    id: item?.id ?? `product-${index + 1}`,
    title,
    text,
    media:
      item?.media ??
      item?.image ?? {
        src: item?.src,
        alt: item?.alt ?? item?.name,
      },
    interaction: item?.interaction,
    zoomable: item?.zoomable,
    price,
  };
}

function getChoiceItems(view, legacyElement, currencySymbol) {
  const chooseOne = findCompound(view, "chooseOne");
  const source =
    Array.isArray(chooseOne?.items) && chooseOne.items.length > 0
      ? chooseOne.items
      : legacyElement?.options;

  return Array.isArray(source)
    ? source.map((item, index) =>
        normalizeChoiceItem(item, index, currencySymbol),
      )
    : [];
}

function getShopItems(view, legacyElement, currencySymbol) {
  const collageCard = findCompound(view, "collageCard");
  const source =
    Array.isArray(collageCard?.items) && collageCard.items.length > 0
      ? collageCard.items
      : legacyElement?.products;

  return Array.isArray(source)
    ? source.map((item, index) =>
        normalizeShopItem(item, index, currencySymbol),
      )
    : [];
}

function getInitialMissionBalance(heroApi, fallbackBalance) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];

  for (const item of missionViews) {
    const amountValue = Number(item?.slots?.amount?.value);

    if (Number.isFinite(amountValue)) return amountValue;
  }

  return fallbackBalance;
}

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

    if (Number.isFinite(candidateBalance)) return candidateBalance;
  }

  return fallbackBalance;
}

function buildChoiceInteraction({ view, legacyElement, currencySymbol }) {
  return {
    choiceItems: getChoiceItems(view, legacyElement, currencySymbol),
  };
}

function buildShopInteraction({ view, data, legacyElement, currencySymbol }) {
  return {
    shopItems: getShopItems(view, legacyElement, currencySymbol),
    calculatorData:
      findCompound(view, "calculator") ?? data?.calculator ?? {},
  };
}

const VARIANT_MODEL_BUILDERS = Object.freeze({
  decision: buildChoiceInteraction,
  event: buildChoiceInteraction,
  assessment: buildChoiceInteraction,
  shop: buildShopInteraction,
});

function resolveVariant(view, requestedVariant, legacyElement) {
  const candidate =
    VARIANT_BY_TEMPLATE[view?.template] ??
    requestedVariant ??
    LEGACY_VARIANT_BY_ENGINE[legacyElement?.engineVariant] ??
    DEFAULT_VARIANT;

  return VARIANT_MODEL_BUILDERS[candidate] ? candidate : DEFAULT_VARIANT;
}

function matchesBranchRule(value, rule) {
  if (Array.isArray(rule?.includesAny)) {
    return (
      Array.isArray(value) &&
      rule.includesAny.some((candidate) => value.includes(candidate))
    );
  }

  if (rule?.includes !== undefined) {
    return Array.isArray(value) && value.includes(rule.includes);
  }

  if (rule?.notIncludes !== undefined) {
    return Array.isArray(value) && !value.includes(rule.notIncludes);
  }

  if (rule?.equals !== undefined) {
    return Array.isArray(value)
      ? value.length === 1 && value[0] === rule.equals
      : value === rule.equals;
  }

  if (rule?.notEquals !== undefined) {
    return value !== rule.notEquals;
  }

  return true;
}

export function calculateDecisionBalance(currentBalance, item) {
  if (!item) return Number(currentBalance ?? 0);

  if (item?.nextBalance !== undefined && item?.nextBalance !== null) {
    return Number(item.nextBalance);
  }

  return Number(
    (
      Number(currentBalance ?? 0) -
      Number(item?.cost ?? 0) +
      Number(item?.reward ?? 0)
    ).toFixed(2),
  );
}

export function persistDailySpendingResult(heroApi, viewId, result) {
  heroApi?.setInteractiveState?.(viewId, {
    type: "dailySpending",
    ...result,
  });
}

export function resolveDailySpendingNextViewId({
  heroApi,
  currentViewId,
  state,
}) {
  const missionViews = heroApi?.getMissionViews?.() ?? [];
  const currentIndex = missionViews.findIndex(
    (item) => (item?.id ?? item?.viewId) === currentViewId,
  );

  if (currentIndex < 0) return null;

  for (let index = currentIndex + 1; index < missionViews.length; index += 1) {
    const candidate = missionViews[index];
    const candidateId = candidate?.id ?? candidate?.viewId;
    const branchRule = candidate?.availability?.dependsOn ?? candidate?.when;
    const belongsToCurrentView = branchRule?.viewId === currentViewId;
    const stateKey = branchRule?.stateKey;

    if (belongsToCurrentView && stateKey) {
      if (matchesBranchRule(state?.[stateKey], branchRule)) {
        return candidateId;
      }

      continue;
    }

    return candidateId;
  }

  return null;
}

export function navigateAfterStateCommit(navigate) {
  if (typeof window === "undefined") {
    navigate?.();
    return;
  }

  window.requestAnimationFrame(() => {
    navigate?.();
  });
}

export function getDailySpendingModel({ view, data, heroApi, variant }) {
  const legacyElement = getLegacyDailyElement(view, data);
  const resolvedVariant = resolveVariant(view, variant, legacyElement);
  const viewId = view?.id ?? view?.viewId;
  const title = view?.slots?.title ?? data?.title;
  const amount =
    view?.slots?.amount ??
    data?.amount ?? {
      label: "Saldo",
      value: legacyElement?.balance ?? 0,
    };
  const assessment = view?.slots?.assessment ?? data?.assessment;
  const currencySymbol =
    amount?.currencySymbol ??
    amount?.currency ??
    legacyElement?.currencySymbol ??
    DEFAULT_CURRENCY_SYMBOL;
  const initialBalance = getInitialMissionBalance(
    heroApi,
    Number(legacyElement?.balance ?? amount?.value ?? 0),
  );
  const baseBalance = Number.isFinite(initialBalance) ? initialBalance : 0;
  const interaction = VARIANT_MODEL_BUILDERS[resolvedVariant]({
    view,
    data,
    legacyElement,
    currencySymbol,
  });

  return {
    variant: resolvedVariant,
    viewId,
    title,
    amount,
    situation: view?.slots?.situation ?? data?.situation ?? assessment,
    assessment,
    instruction: view?.slots?.instruction ?? data?.instruction,
    feedback: view?.slots?.feedback ?? data?.feedback,
    media: view?.slots?.media ?? data?.media,
    currencySymbol,
    currentBalance: getInheritedBalance(heroApi, viewId, baseBalance),
    ...interaction,
  };
}
