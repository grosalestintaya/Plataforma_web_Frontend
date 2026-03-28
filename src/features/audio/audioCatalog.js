import { Howl } from "howler";

import clickSfx from "@/assets/audios/sfx/click.mp3";
import hoverSfx from "@/assets/audios/sfx/hover.mp3";
import successSfx from "@/assets/audios/sfx/success.mp3";
import errorSfx from "@/assets/audios/sfx/error.mp3";
import openModalSfx from "@/assets/audios/sfx/open-modal.mp3";
import closeModalSfx from "@/assets/audios/sfx/close-modal.mp3";

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
  };
}
