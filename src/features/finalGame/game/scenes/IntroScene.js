// game/scenes/IntroScene.js
// Portada estilo arcade (verde/lila/oro): fondo con grid, iconos flotantes,
// ecualizador y el titulo del juego. Un prompt pulsante inicia la historia.
import Phaser from "phaser";
import {
  fadeToScene,
  createArcadeBackground,
  createFloatingIcons,
  createEqualizer,
  arcadeTitleStyle,
  applyArcadeTitleShadow,
  ARCADE_GOLD_HEX,
} from "../ui/sceneUI";

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    createArcadeBackground(this);
    createFloatingIcons(this);
    createEqualizer(this);
    this.createTitle();
    this.createStartPrompt();
  }

  createTitle() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const title = this.add
      .text(cx, cy - 40, "RETO FINAL", {
        ...arcadeTitleStyle(78),
        align: "center",
        lineSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(2);
    applyArcadeTitleShadow(title);

    // Entrada con "pop".
    title.setScale(0.6);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: "Back.Out",
    });

    const subtitle = this.add
      .text(
        cx,
        cy + 60,
        "Demuestra todo lo que aprendiste superando los desafíos de educación financiera.",
        {
          fontSize: "18px",
          color: "#e9d5ff",
          align: "center",
          wordWrap: { width: 640 },
        },
      )
      .setOrigin(0.5)
      .setDepth(2);
    subtitle.setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 400, delay: 350 });
  }

  createStartPrompt() {
    const cx = this.scale.width / 2;
    const y = this.scale.height - 200;

    const prompt = this.add
      .text(cx, y, "► COMENZAR", {
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#00000055",
        padding: { x: 22, y: 12 },
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    // Parpadeo tipo "Press Start" (alpha no mueve el area de clic).
    this.tweens.add({
      targets: prompt,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    prompt.on("pointerover", () => prompt.setColor(ARCADE_GOLD_HEX));
    prompt.on("pointerout", () => prompt.setColor("#ffffff"));
    prompt.on("pointerdown", () => fadeToScene(this, "StoryScene"));
  }
}
