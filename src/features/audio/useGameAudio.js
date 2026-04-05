import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { createSfxCatalog } from "./audioCatalog";

const STORAGE_KEY = "qy-game-audio-settings";
const MUSIC_RELEASE_DELAY_MS = 450;

function clampVolume(value, fallback) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.max(0, Math.min(100, num));
}

function readInitialSettings() {
  if (typeof window === "undefined") {
    return { music: 50, sfx: 80 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { music: 50, sfx: 80 };

    const parsed = JSON.parse(raw);

    return {
      music: clampVolume(parsed?.music, 50),
      sfx: clampVolume(parsed?.sfx, 80),
    };
  } catch {
    return { music: 50, sfx: 80 };
  }
}

// Estado compartido entre menu y actividad para que la musica no se reinicie
// al navegar dentro del mismo modulo.
const sharedAudioState = {
  settings: readInitialSettings(),
  listeners: new Set(),
  sfxCatalog: null,
  musicHowl: null,
  musicSrc: null,
  musicScopeKey: null,
  musicClaims: 0,
  releaseTimer: null,
};

function notifySettingsChanged() {
  sharedAudioState.listeners.forEach((listener) => {
    listener(sharedAudioState.settings);
  });
}

function persistSettings() {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedAudioState.settings));
}

function ensureSfxCatalog() {
  if (!sharedAudioState.sfxCatalog) {
    sharedAudioState.sfxCatalog = createSfxCatalog();
    Object.values(sharedAudioState.sfxCatalog).forEach((sound) => {
      sound.volume(sharedAudioState.settings.sfx / 100);
    });
  }

  return sharedAudioState.sfxCatalog;
}

function clearPendingMusicRelease() {
  if (!sharedAudioState.releaseTimer) return;

  clearTimeout(sharedAudioState.releaseTimer);
  sharedAudioState.releaseTimer = null;
}

function teardownMusic() {
  if (sharedAudioState.musicHowl) {
    sharedAudioState.musicHowl.stop();
    sharedAudioState.musicHowl.unload();
  }

  sharedAudioState.musicHowl = null;
  sharedAudioState.musicSrc = null;
  sharedAudioState.musicScopeKey = null;
}

function ensureMusicInstance(musicSrc, musicScopeKey) {
  if (!musicSrc) return null;

  const shouldReplaceTrack =
    !sharedAudioState.musicHowl ||
    sharedAudioState.musicSrc !== musicSrc ||
    sharedAudioState.musicScopeKey !== musicScopeKey;

  if (shouldReplaceTrack) {
    teardownMusic();

    sharedAudioState.musicHowl = new Howl({
      src: [musicSrc],
      loop: true,
      preload: true,
      volume: sharedAudioState.settings.music / 100,
    });
    sharedAudioState.musicSrc = musicSrc;
    sharedAudioState.musicScopeKey = musicScopeKey;
  }

  return sharedAudioState.musicHowl;
}

function acquireSharedMusic(musicSrc, musicScopeKey) {
  if (!musicSrc) return () => {};

  clearPendingMusicRelease();
  ensureMusicInstance(musicSrc, musicScopeKey);
  sharedAudioState.musicClaims += 1;

  return () => {
    sharedAudioState.musicClaims = Math.max(0, sharedAudioState.musicClaims - 1);

    if (sharedAudioState.musicClaims > 0) return;

    clearPendingMusicRelease();
    // Damos un margen corto para navegar entre rutas del mismo modulo
    // sin cortar ni reiniciar la musica.
    sharedAudioState.releaseTimer = setTimeout(() => {
      if (sharedAudioState.musicClaims === 0) {
        teardownMusic();
      }
    }, MUSIC_RELEASE_DELAY_MS);
  };
}

/**
 * Hook de audio compartido:
 * - la musica puede persistir entre paginas del mismo modulo;
 * - los efectos y volumenes se comparten de forma global.
 */
export default function useGameAudio({
  musicSrc = null,
  musicScopeKey = "global",
} = {}) {
  const [settings, setSettings] = useState(sharedAudioState.settings);
  const releaseMusicRef = useRef(() => {});

  useEffect(() => {
    ensureSfxCatalog();

    const listener = (nextSettings) => {
      setSettings(nextSettings);
    };

    sharedAudioState.listeners.add(listener);
    return () => {
      sharedAudioState.listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    releaseMusicRef.current?.();
    releaseMusicRef.current = acquireSharedMusic(musicSrc, musicScopeKey);

    return () => {
      releaseMusicRef.current?.();
    };
  }, [musicScopeKey, musicSrc]);

  const setMusic = useCallback((value) => {
    sharedAudioState.settings = {
      ...sharedAudioState.settings,
      music: clampVolume(value, 50),
    };

    if (sharedAudioState.musicHowl) {
      sharedAudioState.musicHowl.volume(sharedAudioState.settings.music / 100);
    }

    persistSettings();
    notifySettingsChanged();
  }, []);

  const setSfx = useCallback((value) => {
    sharedAudioState.settings = {
      ...sharedAudioState.settings,
      sfx: clampVolume(value, 80),
    };

    Object.values(ensureSfxCatalog()).forEach((sound) => {
      sound.volume(sharedAudioState.settings.sfx / 100);
    });

    persistSettings();
    notifySettingsChanged();
  }, []);

  const playMusic = useCallback(() => {
    const musicInstance = sharedAudioState.musicHowl;
    if (!musicInstance) return;

    if (!musicInstance.playing()) {
      musicInstance.play();
    }
  }, []);

  const pauseMusic = useCallback(() => {
    sharedAudioState.musicHowl?.pause();
  }, []);

  const resumeMusic = useCallback(() => {
    const musicInstance = sharedAudioState.musicHowl;
    if (!musicInstance) return;

    if (!musicInstance.playing()) {
      musicInstance.play();
    }
  }, []);

  const stopMusic = useCallback(() => {
    sharedAudioState.musicHowl?.stop();
  }, []);

  const playSfx = useCallback((name, options = {}) => {
    const sound = ensureSfxCatalog()?.[name];
    if (!sound) return;

    const runPlayback = () => {
      const id = sound.play();

      if (typeof options.rate === "number") {
        sound.rate(options.rate, id);
      }

      if (typeof options.seek === "number") {
        sound.seek(options.seek, id);
      }

      return id;
    };

    if (sound.state() !== "loaded") {
      sound.once("load", () => {
        runPlayback();
      });

      sound.load();
      return;
    }

    return runPlayback();
  }, []);

  const stopSfx = useCallback((name) => {
    const sound = ensureSfxCatalog()?.[name];
    if (!sound) return;

    sound.stop();
  }, []);

  return {
    music: settings.music,
    sfx: settings.sfx,
    setMusic,
    setSfx,
    playMusic,
    pauseMusic,
    resumeMusic,
    stopMusic,
    playSfx,
    stopSfx,
  };
}
