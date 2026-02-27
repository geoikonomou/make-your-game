import { gameState } from "../core/state.js";
import { stopListeners } from "../core/game-engine.js";
import { showScreen } from "./screen-controller.js";
import { startLevel, getCurrentLevel } from "./level-controller.js";
import { LEVELS } from "../config/level-config.js";
import { showCutscene } from "./cutscene-controller.js";

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
      gameState.campaignMode = false;
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
export function initPauseController(DOM, restartFn) {
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
      gameState.campaignMode = false;
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
  scores.sort(
    (a, b) =>
      b.score - a.score || (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity),
  );
  // Keep top 10
  localStorage.setItem("leaderboard", JSON.stringify(scores.slice(0, 10)));
  console.log(
    `Score saved: ${name} — ${score} (${Math.floor(timeMs / 1000)}s)`,
  );
}

/**
 * Initializes Game Over screen event delegation. Call once during app startup.
 */
export function initGameOverController() {
  document.addEventListener("click", handleGameOverClick);
}

/* ------------------------------------------------------------------ */
/*  Win Screen                                                         */
/* ------------------------------------------------------------------ */

/** Shows the Win overlay with score and time. */
export function showWinScreen() {
  if (!_DOM?.screens?.win) return;
  const scoreEl = document.getElementById("winFinalScore");
  if (scoreEl) scoreEl.textContent = gameState.score;
  const timeEl = document.getElementById("winFinalTime");
  if (timeEl) {
    const totalSec = Math.floor(gameState.elapsedMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    timeEl.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
  }
  const usernameInput = document.getElementById("winUsernameInput");
  if (usernameInput) {
    usernameInput.value = "";
    usernameInput.disabled = false;
  }
  const submitBtn = document.getElementById("winSubmitScoreBtn");
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Score";
  }
  // Hide "Next Level" if this is the last level in freeplay mode
  // In campaign mode, keep it visible — it triggers the victory cutscene
  const nextBtn = document.getElementById("nextLevelBtn");
  const maxLevel = Object.keys(LEVELS).length;
  if (nextBtn) {
    if (gameState.campaignMode) {
      nextBtn.style.display = "";
      nextBtn.textContent =
        getCurrentLevel() >= maxLevel ? "Finish Campaign" : "Next Level";
    } else {
      nextBtn.style.display = getCurrentLevel() >= maxLevel ? "none" : "";
      nextBtn.textContent = "Next Level";
    }
  }
  _DOM.screens.win.classList.remove("hidden");
}

/** Hides the Win overlay. */
function hideWinScreen() {
  if (!_DOM?.screens?.win) return;
  _DOM.screens.win.classList.add("hidden");
}

/**
 * Delegated click handler for Win screen buttons.
 * @param {MouseEvent} e
 */
function handleWinClick(e) {
  switch (e.target.id) {
    case "winSubmitScoreBtn": {
      const input = document.getElementById("winUsernameInput");
      const name = input?.value.trim();
      if (!name) {
        input?.focus();
        return;
      }
      saveScore(name, gameState.score, gameState.elapsedMs);
      e.target.disabled = true;
      e.target.textContent = "Submitted!";
      if (input) input.disabled = true;
      break;
    }
    case "nextLevelBtn": {
      hideWinScreen();
      const next = getCurrentLevel() + 1;
      const maxLevel = Object.keys(LEVELS).length;
      if (gameState.campaignMode && next > maxLevel) {
        // Campaign complete — show the victory cutscene
        stopListeners();
        showCutscene("complete", _DOM, () => {
          gameState.campaignMode = false;
          showScreen("menu", _DOM);
        });
      } else if (gameState.campaignMode) {
        // Campaign — show cutscene before next level
        stopListeners();
        showCutscene(next, _DOM, () => {
          showScreen("game", _DOM);
          startLevel(next, _DOM);
        });
      } else {
        // Freeplay — load next level directly
        startLevel(next, _DOM);
      }
      break;
    }
    case "winRestartBtn":
      hideWinScreen();
      _restartFn?.();
      break;
    case "winBackToMenuBtn":
      hideWinScreen();
      gameState.campaignMode = false;
      showScreen("menu", _DOM);
      stopListeners();
      break;
  }
}

/**
 * Initializes Win screen event delegation. Call once during app startup.
 */
export function initWinController() {
  document.addEventListener("click", handleWinClick);
}
