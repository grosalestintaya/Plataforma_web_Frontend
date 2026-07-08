// game/services/audioSettings.js
// Volumen global de los efectos de sonido (sfx), separado de la musica (que
// gestiona musicManager). Los sfx se crean con addSfx() para quedar
// registrados y poder ajustar su volumen en vivo desde el modal de opciones.

let sfxVolume = 1;
const registry = new Set();

export function getSfxVolume() {
  return sfxVolume;
}

// Ajusta el volumen de todos los sfx (0..1) y lo aplica a los ya creados.
export function setSfxVolume(value) {
  sfxVolume = Math.max(0, Math.min(1, value));
  for (const sound of [...registry]) {
    try {
      sound.setVolume(sfxVolume);
    } catch {
      registry.delete(sound); // sonido ya destruido
    }
  }
}

// Crea un sfx con el volumen actual y lo registra para ajustes en vivo.
export function addSfx(scene, key) {
  const sound = scene.sound.add(key, { volume: sfxVolume });
  registry.add(sound);
  return sound;
}
