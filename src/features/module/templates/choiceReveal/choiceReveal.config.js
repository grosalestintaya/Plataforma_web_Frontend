// Choice Reveal comparte un solo flujo y varia la disposicion de opciones.
export const CHOICE_REVEAL_CONFIG = {
  layout: {
    maxWidth: "max-w-6xl",
    titleWidth: "max-w-[720px]",
    textWidth: "max-w-[760px]",
    feedbackWidth: "max-w-[760px]",
  },
  variantMap: {
    default: "binaryChoice",
    binaryChoice: "binaryChoice",
    gridChoice: "gridChoice",
    labelChoice: "labelChoice",
  },
  variants: {
    binaryChoice: {
      optionsClassName: "grid gap-4 md:grid-cols-2",
      compact: false,
    },
    gridChoice: {
      optionsClassName: "grid gap-4 sm:grid-cols-2",
      compact: false,
    },
    labelChoice: {
      optionsClassName: "grid gap-3",
      compact: true,
    },
  },
  fallbackVariant: "binaryChoice",
};
