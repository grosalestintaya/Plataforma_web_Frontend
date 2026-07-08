// game/scenes/BootScene.js
import Phaser from "phaser";
import coinIncome1 from "@/assets/dashboard/coin.webp";
import coinIncome2 from "@/assets/dashboard/coin2.webp";
import coinIncome3 from "@/assets/dashboard/coin4.webp";
import heroIllustration from "@/assets/marketing/hero.webp";
import { fadeToScene } from "../ui/sceneUI";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.createLoadingBar();

    // --- Backgrounds de la historieta (public/activity/6/) ---
    this.load.image("market_bg", "/activity/6/m1_image.webp");

    // --- Backgrounds por modulo (ilustraciones reales ya usadas en las misiones) ---
    this.load.image("m01_bg", "/activity/6/m1_image.webp");
    this.load.image("m02_bg", "/activity/6/m2_image.webp");
    this.load.image("m03_bg", "/activity/6/m3_image.webp");
    this.load.image("m04_bg", "/activity/6/m4_image.webp");
    this.load.image("m05_bg", "/activity/6/m5_image.webp");
    this.load.image("banker_bg", "/activity/6/pappers_image.webp");
    this.load.image("banker", "/activity/6/banquero.webp");
    this.load.image("stamp_approve", "/activity/6/aprobar.webp");
    this.load.image("stamp_reject", "/activity/6/rechazar.webp");

    // --- Mascotas (public/game/) ---
    this.load.image("mascot_snake", "/game/mascots/snake.webp");
    this.load.image("mascot_llama", "/game/mascots/llama.webp");
    // 'puma' es .gif — Phaser lo carga como imagen estática (no animará el gif nativo)
    this.load.image("mascot_puma", "/game/mascots/puma.gif");
    // Colibri animado: spritesheet generado a partir de colibri.gif (7 frames
    // coalescidos, ver public/game/mascots/spritesheets/). Phaser no anima
    // gifs nativamente, pero si un spritesheet con this.anims.
    this.load.spritesheet(
      "mascot_colibri",
      "/game/mascots/spritesheets/colibri-spritesheet.png",
      { frameWidth: 180, frameHeight: 180 },
    );

    // --- Assets del minijuego (items reales de los modulos) ---
    this.load.image("coin_1", coinIncome1);
    this.load.image("coin_2", coinIncome2);
    this.load.image("coin_3", coinIncome3);
    this.load.image("item_gaseosa", "/activity/2/gaseosa.webp");
    this.load.image("item_helado", "/activity/2/helado.webp");
    this.load.image(
      "item_compra_impulsiva",
      "/activity/4/compra-impulsiva..webp",
    );
    this.load.image("casa_bg", "/activity/6/casa_image.webp");
    this.load.image("runner_bg", "/activity/6/birdgame_image.webp");
    this.load.image("hero_illustration", heroIllustration);

    // --- Audio (public/game/) ---
    this.load.audio("bg_music", "/game/audios/modules/module5.mp3");
    this.load.audio("sfx_click", "/game/audios/sfx/click.mp3");
    this.load.audio("sfx_hover", "/game/audios/sfx/hover.mp3");
    this.load.audio("sfx_success", "/game/audios/sfx/success.mp3");
    this.load.audio("sfx_error", "/game/audios/sfx/error.mp3");
    this.load.audio("sfx_next", "/game/audios/sfx/next.mp3");
    this.load.audio("sfx_stamp", "/game/audios/sfx/StampDown.mp3");
    this.load.audio("sfx_coin", "/game/audios/sfx/Moneda.mp3");
  }

  createLoadingBar() {
    const { width, height } = this.cameras.main;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1a1a, 1);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const progressBar = this.add.graphics();

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Cargando...", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const percentText = this.add
      .text(width / 2, height / 2, "0%", {
        fontSize: "18px",
        color: "#00c853",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value) => {
      percentText.setText(`${Math.round(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x00c853, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBox.destroy();
      progressBar.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create() {
    fadeToScene(this, "IntroScene");
  }
}
