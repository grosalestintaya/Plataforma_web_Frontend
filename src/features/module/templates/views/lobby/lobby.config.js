/**
 * Lobby config:
 * - Define variantes y slots del template Lobby.
 * - Se alinea al documento: preGame, postGame y wait.
 */

export const LOBBY_VARIANT_BY_TEMPLATE = {
  preGameLobby: "preGame",
  postGameLobby: "postGame",
  waitLobby: "wait",
};

/**
 * Crea un slot de tipografia reutilizable.
 */
function createTypographySlot(area, contentKey, fallbackVariant, extra = {}) {
  return {
    area,
    block: "Typography",
    props: (payload) => {
      const content = payload?.[contentKey];
      return {
        content,
        variant: content?.variant ?? fallbackVariant,
        color: content?.color,
        align: content?.align,
        component: content?.component,
        className: content?.className,
        containerClassName: content?.containerClassName,
      };
    },
    ...extra,
  };
}

/**
 * Busca el agrupador de recompensas de la vista.
 */
function getRowItems(view) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];
  const rowCard = compounds.find(
    (item) => (item?.component ?? item?.type) === "rowCard",
  );
  return rowCard?.items ?? [];
}

export const LOBBY_CONFIG = {
  layouts: {
    preGame: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "body", "media"],
        gap: "20px",
      },
      md: {
        cols: "1fr 1fr",
        rows: "auto auto",
        areas: ["title title", "body media"],
      },
    },
    postGame: {
      base: {
        cols: "1fr",
        rows: "auto auto auto",
        areas: ["title", "rewards", "feedback"],
        gap: "20px",
      },
    },
    wait: {
      base: {
        cols: "1fr",
        rows: "auto auto",
        areas: ["title", "media"],
        gap: "20px",
      },
    },
  },
  variants: {
    preGame: [
      createTypographySlot("title", "title", "h1", {
        className:
          "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      createTypographySlot("body", "body", "body", {
        when: (payload) => Boolean(payload?.body),
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
      }),
      {
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen",
          className: "min-h-[220px] w-full",
        }),
      },
    ],
    postGame: [
      createTypographySlot("title", "title", "h1", {
        className:
          "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "rewards",
        when: (payload) =>
          Array.isArray(payload?.rowItems) && payload.rowItems.length > 0,
        block: "RowCard",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        props: (payload) => ({
          items: payload?.rowItems ?? [],
        }),
      },
      createTypographySlot("feedback", "feedback", "label", {
        when: (payload) => Boolean(payload?.feedback),
        className:
          "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
    ],
    wait: [
      createTypographySlot("title", "title", "h1", {
        className:
          "rounded-2xl border border-white/15 bg-white/10 p-5 text-center",
        containerClassName: "mx-auto max-w-[760px]",
      }),
      {
        area: "media",
        when: (payload) => Boolean(payload?.media),
        block: "Image",
        className: "rounded-2xl border border-white/15 bg-white/10 p-5",
        props: (payload) => ({
          src: payload?.media?.src,
          alt: payload?.media?.alt ?? "Imagen",
          className: "min-h-[220px] w-full",
        }),
      },
    ],
  },
  fallbackVariant: "preGame",
};

/**
 * Resuelve variante usando `variant`, `template` y fallback.
 */
function resolveVariant(variant, view) {
  if (variant && LOBBY_CONFIG.variants[variant]) return variant;
  const mappedVariant = LOBBY_VARIANT_BY_TEMPLATE[view?.template];
  if (mappedVariant && LOBBY_CONFIG.variants[mappedVariant])
    return mappedVariant;
  return LOBBY_CONFIG.fallbackVariant;
}

/**
 * Estandariza el payload para que Lobby lea una sola forma.
 */
function getPayload(data = {}, view) {
  return {
    title: view?.slots?.title ?? data?.title,
    body: view?.slots?.body ?? data?.body ?? data?.text,
    media: view?.slots?.media ?? data?.media ?? data?.image,
    feedback: view?.slots?.feedback ?? data?.feedback,
    rowItems: getRowItems(view),
  };
}

/**
 * Punto de entrada consumido por LobbyTemplate.
 */
export function getLobbyRuntime({ variant, data, view }) {
  const resolvedVariant = resolveVariant(variant, view);

  return {
    layoutDef: LOBBY_CONFIG.layouts[resolvedVariant],
    slots: LOBBY_CONFIG.variants[resolvedVariant],
    payload: getPayload(data, view),
  };
}
