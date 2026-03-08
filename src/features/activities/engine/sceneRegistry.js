import SceneIntro from "../templates/SceneIntro";
import SceneMCQ from "../templates/SceneMCQ";
import SceneResults from "../templates/SceneResults";
import SceneOutro from "../templates/SceneOutro";
import SceneConcept from "../templates/SceneConcept";
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
