import { setupUI } from "./controllers/ui-controller.js";
import { startLevel } from "./controllers/level-controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    container: document.getElementById("gameContainer"),
    bricksContainer: document.getElementById("bricksContainer"),
    levelDisplay: document.getElementById("levelDisplay"),
    screens: {
      menu: document.getElementById("mainMenu"),
      levels: document.getElementById("levelScreen"),
      options: document.getElementById("optionsScreen"),
      game: document.getElementById("gameScreen"),
    },
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

  startLevel(1, DOM);

  console.log("Arkanoid initialized!");
  console.log("Controls:");
  console.log("- ESC: Return to menu");
  console.log("- R: Restart level");
  console.log("- Test: testBrickHit()");
});
