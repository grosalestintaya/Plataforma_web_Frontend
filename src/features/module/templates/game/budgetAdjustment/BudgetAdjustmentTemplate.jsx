import { startTransition, useEffect, useMemo, useState } from "react";
import {
  Apple,
  BadgeCheck,
  BriefcaseBusiness,
  Box,
  ClipboardList,
  Cookie,
  CupSoda,
  Flower2,
  GlassWater,
  HandCoins,
  PackageOpen,
  Paintbrush,
  PartyPopper,
  Recycle,
  ScrollText,
  Sparkles,
  Snowflake,
  Sprout,
  Tags,
  TriangleAlert,
  Truck,
  X,
} from "lucide-react";

import { cn } from "@/shared/libs/utils";
import guideMascot from "@/assets/mascots/guide.webp";
import Typography from "@/features/module/blocks/base/Typography";
import CardBase from "@/features/module/blocks/compounds/container/CardBase";
import CollageCard from "@/features/module/blocks/compounds/grouper/CollageCard";
import BalanceScale from "@/features/module/blocks/compounds/iteractive/BalanceScale";

const DEFAULT_BUDGET_DATA = {
  eyebrow: { text: "Proyecto emprendedor" },
  subtitle: { text: "Elabora el presupuesto de tu proyecto escolar" },
  coach: {
    feedback: {
      idle: {
        title: "Construye el presupuesto",
        text: "Selecciona las tarjetas necesarias y revisa la balanza.",
      },
      overBudget: {
        title: "Te pasaste del presupuesto",
        text: "Quita o cambia una tarjeta para recuperar saldo.",
      },
      missingEssential: {
        title: "Aun faltan gastos clave",
        text: "Falta una tarjeta necesaria o una alternativa obligatoria.",
      },
      good: {
        title: "Buen trabajo, tu presupuesto va bien",
        text: "Cubriste lo necesario y queda saldo.",
      },
      balanced: {
        title: "Vas equilibrando el presupuesto",
        text: "El presupuesto funciona, pero queda poco saldo.",
      },
    },
  },
  budget: {
    income: 80,
    targetBalanceMin: 10,
    essentialIds: ["frutas-insumos", "vasos"],
    items: [
      {
        id: "frutas-insumos",
        label: "Frutas e insumos",
        amount: 30,
        tag: "Necesario",
        hint: "Base del producto principal del proyecto.",
        variant: "sun",
      },
      {
        id: "vasos",
        label: "Vasos",
        amount: 12,
        tag: "Necesario",
        hint: "Sirven para entregar las porciones.",
        variant: "ocean",
      },
      {
        id: "cartel-a-mano",
        label: "Cartel a mano",
        amount: 4,
        tag: "Necesario",
        hint: "Cumple la funcion de avisar sin gastar tanto.",
        variant: "forest",
      },
    ],
  },
};

const STATE_COPY = {
  idle: {
    label: "Explorando",
    tone: "idle",
    icon: Sparkles,
    score: 0,
  },
  balanced: {
    label: "Equilibrado",
    tone: "balanced",
    icon: HandCoins,
    score: 60,
  },
  good: {
    label: "Bueno",
    tone: "good",
    icon: BadgeCheck,
    score: 100,
  },
  risk: {
    label: "Riesgo",
    tone: "risk",
    icon: TriangleAlert,
    score: 40,
  },
};

const PASSING_SCORE = 60;
const MAX_SCORE = 100;

const BUDGET_ITEM_ICON = {
  "frutas-insumos": Apple,
  vasos: CupSoda,
  hielo: Snowflake,
  cartel: ClipboardList,
  decoracion: PartyPopper,
  snacks: Cookie,
  "cartel-a-mano": ScrollText,
  "decoracion-simple": PartyPopper,
  botellas: GlassWater,
  etiquetas: Tags,
  plantas: Flower2,
  "tierra-abono": Sprout,
  "envases-reciclados": Recycle,
  "macetas-compradas": Box,
  "pinturas-basicas": Paintbrush,
  "kit-pintura": Paintbrush,
  "etiquetas-simples": Tags,
  "etiquetas-impresas": Tags,
  "decoracion-puesto": PartyPopper,
  "cajas-transporte": Truck,
};

const CARD_TONE_CLASS = {
  sun: "from-[#fff3c2] to-[#ffd36d] text-[#a64f00]",
  ocean: "from-[#dff6ff] to-[#93d9ff] text-[#115c9b]",
  sky: "from-[#e4f8ff] to-[#99e4ff] text-[#11649b]",
  rose: "from-[#ffe1ec] to-[#ff9fc1] text-[#b41855]",
  violet: "from-[#efe6ff] to-[#c8a9ff] text-[#4d25b6]",
  pumpkin: "from-[#fff0cf] to-[#ffbf74] text-[#aa4b00]",
  mint: "from-[#e1fff1] to-[#9af0c7] text-[#08724e]",
  forest: "from-[#efffda] to-[#bce982] text-[#3f7a19]",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function formatCurrency(value) {
  return `S/${Math.round(Number(value ?? 0))}`;
}

function resolveBudgetItemImage(item) {
  const media = item?.image ?? item?.media ?? null;
  const rawSrc = typeof media === "string" ? media : media?.src;
  const src = String(rawSrc ?? "").trim();

  if (!src) return null;

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/")
  ) {
    return {
      src,
      alt: typeof media === "object" ? media.alt : item.label,
    };
  }

  const normalizedSrc = src
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\/assets\/activity\//, "")
    .replace(/^assets\/activity\//, "")
    .replace(/^activity\//, "")
    .replace(/^assets\//, "");

  return {
    src: `/activity/${normalizedSrc}`,
    alt: typeof media === "object" ? media.alt : item.label,
  };
}

function getStatusScore(statusKey) {
  return STATE_COPY[statusKey]?.score ?? 0;
}

function isPassingScore(score) {
  return Number(score ?? 0) >= PASSING_SCORE;
}

function getAverageScore(results) {
  if (!results.length) return 0;

  const totalScore = results.reduce((sum, result) => {
    return sum + Number(result.score ?? getStatusScore(result.status));
  }, 0);

  return clamp(Math.round(totalScore / results.length), 0, MAX_SCORE);
}

function interpolateCopy(text, replacements) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (_, key) => {
    return replacements[key] ?? "";
  });
}

function normalizeCoachCopy(copy, fallback, replacements) {
  const source = copy ?? fallback;
  const title = typeof source?.title === "string" ? source.title : source?.title?.text;
  const text =
    typeof source?.text === "string"
      ? source.text
      : source?.text?.paragraphs?.join(" ") ?? source?.text?.text;
  const fallbackTitle =
    typeof fallback?.title === "string" ? fallback.title : fallback?.title?.text;
  const fallbackText =
    typeof fallback?.text === "string"
      ? fallback.text
      : fallback?.text?.paragraphs?.join(" ") ?? fallback?.text?.text;

  return {
    title: interpolateCopy(title ?? fallbackTitle, replacements),
    text: interpolateCopy(text ?? fallbackText, replacements),
  };
}

function getViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

function mergeBudgetData(data) {
  const defaultBudget = DEFAULT_BUDGET_DATA.budget;
  const incomingBudget = data?.budget ?? {};

  return {
    ...DEFAULT_BUDGET_DATA,
    ...data,
    coach: {
      ...DEFAULT_BUDGET_DATA.coach,
      ...(data?.coach ?? {}),
      feedback: {
        ...DEFAULT_BUDGET_DATA.coach.feedback,
        ...(data?.coach?.feedback ?? {}),
      },
    },
    budget: {
      ...defaultBudget,
      ...incomingBudget,
      items: Array.isArray(incomingBudget.items)
        ? incomingBudget.items
        : defaultBudget.items,
    },
  };
}

function resolveBudgetState({
  income,
  total,
  balance,
  selectedCount,
  essentialIds,
  requiredGroups = [],
  exclusiveGroups = [],
  selectedIdSet,
  targetBalanceMin,
}) {
  if (!selectedCount) {
    return {
      key: "idle",
      ...STATE_COPY.idle,
    };
  }

  const missingEssential = essentialIds.some((id) => !selectedIdSet.has(id));
  const missingRequiredGroup = requiredGroups.some((group) => {
    const selectedInGroup = group.ids.filter((id) => selectedIdSet.has(id));
    return selectedInGroup.length < Number(group.min ?? 1);
  });
  const incompatibleGroup = [...requiredGroups, ...exclusiveGroups].some(
    (group) => {
      const selectedInGroup = group.ids.filter((id) => selectedIdSet.has(id));
      return selectedInGroup.length > Number(group.max ?? 1);
    },
  );

  if (
    total > income ||
    missingEssential ||
    missingRequiredGroup ||
    incompatibleGroup
  ) {
    return {
      key: "risk",
      ...STATE_COPY.risk,
    };
  }

  if (balance >= targetBalanceMin) {
    return {
      key: "good",
      ...STATE_COPY.good,
    };
  }

  return {
    key: "balanced",
    ...STATE_COPY.balanced,
  };
}

function buildCoachFeedback({
  status,
  balance,
  selectedCount,
  missingEssentialCount,
  feedbackCopy,
}) {
  let feedbackKey = "balanced";

  if (!selectedCount) {
    feedbackKey = "idle";
  } else if (status.key === "risk" && balance < 0) {
    feedbackKey = "overBudget";
  } else if (status.key === "risk" && missingEssentialCount > 0) {
    feedbackKey = "missingEssential";
  } else if (status.key === "good") {
    feedbackKey = "good";
  }

  return normalizeCoachCopy(
    feedbackCopy?.[feedbackKey],
    DEFAULT_BUDGET_DATA.coach.feedback[feedbackKey],
    { balance: formatCurrency(balance) },
  );
}

function BudgetProductCard({
  item,
  onClick,
  ariaLabel,
  compact = false,
  revealLabel = false,
  useImage = false,
  className = "",
}) {
  const ItemIcon = BUDGET_ITEM_ICON[item.id] ?? PackageOpen;
  const itemImage = useImage ? resolveBudgetItemImage(item) : null;
  const toneClass = CARD_TONE_CLASS[item.variant] ?? CARD_TONE_CLASS.sun;
  const resolvedAriaLabel =
    ariaLabel ?? `Seleccionar ${item.label} por ${formatCurrency(item.amount)}`;

  return (
    <CardBase
      media={
        itemImage
          ? {
              src: itemImage.src,
              alt: itemImage.alt ?? item.label,
              variant: "square",
              mode: "contain",
            }
          : null
      }
      title={null}
      variant="ghost"
      interactive={Boolean(onClick)}
      className={cn(
        "group h-full min-h-0 overflow-visible rounded-[clamp(0.8rem,1.5vw,1.15rem)] border-[clamp(2px,0.28vw,4px)] border-[#0d5f8c] bg-[linear-gradient(180deg,#fff8df_0%,#f8e9c8_100%)] p-[clamp(0.18rem,0.45vw,0.32rem)] text-white shadow-[0_16px_22px_rgba(84,45,0,0.18)]",
        compact &&
          "rounded-[clamp(0.55rem,1.4vw,0.78rem)] border-[clamp(1px,0.2vw,2px)] p-[clamp(0.12rem,0.35vw,0.2rem)] shadow-[0_8px_14px_rgba(0,0,0,0.2)]",
        className,
      )}
      contentClassName="h-full min-h-0"
      overlay={
        <>
          {!itemImage ? (
            <div className="pointer-events-none absolute inset-[clamp(0.45rem,1.1vw,0.75rem)] z-10 flex items-center justify-center rounded-[clamp(0.65rem,1.4vw,0.95rem)] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.96)_0%,rgba(255,242,189,0.86)_48%,rgba(190,236,223,0.72)_100%)] shadow-[inset_0_2px_8px_rgba(255,255,255,0.58)]">
              <ItemIcon
                aria-hidden="true"
                className={cn(
                  "h-[clamp(2.2rem,7vh,4.8rem)] w-[clamp(2.2rem,7vh,4.8rem)] drop-shadow-[0_8px_8px_rgba(0,0,0,0.16)] transition duration-200 group-hover:scale-110",
                  compact &&
                    "h-[clamp(1.45rem,4.4vh,2.85rem)] w-[clamp(1.45rem,4.4vh,2.85rem)]",
                  toneClass,
                )}
                strokeWidth={2.35}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "pointer-events-none absolute -right-[clamp(0.35rem,0.8vw,0.55rem)] -top-[clamp(0.35rem,0.8vw,0.55rem)] z-30 flex h-[clamp(2.35rem,5.2vw,3.7rem)] w-[clamp(2.35rem,5.2vw,3.7rem)] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#30d66f_0%,#07933e_72%)] text-[clamp(0.72rem,1.75vw,1.12rem)] font-black leading-none text-white shadow-[0_10px_18px_rgba(0,104,46,0.32)] ring-2 ring-[#b8ffc9]/45",
              compact &&
                "-right-[clamp(0.18rem,0.6vw,0.35rem)] -top-[clamp(0.18rem,0.6vw,0.35rem)] h-[clamp(1.55rem,4vw,2.25rem)] w-[clamp(1.55rem,4vw,2.25rem)] text-[clamp(0.52rem,1.35vw,0.78rem)]",
            )}
          >
            {formatCurrency(item.amount)}
          </div>

          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-40 bg-black/42 px-[clamp(0.25rem,0.8vw,0.5rem)] py-[clamp(0.28rem,0.8vw,0.5rem)] text-center text-[clamp(0.74rem,1.85vw,1.18rem)] font-black leading-tight text-white backdrop-blur-[1px] transition duration-200",
              revealLabel
                ? "translate-y-[72%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                : "translate-y-0 opacity-100",
              compact &&
                "px-1 py-[clamp(0.18rem,0.5vw,0.32rem)] text-[clamp(0.48rem,1.2vw,0.68rem)]",
            )}
          >
            {item.label}
          </div>

          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              aria-label={resolvedAriaLabel}
              className="absolute inset-0 z-20 rounded-[inherit] bg-transparent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fff2a3]/85"
            />
          ) : null}
        </>
      }
    />
  );
}

function ExpenseStackModal({ open, items, total, onClose, onRemove }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#211100]/65 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-stack-title"
        className="relative flex max-h-[min(42rem,88vh)] w-full max-w-[48rem] flex-col overflow-hidden rounded-[1.6rem] border border-[#ffcf5c]/80 bg-[radial-gradient(circle_at_top,#ffe38a_0%,#f7a91c_46%,#d97800_100%)] p-[clamp(0.75rem,2vw,1rem)] text-[#552800] shadow-[0_26px_70px_rgba(55,20,0,0.42)]"
      >
        <div className="mb-3 flex shrink-0 items-start justify-between gap-3 rounded-[1.1rem] border border-[#d58900]/55 bg-[linear-gradient(180deg,rgba(255,239,147,0.95),rgba(255,198,54,0.9))] px-4 py-3">
          <div className="min-w-0">
            <h2
              id="expense-stack-title"
              className="text-[clamp(1.1rem,2.4vw,1.55rem)] font-black leading-tight"
            >
              Gastos seleccionados
            </h2>
            <p className="mt-1 text-[clamp(0.75rem,1.5vw,0.9rem)] font-bold leading-tight text-[#7a3a00]">
              Revisa las tarjetas colocadas. Haz click en una tarjeta para retirarla.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ad6a00]/45 bg-white/45 text-[#6d3500] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:scale-105 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
            aria-label="Cerrar lista de gastos"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 flex shrink-0 items-center justify-between gap-3 rounded-[1rem] border border-white/35 bg-[#3b176c]/90 px-4 py-3 text-white">
          <span className="text-sm font-black uppercase tracking-[0.05em]">
            Total de gastos
          </span>
          <span className="text-[clamp(1.35rem,3vw,2rem)] font-black leading-none">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="min-h-0 overflow-y-auto rounded-[1.15rem] border border-[#bd7400]/45 bg-[linear-gradient(180deg,rgba(255,225,112,0.38),rgba(255,164,23,0.16))] p-3">
          {items.length ? (
            <div className="grid auto-rows-[clamp(7.5rem,20vh,10rem)] grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-3">
              {items.map((item) => (
                <BudgetProductCard
                  key={item.id}
                  item={item}
                  ariaLabel={`Retirar ${item.label} de gastos`}
                  onClick={() => onRemove?.(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[8rem] items-center justify-center rounded-[1rem] border border-dashed border-[#9b5d00]/45 bg-white/25 px-4 text-center text-sm font-bold text-[#6d3500]">
              Todavia no seleccionaste gastos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailableBudgetBoard({ items, onSelect }) {
  return (
    <CollageCard
      items={items}
      columns={4}
      rows={3}
      slotCount={12}
      className="h-full min-h-0 rounded-[1.45rem] border border-[#d18800]/60 bg-[linear-gradient(180deg,rgba(255,214,75,0.4),rgba(255,173,29,0.14))] p-[clamp(0.45rem,1vh,0.65rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
      gridClassName="h-full min-h-0 gap-[clamp(0.35rem,1.1vh,0.62rem)] auto-rows-fr"
      slotClassName="p-0 min-h-0"
      emptySlotClassName="min-h-0 rounded-[clamp(0.8rem,1.5vw,1.15rem)] border-[#d18800]/25 bg-white/5"
      renderItem={({ item }) => (
        <BudgetProductCard
          item={item}
          onClick={() => onSelect?.(item.id)}
          revealLabel
        />
      )}
    />
  );
}

export default function BudgetAdjustmentTemplate({ view, heroApi, data }) {
  const resolvedData = useMemo(() => mergeBudgetData(data), [data]);
  const viewId = getViewId(view);
  const situations = useMemo(() => {
    return Array.isArray(resolvedData.budget.situations) &&
      resolvedData.budget.situations.length
      ? resolvedData.budget.situations
      : [resolvedData.budget];
  }, [resolvedData.budget]);
  const [situationIndex, setSituationIndex] = useState(0);
  const activeSituation = situations[situationIndex] ?? situations[0];
  const items = activeSituation.items ?? [];
  const essentialIds = activeSituation.essentialIds ?? [];
  const requiredGroups = activeSituation.requiredGroups ?? [];
  const exclusiveGroups = activeSituation.exclusiveGroups ?? [];
  const income = Number(activeSituation.income ?? 0);
  const targetBalanceMin = Number(activeSituation.targetBalanceMin ?? 0);
  const isLastSituation = situationIndex >= situations.length - 1;
  const initialIncomeCard = useMemo(
    () => [
      {
        id: "ingreso-base",
        label: "Ingreso inicial",
        amount: income,
        variant: "forest",
        image: {
          src: "1/recibir-dinero.webp",
          alt: "Ingreso inicial",
        },
      },
    ],
    [income],
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [reviewedSignature, setReviewedSignature] = useState(null);
  const [reviewedOutcome, setReviewedOutcome] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [situationResults, setSituationResults] = useState([]);
  const [isExpenseStackOpen, setIsExpenseStackOpen] = useState(false);

  useEffect(() => {
    const storedState = heroApi?.getInteractiveState?.(viewId);
    const storedSituationIndex = Number(
      storedState?.payload?.workflow?.situationIndex ?? 0,
    );
    const safeSituationIndex = clamp(
      storedSituationIndex,
      0,
      Math.max(situations.length - 1, 0),
    );
    const safeItems = situations[safeSituationIndex]?.items ?? [];
    const nextSelectedIds = Array.isArray(storedState?.selectedProductIds)
      ? storedState.selectedProductIds.filter((id) =>
          safeItems.some((item) => item.id === id),
        )
      : [];
    const workflow = storedState?.payload?.workflow ?? {};

    setSituationIndex(safeSituationIndex);
    setSelectedIds(nextSelectedIds);
    setReviewedSignature(workflow.reviewedSignature ?? null);
    setReviewedOutcome(workflow.reviewedOutcome ?? null);
    setIsFinalized(Boolean(workflow.isFinalized));
    setSituationResults(
      Array.isArray(workflow.situationResults) ? workflow.situationResults : [],
    );
  }, [heroApi, situations, viewId]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const { selectedItems, availableItems } = useMemo(() => {
    const selected = [];
    const available = [];

    items.forEach((item) => {
      (selectedIdSet.has(item.id) ? selected : available).push(item);
    });

    return { selectedItems: selected, availableItems: available };
  }, [items, selectedIdSet]);
  const total = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [selectedItems],
  );
  const balance = income - total;
  const validationIssueCount = useMemo(() => {
    const missingEssentialCount = essentialIds.filter(
      (id) => !selectedIdSet.has(id),
    ).length;
    const missingRequiredGroupCount = requiredGroups.filter((group) => {
      const selectedInGroup = group.ids.filter((id) => selectedIdSet.has(id));
      return selectedInGroup.length < Number(group.min ?? 1);
    }).length;
    const incompatibleGroupCount = [...requiredGroups, ...exclusiveGroups].filter(
      (group) => {
        const selectedInGroup = group.ids.filter((id) => selectedIdSet.has(id));
        return selectedInGroup.length > Number(group.max ?? 1);
      },
    ).length;

    return missingEssentialCount + missingRequiredGroupCount + incompatibleGroupCount;
  }, [essentialIds, exclusiveGroups, requiredGroups, selectedIdSet]);
  const currentSignature = useMemo(
    () => [...selectedIds].sort().join("|"),
    [selectedIds],
  );
  const budgetState = useMemo(
    () =>
      resolveBudgetState({
        income,
        total,
        balance,
        selectedCount: selectedIds.length,
        essentialIds,
        requiredGroups,
        exclusiveGroups,
        selectedIdSet,
        targetBalanceMin,
      }),
    [
      balance,
      essentialIds,
      exclusiveGroups,
      income,
      requiredGroups,
      selectedIdSet,
      targetBalanceMin,
      total,
    ],
  );
  const actionModel = useMemo(() => {
    if (
      isFinalized &&
      reviewedSignature === currentSignature &&
      isPassingScore(budgetState.score)
    ) {
      return {
        label: "Mision finalizada",
        tone: "done",
        action: "done",
        disabled: true,
      };
    }

    if (
      reviewedSignature === currentSignature &&
      isPassingScore(getStatusScore(reviewedOutcome))
    ) {
      return {
        label: isLastSituation ? "Finalizar mision" : "Siguiente situacion",
        tone: isLastSituation ? "success" : "review",
        action: isLastSituation ? "finalize" : "nextSituation",
        disabled: false,
      };
    }

    if (reviewedSignature === currentSignature && reviewedOutcome === "risk") {
      return {
        label: "Realizar ajustes",
        tone: "warning",
        action: "adjust",
        disabled: false,
      };
    }

    return {
      label: "Revisar presupuesto",
      tone: "review",
      action: "review",
      disabled: false,
    };
  }, [
    budgetState.score,
    currentSignature,
    isFinalized,
    isLastSituation,
    reviewedOutcome,
    reviewedSignature,
  ]);
  const coachFeedback = useMemo(
    () =>
      buildCoachFeedback({
        status: budgetState,
        balance,
        selectedCount: selectedIds.length,
        missingEssentialCount: validationIssueCount,
        feedbackCopy: activeSituation.coach?.feedback ?? resolvedData.coach?.feedback,
      }),
    [
      activeSituation.coach?.feedback,
      balance,
      budgetState,
      resolvedData.coach?.feedback,
      selectedIds.length,
      validationIssueCount,
    ],
  );

  const currentSituationResult = useMemo(
    () => ({
      situationId: activeSituation.id,
      income,
      total,
      balance,
      score: budgetState.score,
      status: budgetState.key,
      selectedProductIds: selectedIds,
    }),
    [
      activeSituation.id,
      balance,
      budgetState.key,
      budgetState.score,
      income,
      selectedIds,
      total,
    ],
  );
  const scoredSituationResults = useMemo(() => {
    const previousResults = situationResults.filter(
      (result) => result.situationId !== activeSituation.id,
    );
    return isFinalized
      ? [...previousResults, currentSituationResult]
      : situationResults;
  }, [
    activeSituation.id,
    currentSituationResult,
    isFinalized,
    situationResults,
  ]);
  const missionScore = isFinalized
    ? getAverageScore(scoredSituationResults)
    : budgetState.score;

  useEffect(() => {
    if (!selectedIds.length) {
      setReviewedSignature(null);
      setReviewedOutcome(null);
      setIsFinalized(false);
      setIsExpenseStackOpen(false);
      return;
    }

    if (
      isFinalized &&
      reviewedSignature &&
      reviewedSignature !== currentSignature
    ) {
      setIsFinalized(false);
    }
  }, [currentSignature, isFinalized, reviewedSignature, selectedIds.length]);

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      type: "budgetAdjustment",
      completed:
        isFinalized &&
        isPassingScore(missionScore) &&
        reviewedSignature === currentSignature,
      score: missionScore,
      balance,
      total,
      selectedProductIds: selectedIds,
      payload: {
        status: budgetState.key,
        situationId: activeSituation.id,
        selectedItems,
        income,
        targetBalanceMin,
        workflow: {
          situationIndex,
          situationResults: scoredSituationResults,
          reviewedSignature,
          reviewedOutcome,
          isFinalized,
        },
      },
    });
  }, [
    balance,
    budgetState.key,
    budgetState.score,
    currentSignature,
    heroApi,
    income,
    isFinalized,
    missionScore,
    reviewedOutcome,
    reviewedSignature,
    scoredSituationResults,
    selectedIds,
    selectedItems,
    activeSituation.id,
    situationIndex,
    targetBalanceMin,
    total,
    viewId,
  ]);

  function toggleSelection(itemId) {
    startTransition(() => {
      setSelectedIds((current) =>
        current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId],
      );
    });
  }

  function handleActionButton() {
    if (actionModel.action === "review") {
      setReviewedSignature(currentSignature);
      setReviewedOutcome(budgetState.key);
      setIsFinalized(false);
      return;
    }

    if (actionModel.action === "adjust") {
      setReviewedSignature(null);
      setReviewedOutcome(null);
      setIsFinalized(false);
      return;
    }

    if (actionModel.action === "nextSituation") {
      setSituationResults((current) => [...current, currentSituationResult]);
      setSituationIndex((current) => Math.min(current + 1, situations.length - 1));
      setSelectedIds([]);
      setReviewedSignature(null);
      setReviewedOutcome(null);
      setIsFinalized(false);
      return;
    }

    if (actionModel.action === "finalize") {
      setSituationResults((current) => {
        const withoutCurrent = current.filter(
          (result) => result.situationId !== activeSituation.id,
        );
        return [...withoutCurrent, currentSituationResult];
      });
      setReviewedSignature(currentSignature);
      setReviewedOutcome(budgetState.key);
      setIsFinalized(true);
    }
  }

  return (
    <>
      <section className="mx-auto flex h-full w-full max-w-[82rem] flex-col overflow-hidden px-2 py-2 text-white lg:min-h-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#ffcf5c]/70 bg-[radial-gradient(circle_at_top,rgba(255,229,122,0.95),rgba(255,184,18,0.98)_36%,rgba(236,147,3,0.98)_100%)] p-3 shadow-[0_22px_52px_rgba(103,48,0,0.22)] lg:flex-1 lg:min-h-0">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,247,193,0.42),transparent_72%)]" />
        <div className="pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,244,179,0.22),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-12 bottom-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,191,95,0.28),transparent_72%)]" />

        <div className="relative grid h-full min-h-0 min-w-0 gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:overflow-hidden">
          <div className="grid min-h-0 min-w-0">
            <div className="rounded-[1.7rem] border border-[#d58f00]/65 bg-[linear-gradient(180deg,rgba(255,219,97,0.42),rgba(255,179,42,0.18))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] lg:flex lg:min-h-0 lg:flex-col">
              <div className="mb-3 grid shrink-0 gap-2">
                <div className="flex items-center justify-center gap-3 rounded-[1.1rem] border border-[#ffcc6a]/80 bg-[linear-gradient(180deg,#f58017_0%,#d95d06_100%)] px-4 py-2 text-center shadow-[inset_0_2px_0_rgba(255,255,255,0.24)]">
                  <BriefcaseBusiness className="h-5 w-5 shrink-0 text-white" />
                  <Typography
                    content={{
                      text:
                        activeSituation.projectName ??
                        resolvedData.eyebrow?.text ??
                        "Proyecto emprendedor",
                      variant: "label",
                      align: "center",
                      color: "primary",
                      clamp: 1,
                    }}
                    className="text-[clamp(1rem,0.96rem+0.38vw,1.45rem)] font-extrabold uppercase tracking-[0.03em]"
                  />
                </div>

                <div className="rounded-[1rem] border border-[#d79c16]/75 bg-[linear-gradient(180deg,rgba(255,217,95,0.96),rgba(246,184,29,0.92))] px-4 py-2 text-[#6e3600] shadow-[inset_0_2px_0_rgba(255,255,255,0.28)]">
                  <Typography
                    content={{
                      text:
                        activeSituation.prompt ??
                        resolvedData.subtitle?.text ??
                        "Elabora el presupuesto de tu proyecto escolar",
                      variant: "h3",
                      align: "left",
                      clamp: 2,
                    }}
                    className="text-[clamp(1.05rem,1rem+0.52vw,1.55rem)] font-black leading-tight text-[#6e3600]"
                  />
                </div>
              </div>

              <div className="min-h-0 min-w-0 lg:flex-1">
                {availableItems.length ? (
                  <AvailableBudgetBoard
                    items={availableItems}
                    onSelect={toggleSelection}
                  />
                ) : (
                  <div className="flex h-full min-h-[11rem] items-center justify-center rounded-[1.3rem] border border-dashed border-[#c47900]/55 bg-white/12 px-4 text-center text-sm text-[#6d3400]">
                    Ya colocaste todas las tarjetas en el presupuesto. Revisa si
                    el saldo sigue siendo saludable.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1.5fr)_minmax(0,4fr)] gap-3">
            <div className="min-h-0 overflow-hidden rounded-[1.7rem] border border-[#edbb4f]/60 bg-[linear-gradient(180deg,rgba(255,208,79,0.52),rgba(255,170,32,0.18))] p-[clamp(0.45rem,1vh,0.75rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <div className="grid h-full min-h-0 grid-cols-[clamp(4.35rem,17%,6.25rem)_minmax(0,1fr)] items-stretch gap-[clamp(0.45rem,1vw,0.75rem)]">
                <div className="min-h-0 overflow-hidden rounded-[1.2rem] border border-[#946fff]/55 bg-[radial-gradient(circle_at_top,#885dff_0%,#5628d6_70%,#3b1ca1_100%)] p-[clamp(0.35rem,0.8vh,0.55rem)] shadow-[0_14px_28px_rgba(72,28,189,0.24)]">
                  <div className="flex h-full w-full items-center justify-center rounded-[1rem] border border-white/18 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.02)_72%)] p-1">
                    <img
                      src={guideMascot}
                      alt="Personaje guia del presupuesto"
                      className="h-full max-h-[clamp(3.1rem,11vh,5.9rem)] w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="flex min-h-0 min-w-0 flex-col justify-center overflow-hidden rounded-[1.25rem] border border-[#d79c16]/70 bg-[linear-gradient(180deg,rgba(255,216,97,0.98),rgba(245,185,33,0.92))] px-[clamp(0.65rem,1.4vw,1rem)] py-[clamp(0.45rem,1vh,0.75rem)] text-[#5f2e00] shadow-[inset_0_2px_0_rgba(255,255,255,0.28)]">
                  <Typography
                    content={{
                      text: coachFeedback.title,
                      variant: "h3",
                      align: "left",
                      clamp: 2,
                    }}
                    className="text-[clamp(0.9rem,1.45vw,1.28rem)] font-black leading-[1.05] text-[#5f2e00]"
                  />
                  <Typography
                    content={{
                      text: coachFeedback.text,
                      variant: "bodySm",
                      align: "left",
                      clamp: 3,
                    }}
                    className="mt-[clamp(0.25rem,0.7vh,0.5rem)] text-[clamp(0.68rem,1.12vw,0.9rem)] font-semibold leading-[1.22] text-[#6f3400]"
                  />
                </div>
              </div>
            </div>

            <BalanceScale
              income={income}
              expenses={total}
              balance={balance}
              incomeItems={initialIncomeCard}
              expenseItems={selectedItems.slice(-4).map((item) => ({
                ...item,
                variant: "rose",
              }))}
              status={budgetState}
              actionModel={actionModel}
              onAction={handleActionButton}
              onOpenExpenseStack={() => setIsExpenseStackOpen(true)}
              renderStackItem={({ item, isExpense, onOpenStack }) => (
                <BudgetProductCard
                  item={item}
                  ariaLabel={
                    isExpense
                      ? "Abrir gastos seleccionados"
                      : `${item.label} en la balanza`
                  }
                  onClick={
                    isExpense && onOpenStack
                      ? (event) => {
                          event.stopPropagation();
                          onOpenStack();
                        }
                      : undefined
                  }
                  compact
                  revealLabel
                  className="h-full w-full"
                />
              )}
            />
          </div>
        </div>
      </div>
      </section>

      <ExpenseStackModal
        open={isExpenseStackOpen}
        items={selectedItems}
        total={total}
        onClose={() => setIsExpenseStackOpen(false)}
        onRemove={toggleSelection}
      />
    </>
  );
}
