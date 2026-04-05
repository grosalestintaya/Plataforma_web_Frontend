import missionTheme from "@/assets/audios/mission-theme.mp3";

// Por ahora todos los modulos usan la misma pista base.
// Dejamos el mapa listo para cuando cada modulo tenga su propio audio.
const MODULE_MUSIC_MAP = {
  m01: missionTheme,
  m02: missionTheme,
  m03: missionTheme,
  m04: missionTheme,
  m05: missionTheme,
};

/**
 * Resuelve la musica principal del modulo.
 * El menu y las misiones consumen la misma fuente para mantener continuidad.
 */
export function getModuleMusicSrc(moduleCode) {
  return MODULE_MUSIC_MAP[moduleCode] ?? missionTheme;
}
