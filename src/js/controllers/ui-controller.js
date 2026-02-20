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
import { setRenderDOM } from "../systems/render.js";
import { gameState } from "../core/state.js";

/* ------------------------------------------------------------------ */
/*  Pause Overlay                                                      */
/* ------------------------------------------------------------------ */

const PAUSE_OVERLAY_HTML = `
  <div class="pause-menu">
    <h2 class="pause-title">PAUSED</h2>
    <div class="pause-buttons">
      <button class="menu-btn" id="continueBtn">Continue</button>
      <button class="menu-btn" id="restartBtn">Restart</button>
      <button class="menu-btn" id="backToMenuBtn">Back to Menu</button>
    </div>
  </div>`;

/** @type {Object|null} */
let _DOM = null;
/** @type {Function|null} */
let _restartFn = null;

/**
 * Creates a fresh pause-overlay element and appends it to the game container.
 * Called after the container is cleared (e.g. on level load) so the overlay
 * survives innerHTML wipes.
 *
 * @param {HTMLElement} container - The game container element.
 */
export function createPauseOverlay(container) {
  const el = document.createElement("div");
  el.className = "pause-overlay hidden";
  el.id = "pauseOverlay";
  el.innerHTML = PAUSE_OVERLAY_HTML;
  container.appendChild(el);
  if (_DOM) _DOM.pauseOverlay = el;
}

/** Shows the pause overlay and pauses the game. */
function showPauseOverlay() {
  if (_DOM?.pauseOverlay) _DOM.pauseOverlay.classList.remove("hidden");
  if (gameState.getMode() === "RUNNING") gameState.setMode("PAUSED");
}

/** Hides the pause overlay and resumes the game. */
function hidePauseOverlay() {
  if (_DOM?.pauseOverlay) _DOM.pauseOverlay.classList.add("hidden");
  if (gameState.getMode() === "PAUSED") gameState.setMode("RUNNING");
}

/** Returns whether the game is currently paused. */
function isPaused() {
  return gameState.getMode() === "PAUSED";
}

/**
 * Delegated click handler for the three pause-menu buttons.
 * @param {MouseEvent} e
 */
function handlePauseButtonClick(e) {
  switch (e.target.id) {
    case "continueBtn":
      hidePauseOverlay();
      break;
    case "restartBtn":
      hidePauseOverlay();
      _restartFn?.();
      break;
    case "backToMenuBtn":
      hidePauseOverlay();
      showScreen("menu", _DOM);
      stopListeners();
      break;
  }
}

/**
 * Keyboard handler for Escape (toggle pause).
 * @param {KeyboardEvent} e
 */
function handlePauseKeydown(e) {
  if (e.key === "Escape") {
    isPaused() ? hidePauseOverlay() : showPauseOverlay();
  }
}

/**
 * Initializes pause-menu behaviour: event delegation for buttons and
 * Esc / R keyboard shortcuts. Call once during app startup.
 *
 * @param {Object}   DOM       - Centralized DOM reference object.
 * @param {Function} restartFn - A function that restarts the current level.
 */
function initPauseController(DOM, restartFn) {
  _DOM = DOM;
  _restartFn = restartFn;
  document.addEventListener("click", handlePauseButtonClick);
  document.addEventListener("keydown", handlePauseKeydown);
}

/* ------------------------------------------------------------------ */
/*  Main UI Setup                                                      */
/* ------------------------------------------------------------------ */

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
  // Provide HUD DOM references to the render system
  setRenderDOM(DOM);

  // Load saved high score on startup
  if (DOM.highScoreDisplay) {
    const stored = parseInt(localStorage.getItem("highScore") || "0", 10);
    DOM.highScoreDisplay.textContent = stored;
  }

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

  // --- Pause controller (Esc overlay + R restart + button delegation) ---
  initPauseController(DOM, () => startLevel(getCurrentLevel(), DOM));

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
