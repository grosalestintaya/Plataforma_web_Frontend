// Config base: el juego usa un solo canvas y la variante define el modo de tablero.
export const MEMORY_PAIRS_CONFIG = {
  layout: {
    base: {
      cols: "1fr",
      rows: "auto 1fr",
      areas: ["title", "board"],
      gap: "16px",
    },
  },

  variants: {
    board: [
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
        area: "board",
        block: "MemoryPairsGame",
        props: (d, ctx) => ({
          cards: d.cards,
          grid: d.grid ?? { cols: 4, rows: 3 },
          finishLabel: d.finishLabel ?? "Fin",
          onFinish: () => {
            // Delega la salida final al flujo que invoca el template.
            if (ctx?.heroApi?.goToModuleMenu) return ctx.heroApi.goToModuleMenu();
            console.log("Fin -> ir al menu del modulo");
          },
        }),
      },
    ],
  },

  fallbackVariant: "board",
};
