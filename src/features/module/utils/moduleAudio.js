function getAudioUrl(filename) {
  return new URL(`/src/assets/audios/modules/${filename}`, import.meta.url)
    .href;
}

const MODULE_MUSIC_MAP = {
  m01: getAudioUrl("module1.wav"),
  m02: getAudioUrl("module2.wav"),
  m03: getAudioUrl("module3.wav"),
  m04: getAudioUrl("module4.wav"),
  m05: getAudioUrl("module5.wav"),
};

export function getModuleMusicSrc(moduleCode) {
  return MODULE_MUSIC_MAP[moduleCode] ?? getAudioUrl("module1.wav");
}
