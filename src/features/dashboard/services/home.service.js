// src/services/home.service.js
import { api } from "@/services/apiClient";

function normalizeUser(raw) {
  return {
    nombre: raw?.nombre ?? "",
    puntos: Number(raw?.puntos ?? 0),
    nivel: raw?.nivel ?? "Yachaq",
    progreso: Number(raw?.progreso ?? 0),
    institucion: raw?.institucion ?? "",
    seccion: raw?.seccion ?? "",
    monedas: Number(raw?.monedas ?? 0),
    foto: raw?.foto ?? "default",
  };
}

export async function getHomeUser() {
  const data = await api.get("api/user/home-summary");

  // Si tu backend responde directo:
  // { nombre, puntos, nivel, ... }
  return normalizeUser(data);

  // Si luego respondes envuelto:
  // { ok: true, data: {...} }
  // entonces usa:
  // return normalizeUser(data?.data);
}
