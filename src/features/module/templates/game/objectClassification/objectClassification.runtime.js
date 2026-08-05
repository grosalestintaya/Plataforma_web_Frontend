import { getObjectClassificationModel } from "./objectClassification.config";

const OBJECT_CLASSIFICATION_STAGE_CLASSNAME = [
  "mx-auto h-full min-h-0 w-full max-w-7xl",
  "overflow-y-auto rounded-[2rem] p-2 text-white lg:overflow-hidden",
  "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(5,29,56,0.14))]",
  "shadow-[0_24px_60px_rgba(7,24,52,0.18)] backdrop-blur-[2px]",
].join(" ");

const OBJECT_CLASSIFICATION_SIDEBAR_SLOTS = [
  {
    area: "heading",
    when: (payload) => Boolean(payload?.title),
    areaClassName: [
      "items-stretch rounded-[1.5rem] px-4 py-3",
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))]",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
    ].join(" "),
    block: "Typography",
    props: (payload) => ({
      content: {
        ...payload.title,
        variant: payload?.title?.variant ?? "eyebrow",
      },
    }),
  },
  {
    area: "primary",
    when: (payload) => Boolean(payload?.assessment),
    areaClassName: [
      "items-stretch rounded-[1.7rem] px-4 py-3",
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))]",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
    ].join(" "),
    block: "Typography",
    props: (payload) => ({
      content: {
        ...payload.assessment,
        variant:
          payload?.assessment?.variant ??
          (payload?.media?.src ? "h3" : "body1"),
      },
    }),
  },
  {
    area: "feedback",
    when: (payload) => Boolean(payload?.media?.src),
    areaClassName: "h-[7.5rem] items-start sm:h-[8.5rem] md:h-[8rem]",
    block: "Card",
    props: (payload) => ({
      media: {
        ...payload.media,
        variant: payload?.media?.variant ?? "horizontal",
        mode: payload?.media?.mode ?? "contain",
      },
      variant: "ghost",
      zoomable: payload?.media?.zoomable !== false,
      className: "h-full max-w-[15rem]",
    }),
  },
];

const OBJECT_CLASSIFICATION_SLOTS = [
  {
    area: "heading",
    areaClassName:
      "items-stretch justify-stretch overflow-visible md:overflow-hidden",
    block: "InteractiveInfoAside",
    props: () => ({
      className: "gap-0 rounded-[1.7rem] border-white/10 bg-white/5 p-2",
      contentClassName: "overflow-hidden",
    }),
    child: {
      gridClassName: "gap-2 p-0 sm:gap-2 sm:px-0 md:px-0 lg:px-0 lg:py-0",
      layoutVariant: "guided",
      slots: OBJECT_CLASSIFICATION_SIDEBAR_SLOTS,
    },
  },
  {
    area: "primary",
    areaClassName: "items-stretch justify-stretch",
    block: "ClasifyCard",
    props: (payload, context) => ({
      config: payload?.config,
      view: context?.view,
      heroApi: context?.heroApi,
    }),
  },
];

export function getObjectClassificationMissionRuntime({ view, data }) {
  const model = getObjectClassificationModel({ view, data });

  return {
    variant: "objectClassification",
    stageClassName: OBJECT_CLASSIFICATION_STAGE_CLASSNAME,
    layoutVariant: "secondaryEmphasis",
    gridClassName:
      "gap-3 p-0 sm:gap-2 sm:px-0 md:gap-3 md:px-0 lg:px-0 lg:py-0",
    slots: OBJECT_CLASSIFICATION_SLOTS,
    payload: model,
  };
}
