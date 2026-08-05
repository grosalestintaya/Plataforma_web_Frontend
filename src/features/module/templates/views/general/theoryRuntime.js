const TEMPLATE_VARIANTS = {
  simpleTheory: "simple",
  explanationTheory: "explanation",
  splitTheory: "split",
  assessmentTheory: "assessment",
};

const exists = (key) => (payload) => Boolean(payload?.[key]);
const hasItems = (key) => (payload) => payload?.[key]?.length > 0;

const typographyProps = (content, variant = "bodySm") => ({
  content,
  variant: content?.variant ?? variant,
  color: content?.color,
  align: content?.align,
  component: content?.component,
});

const typographySlot = (
  contentKey,
  variant,
  { slotId = contentKey, when, ...extra } = {},
) => ({
  slotId,
  area: "heading",
  block: "Typography",
  when,
  props: (payload) => typographyProps(payload?.[contentKey], variant),
  ...extra,
});

const headingGroup = (items, extra = {}) => ({
  slotId: "conceptInfoGroup",
  area: "heading",
  areaAlign: "stretch",
  items,
  isStack: true,
  forceStackWrapper: true,
  ...extra,
});

const imageCardProps = ({ media } = {}) => ({
  media: {
    src: media?.src,
    alt: media?.alt ?? "Imagen de apoyo",
    variant: media?.variant ?? media?.ratio,
    mode: media?.mode,
  },
  zoomable: media?.zoomable !== false,
  variant: media?.cardVariant ?? "ghost",
});

const cardProps = (item = {}) => ({
  title: item.title,
  text: item.text,
  media: item.media,
  interaction: item.interaction,
  zoomable:
    item.zoomable === false || item.media?.zoomable === false
      ? false
      : undefined,
  variant: item.cardVariant ?? item.variant,
  size: item.size,
});

const fallbackItems = (item) =>
  !item
    ? []
    : [
        item.content && {
          block: "Typography",
          props: typographyProps(item.content),
        },
        (item.title || item.text || item.media) && {
          block: "Card",
          props: cardProps(item),
        },
      ].filter(Boolean);

const getSplitGroups = (payload = {}) =>
  payload.composeGroupData?.groups ??
  payload.rowItems?.map((item) => ({ items: fallbackItems(item) })) ??
  [];

const hasSplitPair = (payload) => getSplitGroups(payload).length === 2;

const splitGroupProps = (index) => (payload) => {
  const group = getSplitGroups(payload)[index] ?? {};
  return {
    items: group.items ?? [],
    direction: group.direction,
    gap: group.gap,
    className: group.className,
  };
};

const componentSlot = (slotId, block, dataKey) => ({
  slotId,
  area: "primary",
  when: exists(dataKey),
  block,
  props: (payload, ctx) => ({
    data: payload?.[dataKey],
    heroApi: ctx?.heroApi,
    view: ctx?.view,
  }),
});

function getPayload(view = {}) {
  const compounds = Array.isArray(view.elements?.compound)
    ? view.elements.compound
    : [];

  const byType = Object.fromEntries(
    compounds.map((item) => [item.component ?? item.type, item]),
  );

  const feedback = view.slots?.feedback;
  const supportList = Array.isArray(feedback?.items) ? feedback : null;
  const feedbackText = supportList
    ? feedback?.text
      ? { ...feedback, items: undefined }
      : null
    : feedback ?? null;

  const rowItems = (byType.showCard?.items ?? []).map((item) => ({
    ...item,
    text:
      item.text ??
      item.description ??
      item.subtitle ??
      item.label ??
      null,
  }));

  const supportListContent = supportList?.items?.length
    ? {
        paragraphs: supportList.items.map((item) => `* ${item}`),
        variant: supportList.variant ?? "bodySm",
        align: supportList.align ?? "left",
        color: supportList.color ?? "secondary",
      }
    : null;

  return {
    title: view.slots?.title,
    subtitle: view.slots?.subtitle ?? byType.chooseOne?.instruction ?? null,
    body: view.slots?.body,
    media: view.slots?.media,
    feedbackText,
    supportList,
    supportListTitle: supportList?.title ?? null,
    supportListContent,
    rowItems,
    composeGroupData: byType.composeGroup ?? null,
    flipCardData: byType.flipCard ?? null,
    collageCardData: byType.collageCard ?? null,
    chooseOneData: byType.chooseOne ?? null,
    memoryPairsData: byType.memoryPairs ?? null,
    crosswordData: byType.crossword ?? null,
  };
}

const simpleHeading = headingGroup([
  typographySlot("title", "h1"),
  typographySlot("body", "body", { when: exists("body") }),
  typographySlot("supportListTitle", "label", {
    when: exists("supportListTitle"),
  }),
  typographySlot("supportListContent", "bodySm", {
    when: exists("supportListContent"),
  }),
]);

const titleSubtitleHeading = headingGroup([
  typographySlot("title", "h1"),
  typographySlot("subtitle", "h3", { when: exists("subtitle") }),
]);

const THEORY_CONFIG = {
  layoutByVariant: {
    simple: "guided",
    explanation: "primaryEmphasis",
    split: "balanced",
    assessment: "primaryEmphasis",
  },

  variants: {
    simple: [
      simpleHeading,
      {
        slotId: "mediaGroup",
        area: "primary",
        isStack: true,
        when: (payload) => Boolean(payload.media || payload.rowItems?.length),
        items: [
          {
            slotId: "showCard",
            area: "primary",
            when: hasItems("rowItems"),
            block: "ShowCard",
            props: (payload) => ({ items: payload.rowItems }),
          },
          {
            slotId: "mediaImageCard",
            area: "primary",
            when: exists("media"),
            block: "Card",
            props: imageCardProps,
          },
        ],
      },
      {
        slotId: "feedback",
        area: "feedback",
        reserveSpace: true,
        reserveWhen: (payload) =>
          Boolean(payload.feedbackText?.hiddenUntilAction),
        when: (payload) =>
          Boolean(
            payload.feedbackText &&
              !payload.feedbackText.hiddenUntilAction,
          ),
        block: "Typography",
        props: (payload) =>
          typographyProps(payload.feedbackText, "helper"),
      },
    ],

    explanation: [
      titleSubtitleHeading,
      {
        slotId: "examplesComplete",
        area: "primary",
        when: exists("collageCardData"),
        block: "IteractionComplete",
        props: (_, ctx) => ({
          view: ctx?.view,
          heroApi: ctx?.heroApi,
          type: "collageCard",
          countsTowardScore: false,
        }),
        child: {
          slotId: "examplesCollage",
          block: "CollageCard",
          props: ({ collageCardData: data }) => ({
            items: data?.items ?? [],
            columns: data?.columns ?? 4,
            rows: data?.rows,
            className: data?.className,
            gridClassName: data?.gridClassName,
            slotClassName: data?.slotClassName,
            emptySlotClassName: data?.emptySlotClassName,
          }),
        },
      },
    ],

    split: [
      headingGroup([
        typographySlot("title", "h1"),
        typographySlot("body", "h2", {
          slotId: "bodyTitle",
          when: exists("body"),
        }),
        typographySlot("subtitle", "body", {
          when: exists("subtitle"),
        }),
        typographySlot("supportListTitle", "label", {
          when: exists("supportListTitle"),
        }),
        typographySlot("supportListContent", "bodySm", {
          when: exists("supportListContent"),
        }),
      ]),
      {
        slotId: "leftColumnGroup",
        area: "primary",
        when: hasSplitPair,
        block: "ComposeGroup",
        props: splitGroupProps(0),
      },
      {
        slotId: "rightColumnGroup",
        area: "secondary",
        when: hasSplitPair,
        block: "ComposeGroup",
        props: splitGroupProps(1),
      },
      {
        slotId: "mediaImageCard",
        area: "primary",
        when: (payload) => !hasSplitPair(payload) && Boolean(payload.media),
        block: "Card",
        props: imageCardProps,
      },
    ],

    assessment: [
      titleSubtitleHeading,
      {
        slotId: "assessmentGroup",
        area: "primary",
        isStack: true,
        items: [
          componentSlot("chooseOne", "ChooseOne", "chooseOneData"),
          componentSlot(
            "memoryPairs",
            "MemoryPairs",
            "memoryPairsData",
          ),
          componentSlot("crossword", "Crossword", "crosswordData"),
        ],
      },
    ],
  },

  fallbackVariant: "simple",
};

function resolveVariant(variant, view) {
  const mapped = TEMPLATE_VARIANTS[view?.template];
  return THEORY_CONFIG.variants[variant]
    ? variant
    : THEORY_CONFIG.variants[mapped]
      ? mapped
      : THEORY_CONFIG.fallbackVariant;
}

export function getTheoryRuntime({ variant = "simple", view }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    variant: resolvedVariant,
    layoutVariant: THEORY_CONFIG.layoutByVariant[resolvedVariant],
    slots: THEORY_CONFIG.variants[resolvedVariant].map((slot) => {
      const scroll = ["bodyGroup", "bodyTitle", "supportGroup"].includes(
        slot.slotId,
      );
      const alignStart = scroll || slot.slotId === "subtitle";

      return {
        ...slot,
        areaClassName: [
          slot.areaClassName,
          alignStart && "items-start justify-start",
          scroll && "lg:overflow-y-auto",
        ]
          .filter(Boolean)
          .join(" "),
      };
    }),
    payload: getPayload(view),
  };
}
