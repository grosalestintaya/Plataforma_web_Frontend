// game/scenes/BankerScene.js
// Minijuego "El Banquero" (estilo Papers Please): el jugador revisa un
// expediente (hoja vertical a la izquierda) y decide con sellos de aprobar o
// rechazar (panel a la derecha), analizando ingresos, gastos e historial.
// Va entre la historia (StoryScene) y el runner de monedas (GameplayScene).
import Phaser from "phaser";
import { loanApplicants } from "../data/loanApplicants";
import { MAX_BANKER_SCORE, toSectionScore } from "../services/scoreCalculator";
import {
  beginSection,
  completeSection,
  updateProgress,
} from "../services/attemptTracker";
import { playMusic } from "../services/musicManager";
import { addSfx } from "../services/audioSettings";
import { ACTIVITY_IDS } from "../config/activities";
import {
  createBackground,
  createHudBadge,
  createChoiceButton,
  createDocumentCard,
  createImageButton,
  createStoryPanel,
  fadeToScene,
  fadeInObjects,
  popInObjects,
} from "../ui/sceneUI";

const CORRECT_DELTA = 5;
const INCORRECT_DELTA = -2;
// Al sellar suena el golpe; esperamos antes de evaluar para que el sfx de
// exito/error no se solape con el del sello.
const EVAL_DELAY_MS = 1000;
// Tras mostrar el resultado, el jugador se queda en el caso para leer el
// feedback y escuchar el audio completo antes de pasar al siguiente.
const READ_DELAY_MS = 5000;

// Tamaño de fuente del HUD (score/progreso) 20% mas grande que el default
// compartido (14px), solo dentro de esta escena.
const HUD_FONT_SIZE = 17;

// Los sellos son imagenes reales (960x717, aspecto ~1.34:1).
const STAMP_ASPECT = 960 / 717;
const STAMP_WIDTH = 210;
const STAMP_HEIGHT = STAMP_WIDTH / STAMP_ASPECT;
const STAMP_GAP = 24;

// El layout es proporcional al canvas logico real (this.scale.width/height),
// que por la config de escala del juego es 672x432 y no 960x540.
const MARGIN = 30;

export default class BankerScene extends Phaser.Scene {
  constructor() {
    super("BankerScene");
  }

  init(data) {
    this.storyScore = data.storyScore || 0;
    this.bankerScore = 0;
    this.applicantIndex = 0;
    this.answers = [];
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    beginSection(ACTIVITY_IDS.banker);
    playMusic(this, "bg_banker");

    this.sfxStamp = addSfx(this, "sfx_stamp");
    this.sfxHover = addSfx(this, "sfx_hover");
    this.sfxSuccess = addSfx(this, "sfx_success");
    this.sfxError = addSfx(this, "sfx_error");

    this.scoreBadge = createHudBadge(this, 20, 20, "★ 0", {
      fontSize: HUD_FONT_SIZE,
    });
    this.progressBadge = createHudBadge(
      this,
      this.scale.width - 160,
      20,
      `Solicitud 1/${loanApplicants.length}`,
      { fontSize: HUD_FONT_SIZE },
    );

    this.renderIntro();
  }

  renderIntro() {
    createBackground(this, "banker_bg");

    const introText =
      "Ahora serás un banquero.\n\nLlegan personas solicitando préstamos. Revisa el expediente de cada una —ingresos, gastos e historial— y decide si apruebas o rechazas.";
    const { panel, optionsX, optionsY, optionsWidth } = createStoryPanel(
      this,
      introText,
      1,
    );
    fadeInObjects(this, [panel]);

    const btn = createChoiceButton(this, "Comenzar", {
      x: optionsX,
      y: optionsY,
      width: optionsWidth,
      onHover: () => this.sfxHover.play(),
      onClick: () => this.renderApplicant(0),
    });
    popInObjects(this, [btn]);
  }

  renderApplicant(index) {
    [...this.children.list].forEach((child) => {
      if (child !== this.scoreBadge && child !== this.progressBadge)
        child.destroy();
    });

    if (index >= loanApplicants.length) {
      this.finishBanker();
      return;
    }

    this.applicantIndex = index;
    this.updateHud();

    createBackground(this, "banker");
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x0d0d14, 0.5)
      .setOrigin(0)
      .setDepth(1);

    const applicant = loanApplicants[index];
    const capacity = applicant.income - applicant.expenses;

    const docY = MARGIN;
    const docWidth = Math.round(this.scale.width * 0.42);
    const rightX = MARGIN + docWidth + MARGIN;
    const rightWidth = this.scale.width - rightX - MARGIN;

    // --- Columna izquierda: expediente vertical ---
    const { card } = createDocumentCard(this, {
      x: MARGIN,
      y: docY,
      width: docWidth,
      minHeight: this.scale.height - docY * 2,
      header: "SOLICITUD DE PRÉSTAMO",
      name: applicant.name,
      rows: [
        { label: "Ingresos mensuales", value: `S/ ${applicant.income}` },
        { label: "Gastos mensuales", value: `S/ ${applicant.expenses}` },
        { label: "Le queda al mes", value: `S/ ${capacity}` },
        {
          label: "Historial crediticio",
          value: `${applicant.creditHistory}\n${applicant.creditNote}`,
        },
        { label: "Monto solicitado", value: `S/ ${applicant.requestedAmount}` },
      ],
    });

    // --- Columna derecha: titulo, instruccion y sellos ---
    const title = this.add
      .text(rightX, docY + 10, "MESA DE CRÉDITO", {
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0)
      .setDepth(2);

    const instruction = this.add
      .text(
        rightX,
        docY + 66,
        "¿Puede pagar este préstamo sin arriesgar su economía?",
        {
          fontSize: "18px",
          color: "#d1d5db",
          wordWrap: { width: rightWidth },
        },
      )
      .setOrigin(0, 0)
      .setDepth(2);

    // Sellos en paralelo (lado a lado), como imagenes reales, centrados en la
    // columna derecha y un poco mas abajo que antes.
    const stampsGroupWidth = STAMP_WIDTH * 2 + STAMP_GAP;
    const stampsStartX = rightX + (rightWidth - stampsGroupWidth) / 2;
    const stampsCenterY = docY + 270;
    const approveStamp = createImageButton(this, "stamp_approve", {
      x: stampsStartX + STAMP_WIDTH / 2,
      y: stampsCenterY,
      width: STAMP_WIDTH,
      height: STAMP_HEIGHT,
      onHover: () => this.sfxHover.play(),
      onClick: () => this.resolveDecision(applicant, true),
    });
    const rejectStamp = createImageButton(this, "stamp_reject", {
      x: stampsStartX + STAMP_WIDTH + STAMP_GAP + STAMP_WIDTH / 2,
      y: stampsCenterY,
      width: STAMP_WIDTH,
      height: STAMP_HEIGHT,
      onHover: () => this.sfxHover.play(),
      onClick: () => this.resolveDecision(applicant, false),
    });

    this.rightX = rightX;
    this.rightWidth = rightWidth;
    this.currentButtons = [approveStamp, rejectStamp];
    fadeInObjects(this, [card, title, instruction]);
    popInObjects(this, this.currentButtons);
  }

  updateHud() {
    this.scoreBadge.setLabel(`★ ${this.bankerScore}`);
    this.progressBadge.setLabel(
      `Solicitud ${Math.min(this.applicantIndex + 1, loanApplicants.length)}/${loanApplicants.length}`,
    );
  }

  resolveDecision(applicant, approved) {
    // 1) Solo el golpe del sello al seleccionar.
    this.sfxStamp.play();
    this.currentButtons.forEach((btn) => btn.disableInteractive());

    // 2) Esperar ~1s antes de evaluar, para no solapar el sfx del sello con el
    //    de exito/error.
    this.time.delayedCall(EVAL_DELAY_MS, () => {
      const isCorrect = approved === applicant.shouldApprove;
      this.bankerScore = Phaser.Math.Clamp(
        this.bankerScore + (isCorrect ? CORRECT_DELTA : INCORRECT_DELTA),
        0,
        MAX_BANKER_SCORE,
      );
      this.answers.push({ applicant: applicant.name, approved, ok: isCorrect });
      updateProgress(this.sectionScore(), { answers: this.answers });
      this.updateHud();

      // 3) Sonido de resultado + feedback en pantalla.
      if (isCorrect) this.sfxSuccess.play();
      else this.sfxError.play();

      const feedback = approved
        ? applicant.feedbackApprove
        : applicant.feedbackReject;
      this.showFeedback(feedback, isCorrect);

      // 4) Mantener el caso 5s para leer/escuchar, luego el siguiente.
      this.time.delayedCall(READ_DELAY_MS, () => {
        this.renderApplicant(this.applicantIndex + 1);
      });
    });
  }

  showFeedback(text, isCorrect) {
    const color = isCorrect ? "#4ade80" : "#f87171";
    const feedbackBox = this.add
      .text(
        this.rightX,
        MARGIN + 430,
        `${isCorrect ? "✓ Correcto" : "✗ Incorrecto"}\n${text}`,
        {
          fontSize: "18px",
          color,
          backgroundColor: "#000000cc",
          padding: { x: 14, y: 10 },
          wordWrap: { width: this.rightWidth },
          lineSpacing: 4,
        },
      )
      .setOrigin(0, 0)
      .setDepth(5);
    fadeInObjects(this, [feedbackBox]);
  }

  sectionScore() {
    return toSectionScore(this.bankerScore, MAX_BANKER_SCORE);
  }

  finishBanker() {
    const finalScore = this.sectionScore();
    completeSection(finalScore, { answers: this.answers });
    fadeToScene(this, "GameplayScene", {
      storyScore: this.storyScore,
      bankerScore: finalScore,
    });
  }
}
