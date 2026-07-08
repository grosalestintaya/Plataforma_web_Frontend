// game/config.js
import BootScene from "./scenes/BootScene";
import IntroScene from "./scenes/IntroScene";
import StoryScene from "./scenes/StoryScene";
import BankerScene from "./scenes/BankerScene";
import GameplayScene from "./scenes/GameplayScene";
import ResultScene from "./scenes/ResultScene";
import Phaser from "phaser";
export const gameConfig = {
  type: Phaser.AUTO,

  width: 1280,
  height: 720,

  backgroundColor: "#0d0d0d",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },

  scene: [
    BootScene,
    IntroScene,
    StoryScene,
    BankerScene,
    GameplayScene,
    ResultScene,
  ],

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};
