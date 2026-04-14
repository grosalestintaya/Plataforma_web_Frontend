import { Howl } from "howler";

import clickSfx from "@/assets/audios/sfxmenu/Cursor Saliente.wav";
import hoverSfx from "@/assets/audios/sfxmenu/Cursor sobre siguiente.wav";
import successSfx from "@/assets/audios/sfx/Cursor sobre siguiente.wav";
import errorSfx from "@/assets/audios/sfx/error.wav";
import openModalSfx from "@/assets/audios/sfxmenu/Cursor entrante.wav";
import closeModalSfx from "@/assets/audios/sfxmenu/Cursor Saliente.wav";
import mascotTapSfx from "@/assets/audios/sfxmenu/avatar.wav";
import clickdot from "@/assets/audios/sfxmenu/Cursor sobre siguiente.wav";

function makeSfx(name, src, volume = 1) {
  return new Howl({
    src: [src],
    preload: true,
    volume,
    onload() {
      console.log(`[SFX:${name}] loaded`, src);
      console.log(`[SFX:${name}] duration`, this.duration());
      console.log(`[SFX:${name}] state`, this.state());
    },
    onloaderror(id, err) {
      console.error(`[SFX:${name}] load error`, { id, err, src });
    },
    onplay(id) {
      console.log(`[SFX:${name}] playing`, { id });
    },
    onplayerror(id, err) {
      console.error(`[SFX:${name}] play error`, { id, err, src });
    },
  });
}

export function createSfxCatalog() {
  return {
    click: makeSfx("click", clickSfx, 1),
    hover: makeSfx("hover", hoverSfx, 1),
    success: makeSfx("success", successSfx, 1),
    error: makeSfx("error", errorSfx, 1),
    openModal: makeSfx("openModal", openModalSfx, 1),
    closeModal: makeSfx("closeModal", closeModalSfx, 1),
    mascotTap: makeSfx("mascotTap", mascotTapSfx, 1),
    clickdot: makeSfx("clickdot", clickdot, 1),
  };
}
