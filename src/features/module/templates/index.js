import TeoriaTemplate from "./teoria/TeoriaTemplate";
import StepGuideTemplate from "./stepGuide/StepGuideTemplate";
import ScenarioExplorerTemplate from "./scenarioExplorer/ScenarioExplorerTemplate";
import ChoiceRevealTemplate from "./choiceReveal/ChoiceRevealTemplate";

//Games
import FlipCard from "../blocks/Games/FlipCard";
import MemoryPairsGame from "../blocks/Games/MemoryPairsGame";
import ReflectionQuestion from "../blocks/Games/ReflectionQuestion";
import SchoolDayBudget from "../blocks/Games/SchoolDayBudget";

export const templates = {
  // Templates expositivos o compuestos.
  teoria: TeoriaTemplate,
  choiceReveal: ChoiceRevealTemplate,
  stepGuide: StepGuideTemplate,
  scenarioExplorer: ScenarioExplorerTemplate,
  // Componentes interactivos directos para las misiones conceptuales.
  memoryGame: MemoryPairsGame,
  flipCard: FlipCard,
  // Vista reflexiva directa para preguntas actitudinales.
  reflectionQuestion: ReflectionQuestion,
  // Vista interactiva directa para misiones procedimentales con saldo diario.
  schoolDayBudget: SchoolDayBudget,
  // Alias temporal mientras migramos nombres viejos.
  memoryPairs: MemoryPairsGame,
};
