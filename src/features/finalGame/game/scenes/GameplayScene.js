// game/scenes/GameplayScene.js
// Recorrido de 3 carriles: el avatar corre solo, el jugador cambia de carril
// para atrapar ingresos, evitar gastos, y llegar a tiempo a las puertas de
// decision (que ocupan el carril izquierdo y el derecho con una opcion cada
// una; el carril central siempre es neutral).
import Phaser from "phaser";
import { gameplayItems } from "../data/gameplayItems";
import { runnerGates } from "../data/runnerGates";
import { MAX_GAMEPLAY_SCORE, toSectionScore } from "../services/scoreCalculator";
import { beginSection, completeSection, updateProgress } from "../services/attemptTracker";
import { ACTIVITY_IDS } from "../config/activities";
import { fadeToScene, createChoiceButton } from "../ui/sceneUI";

const GAME_DURATION_MS = 35000;
const SPAWN_EVERY_MS_START = 900;
const SPAWN_EVERY_MS_MIN = 500;
const DIFFICULTY_RAMP_MS = 10000;
const DIFFICULTY_STEP_MS = 100;
const FALL_SPEED_MIN = 130;
const FALL_SPEED_MAX = 190;
const GATE_EVERY_MS = 8000;
const GATE_FIRST_DELAY_MS = 4000;
const GATE_FALL_SPEED = 90;
const GATE_HEIGHT = 100;
const ITEM_SIZE = 56;
const ITEM_RING_RADIUS = 34;
const LANE_COUNT = 3;
const AVATAR_Y_OFFSET = 70;
const AVATAR_WIDTH = 90;
const AVATAR_HEIGHT = 90;
const COUNTDOWN_STEPS = ["3", "2", "1", "¡Corre!"];
const COUNTDOWN_STEP_MS = 600;

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("GameplayScene");
  }

  init(data) {
    this.storyScore = data.storyScore || 0;
    this.bankerScore = data.bankerScore || 0;
    this.gameplayScore = 0;
    this.fallingItems = [];
    this.fallingGates = [];
    this.timeLeftMs = GAME_DURATION_MS;
    this.spawnTimer = 0;
    this.spawnEveryMs = SPAWN_EVERY_MS_START;
    this.gateTimer = GATE_FIRST_DELAY_MS;
    this.difficultyTimer = DIFFICULTY_RAMP_MS;
    this.currentLane = 1;
    this.hasFinished = false;
    this.isCountingDown = true;
    this.itemsCaught = 0;
    this.gateChoices = [];
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    beginSection(ACTIVITY_IDS.runner);

    this.sfxClick = this.sound.add("sfx_click");
    this.sfxHover = this.sound.add("sfx_hover");
    this.sfxSuccess = this.sound.add("sfx_success");
    this.sfxError = this.sound.add("sfx_error");
    this.sfxCoin = this.sound.add("sfx_coin");

    this.ensureColibriAnim();
    this.renderIntro();
  }

  ensureColibriAnim() {
    if (!this.anims.exists("colibri_fly")) {
      this.anims.create({
        key: "colibri_fly",
        frames: this.anims.generateFrameNumbers("mascot_colibri", { start: 0, end: 6 }),
        frameRate: 16,
        repeat: -1,
      });
    }
  }

  // Pantalla previa al reto: el colibri animado en el centro, con las
  // instrucciones de control, antes de armar el juego real.
  renderIntro() {
    this.drawBackground();

    const cx = this.scale.width / 2;

    this.add
      .text(cx, 80, "AYUDA AL COLIBRÍ", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#f5b400",
        stroke: "#0f3325",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(2);

    const preview = this.add
      .sprite(cx, this.scale.height / 2 - 30, "mascot_colibri")
      .setDisplaySize(220, 220)
      .setDepth(2);
    preview.play("colibri_fly");
    // Vaiven suave para que se note que "se mueve", ademas del aleteo.
    this.tweens.add({
      targets: preview,
      y: preview.y - 16,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add
      .text(
        cx,
        this.scale.height / 2 + 140,
        "Usa las flechas ← → o el mouse para cambiar de carril.\nAtrapa ingresos, evita gastos, y decide a tiempo en las puertas.",
        {
          fontSize: "18px",
          color: "#e5e7eb",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: this.scale.width * 0.75 },
        },
      )
      .setOrigin(0.5)
      .setDepth(2);

    createChoiceButton(this, "Comenzar", {
      x: cx - 70,
      y: this.scale.height - 90,
      onHover: () => this.sfxHover.play(),
      onClick: () => {
        this.sfxClick.play();
        [...this.children.list].forEach((child) => child.destroy());
        this.startGame();
      },
    });
  }

  startGame() {
    this.drawBackground();

    this.laneX = [this.scale.width * 0.2, this.scale.width * 0.5, this.scale.width * 0.8];
    this.drawLaneDividers();

    this.scoreText = this.add
      .text(20, 20, this.formatScoreLabel(), { fontSize: "16px", color: "#00c853" })
      .setDepth(2);

    this.timeText = this.add
      .text(this.scale.width - 20, 20, this.formatTimeLabel(), {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(1, 0)
      .setDepth(2);

    const avatarY = this.scale.height - AVATAR_Y_OFFSET;
    this.avatar = this.add
      .sprite(this.laneX[this.currentLane], avatarY, "mascot_colibri")
      .setDisplaySize(AVATAR_WIDTH, AVATAR_HEIGHT)
      .setDepth(1);
    this.avatar.play("colibri_fly");

    this.input.keyboard.on("keydown-LEFT", () => this.moveLane(-1));
    this.input.keyboard.on("keydown-RIGHT", () => this.moveLane(1));
    this.input.on("pointerdown", (pointer) => {
      this.moveLane(pointer.x < this.scale.width / 2 ? -1 : 1);
    });

    this.startCountdown();
  }

  drawBackground() {
    // La imagen es muy panoramica (7000x2800, aspecto 2.5:1) comparada con el
    // canvas (1280x720, 16:9 = 1.78:1). Recortamos el ancho centrado para que
    // cubra el canvas completo sin deformarse (equivalente a "background-size:
    // cover" en CSS).
    const bg = this.add.image(0, 0, "runner_bg").setOrigin(0, 0).setDepth(0);
    const source = bg.texture.getSourceImage();
    const canvasAspect = this.scale.width / this.scale.height;
    const cropWidth = Math.min(source.width, source.height * canvasAspect);
    const cropX = (source.width - cropWidth) / 2;
    bg.setCrop(cropX, 0, cropWidth, source.height);
    bg.setDisplaySize(this.scale.width, this.scale.height);

    // Overlay oscuro para que el HUD y los items sigan siendo legibles sobre
    // una imagen con mucho detalle/color.
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x0d0d14, 0.4)
      .setOrigin(0)
      .setDepth(0);
  }

  drawLaneDividers() {
    const graphics = this.add.graphics().setDepth(0);
    graphics.lineStyle(1, 0xffffff, 0.15);
    const dividerXs = [
      (this.laneX[0] + this.laneX[1]) / 2,
      (this.laneX[1] + this.laneX[2]) / 2,
    ];
    dividerXs.forEach((x) => graphics.lineBetween(x, 0, x, this.scale.height));
  }

  moveLane(direction) {
    if (this.isCountingDown || this.hasFinished) return;
    const nextLane = Phaser.Math.Clamp(this.currentLane + direction, 0, LANE_COUNT - 1);
    if (nextLane === this.currentLane) return;
    this.currentLane = nextLane;
    this.tweens.add({
      targets: this.avatar,
      x: this.laneX[this.currentLane],
      duration: 150,
      ease: "Sine.Out",
    });
  }

  startCountdown() {
    const countdownText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(3);

    COUNTDOWN_STEPS.forEach((label, i) => {
      this.time.delayedCall(i * COUNTDOWN_STEP_MS, () => countdownText.setText(label));
    });

    this.time.delayedCall(COUNTDOWN_STEPS.length * COUNTDOWN_STEP_MS, () => {
      countdownText.destroy();
      this.isCountingDown = false;
    });
  }

  update(_time, delta) {
    this.updateTimer(delta);
    this.updateDifficulty(delta);
    this.updateSpawner(delta);
    this.updateGateSpawner(delta);
    this.updateFallingItems(delta);
    this.updateFallingGates(delta);
  }

  updateTimer(delta) {
    if (this.hasFinished || this.isCountingDown) return;
    this.timeLeftMs -= delta;
    this.timeText.setText(this.formatTimeLabel());
    if (this.timeLeftMs <= 0) {
      this.finishGameplay();
    }
  }

  updateDifficulty(delta) {
    if (this.hasFinished || this.isCountingDown) return;
    this.difficultyTimer -= delta;
    if (this.difficultyTimer <= 0) {
      this.spawnEveryMs = Math.max(SPAWN_EVERY_MS_MIN, this.spawnEveryMs - DIFFICULTY_STEP_MS);
      this.difficultyTimer = DIFFICULTY_RAMP_MS;
    }
  }

  updateSpawner(delta) {
    if (this.hasFinished || this.isCountingDown) return;
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnItem();
      this.spawnTimer = this.spawnEveryMs;
    }
  }

  updateGateSpawner(delta) {
    if (this.hasFinished || this.isCountingDown) return;
    this.gateTimer -= delta;
    if (this.gateTimer <= 0) {
      this.spawnGate();
      this.gateTimer = GATE_EVERY_MS;
    }
  }

  spawnItem() {
    const definition = Phaser.Utils.Array.GetRandom(gameplayItems);
    const lane = Phaser.Math.Between(0, LANE_COUNT - 1);
    const ringColor = definition.kind === "income" ? 0x00c853 : 0xff5252;

    const ring = this.add.graphics().setDepth(1);
    ring.fillStyle(0x1a1a1a, 1);
    ring.fillCircle(0, 0, ITEM_RING_RADIUS);
    ring.lineStyle(3, ringColor, 1);
    ring.strokeCircle(0, 0, ITEM_RING_RADIUS);

    const icon = this.add
      .image(0, 0, definition.imageKey)
      .setDisplaySize(ITEM_SIZE, ITEM_SIZE);

    const container = this.add
      .container(this.laneX[lane], -ITEM_RING_RADIUS, [ring, icon])
      .setDepth(1);

    this.fallingItems.push({
      sprite: container,
      definition,
      lane,
      speed: Phaser.Math.Between(FALL_SPEED_MIN, FALL_SPEED_MAX),
    });
  }

  spawnGate() {
    const gateDef = Phaser.Utils.Array.GetRandom(runnerGates);
    const boxWidth = this.laneX[1] - this.laneX[0] - 10;

    const leftBox = this.add
      .rectangle(this.laneX[0], 0, boxWidth, GATE_HEIGHT, 0x00c853, 0.25)
      .setStrokeStyle(2, 0x00c853);
    const leftText = this.add
      .text(this.laneX[0], 0, gateDef.leftLabel, {
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: boxWidth - 10 },
      })
      .setOrigin(0.5);

    const rightBox = this.add
      .rectangle(this.laneX[2], 0, boxWidth, GATE_HEIGHT, 0xff5252, 0.25)
      .setStrokeStyle(2, 0xff5252);
    const rightText = this.add
      .text(this.laneX[2], 0, gateDef.rightLabel, {
        fontSize: "14px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: boxWidth - 10 },
      })
      .setOrigin(0.5);

    const container = this.add
      .container(0, -GATE_HEIGHT, [leftBox, leftText, rightBox, rightText])
      .setDepth(1);

    this.fallingGates.push({ sprite: container, gateDef, speed: GATE_FALL_SPEED });
  }

  updateFallingItems(delta) {
    if (!this.avatar) return;
    const catchLineY = this.avatar.y;

    this.fallingItems = this.fallingItems.filter((entry) => {
      entry.sprite.y += entry.speed * (delta / 1000);

      if (entry.sprite.y >= catchLineY) {
        if (entry.lane === this.currentLane) {
          this.resolveCatch(entry.definition, entry.sprite.x, entry.sprite.y);
        }
        entry.sprite.destroy();
        return false;
      }

      return true;
    });
  }

  updateFallingGates(delta) {
    if (!this.avatar) return;
    const resolveLineY = this.avatar.y - 40;

    this.fallingGates = this.fallingGates.filter((entry) => {
      entry.sprite.y += entry.speed * (delta / 1000);

      if (entry.sprite.y >= resolveLineY) {
        this.resolveGate(entry.gateDef);
        entry.sprite.destroy();
        return false;
      }

      return true;
    });
  }

  resolveCatch(definition, x, y) {
    const isIncome = definition.kind === "income";

    if (isIncome) {
      this.gameplayScore = Math.min(
        MAX_GAMEPLAY_SCORE,
        this.gameplayScore + definition.value,
      );
      this.itemsCaught += 1;
      this.sfxCoin.play();
    } else {
      this.gameplayScore = Math.max(0, this.gameplayScore - definition.value);
      this.sfxError.play();
    }
    this.scoreText.setText(this.formatScoreLabel());
    this.showScorePopup(x, y, isIncome, definition.value);
    updateProgress(this.sectionScore(), this.buildPayload());
  }

  resolveGate(gateDef) {
    let delta = 0;
    let feedback = "No decidiste a tiempo...";
    let choice = "neutral";

    if (this.currentLane === 0) {
      delta = gateDef.leftDelta;
      feedback = gateDef.leftFeedback;
      choice = gateDef.leftLabel;
    } else if (this.currentLane === 2) {
      delta = gateDef.rightDelta;
      feedback = gateDef.rightFeedback;
      choice = gateDef.rightLabel;
    }

    this.gameplayScore = Phaser.Math.Clamp(this.gameplayScore + delta, 0, MAX_GAMEPLAY_SCORE);
    this.gateChoices.push({ gate: gateDef.id, choice, ok: delta > 0 });
    this.scoreText.setText(this.formatScoreLabel());
    if (delta > 0) this.sfxSuccess.play();
    else if (delta < 0) this.sfxError.play();

    this.showGateFeedback(feedback, delta);
    updateProgress(this.sectionScore(), this.buildPayload());
  }

  showScorePopup(x, y, isIncome, value) {
    const label = isIncome ? `+${value}` : `-${value}`;
    const popup = this.add
      .text(x, y, label, {
        fontSize: "22px",
        color: isIncome ? "#00c853" : "#ff5252",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: "Sine.Out",
      onComplete: () => popup.destroy(),
    });
  }

  showGateFeedback(feedback, delta) {
    const color = delta > 0 ? "#00c853" : delta < 0 ? "#ff5252" : "#ffffff";
    const text = this.add
      .text(this.scale.width / 2, this.avatar.y - 60, feedback, {
        fontSize: "18px",
        color,
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1200,
      delay: 300,
      onComplete: () => text.destroy(),
    });
  }

  formatScoreLabel() {
    return `Puntaje: ${this.gameplayScore}/${MAX_GAMEPLAY_SCORE}`;
  }

  formatTimeLabel() {
    return `Tiempo: ${Math.max(0, Math.ceil(this.timeLeftMs / 1000))}s`;
  }

  sectionScore() {
    return toSectionScore(this.gameplayScore, MAX_GAMEPLAY_SCORE);
  }

  buildPayload() {
    return {
      answers: this.gateChoices,
      itemsCaught: this.itemsCaught,
      rawScore: this.gameplayScore,
    };
  }

  finishGameplay() {
    if (this.hasFinished) return;
    this.hasFinished = true;

    this.fallingItems.forEach((entry) => entry.sprite.destroy());
    this.fallingItems = [];
    this.fallingGates.forEach((entry) => entry.sprite.destroy());
    this.fallingGates = [];

    const finalScore = this.sectionScore();
    completeSection(finalScore, this.buildPayload());

    fadeToScene(this, "ResultScene", {
      storyScore: this.storyScore,
      bankerScore: this.bankerScore,
      gameplayScore: finalScore,
    });
  }
}
