// Step Guide usa un solo layout y cambia solo la forma de mostrar el detalle.
export const STEP_GUIDE_CONFIG = {
  layout: {
    base: {
      cols: "1fr",
      rows: "auto 1fr",
      areas: ["title", "steps"],
      gap: "20px",
    },
  },
  variantMap: {
    default: "modalDetail",
    modalDetail: "modalDetail",
    inlineDetail: "inlineDetail",
  },
  variants: {
    modalDetail: [
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
        area: "steps",
        block: "InteractiveStepsGuide",
        className: "flex items-center justify-center",
        props: (d) => ({ steps: d.steps }),
      },
    ],
    inlineDetail: [
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
        area: "steps",
        block: "InteractiveStepsGuide",
        className: "flex items-center justify-center",
        props: (d) => ({ steps: d.steps }),
      },
    ],
  },
  fallbackVariant: "modalDetail",
};
