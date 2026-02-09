// ui-controller.js
import { startMusic, toggleMute, volumeControls } from "./audio-controller.js";
import { startLevel, getCurrentLevel, getCurrentBricks } from "./level-controller.js";
import { showScreen } from "./screen-controller.js";
import { audioManager } from "../audio/audio-manager.js";

export function setupUI(DOM) {
  // --- Main Menu ---
  DOM.buttons.play.addEventListener("click", () => {
    startMusic();
    audioManager?.playSfx?.("gameStart");
    audioManager.settings.selectedlevel = 1;
    showScreen("game", DOM);
  });

  DOM.buttons.selectLevel.addEventListener("click", () => {
    startMusic();
    audioManager?.playSfx?.("click");
    showScreen("levels", DOM);
  });

  DOM.buttons.options.addEventListener("click", () => {
    startMusic();
    audioManager?.playSfx?.("click");
    showScreen("options", DOM);
  });

  // --- Mute ---
  DOM.buttons.mute.addEventListener("click", () => toggleMute(DOM.buttons.mute));

  // --- Level buttons ---
  DOM.buttons.levelButtons.forEach((btn) => {
    btn.addEventListener("click", function() {
      audioManager?.settings && (audioManager.settings.selectedLevel = parseInt(this.dataset.level));
      showScreen("game", DOM);
      startLevel(parseInt(this.dataset.level), DOM);
    });
  });

  DOM.buttons.backtoMenuButtons.forEach((btn) => {
    btn.addEventListener("click", function() {
      console.log('hello');
      showScreen("menu", DOM);
    });
  });
  // --- Volume sliders ---
  const setupSlider = (input, fn, display) => {
    input.addEventListener("input", () => {
      fn(input.value);
      display.textContent = input.value + "%";
    });
  };

  setupSlider(DOM.buttons.volume.master, volumeControls.master, DOM.buttons.volume.masterValue);
  setupSlider(DOM.buttons.volume.music, volumeControls.music, DOM.buttons.volume.musicValue);
  setupSlider(DOM.buttons.volume.sfx, volumeControls.sfx, DOM.buttons.volume.sfxValue);

  // --- Keyboard ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showScreen("menu", DOM);
    if (e.key.toLowerCase() === "r") startLevel(getCurrentLevel(), DOM);
  });

  // --- Resize ---
  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (!getCurrentBricks().length) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => startLevel(getCurrentLevel(), DOM), 150);
  });

  // --- Debug ---
  window.testBrickHit = () => {
    const bricks = getCurrentBricks().filter((b) => b.isActive());
    if (!bricks.length) return;
    const randomBrick = bricks[Math.floor(Math.random() * bricks.length)];
    randomBrick.hit();
  };
}
