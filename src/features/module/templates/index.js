import TeoriaTemplate from "./teoria/TeoriaTemplate";
import StepGuideTemplate from "./stepGuide/StepGuideTemplate";
import ScenarioExplorerTemplate from "./scenarioExplorer/ScenarioExplorerTemplate";
import ChoiceRevealTemplate from "./choiceReveal/ChoiceRevealTemplate";

// Games
import MemoryPairsGame  from "../blocks/Games/MemoryPairsGame";



export const templates = {
  // Template expositivo base del sistema.
  teoria: TeoriaTemplate,
  choiceReveal: ChoiceRevealTemplate,
  stepGuide: StepGuideTemplate,
  scenarioExplorer: ScenarioExplorerTemplate,
  // Legacy: se mantiene mientras migramos contenido viejo.
  memoryPairs: MemoryPairsGame,
};
