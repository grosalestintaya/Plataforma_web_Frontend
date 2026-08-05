export const MISSION_SCHEMA_VERSION = "1.0";

export const MISSION_VIEW_TEMPLATES = Object.freeze([
  "preGameLobby",
  "postGameLobby",
  "waitLobby",
  "simpleTheory",
  "explanationTheory",
  "splitTheory",
  "assessmentTheory",
  "simpleQuiz",
  "extendedQuiz",
  "decisionDailySpending",
  "shopDailySpending",
  "eventDailySpending",
  "assessmentDailySpending",
  "DailySpending",
  "objectClassification",
  "ObjectClassification",
  "budgetAdjustment",
  "BudgetAdjustment",
  "collectObjects",
  "CollectObjects",
  "whatWouldYouDo",
  "WhatWouldYouDo",
  "teoria",
  "choiceReveal",
  "memoryGame",
  "memoryPairs",
]);

export const MISSION_NAV_MODES = Object.freeze([
  "normal",
  "cta",
  "locked",
  "lockedUntilComplete",
  "embedded",
]);

export const MISSION_NAV_ACTIONS = Object.freeze([
  "startMissionAttempt",
  "goToNextMissionMenu",
]);

export const MISSION_BLOCK_COMPONENTS = Object.freeze([
  "Typography",
  "Image",
  "Audio",
  "Video",
  "ProgressBar",
  "ImageZoom",
  "Button",
  "Input",
  "Card",
  "CardBase",
  "Modal",
  "TextField",
  "ComposeGroup",
  "ShowCard",
  "CollageCard",
  "InteractiveInfoAside",
  "ChooseOne",
  "Form",
  "FormQuestion",
  "Calculator",
  "MemoryPairs",
  "DragDropClassification",
  "FallingObjects",
  "BalanceScale",
  "ClasifyCard",
  "Shopping",
  "IteractionComplete",
  "ObjectClassification",
  "Crossword",
  "heading",
  "text",
  "image",
  "amount",
  "calculator",
  "chooseOne",
  "collageCard",
  "composeGroup",
  "crossword",
  "formQuestion",
  "memoryPairs",
  "objectClassification",
  "showCard",
]);

const TEMPLATE_SET = new Set(MISSION_VIEW_TEMPLATES);
const NAV_MODE_SET = new Set(MISSION_NAV_MODES);
const NAV_ACTION_SET = new Set(MISSION_NAV_ACTIONS);
const BLOCK_COMPONENT_SET = new Set(MISSION_BLOCK_COMPONENTS);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pushIssue(issues, path, message) {
  issues.push(`${path}: ${message}`);
}

function validateTypographyNode(value, path, issues, { required = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) pushIssue(issues, path, "debe tener contenido textual");
    return;
  }

  if (typeof value === "string" || typeof value === "number") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateTypographyNode(item, `${path}[${index}]`, issues),
    );
    return;
  }

  if (!isObject(value)) {
    pushIssue(issues, path, "debe ser string, numero u objeto tipografico");
    return;
  }

  if (
    value.text === undefined &&
    value.paragraphs === undefined &&
    value.items === undefined
  ) {
    return;
  }

  if (value.text !== undefined && typeof value.text !== "string") {
    pushIssue(issues, `${path}.text`, "debe ser string");
  }

  if (value.paragraphs !== undefined && !Array.isArray(value.paragraphs)) {
    pushIssue(issues, `${path}.paragraphs`, "debe ser un arreglo");
  }
}

function validateMediaNode(value, path, issues) {
  if (value === undefined || value === null) return;

  if (typeof value === "string") return;

  if (!isObject(value)) {
    pushIssue(issues, path, "debe ser string u objeto media");
    return;
  }

  if (!isNonEmptyString(value.src)) {
    pushIssue(issues, `${path}.src`, "debe ser un string no vacio");
  }

  if (value.alt !== undefined && typeof value.alt !== "string") {
    pushIssue(issues, `${path}.alt`, "debe ser string");
  }
}

function validateNavigation(nav, path, issues) {
  if (nav === undefined) return;

  if (!isObject(nav)) {
    pushIssue(issues, path, "debe ser un objeto");
    return;
  }

  if (nav.mode !== undefined && !NAV_MODE_SET.has(nav.mode)) {
    pushIssue(
      issues,
      `${path}.mode`,
      `modo no registrado: ${String(nav.mode)}`,
    );
  }

  if (nav.action !== undefined && !NAV_ACTION_SET.has(nav.action)) {
    pushIssue(
      issues,
      `${path}.action`,
      `accion no registrada: ${String(nav.action)}`,
    );
  }

  if (nav.label !== undefined && typeof nav.label !== "string") {
    pushIssue(issues, `${path}.label`, "debe ser string");
  }
}

function validateElement(element, path, issues) {
  if (!isObject(element)) {
    pushIssue(issues, path, "debe ser un objeto");
    return;
  }

  const component = element.component ?? element.type;

  if (!isNonEmptyString(component)) {
    pushIssue(issues, path, "debe declarar component o type");
    return;
  }

  if (!BLOCK_COMPONENT_SET.has(component)) {
    pushIssue(issues, path, `componente no registrado: ${component}`);
  }

  if (element.slot !== undefined && typeof element.slot !== "string") {
    pushIssue(issues, `${path}.slot`, "debe ser string");
  }

  if (element.area !== undefined && typeof element.area !== "string") {
    pushIssue(issues, `${path}.area`, "debe ser string");
  }
}

function validateElements(elements, path, issues) {
  if (elements === undefined) return;

  if (!isObject(elements)) {
    pushIssue(issues, path, "debe ser un objeto");
    return;
  }

  for (const groupName of ["base", "compound"]) {
    if (elements[groupName] === undefined) continue;

    if (!Array.isArray(elements[groupName])) {
      pushIssue(issues, `${path}.${groupName}`, "debe ser un arreglo");
      continue;
    }

    elements[groupName].forEach((element, index) =>
      validateElement(element, `${path}.${groupName}[${index}]`, issues),
    );
  }
}

function validateSlots(slots, path, issues) {
  if (slots === undefined) return;

  if (!isObject(slots)) {
    pushIssue(issues, path, "debe ser un objeto");
    return;
  }

  for (const [slotName, slotValue] of Object.entries(slots)) {
    if (slotName === "media" || slotName === "image") {
      validateMediaNode(slotValue, `${path}.${slotName}`, issues);
    } else {
      validateTypographyNode(slotValue, `${path}.${slotName}`, issues);
    }
  }
}

function validateViewShape(view, path, issues) {
  if (!isObject(view)) {
    pushIssue(issues, path, "debe ser un objeto");
    return;
  }

  const viewId = view.id ?? view.viewId;

  if (!isNonEmptyString(viewId)) {
    pushIssue(issues, path, "debe declarar id o viewId");
  }

  if (!isNonEmptyString(view.template)) {
    pushIssue(issues, `${path}.template`, "debe ser un string no vacio");
  } else if (!TEMPLATE_SET.has(view.template)) {
    pushIssue(
      issues,
      `${path}.template`,
      `template no registrado: ${view.template}`,
    );
  }

  if (view.variant !== undefined && typeof view.variant !== "string") {
    pushIssue(issues, `${path}.variant`, "debe ser string");
  }

  validateSlots(view.slots, `${path}.slots`, issues);
  validateElements(view.elements, `${path}.elements`, issues);
  validateNavigation(view.navigation ?? view.nav, `${path}.navigation`, issues);
}

function validateTemplateSpecificView(view, path, issues) {
  const template = view?.template;

  if (template === "preGameLobby" || template === "postGameLobby") {
    if (!isObject(view.slots)) {
      pushIssue(issues, `${path}.slots`, "los lobby deben definir slots");
    }

    return;
  }

  if (/Quiz|choiceReveal/i.test(template)) {
    const compounds = Array.isArray(view?.elements?.compound)
      ? view.elements.compound
      : [];
    const hasFormQuestion = compounds.some(
      (item) => (item?.component ?? item?.type) === "formQuestion",
    );
    const hasDataQuestions =
      Array.isArray(view?.data?.questions) || isObject(view?.data?.formQuestion);

    if (!hasFormQuestion && !hasDataQuestions) {
      pushIssue(
        issues,
        path,
        "las vistas quiz deben definir formQuestion o data.questions",
      );
    }
  }
}

export function validateMissionContent(
  mission,
  { moduleCode = "unknown-module", missionKey = "unknown-mission" } = {},
) {
  const issues = [];
  const path = `${moduleCode}.${missionKey}`;

  if (!isObject(mission)) {
    return [`${path}: la mision debe ser un objeto`];
  }

  if (mission.schemaVersion !== MISSION_SCHEMA_VERSION) {
    pushIssue(
      issues,
      `${path}.schemaVersion`,
      `debe ser "${MISSION_SCHEMA_VERSION}"`,
    );
  }

  if (!isNonEmptyString(mission.id) && !isNonEmptyString(mission.missionId)) {
    pushIssue(issues, `${path}.id`, "debe declarar id o missionId");
  }

  if (!isNonEmptyString(mission.activityKey)) {
    pushIssue(issues, `${path}.activityKey`, "debe ser un string no vacio");
  }

  if (!isNonEmptyString(mission.missionTitle)) {
    pushIssue(issues, `${path}.missionTitle`, "debe ser un string no vacio");
  }

  if (!Array.isArray(mission.views) || mission.views.length === 0) {
    pushIssue(issues, `${path}.views`, "debe ser un arreglo no vacio");
    return issues;
  }

  const seenViewIds = new Set();

  mission.views.forEach((view, index) => {
    const viewPath = `${path}.views[${index}]`;
    validateViewShape(view, viewPath, issues);
    validateTemplateSpecificView(view, viewPath, issues);

    const viewId = view?.id ?? view?.viewId;
    if (!isNonEmptyString(viewId)) return;

    if (seenViewIds.has(viewId)) {
      pushIssue(issues, viewPath, `viewId duplicado: ${viewId}`);
    }

    seenViewIds.add(viewId);
  });

  return issues;
}

export function assertValidMissionContent(mission, context) {
  const issues = validateMissionContent(mission, context);

  if (issues.length > 0) {
    throw new Error(`Modelo de mision invalido:\n${issues.join("\n")}`);
  }

  return mission;
}

export function validateModulesCatalog(catalog) {
  const issues = [];

  if (!isObject(catalog)) {
    return ["modulos.json: debe ser un objeto"];
  }

  if (catalog.schemaVersion !== MISSION_SCHEMA_VERSION) {
    pushIssue(
      issues,
      "modulos.json.schemaVersion",
      `debe ser "${MISSION_SCHEMA_VERSION}"`,
    );
  }

  if (!Array.isArray(catalog.modules) || catalog.modules.length === 0) {
    pushIssue(issues, "modulos.json.modules", "debe ser un arreglo no vacio");
    return issues;
  }

  const seenCodes = new Set();

  catalog.modules.forEach((moduleItem, moduleIndex) => {
    const path = `modulos.json.modules[${moduleIndex}]`;

    if (!isObject(moduleItem)) {
      pushIssue(issues, path, "debe ser un objeto");
      return;
    }

    if (!isNonEmptyString(moduleItem.id)) {
      pushIssue(issues, `${path}.id`, "debe ser un string no vacio");
    }

    if (!isNonEmptyString(moduleItem.code)) {
      pushIssue(issues, `${path}.code`, "debe ser un string no vacio");
    } else if (seenCodes.has(moduleItem.code)) {
      pushIssue(issues, `${path}.code`, `codigo duplicado: ${moduleItem.code}`);
    } else {
      seenCodes.add(moduleItem.code);
    }

    if (!isObject(moduleItem.missions)) {
      pushIssue(issues, `${path}.missions`, "debe ser un objeto");
      return;
    }

    for (const [missionKey, missionMeta] of Object.entries(
      moduleItem.missions,
    )) {
      const missionPath = `${path}.missions.${missionKey}`;

      if (!isObject(missionMeta)) {
        pushIssue(issues, missionPath, "debe ser un objeto");
        continue;
      }

      if (!isNonEmptyString(missionMeta.title)) {
        pushIssue(issues, `${missionPath}.title`, "debe ser string no vacio");
      }

      if (!isNonEmptyString(missionMeta.activityKey)) {
        pushIssue(
          issues,
          `${missionPath}.activityKey`,
          "debe ser string no vacio",
        );
      }
    }
  });

  return issues;
}

export function assertValidModulesCatalog(catalog) {
  const issues = validateModulesCatalog(catalog);

  if (issues.length > 0) {
    throw new Error(`Catalogo de modulos invalido:\n${issues.join("\n")}`);
  }

  return catalog;
}
