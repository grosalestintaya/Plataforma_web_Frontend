// game/scenes/ResultScene.js
// Pantalla de resultados con la misma vibra arcade que la portada (verde/lila/
// oro): fondo con grid, iconos flotantes, titulo dorado con glow, un scoreboard
// con los 3 puntajes, el promedio destacado y un ecualizador animado abajo.
import Phaser from "phaser";
import { EventBus } from "../EventBus";
import { averageSectionScores } from "../services/scoreCalculator";
import {
  createArcadeBackground,
  createFloatingIcons,
  createEqualizer,
  arcadeTitleStyle,
  applyArcadeTitleShadow,
  ARCADE_GREEN,
  ARCADE_LILAC_HEX,
  ARCADE_GOLD_HEX,
} from "../ui/sceneUI";

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    // Los tres puntajes ya vienen normalizados a 60-100 desde cada seccion.
    this.storyScore = data.storyScore || 0;
    this.bankerScore = data.bankerScore || 0;
    this.gameplayScore = data.gameplayScore || 0;
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.average = averageSectionScores([
      this.storyScore,
      this.bankerScore,
      this.gameplayScore,
    ]);

    createArcadeBackground(this);
    createFloatingIcons(this);
    createEqualizer(this);
    this.createTitle();
    this.createScoreboard();
    this.createAverage();
    this.startReturnCountdown();

    const bgMusic = this.sound.get("bg_music");
    if (bgMusic) {
      this.tweens.add({
        targets: bgMusic,
        volume: 0,
        duration: 1500,
        delay: 3000,
        onComplete: () => bgMusic.stop(),
      });
    }
  }

  createTitle() {
    const title = this.add
      .text(this.scale.width / 2, 90, "RESULTADOS", arcadeTitleStyle(54))
      .setOrigin(0.5)
      .setDepth(3);
    applyArcadeTitleShadow(title);

    title.setScale(0.6);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: "Back.Out",
    });
  }

  createScoreboard() {
    const cx = this.scale.width / 2;
    const rows = [
      { label: "Historia", value: this.storyScore },
      { label: "Banquero", value: this.bankerScore },
      { label: "Reto final", value: this.gameplayScore },
    ];

    const panelWidth = 460;
    const rowHeight = 56;
    const gap = 14;
    const startY = 180;

    rows.forEach((row, i) => {
      const y = startY + i * (rowHeight + gap);
      const x = cx - panelWidth / 2;

      const panel = this.add.graphics().setDepth(2);
      panel.fillStyle(0x000000, 0.4);
      panel.fillRoundedRect(x, y, panelWidth, rowHeight, 12);
      panel.lineStyle(2, ARCADE_GREEN, 0.7);
      panel.strokeRoundedRect(x, y, panelWidth, rowHeight, 12);

      this.add
        .text(x + 24, y + rowHeight / 2, row.label, {
          fontSize: "22px",
          color: ARCADE_LILAC_HEX,
        })
        .setOrigin(0, 0.5)
        .setDepth(3);

      const valueText = this.add
        .text(x + panelWidth - 24, y + rowHeight / 2, `${row.value}`, {
          fontSize: "28px",
          fontStyle: "bold",
          color: ARCADE_GOLD_HEX,
        })
        .setOrigin(1, 0.5)
        .setDepth(3);
      valueText.setShadow(0, 0, ARCADE_GOLD_HEX, 10, true, true);

      // Aparicion escalonada de cada fila.
      const items = [panel, valueText];
      items.forEach((it) => it.setAlpha(0));
      this.tweens.add({
        targets: items,
        alpha: 1,
        duration: 300,
        delay: 300 + i * 180,
      });
    });
  }

  createAverage() {
    const avg = this.add
      .text(this.scale.width / 2, 430, `PROMEDIO  ${this.average}`, {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#f5b400",
      })
      .setOrigin(0.5)
      .setDepth(3);
    avg.setShadow(0, 0, "#f5b400", 14, true, true);

    avg.setAlpha(0);
    this.tweens.add({ targets: avg, alpha: 1, duration: 400, delay: 900 });
  }

  // Muestra "Regresando a casa en 5..1" y al terminar avisa a React para que
  // navegue con el router (ver FinalGamePage).
  startReturnCountdown() {
    const countdownText = this.add
      .text(this.scale.width / 2, 530, "", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(3);

    let remaining = 5;
    const tick = () => {
      if (remaining >= 1) {
        countdownText.setText(`Regresando a casa en ${remaining}...`);
        remaining -= 1;
        this.time.delayedCall(1000, tick);
      } else {
        EventBus.emit("game-finished", {
          storyScore: this.storyScore,
          bankerScore: this.bankerScore,
          gameplayScore: this.gameplayScore,
          average: this.average,
        });
      }
    };
    tick();
  }
}
