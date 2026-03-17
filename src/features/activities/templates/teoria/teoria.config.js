// src/features/module/templates/teoria.config.js
export const TEORIA_CONFIG = {
  // layouts por variante
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

  // slots por variante (declara qué bloque va en qué area)
  variants: {
    simple: [
      { area: "title", block: "Title", children: (d) => d.title },
      {
        area: "text",
        block: "Text",
        className: "flex items-center justify-center",
        children: (d) => d.text,
      },
      {
        area: "image",
        block: "Image",
        className: "flex items-center justify-center",
        props: (d) => ({ src: d.image?.src, alt: d.image?.alt }),
      },
    ],

    examples: [
      { area: "title", block: "Title", children: (d) => d.title },
      {
        area: "text",
        block: "Text",
        className: "flex items-center justify-center",
        children: (d) => d.text,
      },
      {
        area: "examples",
        className: "flex items-center justify-center",
        stackClassName: "items-center",
        items: [
          { block: "ImageCollage", props: (d) => ({ items: d.examples }) },
          // ✅ Texto extra opcional (solo si existe)
          {
            block: "Text",
            when: (d) => Boolean(d.note),
            className: "max-w-[760px] text-xs md:text-sm",
            children: (d) => d.note,
          },
        ],
      },
    ],

    split: [
      { area: "title", block: "Title", children: (d) => d.title },
      {
        area: "text",
        block: "Text",
        className: "flex items-center justify-center",
        children: (d) =>
          Array.isArray(d.leftText) ? d.leftText.join("\n\n") : d.leftText,
      },
      {
        area: "image",
        block: "Image",
        className: "flex items-center justify-center",
        props: (d) => ({ src: d.rightImage?.src, alt: d.rightImage?.alt }),
      },
    ],

    compare: [
      { area: "title", block: "Title", children: (d) => d.title },

      {
        area: "text",
        block: "Text",
        className: "flex items-center justify-center",
        children: (d) => d.text,
      },

      {
        area: "compare",
        block: "Compare2Items",
        className: "flex items-center justify-center",
        props: (d) => ({ items: d.items }),
      },
    ],
  },

  fallbackVariant: "simple",
};
// Futuro:
// quiz: { mcq: {...}, trueFalse: {...} }
// procedural: { intro: {...}, board: {...} }
