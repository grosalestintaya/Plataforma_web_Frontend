// src/game/mascot/mascotCatalog.js
// Recomendación: usa /public/mascots/... para que sea simple en rutas
// /public/mascots/puma.gif, condor.gif, etc.

export const MASCOT_BY_MODULE = {
  m01: { key: "llama", name: "llamita", gif: "/mascots/llama.gif" },
  m02: { key: "condor", name: "Cóndor", gif: "/mascots/condor.gif" },
  m03: { key: "zorro", name: "Zorro", gif: "/mascots/zorro.gif" },
  m04: { key: "oso", name: "Oso Andino", gif: "/mascots/oso.gif" },
  m05: { key: "llama", name: "Llama", gif: "/mascots/llama.gif" },
  m06: { key: "jaguar", name: "Jaguar", gif: "/mascots/jaguar.gif" },
};

export const DEFAULT_MASCOT = {
  key: "guide",
  name: "Guía",
  gif: "/mascots/guide.gif",
};

export function getMascotForModule(moduleKey) {
  return MASCOT_BY_MODULE[moduleKey] || DEFAULT_MASCOT;
}
