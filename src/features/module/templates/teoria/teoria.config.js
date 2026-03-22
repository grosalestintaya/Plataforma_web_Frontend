// Crea un slot de tipografia y reutiliza el mismo contrato en todas las variantes.
function createTypographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typografia",
    props: (d) => {
      const content = d[contentKey];

      return {
        variant: content?.variant ?? fallbackVariant,
        color: content?.color,
        align: content?.align,
        component: content?.component,
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    children: (d) => d[contentKey],
    ...extra,
  };
}

// Mantiene el titulo con semantica de heading aunque cambie la variante visual.
function createTitleSlot() {
  return createTypographySlot("title", "title", "h4", {
    props: (d) => ({
      variant: d.title?.variant ?? "h4",
      color: d.title?.color,
      align: d.title?.align,
      component: d.title?.component ?? "h2",
      className: d.title?.className,
      containerClassName: d.title?.containerClassName,
    }),
    children: (d) => d.title,
  });
}

export const TEORIA_CONFIG = {
  // Las variantes expositivas comparten template, pero pueden redistribuir sus areas.
  layouts: {
    simple: {
      base: {
        cols: "1fr",
        rows: "auto 1fr 2fr",
        areas: ["title", "text", "image"],
        gap: "16px",
      },
    },
    examples: {
      base: {
        cols: "1fr",
        rows: "auto 1fr 2fr",
        areas: ["title", "text", "examples"],
        gap: "16px",
      },
    },
    split: {
      base: {
        cols: "1fr",
        rows: "auto 1fr 2fr",
        areas: ["title", "text", "image"],
        gap: "16px",
      },
      md: {
        cols: "7fr 5fr",
        rows: "auto 1fr",
        areas: ["title title", "text image"],
      },
    },
    compare: {
      base: {
        cols: "1fr",
        rows: "auto 1fr 2fr",
        areas: ["title", "text", "compare"],
        gap: "16px",
      },
    },
  },

  // Cada variante declara que bloque vive en cada area del layout.
  variants: {
    simple: [
      createTitleSlot(),
      createTypographySlot("text", "text", "body1", {
        className: "flex items-center justify-center",
      }),
      {
        area: "image",
        block: "Image",
        className: "flex items-center justify-center",
        props: (d) => ({
          src: d.image?.src,
          alt: d.image?.alt,
          placeholderLabel: d.image?.placeholderLabel,
        }),
      },
    ],

    examples: [
      createTitleSlot(),
      createTypographySlot("text", "text", "body1", {
        className: "flex items-center justify-center",
      }),
      {
        area: "examples",
        className: "flex items-center justify-center",
        stackClassName: "items-center",
        items: [
          { block: "ImageCollage", props: (d) => ({ items: d.examples }) },
          createTypographySlot("examples", "note", "caption", {
            // La nota solo aparece cuando el contenido realmente la define.
            when: (d) => Boolean(d.note),
            className: "max-w-[760px] text-xs md:text-sm",
          }),
        ],
      },
    ],

    split: [
      createTitleSlot(),
      createTypographySlot("text", "leftText", "body1", {
        className: "flex items-center justify-center",
        props: (d) => ({
          variant: d.leftText?.variant ?? "body1",
          color: d.leftText?.color,
          align: d.leftText?.align ?? "left",
          component: d.leftText?.component,
          className: d.leftText?.className,
          containerClassName: d.leftText?.containerClassName,
        }),
        children: (d) => d.leftText,
      }),
      {
        area: "image",
        block: "Image",
        className: "flex items-center justify-center",
        props: (d) => ({
          src: d.rightImage?.src,
          alt: d.rightImage?.alt,
          placeholderLabel: d.rightImage?.placeholderLabel,
        }),
      },
    ],

    compare: [
      createTitleSlot(),
      createTypographySlot("text", "text", "body1", {
        className: "flex items-center justify-center",
      }),
      {
        area: "compare",
        // Usa el nombre real del bloque compartido.
        block: "CompareItems",
        className: "flex items-center justify-center",
        props: (d) => ({ items: d.items }),
      },
    ],
  },

  fallbackVariant: "simple",
}