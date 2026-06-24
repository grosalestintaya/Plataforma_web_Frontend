import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import Typography from "@/features/module/blocks/base/Typography";
import { cn } from "@/shared/libs/utils";

const DEFAULT_DATA = {
  sourceViewId: "m4_2_v2",
  previewPayload: {
    targetAmount: 300,
    collectedAmount: 325,
    protectedGoalAmount: 300,
    surplusAmount: 25,
    target: {
      title: {
        text: "Bicicleta",
        variant: "h3",
        align: "center",
      },
      media: {
        src: "4/bicicleta.jpeg",
        alt: "Bicicleta como meta",
        variant: "horizontal",
      },
    },
  },
  intro: {
    eyebrow: {
      text: "Haz crecer tu excedente",
      variant: "label",
      align: "left",
    },
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
    statusTitle: {
      text: "META ASEGURADA",
      variant: "label",
      align: "center",
    },
    statusText: {
      text: "Este dinero ya no se utiliza.",
      variant: "bodySm",
      align: "center",
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
      text: "Reparte el dinero extra entre respaldo, oportunidad y un gasto que puede esperar. No puedes usar mas de lo que tienes disponible.",
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
    targetLabel: "Meta protegida",
    collectedLabel: "Dinero reunido",
    protectedLabel: "Dinero protegido",
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
  opportunities: [
    {
      id: "backup",
      type: "save",
      title: "Guardar como respaldo",
      description: "Reserva una parte del dinero para un imprevisto o una meta futura.",
      minAmount: 5,
      durationWeeks: 0,
      returnType: "fixed",
      returnMultiplier: 1,
      risk: "low",
      riskLabel: "Bajo",
      possibleResult: "Tu dinero se mantiene disponible.",
      media: {
        src: "1/ahorro.webp",
        alt: "Guardar dinero como respaldo",
        variant: "horizontal",
      },
      timeline: [
        "Tu dinero queda guardado y listo para cualquier imprevisto.",
      ],
      outcome: {
        safe: {
          title: "Cuidar tu dinero tambien es una buena decision.",
          text: "Guardaste tu excedente y mantuviste tu meta protegida.",
        },
      },
    },
    {
      id: "juice-stand",
      type: "investment",
      title: "Venta de refrescos",
      description: "Usa una parte del excedente para comprar fruta, vasos e hielo y vender bebidas en una actividad escolar.",
      minAmount: 15,
      maxAmount: 20,
      durationWeeks: 1,
      returnType: "range",
      returnMultiplierMin: 1.35,
      returnMultiplierMax: 1.55,
      risk: "medium",
      riskLabel: "Medio",
      possibleResult: "Podrias recuperar mas de lo invertido despues de una semana.",
      media: {
        src: "1/ensalada-de-fruta.webp",
        alt: "Venta de refrescos",
        variant: "horizontal",
      },
      timeline: [
        "Semana 1: compras insumos y preparas la venta.",
        "Semana 2: vendes refrescos en una actividad escolar.",
      ],
      outcome: {
        good: {
          title: "Planificaste la inversion y guardaste un respaldo.",
          text: "Tu idea funciono y pudiste hacer crecer el excedente sin poner en riesgo la bicicleta.",
        },
        balanced: {
          title: "La venta funciono, pero dejaste poco respaldo.",
          text: "La ganancia existe, aunque tu plan podia ser mas equilibrado.",
        },
      },
    },
    {
      id: "bracelets",
      type: "investment",
      title: "Pulseras y manualidades",
      description: "Compra materiales para crear productos simples y venderlos.",
      minAmount: 10,
      maxAmount: 15,
      durationWeeks: 2,
      returnType: "range",
      returnMultiplierMin: 1.3,
      returnMultiplierMax: 1.5,
      risk: "medium",
      riskLabel: "Medio",
      possibleResult: "Puedes obtener una ganancia si logras vender los productos.",
      media: {
        src: "1/ganar-dinero.webp",
        alt: "Pulseras y manualidades",
        variant: "horizontal",
      },
      timeline: [
        "Semana 1: compras materiales y preparas tus productos.",
        "Semana 2: ofreces tus manualidades y recuperas lo invertido.",
      ],
      outcome: {
        balanced: {
          title: "La venta tomo mas tiempo, pero genero una ganancia moderada.",
          text: "Hiciste crecer tu dinero con paciencia y organizacion.",
        },
        good: {
          title: "Tu excedente crecio con una decision bien pensada.",
          text: "Combinaste respaldo con una oportunidad realista.",
        },
      },
    },
    {
      id: "quick-money",
      type: "risky",
      title: "Oferta de dinero rapido",
      description: "Una persona promete devolverte el doble manana, pero no explica como lo hara.",
      minAmount: 10,
      durationWeeks: 0,
      risk: "high",
      riskLabel: "Alto",
      possibleResult: "No hay informacion suficiente para confiar.",
      media: {
        src: "1/compra-online-ahorro.webp",
        alt: "Oferta de dinero rapido",
        variant: "horizontal",
      },
      timeline: [
        "La propuesta no explicaba como iba a generar ganancia.",
        "Recuperaste solo una parte de lo que arriesgaste.",
      ],
      outcome: {
        risk: {
          title: "La oferta no era clara.",
          text: "Cuidar tu dinero tambien implica desconfiar de promesas rapidas.",
        },
      },
    },
  ],
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

function mergeViewData(data) {
  return {
    ...DEFAULT_DATA,
    ...data,
    intro: {
      ...DEFAULT_DATA.intro,
      ...(data?.intro ?? {}),
    },
    noSurplus: {
      ...DEFAULT_DATA.noSurplus,
      ...(data?.noSurplus ?? {}),
    },
    opportunitiesSection: {
      ...DEFAULT_DATA.opportunitiesSection,
      ...(data?.opportunitiesSection ?? {}),
    },
    distributionSection: {
      ...DEFAULT_DATA.distributionSection,
      ...(data?.distributionSection ?? {}),
    },
    resultSection: {
      ...DEFAULT_DATA.resultSection,
      ...(data?.resultSection ?? {}),
    },
    summary: {
      ...DEFAULT_DATA.summary,
      ...(data?.summary ?? {}),
    },
    states: {
      ...DEFAULT_DATA.states,
      ...(data?.states ?? {}),
    },
    previewPayload: {
      ...DEFAULT_DATA.previewPayload,
      ...(data?.previewPayload ?? {}),
      target: {
        ...DEFAULT_DATA.previewPayload.target,
        ...(data?.previewPayload?.target ?? {}),
        title:
          data?.previewPayload?.target?.title ??
          DEFAULT_DATA.previewPayload.target.title,
        media: {
          ...DEFAULT_DATA.previewPayload.target.media,
          ...(data?.previewPayload?.target?.media ?? {}),
        },
      },
    },
    opportunities:
      Array.isArray(data?.opportunities) && data.opportunities.length
        ? data.opportunities
        : DEFAULT_DATA.opportunities,
  };
}

function getViewId(view) {
  return view?.id ?? view?.viewId ?? null;
}

function getResolvedSourcePayload(heroApi, resolvedData) {
  const previousState = heroApi?.getInteractiveState?.(resolvedData.sourceViewId);
  const payload = previousState?.payload ?? resolvedData.previewPayload;
  const targetAmount = toNumber(payload?.targetAmount, 0);
  const collectedAmount = toNumber(payload?.collectedAmount, 0);
  const protectedGoalAmount = toNumber(
    payload?.protectedGoalAmount,
    targetAmount,
  );
  const surplusAmount = Math.max(
    0,
    toNumber(payload?.surplusAmount, collectedAmount - protectedGoalAmount),
  );

  return {
    targetAmount,
    collectedAmount,
    protectedGoalAmount,
    surplusAmount,
    target: payload?.target ?? resolvedData.previewPayload.target,
  };
}

function getSuggestedAllocation(opportunity, surplusAmount) {
  if (!opportunity) {
    return {
      backupAmount: 0,
      investmentAmount: 0,
      optionalExpenseAmount: 0,
    };
  }

  if (opportunity.type === "save") {
    return {
      backupAmount: surplusAmount,
      investmentAmount: 0,
      optionalExpenseAmount: 0,
    };
  }

  const suggestedInvestment = clamp(
    toNumber(opportunity.maxAmount, opportunity.minAmount ?? 0) ||
      toNumber(opportunity.minAmount, 0),
    0,
    surplusAmount,
  );
  const remaining = Math.max(0, surplusAmount - suggestedInvestment);
  const suggestedBackup = Math.min(remaining, Math.max(5, Math.floor(remaining)));

  return {
    backupAmount: suggestedBackup,
    investmentAmount: suggestedInvestment,
    optionalExpenseAmount: 0,
  };
}

function getTimelineCopy(opportunity, summary) {
  if (Array.isArray(opportunity?.timeline) && opportunity.timeline.length) {
    return opportunity.timeline;
  }

  if (opportunity?.durationWeeks > 0) {
    return [
      `${summary.weekSingular === "semana" ? "Semana 1" : "Semana 1"}: preparas tu decision.`,
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
  const safeInvestmentAmount = Math.max(0, toNumber(investmentAmount, 0));
  const safeBackupAmount = Math.max(0, toNumber(backupAmount, 0));
  const safeOptionalExpenseAmount = Math.max(0, toNumber(optionalExpenseAmount, 0));
  const assignedTotal =
    safeInvestmentAmount + safeBackupAmount + safeOptionalExpenseAmount;
  const unusedAmount = Math.max(0, surplusAmount - assignedTotal);

  if (!selectedOpportunity || selectedOpportunity.type === "save") {
    return {
      returnedAmount: 0,
      profitAmount: 0,
      finalSurplusAmount: safeBackupAmount + unusedAmount,
      outcome: "safe",
      message:
        selectedOpportunity?.outcome?.safe?.text ??
        "Tu dinero permanecio guardado y disponible.",
      title:
        selectedOpportunity?.outcome?.safe?.title ??
        "Cuidar tu dinero tambien es una buena decision.",
      unusedAmount,
    };
  }

  if (selectedOpportunity.id === "juice-stand") {
    const multiplier = safeBackupAmount >= 5 ? 1.5 : 1.3;
    const returnedAmount = Math.round(safeInvestmentAmount * multiplier);
    return {
      returnedAmount,
      profitAmount: returnedAmount - safeInvestmentAmount,
      finalSurplusAmount: safeBackupAmount + returnedAmount + unusedAmount,
      outcome: safeBackupAmount >= 5 ? "good" : "balanced",
      title:
        safeBackupAmount >= 5
          ? selectedOpportunity?.outcome?.good?.title
          : selectedOpportunity?.outcome?.balanced?.title,
      message:
        safeBackupAmount >= 5
          ? selectedOpportunity?.outcome?.good?.text
          : selectedOpportunity?.outcome?.balanced?.text,
      unusedAmount,
    };
  }

  if (selectedOpportunity.id === "bracelets") {
    const multiplier = safeBackupAmount >= 5 ? 1.45 : 1.4;
    const returnedAmount = Math.round(safeInvestmentAmount * multiplier);
    return {
      returnedAmount,
      profitAmount: returnedAmount - safeInvestmentAmount,
      finalSurplusAmount: safeBackupAmount + returnedAmount + unusedAmount,
      outcome: safeBackupAmount >= 5 ? "good" : "balanced",
      title:
        safeBackupAmount >= 5
          ? selectedOpportunity?.outcome?.good?.title
          : selectedOpportunity?.outcome?.balanced?.title,
      message:
        safeBackupAmount >= 5
          ? selectedOpportunity?.outcome?.good?.text
          : selectedOpportunity?.outcome?.balanced?.text,
      unusedAmount,
    };
  }

  const returnedAmount = Math.round(safeInvestmentAmount * 0.5);
  return {
    returnedAmount,
    profitAmount: returnedAmount - safeInvestmentAmount,
    finalSurplusAmount: safeBackupAmount + returnedAmount + unusedAmount,
    outcome: "risk",
    title:
      selectedOpportunity?.outcome?.risk?.title ?? "La oferta no era clara.",
    message:
      selectedOpportunity?.outcome?.risk?.text ??
      "Recuperaste solo una parte y entendiste la senal de riesgo.",
    unusedAmount,
  };
}

function getScore({
  isFinalized,
  hasSurplus,
  protectedGoalAmount,
  targetAmount,
  backupAmount,
  investmentAmount,
  outcome,
}) {
  if (!isFinalized) return 0;
  if (protectedGoalAmount < targetAmount) return 20;
  if (!hasSurplus) return 100;
  if (
    backupAmount >= 5 &&
    investmentAmount > 0 &&
    (outcome === "good" || outcome === "balanced")
  ) {
    return 100;
  }
  if (outcome !== "risk") return 70;
  return 45;
}

function InfoPill({ icon: Icon, label, value, tone = "blue" }) {
  const toneClass =
    tone === "green"
      ? "border-[#72d6a2]/38 bg-[linear-gradient(180deg,rgba(48,161,110,0.22),rgba(27,97,71,0.16))]"
      : tone === "gold"
        ? "border-[#ffd177]/42 bg-[linear-gradient(180deg,rgba(255,186,67,0.24),rgba(124,69,0,0.14))]"
        : "border-white/18 bg-[linear-gradient(180deg,rgba(34,103,207,0.2),rgba(18,54,116,0.12))]";

  return (
    <div className={cn("rounded-[1rem] border px-3 py-3", toneClass)}>
      <div className="flex items-center gap-2 text-white/72">
        <Icon className="h-4.5 w-4.5" strokeWidth={2.4} />
        <span className="text-[0.78rem] font-black uppercase tracking-[0.04em]">
          {label}
        </span>
      </div>
      <div className="mt-2 text-[1.1rem] font-black text-white sm:text-[1.25rem]">
        {value}
      </div>
    </div>
  );
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

function OpportunityCard({
  opportunity,
  summary,
  isSelected,
  onSelect,
}) {
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
        "group flex h-full flex-col overflow-hidden rounded-[1.25rem] border text-left transition duration-150",
        isSelected
          ? "border-[#ffe08a] bg-[linear-gradient(180deg,rgba(255,215,95,0.24),rgba(40,91,176,0.2))] shadow-[0_16px_30px_rgba(10,39,98,0.26)]"
          : "border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/28 hover:bg-white/10",
      )}
    >
      <div className="relative h-32 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={opportunity?.media?.alt ?? opportunity?.title}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,66,0.05),rgba(7,24,66,0.5))]" />
        <div className="absolute left-3 top-3 inline-flex rounded-full bg-[rgba(9,29,78,0.8)] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[0.04em] text-white">
          {opportunity?.riskLabel ?? opportunity?.risk}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4 text-white">
        <div className="text-[1.04rem] font-black leading-tight">
          {opportunity?.title}
        </div>
        <div className="mt-2 text-[0.86rem] font-semibold leading-relaxed text-white/82">
          {opportunity?.description}
        </div>

        <div className="mt-4 grid gap-2 text-[0.78rem] font-semibold text-white/78 sm:grid-cols-2">
          <div>
            <div className="font-black uppercase tracking-[0.04em] text-white/62">
              {summary.minAmountLabel}
            </div>
            <div className="mt-1 text-white">
              {formatCurrency(opportunity?.minAmount ?? 0)}
            </div>
          </div>
          <div>
            <div className="font-black uppercase tracking-[0.04em] text-white/62">
              {summary.durationLabel}
            </div>
            <div className="mt-1 text-white">{durationText}</div>
          </div>
          <div>
            <div className="font-black uppercase tracking-[0.04em] text-white/62">
              {summary.resultLabel}
            </div>
            <div className="mt-1 text-white">{opportunity?.possibleResult}</div>
          </div>
          <div>
            <div className="font-black uppercase tracking-[0.04em] text-white/62">
              {summary.riskLabel}
            </div>
            <div className="mt-1 text-white">{opportunity?.riskLabel}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

function AmountControl({
  label,
  description,
  value,
  max,
  onChange,
}) {
  return (
    <div className="rounded-[1rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.82rem] font-black uppercase tracking-[0.04em] text-white/72">
            {label}
          </div>
          <div className="mt-1 text-[0.84rem] font-semibold leading-relaxed text-white/72">
            {description}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[1.15rem] font-black text-white">
            {formatCurrency(value)}
          </div>
          <div className="text-[0.74rem] font-semibold text-white/62">
            Maximo {formatCurrency(max)}
          </div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={Math.max(0, Math.floor(max))}
        step="1"
        value={clamp(Math.floor(value), 0, Math.max(0, Math.floor(max)))}
        onChange={(event) => onChange?.(toNumber(event.target.value, 0))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-[#ffbf37]"
      />
    </div>
  );
}

export default function InvestmentSurplusTemplate({ view, heroApi, data }) {
  const viewId = getViewId(view);
  const resolvedData = useMemo(() => mergeViewData(data), [data]);
  const sourcePayload = useMemo(
    () => getResolvedSourcePayload(heroApi, resolvedData),
    [heroApi, resolvedData],
  );
  const hasSurplus = sourcePayload.surplusAmount > 0;
  const targetTitle =
    sourcePayload.target?.title?.text ??
    sourcePayload.target?.title ??
    resolvedData.previewPayload.target?.title?.text ??
    "Meta";
  const targetImageSrc = resolveAssetSrc(sourcePayload.target?.media?.src);
  const [step, setStep] = useState(hasSurplus ? "intro" : "noSurplus");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [backupAmount, setBackupAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [optionalExpenseAmount, setOptionalExpenseAmount] = useState(0);
  const [outcome, setOutcome] = useState("safe");
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [finalSurplusAmount, setFinalSurplusAmount] = useState(
    sourcePayload.surplusAmount,
  );
  const [unusedAmount, setUnusedAmount] = useState(sourcePayload.surplusAmount);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [needsBackupConfirmation, setNeedsBackupConfirmation] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    const storedState = heroApi?.getInteractiveState?.(viewId);
    const payload = storedState?.payload ?? null;

    if (!payload) {
      setStep(hasSurplus ? "intro" : "noSurplus");
      setSelectedOpportunityId(null);
      setBackupAmount(0);
      setInvestmentAmount(0);
      setOptionalExpenseAmount(0);
      setOutcome("safe");
      setReturnedAmount(0);
      setProfitAmount(0);
      setFinalSurplusAmount(sourcePayload.surplusAmount);
      setUnusedAmount(sourcePayload.surplusAmount);
      setResultTitle("");
      setResultMessage("");
      setValidationMessage("");
      setNeedsBackupConfirmation(false);
      setIsFinalized(false);
      return;
    }

    setStep(payload.step ?? (hasSurplus ? "intro" : "noSurplus"));
    setSelectedOpportunityId(payload.selectedOpportunityId ?? null);
    setBackupAmount(toNumber(payload.backupAmount, 0));
    setInvestmentAmount(toNumber(payload.investmentAmount, 0));
    setOptionalExpenseAmount(toNumber(payload.optionalExpenseAmount, 0));
    setOutcome(payload.outcome ?? "safe");
    setReturnedAmount(toNumber(payload.returnedAmount, 0));
    setProfitAmount(toNumber(payload.profitAmount, 0));
    setFinalSurplusAmount(
      toNumber(payload.finalSurplusAmount, sourcePayload.surplusAmount),
    );
    setUnusedAmount(toNumber(payload.unusedAmount, sourcePayload.surplusAmount));
    setResultTitle(payload.resultTitle ?? "");
    setResultMessage(payload.resultMessage ?? "");
    setValidationMessage("");
    setNeedsBackupConfirmation(false);
    setIsFinalized(Boolean(payload.isFinalized));
  }, [hasSurplus, heroApi, sourcePayload.surplusAmount, viewId]);

  const selectedOpportunity = useMemo(
    () =>
      resolvedData.opportunities.find(
        (opportunity) => opportunity.id === selectedOpportunityId,
      ) ?? null,
    [resolvedData.opportunities, selectedOpportunityId],
  );

  const assignedTotal = backupAmount + investmentAmount + optionalExpenseAmount;
  const remainingAmount = Math.max(0, sourcePayload.surplusAmount - assignedTotal);
  const safeRemainingAmount =
    assignedTotal > sourcePayload.surplusAmount ? 0 : remainingAmount;
  const computedScore = getScore({
    isFinalized,
    hasSurplus,
    protectedGoalAmount: sourcePayload.protectedGoalAmount,
    targetAmount: sourcePayload.targetAmount,
    backupAmount,
    investmentAmount,
    outcome,
  });
  const outcomeCopy =
    resolvedData.states?.[outcome] ?? resolvedData.states.safe ?? DEFAULT_DATA.states.safe;
  const outcomeTone =
    OUTCOME_TONE[outcomeCopy.tone] ?? OUTCOME_TONE.safe;
  const OutcomeIcon = outcomeTone.icon;

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      type: "investmentSurplus",
      completed: isFinalized,
      score: computedScore,
      selectedOptionId: selectedOpportunityId,
      protectedGoalAmount: sourcePayload.protectedGoalAmount,
      surplusAmount: sourcePayload.surplusAmount,
      payload: {
        step,
        targetAmount: sourcePayload.targetAmount,
        collectedAmount: sourcePayload.collectedAmount,
        protectedGoalAmount: sourcePayload.protectedGoalAmount,
        initialSurplusAmount: sourcePayload.surplusAmount,
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
    computedScore,
    finalSurplusAmount,
    heroApi,
    investmentAmount,
    isFinalized,
    optionalExpenseAmount,
    outcome,
    profitAmount,
    resultMessage,
    resultTitle,
    returnedAmount,
    selectedOpportunityId,
    sourcePayload.collectedAmount,
    sourcePayload.protectedGoalAmount,
    sourcePayload.surplusAmount,
    sourcePayload.targetAmount,
    step,
    unusedAmount,
    viewId,
  ]);

  function handleSelectOpportunity(opportunity) {
    const suggested = getSuggestedAllocation(
      opportunity,
      sourcePayload.surplusAmount,
    );

    setSelectedOpportunityId(opportunity.id);
    setBackupAmount(suggested.backupAmount);
    setInvestmentAmount(suggested.investmentAmount);
    setOptionalExpenseAmount(suggested.optionalExpenseAmount);
    setValidationMessage("");
    setNeedsBackupConfirmation(false);
    setIsFinalized(false);
  }

  function handleStartDecision() {
    if (!hasSurplus) return;
    setStep("opportunities");
  }

  function handleContinueFromNoSurplus() {
    setIsFinalized(true);
    setOutcome("safe");
    setResultTitle(resolvedData.noSurplus.title?.text ?? "Meta alcanzada");
    setResultMessage(
      resolvedData.noSurplus.description?.text ??
        "Ya protegiste tu meta y no quedo excedente disponible.",
    );
  }

  function handleContinueToDistribution() {
    if (!selectedOpportunity) {
      setValidationMessage("Selecciona una oportunidad para continuar.");
      return;
    }

    setValidationMessage("");
    setStep("distribution");
  }

  function handleDistributionChange(field, value) {
    const safeValue = Math.max(0, Math.floor(toNumber(value, 0)));
    setValidationMessage("");
    setNeedsBackupConfirmation(false);
    setIsFinalized(false);

    if (field === "backup") setBackupAmount(safeValue);
    if (field === "investment") setInvestmentAmount(safeValue);
    if (field === "expense") setOptionalExpenseAmount(safeValue);
  }

  function handleResolveResult() {
    if (!selectedOpportunity) {
      setValidationMessage("Selecciona una oportunidad para continuar.");
      return;
    }

    if (assignedTotal > sourcePayload.surplusAmount) {
      setValidationMessage(
        "No puedes usar mas dinero del que tienes disponible.",
      );
      return;
    }

    if (selectedOpportunity.type === "save") {
      if (backupAmount <= 0) {
        setValidationMessage("Asigna una parte del excedente al respaldo.");
        return;
      }
    } else {
      if (investmentAmount <= 0) {
        setValidationMessage(
          "Asigna una parte del excedente a la oportunidad elegida.",
        );
        return;
      }

      if (investmentAmount < toNumber(selectedOpportunity.minAmount, 0)) {
        setValidationMessage(
          "Aun no alcanza para iniciar esta oportunidad.",
        );
        return;
      }

      if (backupAmount < 5 && !needsBackupConfirmation) {
        setValidationMessage(
          resolvedData.distributionSection.warningText ??
            DEFAULT_DATA.distributionSection.warningText,
        );
        setNeedsBackupConfirmation(true);
        return;
      }
    }

    const result = resolveInvestmentResult({
      selectedOpportunity,
      investmentAmount,
      backupAmount,
      optionalExpenseAmount,
      surplusAmount: sourcePayload.surplusAmount,
    });

    setOutcome(result.outcome);
    setReturnedAmount(result.returnedAmount);
    setProfitAmount(result.profitAmount);
    setFinalSurplusAmount(result.finalSurplusAmount);
    setUnusedAmount(result.unusedAmount);
    setResultTitle(result.title ?? "");
    setResultMessage(result.message ?? "");
    setValidationMessage("");
    setNeedsBackupConfirmation(false);
    setStep("result");
  }

  function handleRetryDistribution() {
    setIsFinalized(false);
    setValidationMessage("");
    setNeedsBackupConfirmation(false);
    setStep("distribution");
  }

  function handleFinalize() {
    setIsFinalized(true);
  }

  const durationText =
    toNumber(selectedOpportunity?.durationWeeks, 0) <= 0
      ? resolvedData.summary.immediateLabel
      : `${selectedOpportunity.durationWeeks} ${
          Number(selectedOpportunity.durationWeeks) === 1
            ? resolvedData.summary.weekSingular
            : resolvedData.summary.weekPlural
        }`;

  const timeline = getTimelineCopy(selectedOpportunity, resolvedData.summary);

  return (
    <section className="mx-auto flex h-full w-full max-w-[96rem] min-w-0 flex-col overflow-hidden rounded-[2rem] border border-white/30 bg-[linear-gradient(180deg,#3d8cff_0%,#235fda_100%)] p-2 text-white shadow-[0_24px_60px_rgba(8,30,88,0.3)] sm:p-3">
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[clamp(20rem,25vw,23rem)_minmax(0,1fr)]">
        <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.7rem] border border-white/30 bg-[linear-gradient(180deg,#1b66de_0%,#0f4fb9_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_46%)]" />
          <div className="pointer-events-none absolute inset-3 rounded-[1.4rem] border border-[#66beff]/40" />

          <div className="relative z-10 grid min-h-0 flex-1 gap-3 [grid-template-rows:auto_minmax(0,1fr)_auto_auto]">
            <div className="rounded-[1.2rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#2a76ef_0%,#1958c0_100%)] px-4 py-4">
              <Typography
                content={resolvedData.intro.eyebrow}
                className="text-[0.76rem] font-black uppercase tracking-[0.08em] text-white/70"
              />
              <Typography
                content={{
                  text: resolvedData.intro.title?.text ?? "Meta asegurada",
                  variant: "h2",
                  align: "left",
                }}
                className="mt-2 text-[1.9rem] font-black leading-[0.94]"
              />
              <div className="mt-3 flex items-center gap-2 rounded-[1rem] border border-[#8ed4ff]/35 bg-white/8 px-3 py-2.5">
                <LockKeyhole className="h-5 w-5 shrink-0 text-[#8de69f]" strokeWidth={2.5} />
                <div>
                  <div className="text-[0.76rem] font-black uppercase tracking-[0.06em] text-[#bdf6c8]">
                    {resolvedData.intro.statusTitle?.text}
                  </div>
                  <div className="text-[0.82rem] font-semibold text-white/78">
                    {resolvedData.intro.statusText?.text}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 rounded-[1.2rem] border border-[#66beff]/34 bg-[linear-gradient(180deg,#236fef_0%,#154fae_100%)] p-3">
              <div className="overflow-hidden rounded-[1.05rem] border-[3px] border-white/32 bg-white/8 shadow-[0_14px_28px_rgba(7,31,94,0.24)]">
                <div className="relative h-44 overflow-hidden">
                  {targetImageSrc ? (
                    <img
                      src={targetImageSrc}
                      alt={sourcePayload.target?.media?.alt ?? targetTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,24,66,0.04),rgba(7,24,66,0.34))]" />
                  <div className="absolute right-3 top-3 inline-flex rounded-full bg-[linear-gradient(180deg,#42d98f_0%,#19bf6c_100%)] px-3 py-1 text-[0.82rem] font-black text-white shadow-[0_10px_16px_rgba(0,105,64,0.26)]">
                    {formatCurrency(sourcePayload.targetAmount)}
                  </div>
                </div>

                <div className="px-4 py-4">
                  <div className="text-[1.18rem] font-black text-white">
                    {targetTitle}
                  </div>
                  <div className="mt-2 grid gap-2">
                    <InfoPill
                      icon={ShieldCheck}
                      label={resolvedData.summary.targetLabel}
                      value={formatCurrency(sourcePayload.protectedGoalAmount)}
                      tone="green"
                    />
                    <InfoPill
                      icon={Wallet}
                      label={resolvedData.summary.surplusLabel}
                      value={formatCurrency(sourcePayload.surplusAmount)}
                      tone="gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <InfoPill
                icon={PiggyBank}
                label={resolvedData.summary.collectedLabel}
                value={formatCurrency(sourcePayload.collectedAmount)}
              />
              <InfoPill
                icon={LockKeyhole}
                label={resolvedData.summary.protectedLabel}
                value={formatCurrency(sourcePayload.protectedGoalAmount)}
                tone="green"
              />
            </div>

            <div
              className={cn(
                "rounded-[1.1rem] border px-4 py-4",
                outcomeTone.wrapper,
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-[0_10px_18px_rgba(0,0,0,0.16)]",
                    outcomeTone.badge,
                  )}
                >
                  <OutcomeIcon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-[0.76rem] font-black uppercase tracking-[0.05em] text-white/72">
                    Estado actual
                  </div>
                  <div className="mt-1 text-[1.02rem] font-black text-white">
                    {outcomeCopy.label}
                  </div>
                  <div className="mt-1 text-[0.84rem] font-semibold leading-relaxed text-white/76">
                    {outcomeCopy.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="relative min-h-[30rem] overflow-hidden rounded-[1.7rem] border border-white/34 bg-[linear-gradient(180deg,#bdd7ff_0%,#9cc0fb_38%,#77a7ef_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_52%)]" />

          <div className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
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
                      label={resolvedData.summary.collectedLabel}
                      value={formatCurrency(sourcePayload.collectedAmount)}
                    />
                    <StatCard
                      label={resolvedData.summary.protectedLabel}
                      value={formatCurrency(sourcePayload.protectedGoalAmount)}
                      tone="positive"
                    />
                    <StatCard
                      label={resolvedData.summary.surplusLabel}
                      value={formatCurrency(sourcePayload.surplusAmount)}
                      tone="positive"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleStartDecision}
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
                  onClick={handleContinueFromNoSurplus}
                  className="mt-6 inline-flex min-w-[11rem] items-center justify-center rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                >
                  {resolvedData.noSurplus.buttonText}
                </button>
              </div>
            ) : null}

            {step === "opportunities" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <Typography content={resolvedData.opportunitiesSection.title} className="font-black text-[#11336d]" />
                <Typography
                  content={resolvedData.opportunitiesSection.description}
                  className="mt-2 max-w-[38rem] text-[0.95rem] font-semibold leading-relaxed text-[#234379]"
                />

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
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
                  <div className="mt-4 rounded-[1rem] border border-[#ffb48c] bg-[rgba(133,37,18,0.18)] px-4 py-3 text-[0.9rem] font-semibold text-[#6e220f]">
                    {validationMessage}
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("intro")}
                    className="inline-flex min-w-[9rem] items-center justify-center rounded-[1rem] border border-white/22 bg-white/12 px-5 py-3 text-[0.96rem] font-black text-white transition hover:bg-white/18"
                  >
                    {resolvedData.opportunitiesSection.backButtonText}
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueToDistribution}
                    className="inline-flex min-w-[14rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                  >
                    <span>{resolvedData.opportunitiesSection.buttonText}</span>
                    <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.8} />
                  </button>
                </div>
              </div>
            ) : null}

            {step === "distribution" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <Typography content={resolvedData.distributionSection.title} className="font-black text-[#11336d]" />
                <Typography
                  content={resolvedData.distributionSection.description}
                  className="mt-2 max-w-[42rem] text-[0.95rem] font-semibold leading-relaxed text-[#234379]"
                />

                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                  <div className="rounded-[1.3rem] border border-white/24 bg-[linear-gradient(180deg,rgba(19,79,188,0.18),rgba(13,55,145,0.12))] p-4">
                    <div className="text-[0.76rem] font-black uppercase tracking-[0.05em] text-white/72">
                      {resolvedData.summary.selectedOpportunityLabel}
                    </div>
                    <div className="mt-2 text-[1.2rem] font-black text-white">
                      {selectedOpportunity?.title}
                    </div>
                    <div className="mt-2 text-[0.92rem] font-semibold leading-relaxed text-white/84">
                      {selectedOpportunity?.description}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <StatCard
                        label={resolvedData.summary.durationLabel}
                        value={durationText}
                      />
                      <StatCard
                        label={resolvedData.summary.riskLabel}
                        value={selectedOpportunity?.riskLabel ?? "-"}
                      />
                    </div>

                    <div className="mt-5 grid gap-3">
                      <AmountControl
                        label={resolvedData.summary.backupLabel}
                        description="Dinero reservado por si aparece un imprevisto."
                        value={backupAmount}
                        max={sourcePayload.surplusAmount}
                        onChange={(value) =>
                          handleDistributionChange("backup", value)
                        }
                      />

                      {selectedOpportunity?.type !== "save" ? (
                        <AmountControl
                          label={resolvedData.summary.investmentLabel}
                          description={`Monto para ${selectedOpportunity?.title?.toLowerCase?.() ?? "la oportunidad"}.`}
                          value={investmentAmount}
                          max={sourcePayload.surplusAmount}
                          onChange={(value) =>
                            handleDistributionChange("investment", value)
                          }
                        />
                      ) : null}

                      <AmountControl
                        label={resolvedData.summary.optionalExpenseLabel}
                        description="Un gasto que puede esperar si prefieres guardar o invertir mas."
                        value={optionalExpenseAmount}
                        max={sourcePayload.surplusAmount}
                        onChange={(value) =>
                          handleDistributionChange("expense", value)
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] border border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-4">
                    <Typography
                      content={resolvedData.distributionSection.helperText}
                      className="text-[0.95rem] font-semibold leading-relaxed text-[#234379]"
                    />

                    <div className="mt-4 grid gap-3">
                      <StatCard
                        label={resolvedData.summary.surplusLabel}
                        value={formatCurrency(sourcePayload.surplusAmount)}
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
                        value={formatCurrency(safeRemainingAmount)}
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

                <div className="mt-5 flex flex-wrap gap-3">
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
                <Typography content={resolvedData.resultSection.title} className="font-black text-[#11336d]" />

                <div
                  className={cn(
                    "mt-5 rounded-[1.4rem] border px-5 py-5 shadow-[0_20px_36px_rgba(10,28,88,0.14)]",
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
                      <div className="mt-1 text-[1.4rem] font-black text-white">
                        {resultTitle || outcomeCopy.label}
                      </div>
                      <div className="mt-2 max-w-[42rem] text-[0.96rem] font-semibold leading-relaxed text-white/84">
                        {resultMessage || outcomeCopy.description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
                  <div className="rounded-[1.3rem] border border-white/24 bg-[linear-gradient(180deg,rgba(19,79,188,0.18),rgba(13,55,145,0.12))] p-4">
                    <div className="flex items-center gap-2 text-white/74">
                      <Clock3 className="h-4.5 w-4.5" strokeWidth={2.4} />
                      <span className="text-[0.78rem] font-black uppercase tracking-[0.05em]">
                        Paso del tiempo
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {timeline.map((entry, index) => (
                        <div
                          key={`${selectedOpportunity?.id ?? "timeline"}-${index}`}
                          className="rounded-[1rem] border border-white/16 bg-white/10 px-4 py-3 text-[0.92rem] font-semibold leading-relaxed text-white/86"
                        >
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] border border-white/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] p-4">
                    <div className="grid gap-3">
                      <StatCard
                        label={resolvedData.summary.protectedLabel}
                        value={formatCurrency(sourcePayload.protectedGoalAmount)}
                        tone="positive"
                      />
                      <StatCard
                        label={resolvedData.summary.surplusLabel}
                        value={formatCurrency(sourcePayload.surplusAmount)}
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRetryDistribution}
                    className="inline-flex min-w-[13rem] items-center justify-center rounded-[1rem] border border-white/22 bg-white/12 px-5 py-3 text-[0.96rem] font-black text-white transition hover:bg-white/18"
                  >
                    {resolvedData.resultSection.replayButtonText}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalize}
                    className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-[1rem] border border-[#ffe08a] bg-[linear-gradient(180deg,#ffd45c_0%,#f1a81f_100%)] px-6 py-3 text-[1rem] font-black text-[#6b3b00] shadow-[0_14px_24px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]"
                  >
                    <span>{resolvedData.resultSection.finalizeButtonText}</span>
                    <BadgeCheck className="h-4.5 w-4.5" strokeWidth={2.8} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
