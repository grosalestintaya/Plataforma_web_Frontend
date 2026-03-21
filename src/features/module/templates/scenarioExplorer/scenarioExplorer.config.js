// Scenario Explorer mantiene un solo canvas y cambia la dinamica interna.
export const SCENARIO_EXPLORER_CONFIG = {
  layout: {
    base: {
      cols: "1fr",
      rows: "auto auto 1fr",
      areas: ["title", "text", "table"],
      gap: "18px",
    },
  },
  variantMap: {
    default: "numericOutcome",
    numericOutcome: "numericOutcome",
    rangeOutcome: "rangeOutcome",
    weeklyBudget: "weeklyBudget",
  },
  variants: {
    numericOutcome: [
      {
        area: "title",
        block: "Typografia",
        props: (d) => ({
          variant: d.title?.variant ?? "title",
          tone: d.title?.tone,
          align: d.title?.align,
          as: d.title?.as ?? "h2",
          className: d.title?.className,
          containerClassName: d.title?.containerClassName,
        }),
        children: (d) => d.title,
      },
      {
        area: "text",
        block: "Typografia",
        className: "flex items-center justify-center",
        props: (d) => ({
          variant: d.text?.variant ?? "body",
          tone: d.text?.tone,
          align: d.text?.align,
          as: d.text?.as,
          className: d.text?.className,
          containerClassName: d.text?.containerClassName,
        }),
        children: (d) => d.text,
      },
      {
        area: "table",
        block: "BudgetScenarioExplorer",
        className: "flex items-start justify-center",
        props: (d) => ({
          budget: d.budget,
        }),
      },
    ],
    rangeOutcome: [
      {
        area: "title",
        block: "Typografia",
        props: (d) => ({
          variant: d.title?.variant ?? "title",
          tone: d.title?.tone,
          align: d.title?.align,
          as: d.title?.as ?? "h2",
          className: d.title?.className,
          containerClassName: d.title?.containerClassName,
        }),
        children: (d) => d.title,
      },
      {
        area: "text",
        block: "Typografia",
        className: "flex items-center justify-center",
        props: (d) => ({
          variant: d.text?.variant ?? "body",
          tone: d.text?.tone,
          align: d.text?.align,
          as: d.text?.as,
          className: d.text?.className,
          containerClassName: d.text?.containerClassName,
        }),
        children: (d) => d.text,
      },
      {
        area: "table",
        block: "BudgetScenarioExplorer",
        className: "flex items-start justify-center",
        props: (d) => ({
          budget: d.budget,
        }),
      },
    ],
    weeklyBudget: [
      {
        area: "title",
        block: "Typografia",
        props: (d) => ({
          variant: d.title?.variant ?? "title",
          tone: d.title?.tone,
          align: d.title?.align,
          as: d.title?.as ?? "h2",
          className: d.title?.className,
          containerClassName: d.title?.containerClassName,
        }),
        children: (d) => d.title,
      },
      {
        area: "text",
        block: "Typografia",
        className: "flex items-center justify-center",
        props: (d) => ({
          variant: d.text?.variant ?? "body",
          tone: d.text?.tone,
          align: d.text?.align,
          as: d.text?.as,
          className: d.text?.className,
          containerClassName: d.text?.containerClassName,
        }),
        children: (d) => d.text,
      },
      {
        area: "table",
        block: "BudgetScenarioExplorer",
        className: "flex items-start justify-center",
        props: (d) => ({
          budget: d.budget,
        }),
      },
    ],
  },
  fallbackVariant: "numericOutcome",
};
