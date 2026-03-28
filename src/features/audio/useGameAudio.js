import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { createSfxCatalog } from "./audioCatalog";

const STORAGE_KEY = "qy-game-audio-settings";

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

export default function useGameAudio({ musicSrc = null } = {}) {
  const initial = readInitialSettings();

  const [music, setMusic] = useState(initial.music);
  const [sfx, setSfx] = useState(initial.sfx);

  const musicRef = useRef(null);
  const sfxRef = useRef(null);

  if (!sfxRef.current) {
    sfxRef.current = createSfxCatalog();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        music,
        sfx,
      }),
    );
  }, [music, sfx]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.unload();
      musicRef.current = null;
    }

    if (!musicSrc) return;

    musicRef.current = new Howl({
      src: [musicSrc],
      loop: true,
      preload: true,
      volume: music / 100,
    });

    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
        musicRef.current = null;
      }
    };
  }, [musicSrc]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume(music / 100);
    }
  }, [music]);

  useEffect(() => {
    if (!sfxRef.current) return;

    Object.values(sfxRef.current).forEach((sound) => {
      sound.volume(sfx / 100);
    });
  }, [sfx]);

  const playMusic = useCallback(() => {
    const musicInstance = musicRef.current;
    if (!musicInstance) return;

    if (!musicInstance.playing()) {
      musicInstance.play();
    }
  }, []);

  const pauseMusic = useCallback(() => {
    musicRef.current?.pause();
  }, []);

  const resumeMusic = useCallback(() => {
    const musicInstance = musicRef.current;
    if (!musicInstance) return;

    if (!musicInstance.playing()) {
      musicInstance.play();
    }
  }, []);

  const stopMusic = useCallback(() => {
    musicRef.current?.stop();
  }, []);
  const playSfx = useCallback((name, options = {}) => {
    const sound = sfxRef.current?.[name];

    console.log("playSfx llamado:", name);

    if (!sound) {
      console.warn("No existe SFX:", name);
      return;
    }

    const runPlayback = () => {
      const id = sound.play();
      console.log(`[SFX:${name}] play id:`, id);

      if (typeof options.rate === "number") {
        sound.rate(options.rate, id);
      }

      if (typeof options.seek === "number") {
        sound.seek(options.seek, id);
      }

      return id;
    };

    console.log("state:", sound.state());
    console.log("duration:", sound.duration());

    if (sound.state() !== "loaded") {
      console.warn(`[SFX:${name}] aún no está cargado. Esperando load...`);

      sound.once("load", () => {
        console.log(`[SFX:${name}] cargado. Reproduciendo ahora.`);
        runPlayback();
      });

      sound.once("loaderror", (id, err) => {
        console.error(`[SFX:${name}] error al cargar`, { id, err });
      });

      sound.load();
      return;
    }

    return runPlayback();
  }, []);
  const stopSfx = useCallback((name) => {
    const sound = sfxRef.current?.[name];
    if (!sound) return;

    sound.stop();
  }, []);

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
        musicRef.current = null;
      }

      if (sfxRef.current) {
        Object.values(sfxRef.current).forEach((sound) => {
          sound.stop();
          sound.unload();
        });
      }
    };
  }, []);

  return {
    music,
    sfx,
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
