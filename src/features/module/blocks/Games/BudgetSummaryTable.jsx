import Typografia from "../Typografia";
import { cn } from "@/shared/libs/utils";

function ValueCell({ value }) {
  const isBlank = value === undefined || value === null || value === "";

  return (
    <span
      className={cn(
        "text-sm font-bold md:text-base",
        isBlank ? "text-white/45" : "text-white",
      )}
    >
      {isBlank ? "____" : value}
    </span>
  );
}

function BudgetColumn({ title, rows = [] }) {
  return (
    <section className="rounded-2xl border border-white/15 p-4">
      <Typografia
        variant="subtitle2"
        align="center"
        className="pb-3 text-[13px] font-extrabold uppercase tracking-[0.14em]"
      >
        {title}
      </Typografia>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row?.id ?? index}
            className="flex items-start justify-between gap-3 border-b border-white/10 pb-2 last:border-b-0 last:pb-0"
          >
            <span className="text-left text-xs font-medium leading-snug text-white/80 md:text-sm">
              {row?.label}
            </span>
            <ValueCell value={row?.value} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryColumn({ rows = [] }) {
  return (
    <section className="rounded-2xl border border-white/15 p-4">
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row?.id ?? index}
            className="rounded-xl border border-white/10 px-3 py-3"
          >
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/65 md:text-xs">
              {row?.label}
            </div>
            <div className="pt-1">
              <ValueCell value={row?.value} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BudgetSummaryTable({
  prompt,
  columns = [],
  summary = [],
  note,
  className = "",
}) {
  return (
    <div className={cn("w-full max-w-6xl space-y-4", className)}>
      {prompt && (
        <Typografia
          content={prompt}
          variant={prompt?.variant ?? "body1"}
          align={prompt?.align ?? "left"}
          className="py-0"
          containerClassName={cn(
            "rounded-xl border border-white/15 px-4 py-3",
            prompt?.containerClassName,
          )}
        />
      )}

      <div className="grid gap-3 xl:grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr]">
        {columns.map((column, index) => (
          <BudgetColumn
            key={column?.id ?? index}
            title={column?.title}
            rows={column?.rows}
          />
        ))}

        <SummaryColumn rows={summary} />
      </div>

      {note && (
        <Typografia
          content={note}
          variant={note?.variant ?? "body2"}
          align={note?.align ?? "left"}
          className="py-0 text-xs md:text-sm"
          containerClassName={cn(
            "rounded-xl border border-white/10 px-4 py-3",
            note?.containerClassName,
          )}
        />
      )}
    </div>
  );
}
