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
/*  Pause Screen                                                       */
/* ------------------------------------------------------------------ */

/** @type {Object|null} */
let _DOM = null;
/** @type {Function|null} */
let _restartFn = null;
/** @type {number|null} Timestamp when pause started, used to adjust the timer */
let _pausedAt = null;

/** Shows the pause screen and pauses the game. */
function showPauseScreen() {
  if (!_DOM) return;
  // Show pause screen alongside the game screen (don't hide game)
  if (_DOM.screens.pause) _DOM.screens.pause.classList.remove("hidden");
  if (gameState.getMode() === "RUNNING") {
    _pausedAt = performance.now();
    gameState.setMode("PAUSED");
  }
}

/** Hides the pause screen and resumes the game. */
function hidePauseScreen() {
  if (!_DOM) return;
  if (_DOM.screens.pause) _DOM.screens.pause.classList.add("hidden");
  if (gameState.getMode() === "PAUSED") {
    // Shift timeStarted forward by the paused duration so the timer stays accurate
    if (_pausedAt && gameState.timeStarted) {
      gameState.timeStarted += performance.now() - _pausedAt;
    }
    _pausedAt = null;
    gameState.setMode("RUNNING");
  }
}

/**
 * Delegated click handler for the three pause-menu buttons.
 * @param {MouseEvent} e
 */
function handlePauseButtonClick(e) {
  switch (e.target.id) {
    case "continueBtn":
      hidePauseScreen();
      break;
    case "restartBtn":
      hidePauseScreen();
      _restartFn?.();
      break;
    case "backToMenuBtn":
      hidePauseScreen();
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
    const mode = gameState.getMode();
    if (mode === "PAUSED") {
      hidePauseScreen();
    } else if (mode === "RUNNING") {
      showPauseScreen();
    }
  }
}

/**
 * Initializes pause-screen behaviour: event delegation for buttons and
 * Esc keyboard shortcut. Call once during app startup.
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
/*  Game Over Screen                                                   */
/* ------------------------------------------------------------------ */

/** Shows the Game Over overlay with the final score and time. */
export function showGameOverScreen() {
  if (!_DOM?.screens?.gameOver) return;
  const finalScoreEl = document.getElementById("finalScore");
  if (finalScoreEl) finalScoreEl.textContent = gameState.score;
  const finalTimeEl = document.getElementById("finalTime");
  if (finalTimeEl) {
    const totalSec = Math.floor(gameState.elapsedMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    finalTimeEl.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
  }
  const usernameInput = document.getElementById("usernameInput");
  if (usernameInput) {
    usernameInput.value = "";
    usernameInput.disabled = false;
  }
  const submitBtn = document.getElementById("submitScoreBtn");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Score";
  }
  _DOM.screens.gameOver.classList.remove("hidden");
}

/** Hides the Game Over overlay. */
function hideGameOverScreen() {
  if (!_DOM?.screens?.gameOver) return;
  _DOM.screens.gameOver.classList.add("hidden");
}

/**
 * Delegated click handler for Game Over buttons.
 * @param {MouseEvent} e
 */
function handleGameOverClick(e) {
  switch (e.target.id) {
    case "submitScoreBtn": {
      const input = document.getElementById("usernameInput");
      const name = input?.value.trim();
      if (!name) {
        input?.focus();
        return;
      }
      saveScore(name, gameState.score, gameState.elapsedMs);
      // Disable button/input after submission
      e.target.disabled = true;
      e.target.textContent = "Submitted!";
      if (input) input.disabled = true;
      break;
    }
    case "goRestartBtn":
      hideGameOverScreen();
      _restartFn?.();
      break;
    case "goBackToMenuBtn":
      hideGameOverScreen();
      showScreen("menu", _DOM);
      stopListeners();
      break;
  }
}

/**
 * Saves a player's score to localStorage.
 * @param {string} name - Player name.
 * @param {number} score - Final score.
 * @param {number} timeMs - Elapsed time in milliseconds (used as tiebreaker).
 */
function saveScore(name, score, timeMs) {
  const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push({ name, score, timeMs, date: new Date().toISOString() });
  // Sort by score desc, then by time asc (faster = better) as tiebreaker
  scores.sort((a, b) => b.score - a.score || (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity));
  // Keep top 10
  localStorage.setItem("leaderboard", JSON.stringify(scores.slice(0, 10)));
  console.log(`Score saved: ${name} — ${score} (${Math.floor(timeMs / 1000)}s)`);
}

/**
 * Initializes Game Over screen event delegation. Call once during app startup.
 */
function initGameOverController() {
  document.addEventListener("click", handleGameOverClick);
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

  // --- Game Over controller (button delegation) ---
  initGameOverController();

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
