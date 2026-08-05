import CardDecorationInteraction from "./CardDecorationInteraction";
import DragDropCard from "./DragDropCard";
import FlipCard from "./FlipCard";
import SelectableCard from "./SelectableCard";
import ZoomableCard from "./ZoomableCard";

const TYPE_ALIASES = {
  select: "selectable",
  SelectableCard: "selectable",
  flip: "flipCard",
  zoom: "zoomable",
  ZoomableCard: "zoomable",
  drag: "dragDrop",
  DragDropCard: "dragDrop",
  BadgeInteraction: "badge",
  RevealCard: "reveal",
  RevealInteraction: "reveal",
};

const CARD_INTERACTION_REGISTRY = {
  selectable: { category: "primary", Component: SelectableCard },
  flipCard: { category: "primary", Component: FlipCard },
  zoomable: { category: "primary", Component: ZoomableCard },
  dragDrop: { category: "primary", Component: DragDropCard },
  badge: { category: "enhancer", Component: CardDecorationInteraction },
  reveal: {
    category: "enhancer",
    Component: CardDecorationInteraction,
    getHostProps: (config) =>
      config.mode === "hoverFocus" ? { className: "group", tabIndex: 0 } : {},
  },
};

function hasMedia(media) {
  return Boolean(media?.src ?? media?.img);
}

function normalizeType(interaction) {
  const raw = interaction?.type ?? interaction;
  return TYPE_ALIASES[raw] ?? raw ?? null;
}

function normalizeConfig(interaction) {
  return typeof interaction === "string" ? { type: interaction } : interaction;
}

function getRequestedInteractions({ interaction, media, zoomable }) {
  if (interaction)
    return Array.isArray(interaction) ? interaction : [interaction];
  if (hasMedia(media) && zoomable !== false) return [{ type: "zoomable" }];
  return [];
}

function expandLegacyDecorations(config) {
  const expanded = [config];
  if (config.badge) expanded.push({ type: "badge", ...config.badge });
  if (config.revealLabel) {
    expanded.push({ type: "reveal", ...config.revealLabel });
  }
  return expanded;
}

export function resolveCardInteractions(options) {
  const requested = getRequestedInteractions(options)
    .map(normalizeConfig)
    .filter(Boolean)
    .flatMap(expandLegacyDecorations);
  const composition = {
    primary: null,
    enhancers: [],
    hostProps: { className: [], tabIndex: undefined },
    ignoredPrimaryTypes: [],
  };

  for (const config of requested) {
    const type = normalizeType(config);
    const definition = CARD_INTERACTION_REGISTRY[type];
    if (!definition) continue;
    const resolvedConfig = { ...config, type };

    if (definition.category === "primary") {
      if (composition.primary) {
        composition.ignoredPrimaryTypes.push(type);
        continue;
      }
      composition.primary = {
        type,
        Component: definition.Component,
        config: resolvedConfig,
      };
      continue;
    }

    composition.enhancers.push({
      type,
      Component: definition.Component,
      config: resolvedConfig,
    });
    const hostProps = definition.getHostProps?.(resolvedConfig) ?? {};
    if (hostProps.className) {
      composition.hostProps.className.push(hostProps.className);
    }
    composition.hostProps.tabIndex ??= hostProps.tabIndex;
  }

  if (import.meta.env.DEV && composition.ignoredPrimaryTypes.length) {
    console.warn(
      `Card admite una interacción primaria. Se ignoraron: ${composition.ignoredPrimaryTypes.join(", ")}.`,
    );
  }

  return composition;
}

export function getCardItemId(item, index = 0) {
  return item?.id ?? `card-item-${index + 1}`;
}
