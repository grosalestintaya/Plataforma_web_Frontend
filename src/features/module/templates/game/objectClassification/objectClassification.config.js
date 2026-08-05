export function findCompound(view, targetType) {
  const compounds = Array.isArray(view?.elements?.compound)
    ? view.elements.compound
    : [];

  return (
    compounds.find((item) => (item?.component ?? item?.type) === targetType) ??
    null
  );
}

export function getLegacyObjectClassificationElement(view, data) {
  if (Array.isArray(view?.elements?.compound)) {
    const fromDoc = view.elements.compound.find(
      (item) => (item?.component ?? item?.type) === "objectClassification",
    );
    if (fromDoc) return fromDoc;
  }

  return data?.objectClassification ?? null;
}

export function getObjectClassificationModel({ view, data }) {
  const legacyElement = getLegacyObjectClassificationElement(view, data);
  const config =
    findCompound(view, "objectClassification") ?? legacyElement ?? {};

  return {
    config,
    title: view?.slots?.title ?? data?.title ?? config?.title,
    assessment:
      view?.slots?.assessment ??
      view?.slots?.body ??
      data?.assessment ??
      data?.text,
    media: view?.slots?.media ?? data?.media ?? config?.media,
  };
}
