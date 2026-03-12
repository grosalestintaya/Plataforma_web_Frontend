import llamaGif from "@/assets/mascots/llama.gif";
import condorGif from "@/assets/mascots/condor.gif";
import colobri from "@/assets/mascots/colibri.gif";
import pumaGif from "@/assets/mascots/puma.gif";
import snakeGif from "@/assets/mascots/snake.gif";
import guideGif from "@/assets/mascots/guide.png";

export const MASCOT_BY_MODULE = {
  m01: { key: "llama", name: "Llamita", gif: llamaGif },
  m02: { key: "condor", name: "Cóndor", gif: condorGif },
  m03: { key: "colibri", name: "Colibrí", gif: colobri },
  m04: { key: "puma", name: "Puma", gif: pumaGif },
  m05: { key: "llama", name: "Llama", gif: llamaGif },
  m06: { key: "snake", name: "Serpiente", gif: snakeGif },
};

export const DEFAULT_MASCOT = {
  key: "guide",
  name: "Guía",
  gif: guideGif,
};

export function getMascotForModule(moduleKey) {
  return MASCOT_BY_MODULE[moduleKey] || DEFAULT_MASCOT;
}
