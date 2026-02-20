import { startMusic, toggleMute, volumeControls } from "./audio-controller.js";
import {
  startLevel,
  getCurrentLevel,
  getCurrentBricks,
  handleResize,
} from "./level-controller.js";
import { stopListeners } from "../core/game-engine.js";
import { showScreen } from "./screen-controller.js";
import { audioManager } from "../audio/audio-manager.js";
// import { enterGameMode } from "../core/game-engine.js";

/**
 * Initializes all UI event listeners and binds user interactions
 * to game systems (audio, level loading, screen transitions, etc.).
 *
 * @param {Object} DOM - Centralized DOM reference object.
 * @param {HTMLElement} DOM.container
 * @param {HTMLElement} DOM.bricksContainer
 * @param {HTMLElement} DOM.levelDisplay
 * @param {Object} DOM.screens
 * @param {Object} DOM.buttons
 */
export function setupUI(DOM) {
  // --- Main Menu ---
  DOM.buttons.play.addEventListener("click", () => {
    startMusic();
    audioManager?.playSfx?.("gameStart");
    showScreen("game", DOM);
    startLevel(1, DOM);
    // enterGameMode();
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
  DOM.buttons.mute.addEventListener("click", () =>
    toggleMute(DOM.buttons.mute),
  );

  // --- Level buttons ---
  DOM.buttons.levelButtons.forEach((btn) => {
    btn.addEventListener("click", function() {
      const level = parseInt(this.dataset.level);
      showScreen("game", DOM);
      startLevel(level, DOM);
    });
  });

  //back to menu buttons
  DOM.buttons.backtoMenuButtons.forEach((btn) => {
    btn.addEventListener("click", function() {
      showScreen("menu", DOM);
      stopListeners();
    });
  });
  // --- Volume sliders ---
  const setupSlider = (input, fn, display) => {
    input.addEventListener("input", () => {
      fn(input.value);
      display.textContent = input.value + "%";
    });
  };

  setupSlider(
    DOM.buttons.volume.master,
    volumeControls.master,
    DOM.buttons.volume.masterValue,
  );
  setupSlider(
    DOM.buttons.volume.music,
    volumeControls.music,
    DOM.buttons.volume.musicValue,
  );
  setupSlider(
    DOM.buttons.volume.sfx,
    volumeControls.sfx,
    DOM.buttons.volume.sfxValue,
  );

  // --- Keyboard ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showScreen("menu", DOM);
    if (e.key.toLowerCase() === "r") startLevel(getCurrentLevel(), DOM);
  });

  // --- Resize ---
  window.addEventListener("resize", () => handleResize(getCurrentLevel(), DOM));
  // --- Debug ---
  window.testBrickHit = () => {
    const bricks = getCurrentBricks().filter((b) => b.isActive());
    if (!bricks.length) return;
    const randomBrick = bricks[Math.floor(Math.random() * bricks.length)];
    randomBrick.hit();
    console.log(
      `Brick hit! Destroyed: ${randomBrick}, Active remaining: ${bricks.length - (randomBrick ? 1 : 0)}`,
    );
  };
}
