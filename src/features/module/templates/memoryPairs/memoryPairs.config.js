export const MEMORY_PAIRS_CONFIG = {
  layouts: {
    board: {
      base: {
        cols: "1fr",
        rows: "auto 1fr",
        areas: ["title", "board"],
        gap: "16px"
      }
    }
  },

  variants: {
    board: [
      { area: "title", block: "Title", children: (d) => d.title },
      {
        area: "board",
        block: "MemoryPairsGame",
        props: (d, ctx) => ({
          cards: d.cards,
          grid: d.grid ?? { cols: 4, rows: 3 },
          finishLabel: d.finishLabel ?? "Fin",
          onFinish: () => {
            // Aquí defines la acción al terminar.
            // Si luego tienes “menu del módulo”, lo conectas aquí.
            if (ctx?.heroApi?.goToModuleMenu) return ctx.heroApi.goToModuleMenu();
            console.log("Fin → ir al menú del módulo");
          }
        })
      }
    ]
  },

  fallbackVariant: "board"
};