// game/services/musicManager.js
// Gestiona UNA pista de musica de fondo a la vez, compartida entre escenas. El
// sound manager de Phaser es global y no detiene los sonidos al cambiar de
// escena, asi que centralizamos aqui: cambiar de seccion detiene la pista
// anterior y arranca la nueva, evitando que se solapen.

let current = null;
let currentKey = null;
let musicVolume = 0.4;

export function getMusicVolume() {
  return musicVolume;
}

// Ajusta el volumen de la musica (0..1) y lo aplica en vivo a la pista actual.
export function setMusicVolume(value) {
  musicVolume = Math.max(0, Math.min(1, value));
  if (current) {
    try {
      current.setVolume(musicVolume);
    } catch {
      // la pista ya pudo ser destruida
    }
  }
}

export function playMusic(scene, key) {
  if (currentKey === key && current && current.isPlaying) return current;
  stopMusic();
  current = scene.sound.add(key, { loop: true, volume: musicVolume });
  current.play();
  currentKey = key;
  return current;
}

// Baja el volumen gradualmente y detiene la pista actual (para el cierre).
export function fadeOutMusic(scene, { duration = 1500, delay = 0 } = {}) {
  if (!current) return;
  const music = current;
  current = null;
  currentKey = null;
  scene.tweens.add({
    targets: music,
    volume: 0,
    duration,
    delay,
    onComplete: () => {
      try {
        music.stop();
        music.destroy();
      } catch {
        // la pista ya pudo ser destruida (ej. al cerrar el juego)
      }
    },
  });
}

export function stopMusic() {
  if (!current) return;
  try {
    current.stop();
    current.destroy();
  } catch {
    // la pista ya pudo ser destruida (ej. al cerrar el juego)
  }
  current = null;
  currentKey = null;
}
