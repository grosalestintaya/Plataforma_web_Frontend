import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MISSION_SCHEMA_VERSION,
  validateMissionContent,
  validateModulesCatalog,
} from "../src/features/module/content/mission.schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "src", "features", "module", "content");
const catalogPath = path.join(contentDir, "modulos.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function walkJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      /^m\d-.*\.json$/.test(entry.name) &&
      !entry.name.includes("image-prompts")
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function missionContextFromPath(filePath) {
  const fileName = path.basename(filePath, ".json");
  const moduleFolder = path.basename(path.dirname(filePath));
  const moduleNumber = moduleFolder.replace(/\D/g, "").padStart(2, "0");
  const missionKey = fileName.split("-").slice(1).join("-");

  return {
    moduleCode: `m${moduleNumber}`,
    missionKey,
  };
}

function getExpectedMissionContexts(catalog) {
  return (catalog.modules ?? []).flatMap((moduleItem) =>
    Object.keys(moduleItem.missions ?? {}).map((missionKey) => ({
      moduleCode: moduleItem.code,
      missionKey,
    })),
  );
}

const catalog = readJson(catalogPath);
const issues = validateModulesCatalog(catalog);
const warnings = [];
const missionFiles = walkJsonFiles(contentDir);
const existingMissionKeys = new Set();

for (const filePath of missionFiles) {
  const mission = readJson(filePath);
  const context = missionContextFromPath(filePath);
  const relativePath = path.relative(rootDir, filePath);

  existingMissionKeys.add(`${context.moduleCode}:${context.missionKey}`);

  issues.push(
    ...validateMissionContent(mission, context).map(
      (issue) => `${relativePath} -> ${issue}`,
    ),
  );
}

for (const expected of getExpectedMissionContexts(catalog)) {
  const key = `${expected.moduleCode}:${expected.missionKey}`;

  if (!existingMissionKeys.has(key)) {
    warnings.push(
      `${expected.moduleCode}.${expected.missionKey}: mision declarada sin archivo de contenido`,
    );
  }
}

if (issues.length > 0) {
  console.error("Validacion de misiones fallida:\n");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `OK: ${missionFiles.length} misiones validas con schemaVersion ${MISSION_SCHEMA_VERSION}.`,
);

if (warnings.length > 0) {
  console.log("\nAvisos:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
