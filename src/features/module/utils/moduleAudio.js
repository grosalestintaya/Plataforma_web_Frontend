function getAudioUrl(filename) {
  return new URL(`/src/assets/audios/modules/${filename}`, import.meta.url)
    .href;
}

const MODULE_MUSIC_MAP = {
  m01: getAudioUrl("module1.mp3"),
  m02: getAudioUrl("module2.mp3"),
  m03: getAudioUrl("module3.mp3"),
  m04: getAudioUrl("module4.mp3"),
  m05: getAudioUrl("module5.mp3"),
};

export function getModuleMusicSrc(moduleCode) {
  return MODULE_MUSIC_MAP[moduleCode] ?? getAudioUrl("module1.mp3");
}
