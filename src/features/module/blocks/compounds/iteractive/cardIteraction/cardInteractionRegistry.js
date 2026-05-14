import FlipCard from "./FlipCard";
import ZoomableCard from "./ZoomableCard";
import SelectableCard from "./SelectableCard";
import DragDropCard from "./DragDropCard";

function hasMedia(media) {
  return Boolean(media?.src ?? media?.img);
}

function normalizeInteractionType(interaction) {
  const raw = interaction?.type ?? interaction ?? null;

  if (raw === "select" || raw === "selectable" || raw === "SelectableCard") {
    return "selectable";
  }

  if (raw === "flip" || raw === "flipCard") {
    return "flipCard";
  }

  if (raw === "zoom" || raw === "zoomable" || raw === "ZoomableCard") {
    return "zoomable";
  }

  if (raw === "drag" || raw === "dragDrop" || raw === "DragDropCard") {
    return "dragDrop";
  }

  return null;
}

function resolveCardInteraction({ interaction, media, zoomable }) {
  if (interaction) return interaction;

  if (hasMedia(media) && zoomable !== false) {
    return { type: "zoomable" };
  }

  return null;
}

const CARD_INTERACTION_REGISTRY = {
  selectable: SelectableCard,
  flipCard: FlipCard,
  zoomable: ZoomableCard,
  dragDrop: DragDropCard,
};

export function getCardInteractionComponent({ interaction, media, zoomable }) {
  const resolvedInteraction = resolveCardInteraction({
    interaction,
    media,
    zoomable,
  });

  const type = normalizeInteractionType(resolvedInteraction);

  if (!type) {
    return {
      Component: null,
      interaction: null,
      type: null,
    };
  }

  return {
    Component: CARD_INTERACTION_REGISTRY[type] ?? null,
    interaction: resolvedInteraction,
    type,
  };
}

export function getCardItemId(item, index = 0) {
  return item?.id ?? `card-item-${index + 1}`;
}