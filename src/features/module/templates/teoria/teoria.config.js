// src/features/module/templates/teoria.config.js
export const TEORIA_CONFIG = {
  // Cada variante expositiva puede cambiar la composicion visual.
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
        area: "examples",
        className: "flex items-center justify-center",
        stackClassName: "items-center",
        items: [
          { block: "ImageCollage", props: (d) => ({ items: d.examples }) },
          // ✅ Texto extra opcional (solo si existe)
          {
            block: "Typografia",
            when: (d) => Boolean(d.note),
            className: "max-w-[760px] text-xs md:text-sm",
            props: (d) => ({
              variant: d.note?.variant ?? "caption",
              tone: d.note?.tone,
              align: d.note?.align,
              as: d.note?.as,
              className: d.note?.className,
              containerClassName: d.note?.containerClassName,
            }),
            children: (d) => d.note,
          },
        ],
      },
    ],

    split: [
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
          variant: d.leftText?.variant ?? "body",
          tone: d.leftText?.tone,
          align: d.leftText?.align ?? "left",
          as: d.leftText?.as,
          className: d.leftText?.className,
          containerClassName: d.leftText?.containerClassName,
        }),
        children: (d) => d.leftText,
      },
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
