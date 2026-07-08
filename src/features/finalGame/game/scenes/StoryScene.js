// game/scenes/StoryScene.js
import Phaser from "phaser";
import { getNode, getQuiz } from "../services/storyEngine";
import { MAX_STORY_SCORE, toSectionScore } from "../services/scoreCalculator";
import { beginSection, completeSection, updateProgress } from "../services/attemptTracker";
import { playMusic } from "../services/musicManager";
import { addSfx } from "../services/audioSettings";
import { ACTIVITY_IDS } from "../config/activities";
import {
  createBackground,
  createStoryPanel,
  createChoiceButton,
  createHudBadge,
  fadeToScene,
  fadeSwap,
  fadeInObjects,
  popInObjects,
} from "../ui/sceneUI";

const START_NODE_ID = "intro_story";
const TOTAL_MODULES = 5;

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  init() {
    this.score = 0;
    this.currentModule = null;
    this.answers = [];
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    beginSection(ACTIVITY_IDS.story);

    this.sfxClick = addSfx(this, "sfx_click");
    this.sfxHover = addSfx(this, "sfx_hover");
    this.sfxNext = addSfx(this, "sfx_next");
    this.sfxSuccess = addSfx(this, "sfx_success");
    this.sfxError = addSfx(this, "sfx_error");

    playMusic(this, "bg_music");

    this.scoreBadge = createHudBadge(this, 20, 20, "★ 0");
    this.moduleBadge = createHudBadge(this, 20, 62, "Introducción");

    this.renderNode(START_NODE_ID);
  }

  renderNode(nodeId) {
    // Destruimos todo lo del nodo anterior EXCEPTO el HUD, que es persistente.
    [...this.children.list].forEach((child) => {
      if (child !== this.scoreBadge && child !== this.moduleBadge) child.destroy();
    });

    const node = getNode(nodeId);
    if (node.module) this.currentModule = node.module;
    this.updateHud();

    createBackground(this, node.background);

    const quiz = node.type === "quiz" ? getQuiz(node.quizRef) : null;
    const panelText = quiz ? `${node.text}\n\n${quiz.question}` : node.text;

    let optionCount = 0;
    if (node.type === "dialog") optionCount = 1;
    else if (node.type === "decision") optionCount = node.choices.length;
    else if (node.type === "quiz") optionCount = quiz.options.length;

    const { panel, optionsX, optionsY, optionsWidth, optionRowHeight } = createStoryPanel(
      this,
      panelText,
      optionCount,
    );
    fadeInObjects(this, [panel]);

    const layout = { x: optionsX, y: optionsY, width: optionsWidth, rowHeight: optionRowHeight };

    let buttons = [];
    if (node.type === "dialog") {
      buttons = this.renderDialogNode(node, layout);
    } else if (node.type === "decision") {
      buttons = this.renderDecisionNode(node, layout);
    } else if (node.type === "quiz") {
      buttons = this.renderQuizNode(node, quiz, layout);
    } else if (node.type === "ending") {
      this.renderEndingNode();
    }

    popInObjects(this, buttons);
  }

  updateHud() {
    this.scoreBadge.setLabel(`★ ${this.score}`);
    const moduleNumber = this.currentModule ? Number(this.currentModule.replace("m0", "")) : null;
    this.moduleBadge.setLabel(
      moduleNumber ? `Módulo ${moduleNumber}/${TOTAL_MODULES}` : "Introducción",
    );
  }

  renderDialogNode(node, layout) {
    const btn = createChoiceButton(this, "Continuar", {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      onHover: () => this.sfxHover.play(),
      onClick: () => this.advance(node.next),
    });
    return [btn];
  }

  renderDecisionNode(node, layout) {
    return node.choices.map((choice, i) =>
      createChoiceButton(this, choice.label, {
        x: layout.x,
        y: layout.y + i * layout.rowHeight,
        width: layout.width,
        onHover: () => this.sfxHover.play(),
        onClick: () => {
          this.score += choice.scoreDelta;
          this.recordAnswer({ node: node.id, choice: choice.label, scoreDelta: choice.scoreDelta });
          this.updateHud();
          this.advance(choice.next);
        },
      }),
    );
  }

  renderQuizNode(node, quiz, layout) {
    return quiz.options.map((option, i) =>
      createChoiceButton(this, option.label, {
        x: layout.x,
        y: layout.y + i * layout.rowHeight,
        width: layout.width,
        onHover: () => this.sfxHover.play(),
        onClick: () => {
          this.score += option.scoreDelta;
          this.recordAnswer({ node: node.id, choice: option.label, ok: !!option.correct });
          this.updateHud();
          if (option.correct) this.sfxSuccess.play();
          else this.sfxError.play();
          this.advance(option.correct ? node.onCorrectNext : node.onIncorrectNext);
        },
      }),
    );
  }

  recordAnswer(entry) {
    this.answers.push(entry);
    updateProgress(this.sectionScore(), { answers: this.answers });
  }

  sectionScore() {
    return toSectionScore(Math.max(0, this.score), MAX_STORY_SCORE);
  }

  renderEndingNode() {
    const finalScore = this.sectionScore();
    completeSection(finalScore, { answers: this.answers });
    this.time.delayedCall(1800, () => {
      fadeToScene(this, "BankerScene", { storyScore: finalScore });
    });
  }

  advance(nextNodeId) {
    this.sfxClick.play();
    this.sfxNext.play();
    fadeSwap(this, () => this.renderNode(nextNodeId));
  }
}
