import Typography from "../../base/Typography";
import { cn } from "@/shared/libs/utils";

const STATUS_CLASS = {
  idle: {
    panel:
      "border-[#e4a621]/60 bg-[radial-gradient(circle_at_top,rgba(139,102,255,0.78),rgba(73,26,160,0.96)_58%,rgba(41,13,89,0.98)_100%)] shadow-[0_20px_36px_rgba(53,17,108,0.34)]",
    stage:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_42%)]",
    shell:
      "border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] text-white",
    pill: "bg-white/18 text-white",
    accent: "text-amber-100",
    action:
      "border-[#a9f89a] bg-[linear-gradient(180deg,#46c63f_0%,#1f9728_100%)] text-white shadow-[0_16px_26px_rgba(31,151,40,0.28)] hover:brightness-105",
  },
  process: {
    panel:
      "border-[#ffd26d]/70 bg-[radial-gradient(circle_at_top,rgba(255,210,109,0.86),rgba(225,135,24,0.96)_58%,rgba(126,67,9,0.98)_100%)] shadow-[0_20px_36px_rgba(159,86,13,0.34)]",
    stage:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(255,244,196,0.24),transparent_44%)]",
    shell:
      "border-[#ffe29a]/55 bg-[linear-gradient(180deg,rgba(255,185,50,0.34),rgba(149,77,10,0.22))] text-white",
    pill: "bg-[#fff3cc] text-[#a85a00]",
    accent: "text-[#fff4cf]",
    action:
      "border-[#ffe29a] bg-[linear-gradient(180deg,#ffb13b_0%,#d97800_100%)] text-white shadow-[0_16px_26px_rgba(217,120,0,0.3)] hover:brightness-105",
  },
  balanced: {
    panel:
      "border-[#7cc3ff]/65 bg-[radial-gradient(circle_at_top,rgba(106,192,255,0.82),rgba(38,111,210,0.96)_58%,rgba(19,58,128,0.98)_100%)] shadow-[0_20px_36px_rgba(25,82,178,0.34)]",
    stage:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(218,244,255,0.24),transparent_44%)]",
    shell:
      "border-[#7cc3ff]/45 bg-[linear-gradient(180deg,rgba(67,151,255,0.28),rgba(26,87,167,0.18))] text-white",
    pill: "bg-[#dff2ff] text-[#195db2]",
    accent: "text-[#dff2ff]",
    action:
      "border-[#aee5ff] bg-[linear-gradient(180deg,#45a8ff_0%,#1e6ed2_100%)] text-white shadow-[0_16px_26px_rgba(30,110,210,0.3)] hover:brightness-105",
  },
  good: {
    panel:
      "border-[#9bf093]/65 bg-[radial-gradient(circle_at_top,rgba(103,222,117,0.82),rgba(35,156,64,0.96)_58%,rgba(17,89,42,0.98)_100%)] shadow-[0_20px_36px_rgba(23,121,47,0.34)]",
    stage:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(237,255,224,0.24),transparent_44%)]",
    shell:
      "border-[#9bf093]/45 bg-[linear-gradient(180deg,rgba(70,193,81,0.32),rgba(23,108,36,0.22))] text-white",
    pill: "bg-[#efffe6] text-[#237233]",
    accent: "text-[#efffe6]",
    action:
      "border-[#baf7a8] bg-[linear-gradient(180deg,#34c85d_0%,#14943c_100%)] text-white shadow-[0_16px_26px_rgba(20,148,60,0.3)] hover:brightness-105",
  },
  risk: {
    panel:
      "border-[#ff9aa5]/65 bg-[radial-gradient(circle_at_top,rgba(255,112,130,0.82),rgba(176,38,73,0.96)_58%,rgba(93,17,45,0.98)_100%)] shadow-[0_20px_36px_rgba(147,24,54,0.34)]",
    stage:
      "bg-[radial-gradient(circle_at_50%_18%,rgba(255,226,232,0.2),transparent_44%)]",
    shell:
      "border-[#ff9aa5]/45 bg-[linear-gradient(180deg,rgba(255,78,107,0.3),rgba(153,20,46,0.22))] text-white",
    pill: "bg-[#fff0f2] text-[#b4233d]",
    accent: "text-[#fff0f2]",
    action:
      "border-[#ffb4bd] bg-[linear-gradient(180deg,#ff5470_0%,#c82046_100%)] text-white shadow-[0_16px_26px_rgba(200,32,70,0.3)] hover:brightness-105",
  },
};

const BADGE_VARIANT_CLASS = {
  indigo:
    "border-[#91a9ff]/70 bg-[linear-gradient(180deg,#5475ff_0%,#263ab8_100%)] text-white",
  rose: "border-[#ff9dbd]/70 bg-[linear-gradient(180deg,#ff4d87_0%,#c6255c_100%)] text-white",
  forest:
    "border-[#c6ec84]/70 bg-[linear-gradient(180deg,#7bd452_0%,#3a8d2b_100%)] text-white",
};

const ACTION_BUTTON_CLASS = {
  disabled:
    "cursor-not-allowed border-[#dbc58c] bg-[linear-gradient(180deg,#dbc98f_0%,#b79f62_100%)] text-white/85 opacity-75",
  review:
    "border-[#a9f89a] bg-[linear-gradient(180deg,#46c63f_0%,#1f9728_100%)] text-white shadow-[0_16px_26px_rgba(31,151,40,0.28)] hover:brightness-105",
  warning:
    "border-[#ffd27c] bg-[linear-gradient(180deg,#ffad31_0%,#df7b00_100%)] text-white shadow-[0_16px_26px_rgba(223,123,0,0.28)] hover:brightness-105",
  success:
    "border-[#baf7a8] bg-[linear-gradient(180deg,#34c85d_0%,#14943c_100%)] text-white shadow-[0_16px_26px_rgba(20,148,60,0.3)] hover:brightness-105",
  done: "cursor-default border-[#baf7a8] bg-[linear-gradient(180deg,#34c85d_0%,#14943c_100%)] text-white opacity-85",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function formatCurrency(value) {
  return `S/${Math.round(Number(value ?? 0))}`;
}

function MetricBadge({ title, value, variant, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-[clamp(0.75rem,1.8vw,1rem)] border px-[clamp(0.45rem,1.3vw,0.75rem)] py-[clamp(0.35rem,1vw,0.55rem)] text-center",
        "shadow-[0_12px_20px_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.18)]",
        BADGE_VARIANT_CLASS[variant] ?? BADGE_VARIANT_CLASS.indigo,
        className,
      )}
    >
      <Typography
        content={{ text: title, variant: "caption", align: "center", color: "primary" }}
        className="text-[clamp(0.5rem,1.15vw,0.68rem)] font-black uppercase tracking-[0.05em] leading-none opacity-90"
      />
      <Typography
        content={{ text: value, variant: "label", align: "center", color: "primary" }}
        className="mt-[clamp(0.15rem,0.5vw,0.3rem)] text-[clamp(1rem,2.45vw,1.55rem)] font-black leading-none"
      />
    </div>
  );
}

function FallbackStackCard({ item }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[0.75rem] bg-white/15 px-2 text-center text-[clamp(0.56rem,1.25vw,0.72rem)] font-black leading-tight text-white">
      {item.label ?? formatCurrency(item.amount)}
    </div>
  );
}

function ScalePan({
  label,
  value,
  variant,
  stackItems,
  emptyLabel,
  onOpenStack,
  angle,
  side,
  renderStackItem,
}) {
  const chainClass =
    side === "left"
      ? "border-[#ff7d64]/80 shadow-[0_0_8px_rgba(255,125,100,0.28)]"
      : "border-[#60d49d]/80 shadow-[0_0_8px_rgba(96,212,157,0.28)]";
  const isStackInteractive = Boolean(onOpenStack && stackItems.length);

  return (
    <div
      className={cn(
        "absolute top-0 z-40 w-[clamp(6rem,31%,9.4rem)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        side === "left" ? "left-0" : "left-full",
      )}
      style={{
        transform: `translateX(-50%) rotate(${-angle}deg)`,
        transformOrigin: "50% 0%",
      }}
    >
      <div className="relative h-[clamp(8rem,28vw,10.4rem)] w-full">
        <div className="absolute left-1/2 top-[0.18rem] z-20 h-[clamp(1.05rem,18%,1.55rem)] w-[clamp(0.38rem,7%,0.58rem)] -translate-x-1/2 rounded-full border border-[#9c5c00] bg-[linear-gradient(180deg,#ffe17d_0%,#e89300_100%)] shadow-[0_4px_8px_rgba(71,26,0,0.22)]" />

        <div
          className={cn(
            "absolute left-[50%] top-[clamp(0.95rem,16%,1.25rem)] z-10 h-[clamp(3rem,48%,4.35rem)] w-0 origin-top rotate-[18deg] border-l-2 border-dashed",
            chainClass,
          )}
        />
        <div
          className={cn(
            "absolute left-[50%] top-[clamp(0.95rem,16%,1.25rem)] z-10 h-[clamp(3rem,48%,4.35rem)] w-0 origin-top -rotate-[18deg] border-l-2 border-dashed",
            chainClass,
          )}
        />

        <div
          role={isStackInteractive ? "button" : undefined}
          tabIndex={isStackInteractive ? 0 : undefined}
          aria-label={isStackInteractive ? "Abrir gastos seleccionados" : undefined}
          onClick={isStackInteractive ? onOpenStack : undefined}
          onKeyDown={(event) => {
            if (!isStackInteractive) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenStack();
            }
          }}
          className={cn(
            "absolute left-1/2 top-[clamp(1.55rem,24%,2.05rem)] z-30 flex h-[clamp(4.05rem,62%,5.65rem)] w-[94%] -translate-x-1/2 items-end justify-center rounded-[clamp(0.9rem,2vw,1.18rem)] border-2 border-dashed border-white/35 bg-white/10 px-[clamp(0.35rem,1vw,0.6rem)] pb-[clamp(0.45rem,1.2vw,0.7rem)] shadow-[inset_0_2px_10px_rgba(255,255,255,0.08)]",
            isStackInteractive &&
              "cursor-pointer transition hover:border-white/65 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/45",
          )}
        >
          {stackItems.length ? (
            stackItems.map((item, index) => (
              <div
                key={item.id}
                className="absolute h-[clamp(3.25rem,8vh,4.65rem)] w-[82%] min-w-[4.8rem] max-w-[7rem]"
                style={{
                  bottom: `calc(${index} * clamp(0.28rem,0.9vw,0.42rem) + clamp(0.28rem,0.8vw,0.42rem))`,
                  transform: `translateX(calc(${index} * clamp(0.14rem,0.5vw,0.28rem)))`,
                  zIndex: index + 1,
                }}
              >
                {renderStackItem ? (
                  renderStackItem({
                    item,
                    index,
                    side,
                    isExpense: side === "right",
                    onOpenStack,
                  })
                ) : (
                  <FallbackStackCard item={item} />
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-center text-[clamp(0.52rem,1.2vw,0.72rem)] font-bold leading-tight text-white/75">
              {emptyLabel}
            </div>
          )}
        </div>

        <div className="absolute left-1/2 top-[clamp(5.7rem,91%,7.15rem)] z-40 h-[clamp(0.6rem,1.5vw,0.85rem)] w-[82%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#ffcb55_0%,#d88100_100%)] shadow-[0_10px_14px_rgba(81,22,0,0.24)]" />
        <div className="absolute left-1/2 top-[clamp(5.25rem,84%,6.55rem)] z-40 h-[clamp(0.9rem,2.2vw,1.25rem)] w-[96%] -translate-x-1/2 rounded-[999px] border border-[#9c5c00] bg-[linear-gradient(180deg,#ffd86d_0%,#f09819_100%)] shadow-[inset_0_4px_10px_rgba(255,255,255,0.32)]" />

        <MetricBadge
          title={label}
          value={value}
          variant={variant}
          className="absolute left-1/2 top-[clamp(6.75rem,106%,8.35rem)] z-40 w-[min(7.2rem,96%)] -translate-x-1/2"
        />

        <div className="sr-only">
          {stackItems.length
            ? `${stackItems.length} tarjetas colocadas`
            : "Sin tarjetas"}
        </div>
      </div>
    </div>
  );
}

export default function BalanceScale({
  income,
  expenses,
  balance,
  incomeItems,
  expenseItems,
  status,
  actionModel,
  onAction,
  onOpenExpenseStack,
  renderStackItem,
}) {
  const maxTilt = 6;
  const maxWeight = Math.max(income, expenses, 1);
  const angle = clamp(
    ((expenses - income) / maxWeight) * maxTilt,
    -maxTilt,
    maxTilt,
  );

  const stateClass = STATUS_CLASS[status.tone] ?? STATUS_CLASS.idle;
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-[1.6rem] border p-[clamp(0.45rem,1.1vh,0.65rem)] transition-colors duration-300",
        stateClass.panel,
      )}
    >
      <div className="grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)_clamp(2.85rem,8vh,3.75rem)_clamp(2.45rem,6.5vh,3.2rem)] gap-[clamp(0.2rem,0.5vh,0.35rem)]">
        <div
          className={cn(
            "relative mx-auto h-full min-h-0 w-full max-w-[36rem] overflow-hidden rounded-[1.25rem]",
            stateClass.stage,
          )}
        >
          <div className="pointer-events-none absolute inset-x-8 top-3 h-24 rounded-full bg-white/8 blur-2xl" />

          <div className="absolute left-1/2 top-[15%] z-20 h-[70%] w-4 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#ffc74e_0%,#d87b00_100%)] shadow-[0_12px_18px_rgba(83,33,0,0.34)]" />

          <div className="absolute bottom-0 left-1/2 z-20 h-4 w-[6.2rem] -translate-x-1/2 rounded-[999px] border border-[#8d4f00] bg-[linear-gradient(180deg,#ffcf5d_0%,#c06b00_100%)] shadow-[0_12px_18px_rgba(71,26,0,0.34)]" />

          <div className="absolute left-1/2 top-[13%] z-30 h-0 w-[68%] -translate-x-1/2">
            <div
              className="relative h-0 w-full origin-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute left-0 top-[clamp(-0.5rem,-1vw,-0.38rem)] z-30 h-[clamp(0.75rem,1.8vw,1rem)] w-full rounded-[999px] border border-[#a95f00] bg-[linear-gradient(180deg,#ffd24e_0%,#ef9600_100%)] shadow-[0_8px_18px_rgba(255,174,44,0.26)]" />

              <div className="absolute left-0 top-0 z-50 h-[clamp(1.2rem,3vw,1.65rem)] w-[clamp(1.2rem,3vw,1.65rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9c5c00] bg-[radial-gradient(circle_at_35%_35%,#fff3b8_0%,#ffc336_56%,#d67800_100%)] shadow-[0_4px_10px_rgba(71,26,0,0.24)]" />
              <div className="absolute left-full top-0 z-50 h-[clamp(1.2rem,3vw,1.65rem)] w-[clamp(1.2rem,3vw,1.65rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9c5c00] bg-[radial-gradient(circle_at_35%_35%,#fff3b8_0%,#ffc336_56%,#d67800_100%)] shadow-[0_4px_10px_rgba(71,26,0,0.24)]" />

              <div className="absolute left-1/2 top-0 z-50 h-[clamp(2.45rem,6vw,3.25rem)] w-[clamp(2.45rem,6vw,3.25rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#d67d00] bg-[radial-gradient(circle_at_35%_35%,#fff3ba_0%,#ffc83a_45%,#f09a00_100%)] shadow-[0_0_0_4px_rgba(255,221,136,0.14)]">
                <div className="absolute left-1/2 top-1/2 h-[clamp(0.85rem,2vw,1.1rem)] w-[clamp(0.85rem,2vw,1.1rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7d4300] bg-[#fff5cf]" />
              </div>

              <ScalePan
                label="Ingresos"
                value={formatCurrency(income)}
                variant="indigo"
                stackItems={incomeItems}
                emptyLabel="Sin base"
                angle={angle}
                side="left"
                renderStackItem={renderStackItem}
              />

              <ScalePan
                label="Gastos"
                value={formatCurrency(expenses)}
                variant="rose"
                stackItems={expenseItems}
                emptyLabel="Haz click en las tarjetas"
                onOpenStack={onOpenExpenseStack}
                angle={angle}
                side="right"
                renderStackItem={renderStackItem}
              />
            </div>
          </div>

          <div className="absolute bottom-[clamp(0.2rem,0.7vw,0.55rem)] left-1/2 z-30 w-[clamp(6.2rem,25%,8.6rem)] -translate-x-1/2 rounded-[clamp(0.65rem,1.4vw,0.9rem)] border border-[#f3cb63]/75 bg-[linear-gradient(180deg,#fff8df_0%,#fff0ad_100%)] px-[clamp(0.45rem,1.2vw,0.7rem)] py-[clamp(0.35rem,0.9vw,0.55rem)] text-center shadow-[0_10px_16px_rgba(47,18,0,0.18)]">
            <Typography
              content={{ text: "Saldo", variant: "caption", align: "center" }}
              className="text-[clamp(0.62rem,1.35vw,0.78rem)] font-black leading-none text-[#f1b300]"
            />
            <Typography
              content={{
                text: formatCurrency(balance),
                variant: "label",
                align: "center",
              }}
              className={cn(
                "mt-0.5 text-[clamp(1.05rem,3.2vw,1.55rem)] font-black leading-none",
                balance < 0 ? "text-[#e33b4f]" : "text-[#58d79a]",
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            "flex h-full min-h-0 items-center justify-between gap-2 overflow-hidden rounded-[0.85rem] border px-[clamp(0.6rem,1.3vw,0.85rem)] py-[clamp(0.28rem,0.65vh,0.45rem)]",
            stateClass.shell,
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <span
              className={cn(
                "inline-flex h-[clamp(1.65rem,3.8vw,2rem)] w-[clamp(1.65rem,3.8vw,2rem)] shrink-0 items-center justify-center rounded-full",
                stateClass.pill,
              )}
            >
              <StatusIcon className="h-[clamp(0.85rem,2vw,1rem)] w-[clamp(0.85rem,2vw,1rem)]" />
            </span>

            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-[clamp(0.75rem,1.8vw,0.9rem)] font-extrabold leading-tight text-white">
                Estado: {status.label}
              </p>
              <p className="truncate text-[clamp(0.58rem,1.35vw,0.7rem)] font-semibold leading-tight text-white/85">
                Cuida que quede saldo disponible
              </p>
            </div>
          </div>

          <div
            className={cn(
              "hidden min-w-[clamp(7.5rem,32%,12rem)] max-w-[42%] shrink-0 overflow-hidden text-right text-[clamp(0.48rem,1.1vw,0.6rem)] font-bold uppercase leading-tight sm:block",
              stateClass.accent,
            )}
          >
            <p className="line-clamp-2">
              Posibles estados: Equilibrado - Riesgo - Bueno
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={actionModel.disabled}
          onClick={onAction}
          className={cn(
            "inline-flex h-full min-h-0 w-full items-center justify-center rounded-[0.85rem] border px-4 py-0 text-[clamp(0.82rem,2vw,1rem)] font-black leading-tight transition duration-200",
            !actionModel.disabled && "cursor-pointer",
            actionModel.disabled
              ? ACTION_BUTTON_CLASS.disabled
              : stateClass.action ?? ACTION_BUTTON_CLASS[actionModel.tone] ?? ACTION_BUTTON_CLASS.review,
          )}
        >
          {actionModel.label}
        </button>
      </div>
    </div>
  );
}
