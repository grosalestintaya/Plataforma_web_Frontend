import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Typography from "@/features/module/blocks/base/Typography";
import { cn } from "@/shared/libs/utils";

const DEFAULT_STAGE_DATA = {
  intro: {
    title: {
      text: "Meta asegurada",
      variant: "h1",
      align: "left",
    },
    description: {
      text: "Primero proteges el dinero de tu meta. Si te sobra un excedente, puedes decidir si guardarlo, hacerlo crecer o usar una parte en un gasto que puede esperar.",
      variant: "body",
      align: "left",
    },
    buttonText: "Decidir que hacer con mi excedente",
  },
  noSurplus: {
    title: {
      text: "Meta alcanzada",
      variant: "h2",
      align: "center",
    },
    description: {
      text: "Ya protegiste el dinero de tu meta. Esta vez no quedo dinero extra para decidir que hacer con el.",
      variant: "body",
      align: "center",
    },
    buttonText: "Continuar",
  },
  opportunitiesSection: {
    title: {
      text: "Oportunidades disponibles",
      variant: "h2",
      align: "left",
    },
    description: {
      text: "Compara monto necesario, tiempo, posible resultado y riesgo antes de elegir.",
      variant: "bodySm",
      align: "left",
    },
    buttonText: "Continuar con esta opcion",
    backButtonText: "Volver",
  },
  distributionSection: {
    title: {
      text: "Distribucion del excedente",
      variant: "h2",
      align: "left",
    },
    description: {
      text: "Reparte el dinero extra entre respaldo, oportunidad y un gasto que puede esperar.",
      variant: "bodySm",
      align: "left",
    },
    helperText: {
      text: "Puedes ajustar los montos antes de ver el resultado.",
      variant: "bodySm",
      align: "left",
    },
    buttonText: "Ver resultado",
    backButtonText: "Cambiar oportunidad",
    warningText: "Estas usando todo tu excedente. Podrias guardar una parte como respaldo antes de continuar.",
  },
  resultSection: {
    title: {
      text: "Resultado",
      variant: "h2",
      align: "left",
    },
    finalizeButtonText: "Finalizar actividad",
    replayButtonText: "Intentar otra distribucion",
  },
  summary: {
    surplusLabel: "Excedente disponible",
    backupLabel: "Respaldo",
    investmentLabel: "Oportunidad",
    optionalExpenseLabel: "Gasto extra",
    unusedLabel: "Dinero sin usar",
    selectedOpportunityLabel: "Oportunidad elegida",
    minAmountLabel: "Monto necesario",
    durationLabel: "Tiempo",
    resultLabel: "Posible resultado",
    riskLabel: "Riesgo",
    returnedLabel: "Monto recuperado",
    profitLabel: "Ganancia",
    finalSurplusLabel: "Nuevo dinero extra disponible",
    immediateLabel: "Inmediato",
    weekSingular: "semana",
    weekPlural: "semanas",
  },
  states: {
    safe: {
      label: "Protegido",
      description: "Conservaste tu excedente disponible.",
      tone: "safe",
    },
    balanced: {
      label: "En crecimiento",
      description: "Tu dinero puede crecer, pero requiere tiempo.",
      tone: "balanced",
    },
    good: {
      label: "Decision equilibrada",
      description: "Protegiste una parte e invertiste otra con criterio.",
      tone: "good",
    },
    risk: {
      label: "En riesgo",
      description: "La oportunidad no era clara o usaste demasiado excedente.",
      tone: "risk",
    },
  },
  opportunities: [],
};

const OUTCOME_TONE = {
  safe: {
    wrapper:
      "border-[#7cd7a7]/45 bg-[linear-gradient(180deg,rgba(31,128,92,0.22),rgba(19,87,67,0.14))] text-[#dffff0]",
    badge: "bg-[#2ac27d] text-white",
    icon: ShieldCheck,
  },
  balanced: {
    wrapper:
      "border-[#7fc3ff]/45 bg-[linear-gradient(180deg,rgba(40,120,206,0.24),rgba(27,76,146,0.14))] text-[#e4f3ff]",
    badge: "bg-[#409cff] text-white",
    icon: Sparkles,
  },
  good: {
    wrapper:
      "border-[#ffd97a]/45 bg-[linear-gradient(180deg,rgba(255,186,62,0.24),rgba(171,92,0,0.14))] text-[#fff3d4]",
    badge: "bg-[#ffb11f] text-[#6b3b00]",
    icon: BadgeCheck,
  },
  risk: {
    wrapper:
      "border-[#ffae97]/45 bg-[linear-gradient(180deg,rgba(204,88,54,0.24),rgba(117,35,18,0.16))] text-[#ffe8e1]",
    badge: "bg-[#ff7c5b] text-white",
    icon: AlertTriangle,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function toNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function formatCurrency(value) {
  return `S/. ${Number(value ?? 0).toFixed(2)}`;
}

function resolveAssetSrc(src) {
  const raw = String(src ?? "").trim();
  if (!raw) return "";

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/")
  ) {
    return raw;
  }

  const normalized = raw
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\/assets\/activity\//, "")
    .replace(/^assets\/activity\//, "")
    .replace(/^activity\//, "")
    .replace(/^assets\//, "");

  return `/activity/${normalized}`;
}

function mergeStageData(data) {
  return {
    ...DEFAULT_STAGE_DATA,
    ...data,
    intro: {
      ...DEFAULT_STAGE_DATA.intro,
      ...(data?.intro ?? {}),
    },
    noSurplus: {
      ...DEFAULT_STAGE_DATA.noSurplus,
      ...(data?.noSurplus ?? {}),
    },
    opportunitiesSection: {
      ...DEFAULT_STAGE_DATA.opportunitiesSection,
      ...(data?.opportunitiesSection ?? {}),
    },
    distributionSection: {
      ...DEFAULT_STAGE_DATA.distributionSection,
      ...(data?.distributionSection ?? {}),
    },
    resultSection: {
      ...DEFAULT_STAGE_DATA.resultSection,
      ...(data?.resultSection ?? {}),
    },
    summary: {
      ...DEFAULT_STAGE_DATA.summary,
      ...(data?.summary ?? {}),
    },
    states: {
      ...DEFAULT_STAGE_DATA.states,
      ...(data?.states ?? {}),
    },
    opportunities:
      Array.isArray(data?.opportunities) && data.opportunities.length
        ? data.opportunities
        : DEFAULT_STAGE_DATA.opportunities,
  };
}

function getRequiredAmount(opportunity) {
  return Math.max(
    0,
    toNumber(opportunity?.requiredAmount, opportunity?.minAmount ?? 0),
  );
}

function getSuggestedAllocation(opportunity, surplusAmount) {
  if (!opportunity) {
    return {
      backupAmount: 0,
      investmentAmount: 0,
      optionalExpenseAmount: 0,
    };
  }

  const requiredAmount = Math.min(getRequiredAmount(opportunity), surplusAmount);

  if (opportunity.type === "save") {
    return {
      backupAmount: requiredAmount,
      investmentAmount: 0,
      optionalExpenseAmount: 0,
    };
  }

  return {
    backupAmount: 0,
    investmentAmount: requiredAmount,
    optionalExpenseAmount: 0,
  };
}

function getTimelineCopy(opportunity, summary) {
  if (Array.isArray(opportunity?.timeline) && opportunity.timeline.length) {
    return opportunity.timeline;
  }

  if (opportunity?.durationWeeks > 0) {
    return [
      "Semana 1: preparas tu decision.",
      `Semana ${opportunity.durationWeeks + 1}: observas el resultado de tu plan.`,
    ];
  }

  return ["Tu dinero se mantiene disponible y bajo control."];
}

function resolveInvestmentResult({
  selectedOpportunity,
  investmentAmount,
  backupAmount,
  optionalExpenseAmount,
  surplusAmount,
}) {
  const safeSurplusAmount = Math.max(0, toNumber(surplusAmount, 0));
  const safeBackupAmount = Math.max(0, toNumber(backupAmount, 0));
  const safeOptionalExpenseAmount = Math.max(0, toNumber(optionalExpenseAmount, 0));
  const usedAmount = Math.min(getRequiredAmount(selectedOpportunity), safeSurplusAmount);
  const returnedAmount = Math.round(
    usedAmount * toNumber(selectedOpportunity?.returnMultiplier, 1),
  );
  const profitAmount = returnedAmount - usedAmount;
  const finalSurplusAmount = Math.max(0, safeSurplusAmount - usedAmount + returnedAmount);
  const unusedAmount = Math.max(
    0,
    safeSurplusAmount - usedAmount - safeBackupAmount - safeOptionalExpenseAmount,
  );

  if (!selectedOpportunity) {
    return {
      outcome: "safe",
      returnedAmount: 0,
      profitAmount: 0,
      finalSurplusAmount: safeSurplusAmount,
      title: "Cuidar tu dinero tambien es una buena decision.",
      message: "Tu dinero permanecio guardado y disponible.",
      unusedAmount,
      usedAmount: 0,
    };
  }

  if (selectedOpportunity.type === "save") {
    return {
      returnedAmount,
      profitAmount,
      finalSurplusAmount,
      outcome: "safe",
      title:
        selectedOpportunity?.outcome?.safe?.title ??
        "Cuidar tu dinero tambien es una buena decision.",
      message:
        selectedOpportunity?.outcome?.safe?.text ??
        "Conservaste tu dinero extra disponible para un imprevisto o una meta futura.",
      unusedAmount,
      usedAmount,
    };
  }

  if (selectedOpportunity.id === "juice-stand") {
    return {
      returnedAmount,
      profitAmount,
      finalSurplusAmount,
      outcome: "good",
      title:
        selectedOpportunity?.outcome?.good?.title ??
        "Planificaste la inversion y guardaste un respaldo.",
      message:
        selectedOpportunity?.outcome?.good?.text ??
        "Elegiste la oportunidad con mayor rentabilidad y tu dinero crecio en poco tiempo.",
      unusedAmount,
      usedAmount,
    };
  }

  if (selectedOpportunity.id === "bracelets") {
    return {
      returnedAmount,
      profitAmount,
      finalSurplusAmount,
      outcome: "balanced",
      title:
        selectedOpportunity?.outcome?.balanced?.title ??
        "Tu excedente crecio con una decision bien pensada.",
      message:
        selectedOpportunity?.outcome?.balanced?.text ??
        "Tu dinero genero una ganancia, pero necesito mas tiempo y tuvo menor rentabilidad.",
      unusedAmount,
      usedAmount,
    };
  }

  return {
    returnedAmount,
    profitAmount,
    finalSurplusAmount,
    outcome: "risk",
    title:
      selectedOpportunity?.outcome?.risk?.title ?? "La oferta no era clara.",
    message:
      selectedOpportunity?.outcome?.risk?.text ??
      "La oferta no explicaba como generaria dinero. Recuperaste solo una parte de lo que usaste.",
    unusedAmount,
    usedAmount,
  };
}

function getInvestmentScore(opportunity) {
  return Math.max(0, toNumber(opportunity?.score, 0));
}

function getFinalScore({ captureScore, selectedOpportunity, isFinalized }) {
  const safeCaptureScore = Math.max(0, toNumber(captureScore, 0));
  const investmentScore = isFinalized
    ? getInvestmentScore(selectedOpportunity)
    : 0;
  const totalScore = safeCaptureScore + investmentScore;

  return {
    captureScore: safeCaptureScore,
    investmentScore,
    totalScore,
    approved: totalScore > 60,
  };
}

function StatCard({ label, value, tone = "blue" }) {
  return (
    <div
      className={cn(
        "rounded-[1rem] border px-3 py-3",
        tone === "positive"
          ? "border-[#74dca6]/42 bg-[linear-gradient(180deg,rgba(31,150,96,0.24),rgba(18,86,61,0.16))]"
          : tone === "negative"
            ? "border-[#ffac97]/42 bg-[linear-gradient(180deg,rgba(191,87,59,0.24),rgba(102,31,17,0.16))]"
            : "border-white/18 bg-[linear-gradient(180deg,rgba(34,103,207,0.2),rgba(18,54,116,0.12))]",
      )}
    >
      <div className="text-[0.75rem] font-black uppercase tracking-[0.04em] text-white/72">
        {label}
      </div>
      <div className="mt-2 text-[1.12rem] font-black text-white sm:text-[1.28rem]">
        {value}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, description, tone = "blue" }) {
  return (
    <div
      className={cn(
        "rounded-[1rem] border px-3 py-3",
        tone === "positive"
          ? "border-[#74dca6]/42 bg-[linear-gradient(180deg,rgba(31,150,96,0.22),rgba(18,86,61,0.12))]"
          : tone === "negative"
            ? "border-[#ffac97]/42 bg-[linear-gradient(180deg,rgba(191,87,59,0.22),rgba(102,31,17,0.12))]"
            : "border-white/18 bg-[linear-gradient(180deg,rgba(34,103,207,0.18),rgba(18,54,116,0.1))]",
      )}
    >
      <div className="text-[0.74rem] font-black uppercase tracking-[0.04em] text-white/72">
        {label}
      </div>
      <div className="mt-2 text-[1.02rem] font-black text-white sm:text-[1.12rem]">
        {value}
      </div>
      {description ? (
        <div className="mt-1 text-[0.76rem] font-semibold leading-snug text-white/72">
          {description}
        </div>
      ) : null}
    </div>
  );
}

function OpportunityCard({ opportunity, summary, isSelected, onSelect }) {
  const imageSrc = resolveAssetSrc(opportunity?.media?.src);
  const durationText =
    toNumber(opportunity?.durationWeeks, 0) <= 0
      ? summary.immediateLabel
      : `${opportunity.durationWeeks} ${
          Number(opportunity.durationWeeks) === 1
            ? summary.weekSingular
            : summary.weekPlural
        }`;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(opportunity)}
      className={cn(
        "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.1rem] border text-left transition duration-150",
        isSelected
          ? "scale-[1.01] border-[3px] border-[#ffe08a] bg-[linear-gradient(180deg,rgba(255,215,95,0.3),rgba(40,91,176,0.22))] ring-4 ring-[#ffe08a]/35 shadow-[0_0_0_2px_rgba(255,224,138,0.28),0_22px_40px_rgba(10,39,98,0.32)]"
          : "border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/28 hover:bg-white/10",
      )}
    >
      <div className="absolute inset-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={opportunity?.media?.alt ?? opportunity?.title}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,66,0.16),rgba(7,24,66,0.08)_35%,rgba(7,24,66,0.72)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex shrink-0 rounded-full bg-[rgba(9,29,78,0.84)] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.04em] text-white">
            {opportunity?.riskLabel ?? opportunity?.risk}
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-1.5">
            <div className="min-w-[4.8rem] rounded-[0.78rem] bg-[rgba(9,29,78,0.82)] px-2 py-1.5 text-white shadow-[0_8px_18px_rgba(8,24,66,0.18)]">
              <div className="whitespace-nowrap text-[0.5rem] font-black uppercase tracking-[0.03em] text-white/68">
                {summary.minAmountLabel}
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[0.72rem] font-black leading-none">
                {formatCurrency(opportunity?.minAmount ?? 0)}
              </div>
            </div>

            <div className="min-w-[4.8rem] rounded-[0.78rem] bg-[rgba(9,29,78,0.82)] px-2 py-1.5 text-white shadow-[0_8px_18px_rgba(8,24,66,0.18)]">
              <div className="whitespace-nowrap text-[0.5rem] font-black uppercase tracking-[0.03em] text-white/68">
                {summary.durationLabel}
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[0.72rem] font-black leading-none">
                {durationText}
              </div>
            </div>
          </div>
        </div>

        {isSelected ? (
          <div className="pointer-events-none absolute right-3 top-[3.6rem] z-20 inline-flex items-center gap-1.5 rounded-full border border-[#fff0bf]/70 bg-[rgba(255,205,76,0.96)] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.05em] text-[#6b3b00] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={3} />
            Elegida
          </div>
        ) : null}

        <div className="pointer-events-none mt-auto">
          <div
            className={cn(
              "rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(7,24,66,0.2),rgba(7,24,66,0.56))] px-3 py-2.5 backdrop-blur-[1px] transition-all duration-200 group-hover:-translate-y-1",
              isSelected && "bg-[linear-gradient(180deg,rgba(7,24,66,0.18),rgba(7,24,66,0.74))]",
            )}
          >
            <div className="text-[0.98rem] font-black leading-tight text-white xl:text-[1rem]">
              {opportunity?.title}
            </div>
            <div className="mt-2 max-h-0 overflow-hidden text-[0.74rem] font-semibold leading-snug text-white/88 opacity-0 transition-all duration-200 group-hover:max-h-16 group-hover:opacity-100 xl:text-[0.76rem]">
              <span className="mr-1 font-black uppercase tracking-[0.04em] text-white/66">
                {summary.resultLabel}:
              </span>
              {opportunity?.possibleResult}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SurplusDecisionStage({
  data,
  sourcePayload,
  onStateChange,
}) {
  const resolvedData = useMemo(() => mergeStageData(data), [data]);
  const hasSurplus = toNumber(sourcePayload?.surplusAmount, 0) > 0;
  const [step, setStep] = useState(hasSurplus ? "intro" : "noSurplus");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [backupAmount, setBackupAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [optionalExpenseAmount, setOptionalExpenseAmount] = useState(0);
  const [outcome, setOutcome] = useState("safe");
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [finalSurplusAmount, setFinalSurplusAmount] = useState(
    toNumber(sourcePayload?.surplusAmount, 0),
  );
  const [unusedAmount, setUnusedAmount] = useState(
    toNumber(sourcePayload?.surplusAmount, 0),
  );
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    setStep(hasSurplus ? "intro" : "noSurplus");
    setSelectedOpportunityId(null);
    setBackupAmount(0);
    setInvestmentAmount(0);
    setOptionalExpenseAmount(0);
    setOutcome("safe");
    setReturnedAmount(0);
    setProfitAmount(0);
    setFinalSurplusAmount(toNumber(sourcePayload?.surplusAmount, 0));
    setUnusedAmount(toNumber(sourcePayload?.surplusAmount, 0));
    setResultTitle("");
    setResultMessage("");
    setValidationMessage("");
    setIsFinalized(false);
  }, [hasSurplus, sourcePayload?.surplusAmount]);

  const selectedOpportunity = useMemo(
    () =>
      resolvedData.opportunities.find(
        (opportunity) => opportunity.id === selectedOpportunityId,
      ) ?? null,
    [resolvedData.opportunities, selectedOpportunityId],
  );

  const assignedTotal = backupAmount + investmentAmount + optionalExpenseAmount;
  const remainingAmount = Math.max(
    0,
    toNumber(sourcePayload?.surplusAmount, 0) - assignedTotal,
  );
  const captureScore = Math.max(0, toNumber(sourcePayload?.captureScore, 0));
  const completionWeek = toNumber(sourcePayload?.completionWeek, 0);
  const restartCount = Math.max(0, toNumber(sourcePayload?.restartCount, 0));
  const requiredAmount = getRequiredAmount(selectedOpportunity);
  const canInvest =
    Boolean(selectedOpportunity) &&
    toNumber(sourcePayload?.surplusAmount, 0) >= requiredAmount;
  const scoreSummary = getFinalScore({
    captureScore,
    selectedOpportunity,
    isFinalized,
  });
  const outcomeCopy =
    resolvedData.states?.[outcome] ??
    resolvedData.states.safe ??
    DEFAULT_STAGE_DATA.states.safe;
  const outcomeTone = OUTCOME_TONE[outcomeCopy.tone] ?? OUTCOME_TONE.safe;
  const OutcomeIcon = outcomeTone.icon;
  const timeline = getTimelineCopy(selectedOpportunity, resolvedData.summary);

  useEffect(() => {
    const details = [
      {
        label: resolvedData.summary.selectedOpportunityLabel,
        value: selectedOpportunity?.title ?? "Sin seleccionar",
      },
      {
        label: resolvedData.summary.backupLabel,
        value: formatCurrency(backupAmount),
      },
      {
        label: resolvedData.summary.investmentLabel,
        value: formatCurrency(investmentAmount),
      },
      {
        label: "Puntaje por reunir la meta",
        value: `${scoreSummary.captureScore}/60`,
      },
      {
        label: "Puntaje por decision",
        value: `${scoreSummary.investmentScore}/40`,
      },
      {
        label: "Puntaje total",
        value: `${scoreSummary.totalScore}/100`,
      },
      {
        label: resolvedData.summary.optionalExpenseLabel,
        value: formatCurrency(optionalExpenseAmount),
      },
      {
        label: resolvedData.summary.returnedLabel,
        value: formatCurrency(returnedAmount),
      },
      {
        label: resolvedData.summary.profitLabel,
        value: formatCurrency(profitAmount),
      },
      {
        label: resolvedData.summary.finalSurplusLabel,
        value: formatCurrency(finalSurplusAmount),
      },
    ];

    onStateChange?.({
      type: "collectObjects",
      completed: isFinalized,
      score: scoreSummary.investmentScore,
      missionScoreOverride: scoreSummary.totalScore,
      displayAmount: isFinalized
        ? finalSurplusAmount
        : toNumber(sourcePayload?.surplusAmount, 0),
      progressValue: isFinalized
        ? finalSurplusAmount
        : toNumber(sourcePayload?.surplusAmount, 0),
      progressMax: Math.max(1, toNumber(sourcePayload?.surplusAmount, 0)),
      details,
      payload: {
        mode: "surplusDecision",
        step,
        targetAmount: toNumber(sourcePayload?.targetAmount, 0),
        collectedAmount: toNumber(sourcePayload?.collectedAmount, 0),
        protectedGoalAmount: toNumber(sourcePayload?.protectedGoalAmount, 0),
        initialSurplusAmount: toNumber(sourcePayload?.surplusAmount, 0),
        captureScore: scoreSummary.captureScore,
        investmentScore: scoreSummary.investmentScore,
        totalScore: scoreSummary.totalScore,
        approved: scoreSummary.approved,
        missionScoreOverride: scoreSummary.totalScore,
        completionWeek,
        restartCount,
        backupAmount,
        investmentAmount,
        optionalExpenseAmount,
        unusedAmount,
        selectedOpportunityId,
        returnedAmount,
        profitAmount,
        finalSurplusAmount,
        outcome,
        resultTitle,
        resultMessage,
        isFinalized,
      },
    });
  }, [
    backupAmount,
    completionWeek,
    captureScore,
    finalSurplusAmount,
    investmentAmount,
    isFinalized,
    onStateChange,
    optionalExpenseAmount,
    outcome,
    profitAmount,
    resolvedData.summary.backupLabel,
    resolvedData.summary.finalSurplusLabel,
    resolvedData.summary.investmentLabel,
    resolvedData.summary.optionalExpenseLabel,
    resolvedData.summary.profitLabel,
    resolvedData.summary.returnedLabel,
    resolvedData.summary.selectedOpportunityLabel,
    resultMessage,
    resultTitle,
    returnedAmount,
    restartCount,
    scoreSummary.approved,
    scoreSummary.captureScore,
    scoreSummary.investmentScore,
    scoreSummary.totalScore,
    selectedOpportunity?.title,
    selectedOpportunityId,
    sourcePayload?.collectedAmount,
    sourcePayload?.protectedGoalAmount,
    sourcePayload?.surplusAmount,
    sourcePayload?.targetAmount,
    step,
    unusedAmount,
  ]);

  function handleSelectOpportunity(opportunity) {
    const suggested = getSuggestedAllocation(
      opportunity,
      toNumber(sourcePayload?.surplusAmount, 0),
    );

    setSelectedOpportunityId(opportunity.id);
    setBackupAmount(suggested.backupAmount);
    setInvestmentAmount(suggested.investmentAmount);
    setOptionalExpenseAmount(suggested.optionalExpenseAmount);
    setValidationMessage("");
    setIsFinalized(false);
  }

  function handleResolveResult() {
    if (!selectedOpportunity) {
      setValidationMessage("Selecciona una oportunidad para continuar.");
      return;
    }

    if (!canInvest) {
      setValidationMessage(
        "No tienes excedente suficiente para esta oportunidad. Elige otra opcion o vuelve a intentar reunir mas dinero.",
      );
      return;
    }

    const result = resolveInvestmentResult({
      selectedOpportunity,
      investmentAmount,
      backupAmount,
      optionalExpenseAmount,
      surplusAmount: toNumber(sourcePayload?.surplusAmount, 0),
    });

    setOutcome(result.outcome);
    setReturnedAmount(result.returnedAmount);
    setProfitAmount(result.profitAmount);
    setFinalSurplusAmount(result.finalSurplusAmount);
    setUnusedAmount(result.unusedAmount);
    setResultTitle(result.title ?? "");
    setResultMessage(result.message ?? "");
    setValidationMessage("");
    setStep("result");
  }

  const durationText =
    toNumber(selectedOpportunity?.durationWeeks, 0) <= 0
      ? resolvedData.summary.immediateLabel
      : `${selectedOpportunity.durationWeeks} ${
          Number(selectedOpportunity.durationWeeks) === 1
            ? resolvedData.summary.weekSingular
            : resolvedData.summary.weekPlural
        }`;

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
      {step === "intro" ? (
        <div className="my-auto grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-center">
          <div>
            <Typography content={resolvedData.intro.title} className="font-black text-[#11336d]" />
            <Typography
              content={resolvedData.intro.description}
              className="mt-4 max-w-[40rem] text-[1.02rem] font-semibold leading-relaxed text-[#234379]"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Dinero reunido"
                value={formatCurrency(sourcePayload?.collectedAmount)}
              />
              <StatCard
                label="Meta protegida"
                value={formatCurrency(sourcePayload?.protectedGoalAmount)}
                tone="positive"
              />
              <StatCard
                label={resolvedData.summary.surplusLabel}
                value={formatCurrency(sourcePayload?.surplusAmount)}
                tone="positive"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep("opportunities")}
              className="mt-7 inline-flex min-w-[16rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>{resolvedData.intro.buttonText}</span>
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.8} />
            </button>
          </div>

          <div className="rounded-[1.4rem] border border-white/26 bg-[linear-gradient(180deg,rgba(20,76,180,0.16),rgba(14,55,143,0.1))] p-5 shadow-[0_20px_36px_rgba(10,28,88,0.14)]">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-6 w-6 text-[#ffbf37]" strokeWidth={2.2} />
              <div className="text-[1.12rem] font-black text-[#17386d]">
                Secuencia del reto
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                "Ingresos reunidos",
                "Meta protegida",
                "Excedente disponible",
                "Decision de inversion o ahorro adicional",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-white/24 bg-white/18 px-4 py-3 text-[0.94rem] font-semibold text-[#234379]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === "noSurplus" ? (
        <div className="my-auto mx-auto w-full max-w-[42rem] rounded-[1.5rem] border border-white/28 bg-[linear-gradient(180deg,rgba(20,76,180,0.76),rgba(14,55,143,0.84))] px-6 py-7 text-center shadow-[0_20px_40px_rgba(10,28,88,0.24)]">
          <Typography content={resolvedData.noSurplus.title} className="font-black text-white" />
          <Typography
            content={resolvedData.noSurplus.description}
            className="mx-auto mt-4 max-w-[28rem] text-[0.98rem] font-semibold leading-relaxed text-white/88"
          />
          <button
            type="button"
            onClick={() => setIsFinalized(true)}
            className="mt-6 inline-flex min-w-[11rem] items-center justify-center rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
          >
            {resolvedData.noSurplus.buttonText}
          </button>
        </div>
      ) : null}

      {step === "opportunities" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <Typography
            content={resolvedData.opportunitiesSection.title}
            className="font-black text-[#11336d] text-[clamp(2rem,2vw+1rem,3rem)] leading-[0.94]"
          />
          <Typography
            content={resolvedData.opportunitiesSection.description}
            className="mt-2 max-w-[38rem] text-[0.88rem] font-semibold leading-relaxed text-[#234379] xl:text-[0.92rem]"
          />

          <div className="mt-4 grid flex-1 auto-rows-fr gap-3 overflow-hidden lg:grid-cols-2">
            {resolvedData.opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                summary={resolvedData.summary}
                isSelected={selectedOpportunityId === opportunity.id}
                onSelect={handleSelectOpportunity}
              />
            ))}
          </div>

          {validationMessage ? (
            <div className="mt-3 rounded-[1rem] border border-[#ffb48c] bg-[rgba(133,37,18,0.18)] px-4 py-3 text-[0.86rem] font-semibold text-[#6e220f]">
              {validationMessage}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="inline-flex min-w-[9rem] items-center justify-center rounded-[1rem] border border-white/22 bg-white/12 px-5 py-3 text-[0.96rem] font-black text-white transition hover:bg-white/18"
            >
              {resolvedData.opportunitiesSection.backButtonText}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedOpportunity) {
                  setValidationMessage("Selecciona una oportunidad para continuar.");
                  return;
                }
                if (
                  toNumber(sourcePayload?.surplusAmount, 0) <
                  getRequiredAmount(selectedOpportunity)
                ) {
                  setValidationMessage(
                    "No tienes excedente suficiente para esta oportunidad. Elige otra opcion o vuelve a intentar reunir mas dinero.",
                  );
                  return;
                }
                setValidationMessage("");
                setStep("distribution");
              }}
              disabled={
                !selectedOpportunity ||
                toNumber(sourcePayload?.surplusAmount, 0) <
                  getRequiredAmount(selectedOpportunity)
              }
              className="inline-flex min-w-[14rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
            >
              <span>{resolvedData.opportunitiesSection.buttonText}</span>
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.8} />
            </button>
          </div>
        </div>
      ) : null}

      {step === "distribution" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <Typography
            content={resolvedData.distributionSection.title}
            className="font-black text-[#11336d] text-[clamp(2rem,2.2vw+0.9rem,2.9rem)] leading-[0.96]"
          />
          <Typography
            content={resolvedData.distributionSection.description}
            className="mt-1.5 max-w-[48rem] text-[0.88rem] font-semibold leading-relaxed text-[#234379] sm:text-[0.92rem]"
          />

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
            <div className="rounded-[1.2rem] border border-white/24 bg-[linear-gradient(180deg,rgba(19,79,188,0.18),rgba(13,55,145,0.12))] p-3.5">
              <div className="text-[0.76rem] font-black uppercase tracking-[0.05em] text-white/72">
                {resolvedData.summary.selectedOpportunityLabel}
              </div>
              <div className="mt-1.5 text-[1.08rem] font-black leading-tight text-white sm:text-[1.16rem]">
                {selectedOpportunity?.title}
              </div>
              <div className="mt-1.5 text-[0.84rem] font-semibold leading-relaxed text-white/84 sm:text-[0.88rem]">
                {selectedOpportunity?.description}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <StatCard
                  label={resolvedData.summary.durationLabel}
                  value={durationText}
                />
                <StatCard
                  label={resolvedData.summary.riskLabel}
                  value={selectedOpportunity?.riskLabel ?? "-"}
                />
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryItem
                  label={resolvedData.summary.backupLabel}
                  value={formatCurrency(backupAmount)}
                  description="Dinero reservado por si aparece un imprevisto."
                  tone="positive"
                />
                <SummaryItem
                  label={resolvedData.summary.investmentLabel}
                  value={formatCurrency(investmentAmount)}
                  description={
                    selectedOpportunity?.type === "save"
                      ? "En esta opcion todo queda disponible como respaldo."
                      : `Monto sugerido para iniciar ${selectedOpportunity?.title?.toLowerCase?.() ?? "la oportunidad"}.`
                  }
                />
                <SummaryItem
                  label={resolvedData.summary.optionalExpenseLabel}
                  value={formatCurrency(optionalExpenseAmount)}
                  description="Monto que puede esperar para no debilitar tu plan."
                  tone={optionalExpenseAmount > 0 ? "negative" : "blue"}
                />
                <SummaryItem
                  label={resolvedData.summary.unusedLabel}
                  value={formatCurrency(remainingAmount)}
                  description="Parte del excedente que todavia no necesitas usar."
                  tone="positive"
                />
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-3.5">
              <div className="text-[0.88rem] font-semibold leading-relaxed text-[#234379] sm:text-[0.9rem]">
                {resolvedData.distributionSection.helperText?.text ??
                  "Revisa el monto sugerido, el tiempo y el riesgo antes de ver el resultado."}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <StatCard
                  label={resolvedData.summary.surplusLabel}
                  value={formatCurrency(sourcePayload?.surplusAmount)}
                />
                <StatCard
                  label={resolvedData.summary.backupLabel}
                  value={formatCurrency(backupAmount)}
                />
                {selectedOpportunity?.type !== "save" ? (
                  <StatCard
                    label={resolvedData.summary.investmentLabel}
                    value={formatCurrency(investmentAmount)}
                  />
                ) : null}
                <StatCard
                  label={resolvedData.summary.optionalExpenseLabel}
                  value={formatCurrency(optionalExpenseAmount)}
                  tone={optionalExpenseAmount > 0 ? "negative" : "blue"}
                />
                <StatCard
                  label={resolvedData.summary.unusedLabel}
                  value={formatCurrency(remainingAmount)}
                  tone="positive"
                />
                <StatCard
                  label={resolvedData.summary.resultLabel}
                  value={selectedOpportunity?.possibleResult ?? "-"}
                  tone="positive"
                />
              </div>

              {validationMessage ? (
                <div className="mt-4 rounded-[1rem] border border-[#ffb48c] bg-[rgba(133,37,18,0.18)] px-4 py-3 text-[0.9rem] font-semibold text-[#6e220f]">
                  {validationMessage}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("opportunities")}
              className="inline-flex min-w-[10rem] items-center justify-center rounded-[1rem] border border-white/22 bg-white/12 px-5 py-3 text-[0.96rem] font-black text-white transition hover:bg-white/18"
            >
              {resolvedData.distributionSection.backButtonText}
            </button>
            <button
              type="button"
              onClick={handleResolveResult}
              className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>{resolvedData.distributionSection.buttonText}</span>
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.8} />
            </button>
          </div>
        </div>
      ) : null}

      {step === "result" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <Typography
            content={resolvedData.resultSection.title}
            className="font-black text-[#11336d] text-[clamp(2rem,2.2vw+0.9rem,2.9rem)] leading-[0.96]"
          />

          <div
            className={cn(
              "mt-3 rounded-[1.2rem] border px-4 py-3.5 shadow-[0_20px_36px_rgba(10,28,88,0.14)] sm:px-5",
              outcomeTone.wrapper,
            )}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-[0_10px_18px_rgba(0,0,0,0.16)]",
                  outcomeTone.badge,
                )}
              >
                <OutcomeIcon className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.78rem] font-black uppercase tracking-[0.05em] text-white/72">
                  {outcomeCopy.label}
                </div>
                <div className="mt-1 text-[1.18rem] font-black leading-tight text-white sm:text-[1.28rem] xl:text-[1.36rem]">
                  {resultTitle || outcomeCopy.label}
                </div>
                <div className="mt-2 max-w-[42rem] text-[0.88rem] font-semibold leading-relaxed text-white/84 sm:text-[0.92rem]">
                  {resultMessage || outcomeCopy.description}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
            <div className="rounded-[1.2rem] border border-white/24 bg-[linear-gradient(180deg,rgba(19,79,188,0.18),rgba(13,55,145,0.12))] p-3.5">
              <div className="flex items-center gap-2 text-white/74">
                <Clock3 className="h-4.5 w-4.5" strokeWidth={2.4} />
                <span className="text-[0.78rem] font-black uppercase tracking-[0.05em]">
                  Paso del tiempo
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {timeline.map((entry, index) => (
                  <div
                    key={`${selectedOpportunity?.id ?? "timeline"}-${index}`}
                    className="rounded-[1rem] border border-white/16 bg-white/10 px-4 py-3 text-[0.86rem] font-semibold leading-relaxed text-white/86 sm:text-[0.9rem]"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard
                  label="Meta protegida"
                  value={formatCurrency(sourcePayload?.protectedGoalAmount)}
                  tone="positive"
                />
                <StatCard
                  label={resolvedData.summary.surplusLabel}
                  value={formatCurrency(sourcePayload?.surplusAmount)}
                />
                <StatCard
                  label={resolvedData.summary.backupLabel}
                  value={formatCurrency(backupAmount)}
                />
                <StatCard
                  label={resolvedData.summary.investmentLabel}
                  value={formatCurrency(investmentAmount)}
                />
                <StatCard
                  label={resolvedData.summary.returnedLabel}
                  value={formatCurrency(returnedAmount)}
                  tone={returnedAmount > 0 ? "positive" : "blue"}
                />
                <StatCard
                  label={resolvedData.summary.profitLabel}
                  value={formatCurrency(profitAmount)}
                  tone={profitAmount >= 0 ? "positive" : "negative"}
                />
                <StatCard
                  label={resolvedData.summary.finalSurplusLabel}
                  value={formatCurrency(finalSurplusAmount)}
                  tone="positive"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsFinalized(true)}
              className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
            >
              <span>{resolvedData.resultSection.finalizeButtonText}</span>
              <BadgeCheck className="h-4.5 w-4.5" strokeWidth={2.8} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
