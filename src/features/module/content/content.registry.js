import modulesCatalog from "./modulos.json";

import m01Conceptual from "./modulo1/m1-conceptual.json";
import m01Procedimental from "./modulo1/m1-procedimental.json";
import m01Actitudinal from "./modulo1/m1-actitudinal.json";

import m02Conceptual from "./modulo2/m2-conceptual.json";
import m02Procedimental from "./modulo2/m2-procedimental.json";
import m02Actitudinal from "./modulo2/m2-actitudinal.json";

import m03Conceptual from "./modulo3/m3-conceptual.json";
import m03Procedimental from "./modulo3/m3-procedimental.json";
import m03Actitudinal from "./modulo3/m3-actitudinal.json";

import m04Conceptual from "./modulo4/m4-conceptual.json";
import m04Procedimental from "./modulo4/m4-procedimental.json";
import m04Actitudinal from "./modulo4/m4-actitudinal.json";

import m05Conceptual from "./modulo5/m5-conceptual.json";
import m05Procedimental from "./modulo5/m5-procedimental.json";
import m05Actitudinal from "./modulo5/m5-actitudinal.json";

const MISSION_CONTENT_BY_MODULE = {
  m01: {
    conceptual: m01Conceptual,
    procedimental: m01Procedimental,
    actitudinal: m01Actitudinal,
  },
  m02: {
    conceptual: m02Conceptual,
    procedimental: m02Procedimental,
    actitudinal: m02Actitudinal,
  },
  m03: {
    conceptual: m03Conceptual,
    procedimental: m03Procedimental,
    actitudinal: m03Actitudinal,
  },
  m04: {
    conceptual: m04Conceptual,
    procedimental: m04Procedimental,
    actitudinal: m04Actitudinal,
  },
  m05: {
    conceptual: m05Conceptual,
    procedimental: m05Procedimental,
    actitudinal: m05Actitudinal,
  },
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeTypographyNode(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeTypographyNode(item));
  }

  if (!isObject(value)) return value ?? "";

  return {
    ...value,
    text:
      typeof value.text === "string" || typeof value.text === "number"
        ? String(value.text)
        : undefined,
    paragraphs: Array.isArray(value.paragraphs)
      ? value.paragraphs
          .map((item) => normalizeTypographyNode(item))
          .filter(Boolean)
      : undefined,
  };
}

function normalizeTextArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTypographyNode(item)).filter(Boolean);
  }
  if (isObject(value) && Array.isArray(value.paragraphs)) {
    return {
      ...normalizeTypographyNode(value),
      paragraphs: value.paragraphs
        .map((item) => normalizeTypographyNode(item))
        .filter(Boolean),
    };
  }
  return normalizeTypographyNode(value);
}

function normalizeMedia(value) {
  if (!isObject(value)) {
    return { src: value ?? "", alt: "" };
  }

  return {
    ...value,
    src: value.src ?? "",
    alt: value.alt ?? "",
    caption: normalizeTypographyNode(value.caption),
  };
}

function normalizeExamples(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    src: item?.src ?? item?.image?.src ?? "",
    alt: item?.alt ?? item?.image?.alt ?? "",
    label: normalizeTypographyNode(item?.label),
  }));
}

function normalizeCompareItems(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    ...item,
    img: normalizeMedia(item?.img ?? item?.image),
    label: normalizeTypographyNode(item?.label),
    note: normalizeTypographyNode(item?.note),
    result: normalizeTypographyNode(item?.result),
  }));
}

function normalizeCards(cards = []) {
  if (!Array.isArray(cards)) return [];

  return cards.map((card) => ({
    ...card,
    img: card?.img ?? card?.image?.src ?? "",
  }));
}

function normalizeViewData(data = {}) {
  if (!isObject(data)) return data ?? {};

  return {
    ...data,
    title: normalizeTypographyNode(data.title),
    subtitle: normalizeTypographyNode(data.subtitle),
    text: normalizeTypographyNode(data.text),
    note: normalizeTypographyNode(data.note),
    leftText: data.leftText ? normalizeTextArray(data.leftText) : data.leftText,
    rightImage: data.rightImage ? normalizeMedia(data.rightImage) : data.rightImage,
    image: data.image ? normalizeMedia(data.image) : data.image,
    examples: normalizeExamples(data.examples),
    items: normalizeCompareItems(data.items),
    cards: normalizeCards(data.cards),
    finishLabel:
      typeof data.finishLabel === "string"
        ? data.finishLabel
        : data.finishLabel?.text ?? data.finishLabel ?? "Fin",
  };
}

function normalizeView(view = {}) {
  return {
    ...view,
    data: normalizeViewData(view.data),
  };
}

function getMissionKeys(moduleMeta, missionContentMap) {
  return Array.from(
    new Set([
      ...Object.keys(moduleMeta?.missions ?? {}),
      ...Object.keys(missionContentMap ?? {}),
    ]),
  );
}

function buildMission(missionKey, missionMeta = {}, missionContent = {}) {
  return {
    id: missionContent.id ?? missionKey,
    activityId:
      missionContent.activityId ??
      missionContent.backendActivityId ??
      missionMeta.activityId ??
      missionMeta.backendActivityId ??
      null,
    backendActivityId:
      missionContent.backendActivityId ??
      missionContent.activityId ??
      missionMeta.backendActivityId ??
      missionMeta.activityId ??
      null,
    activityKey:
      missionContent.activityKey ??
      missionMeta.activityKey ??
      `${missionKey}`,
    headerTitle:
      missionContent.headerTitle ??
      missionMeta.headerTitle ??
      missionMeta.label ??
      missionMeta.title ??
      "",
    missionTitle:
      missionContent.missionTitle ?? missionMeta.title ?? missionMeta.label ?? "",
    views: Array.isArray(missionContent.views)
      ? missionContent.views.map(normalizeView)
      : [],
  };
}

function buildModuleData(moduleMeta) {
  const missionContentMap = MISSION_CONTENT_BY_MODULE[moduleMeta.code] ?? {};
  const missionKeys = getMissionKeys(moduleMeta, missionContentMap);

  const missions = Object.fromEntries(
    missionKeys.map((missionKey) => [
      missionKey,
      buildMission(
        missionKey,
        moduleMeta.missions?.[missionKey],
        missionContentMap[missionKey],
      ),
    ]),
  );

  return {
    id: moduleMeta.id,
    moduleCode: moduleMeta.code,
    title: moduleMeta.title,
    name: moduleMeta.name,
    sortOrder: moduleMeta.sortOrder,
    meta: {
      id: moduleMeta.id,
      moduleCode: moduleMeta.code,
      moduleName: moduleMeta.title,
      title: moduleMeta.title,
      name: moduleMeta.name,
      sortOrder: moduleMeta.sortOrder,
      theme: moduleMeta.theme,
      missions: Object.fromEntries(
        missionKeys.map((missionKey) => [
          missionKey,
          {
            title:
              moduleMeta.missions?.[missionKey]?.title ??
              missions[missionKey]?.missionTitle ??
              "",
          },
        ]),
      ),
    },
    theme: moduleMeta.theme,
    missions,
  };
}

export const MODULE_CONTENT_MAP = modulesCatalog.modules.reduce((acc, moduleMeta) => {
  const moduleData = buildModuleData(moduleMeta);

  acc[moduleMeta.code] = moduleData;

  for (const legacyCode of moduleMeta.legacyCodes ?? []) {
    acc[legacyCode] = moduleData;
  }

  return acc;
}, {});
