import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "qy-activity-audio";

function readInitialAudio() {
  if (typeof window === "undefined") {
    return { sfx: 80, music: 50 };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sfx: 80, music: 50 };

    const parsed = JSON.parse(raw);

    return {
      sfx: typeof parsed.sfx === "number" ? parsed.sfx : 80,
      music: typeof parsed.music === "number" ? parsed.music : 50,
    };
  } catch {
    return { sfx: 80, music: 50 };
  }
}

export default function useActivityAudio() {
  const initial = useMemo(() => readInitialAudio(), []);
  const [sfx, setSfx] = useState(initial.sfx);
  const [music, setMusic] = useState(initial.music);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sfx,
        music,
      }),
    );
  }, [sfx, music]);

  return {
    sfx,
    music,
    setSfx,
    setMusic,
  };
}
