import { setupUI } from "./controllers/ui-controller.js";

/**
 * Entry point for the Brick Breaker game.
 *
 * Waits for the DOM to be ready, builds a structured DOM reference object,
 * and initializes UI bindings via {@link setupUI}.
 *
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    container: document.getElementById("gameContainer"),
    bricksContainer: document.getElementById("bricksContainer"),
    levelDisplay: document.getElementById("levelDisplay"),
    scoreDisplay: document.getElementById("scoreDisplay"),
    highScoreDisplay: document.getElementById("highScoreDisplay"),
    timeDisplay: document.getElementById("timeDisplay"),
    livesDisplay: document.getElementById("livesDisplay"),
    screens: {
      menu: document.getElementById("mainMenu"),
      levels: document.getElementById("levelScreen"),
      options: document.getElementById("optionsScreen"),
      game: document.getElementById("gameScreen"),
    },
    pauseOverlay: document.getElementById("pauseOverlay"),
    buttons: {
      play: document.getElementById("playBtn"),
      selectLevel: document.getElementById("selectLevelBtn"),
      options: document.getElementById("optionsBtn"),
      mute: document.getElementById("muteButton"),
      levelButtons: document.querySelectorAll(".level-btn"),
      backtoMenuButtons: document.querySelectorAll(".back-btn"),
      volume: {
        master: document.getElementById("masterVolume"),
        music: document.getElementById("musicVolume"),
        sfx: document.getElementById("sfxVolume"),
        masterValue: document.getElementById("masterValue"),
        musicValue: document.getElementById("musicValue"),
        sfxValue: document.getElementById("sfxValue"),
      },
    },
  };
  setupUI(DOM);

  console.log("Arkanoid initialized!");
  console.log("Controls:");
  console.log("- ESC: Return to menu");
  console.log("- R: Restart level");
  console.log("- Test: testBrickHit()");
});
