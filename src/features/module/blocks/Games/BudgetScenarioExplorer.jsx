import { useMemo, useState } from "react";
import Typografia from "../Typografia";
import { cn } from "@/shared/libs/utils";

function formatCurrency(value) {
  if (value === "" || value === null || value === undefined || Number.isNaN(value)) {
    return "";
  }

  const amount = Number(value);
  return `S/ ${amount.toFixed(2)}`;
}

function MoneyCell({ value, isEmphasis = false }) {
  const isBlank = value === "";

  return (
    <span
      className={cn(
        "text-sm font-bold md:text-base",
        isEmphasis ? "text-amber-200" : "text-white",
        isBlank ? "text-white/45" : "",
      )}
    >
      {isBlank ? "____" : formatCurrency(value)}
    </span>
  );
}

function ColumnCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/20 p-4">
      <Typografia
        variant="subtitle2"
        align="center"
        className="pb-3 text-[13px] font-extrabold uppercase tracking-[0.14em]"
      >
        {title}
      </Typografia>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
      <span className="text-left text-xs font-medium leading-snug text-white/80 md:text-sm">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function BudgetScenarioExplorer({
  budget,
  className = "",
}) {
  const inputConfig = budget?.interactiveInput ?? {};
  const [inputValue, setInputValue] = useState(inputConfig.initialValue ?? "");

  const parsedInput = inputValue === "" ? null : Number(inputValue);
  const isInputValid = parsedInput !== null && !Number.isNaN(parsedInput);

  const totalIncome = useMemo(
    () =>
      (budget?.incomeItems ?? []).reduce(
        (acc, item) => acc + Number(item.value || 0),
        0,
      ),
    [budget?.incomeItems],
  );

  const baseExpenses = useMemo(
    () =>
      (budget?.expenseItems ?? [])
        .filter((item) => !item.isInteractive)
        .reduce((acc, item) => acc + Number(item.value || 0), 0),
    [budget?.expenseItems],
  );

  const interactiveTotal = useMemo(() => {
    if (!isInputValid) return "";

    const multiplier = Number(inputConfig.multiplier || 1);
    return parsedInput * multiplier;
  }, [inputConfig.multiplier, isInputValid, parsedInput]);

  const totalExpenses =
    interactiveTotal === "" ? "" : baseExpenses + Number(interactiveTotal);
  const balance = totalExpenses === "" ? "" : totalIncome - Number(totalExpenses);

  const stateKey =
    balance === ""
      ? "blank"
      : balance > 0
        ? "positive"
        : balance < 0
          ? "negative"
          : "neutral";

  const activeNote = budget?.notes?.[stateKey] ?? budget?.notes?.blank;

  return (
    <div className={cn("w-full max-w-6xl space-y-4", className)}>
      {budget?.prompt && (
        <Typografia
          content={budget.prompt}
          variant={budget.prompt?.variant ?? "body2"}
          align={budget.prompt?.align ?? "left"}
          className="py-0 text-left"
          containerClassName={cn("rounded-xl border border-white/15 px-4 py-3")}
        />
      )}

      <div className="grid gap-3 xl:grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr]">
        <ColumnCard title="Ingresos">
          {(budget?.incomeItems ?? []).map((item, index) => (
            <Row key={item?.id ?? index} label={item.label}>
              <MoneyCell value={item.value} />
            </Row>
          ))}
          <Row label="Total">
            <MoneyCell value={totalIncome} isEmphasis />
          </Row>
        </ColumnCard>

        <ColumnCard title="Gastos">
          {(budget?.expenseItems ?? []).map((item, index) => {
            if (item.isInteractive) {
              return (
                <Row key={item?.id ?? index} label={item.label}>
                  <div className="flex min-w-[92px] items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-white/80">S/</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      className="w-16 border-b border-white/35 bg-transparent px-1 py-0.5 text-right text-sm font-bold text-white outline-none placeholder:text-white/35"
                      placeholder="__"
                    />
                  </div>
                </Row>
              );
            }

            return (
              <Row key={item?.id ?? index} label={item.label}>
                <MoneyCell value={item.value} />
              </Row>
            );
          })}
          <Row label="Total">
            <MoneyCell value={totalExpenses} isEmphasis />
          </Row>
        </ColumnCard>

        <ColumnCard title="Saldo">
          <Row label="Disponible">
            <MoneyCell value={balance} isEmphasis />
          </Row>
          <Row label="Margen">
            <MoneyCell value={balance} />
          </Row>
          <Row label="Total saldo">
            <MoneyCell value={balance} isEmphasis />
          </Row>
        </ColumnCard>

        <ColumnCard title="Resumen">
          <Row label="Total ingresos">
            <MoneyCell value={totalIncome} isEmphasis />
          </Row>
          <Row label="Total gastos">
            <MoneyCell value={totalExpenses} isEmphasis />
          </Row>
          <Row label="Total saldo">
            <MoneyCell value={balance} isEmphasis />
          </Row>
        </ColumnCard>
      </div>

      {activeNote && (
        <Typografia
          content={activeNote}
          variant={activeNote?.variant ?? "body2"}
          align={activeNote?.align ?? "left"}
          className="py-0 text-left text-sm"
          containerClassName="rounded-xl border border-white/15 px-4 py-3"
        />
      )}
    </div>
  );
}
