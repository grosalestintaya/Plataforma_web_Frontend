import missionTheme from "@/assets/audios/modules/module1-theme.wav";
import module1 from "@/assets/audios/modules/module1-theme.wav";

// Por ahora todos los modulos usan la misma pista base.
// Dejamos el mapa listo para cuando cada modulo tenga su propio audio.
const MODULE_MUSIC_MAP = {
  m01: module1,
  // m02: module2,
  // m03: module3,
  // m04: module4,
  // m05: module5,
};

/**
 * Resuelve la musica principal del modulo.
 * El menu y las misiones consumen la misma fuente para mantener continuidad.
 */
export function getModuleMusicSrc(moduleCode) {
  return MODULE_MUSIC_MAP[moduleCode] ?? missionTheme;
}
