import SceneIntro from "./scenes/SceneIntro";
import SceneMCQ from "./scenes/SceneMCQ";
import SceneResults from "./scenes/SceneResults";
import SceneOutro from "./scenes/SceneOutro";
import SceneConcept from "./scenes/SceneConcept";
export const SCENE_REGISTRY = {
  "scene.intro.v1": SceneIntro,
  "scene.mcq.v1": SceneMCQ,
  "scene.results.v1": SceneResults,
  "scene.outro.v1": SceneOutro,
  "scene.concept.v1": SceneConcept,
};

export function resolveScene(templateKey) {
  return SCENE_REGISTRY[templateKey] || null;
}
