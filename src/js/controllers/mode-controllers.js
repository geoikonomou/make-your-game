import { gameState } from "../core/state.js";
import { stopListeners } from "../core/game-engine.js";
import { showScreen } from "./screen-controller.js";
import { startLevel, getCurrentLevel } from "./level-controller.js";
import { LEVELS } from "../config/level-config.js";
import { submitScore, getLeaderboard } from "../services/api-service.js";
import powerupSystem from "../systems/powerup-system.js";

/* ------------------------------------------------------------------ */
/*  Shared DOM + restart reference                                     */
/* ------------------------------------------------------------------ */

/** @type {Object|null} */
let _DOM = null;
/** @type {Function|null} */
let _restartFn = null;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Returns the ordinal string for a positive integer.
 * e.g. 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th"
 * @param {number} n
 * @returns {string}
 */
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Escapes HTML special characters to prevent XSS from player-supplied names.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ------------------------------------------------------------------ */
/*  Leaderboard renderer                                               */
/* ------------------------------------------------------------------ */

/**
 * Fetches all scores from the Go API and renders a paginated leaderboard
 * table (5 rows per page) inside `containerEl`.
 *
 * If `submitted` is provided, the matching row is highlighted in gold and
 * a percentile congratulation message is shown above the table.
 * Also updates `gameState.highScore` so the HUD stays in sync.
 *
 * @param {HTMLElement|null} containerEl
 * @param {{ name:string, score:number, timeMs:number }|null} [submitted]
 * @returns {Promise<void>}
 */
export async function renderLeaderboard(containerEl, submitted = null) {
  if (!containerEl) return;

  containerEl.innerHTML = `<p class="lb-loading">Loading scores…</p>`;

  let scores;
  try {
    scores = await getLeaderboard();
  } catch (err) {
    containerEl.innerHTML = `<p class="lb-error">Could not load leaderboard.<br>${err.message}</p>`;
    return;
  }

  if (!scores?.length) {
    containerEl.innerHTML = `<p class="lb-empty">No scores yet. Be the first!</p>`;
    return;
  }

  // Keep HUD high score in sync — list is sorted desc so index 0 is best
  gameState.highScore = scores[0].score;

  // Find submitted entry's rank / percentile
  let submittedRank = null;
  let submittedPercentile = null;
  if (submitted) {
    const match = scores.find(
      (s) =>
        s.name === submitted.name &&
        s.score === submitted.score &&
        s.timeMs === submitted.timeMs,
    );
    if (match) {
      submittedRank = match.rank;
      submittedPercentile = Math.max(
        1,
        Math.round((match.rank / scores.length) * 100),
      );
    }
  }

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(scores.length / PAGE_SIZE);
  let currentPage =
    submittedRank !== null ? Math.ceil(submittedRank / PAGE_SIZE) : 1;

  function renderPage() {
    const pageScores = scores.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );

    let html =
      submittedRank !== null
        ? `<p class="lb-congrats">🎉 You are in the top <strong>${submittedPercentile}%</strong>, on the <strong>${ordinal(submittedRank)}</strong> position!</p>`
        : "";

    html += `
      <table class="lb-table">
        <thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Time</th></tr></thead>
        <tbody>
          ${pageScores
        .map(
          (s) => `
            <tr class="${submitted && s.name === submitted.name && s.score === submitted.score ? "lb-row-highlight" : ""}">
              <td>${ordinal(s.rank)}</td>
              <td>${escHtml(s.name)}</td>
              <td>${s.score.toLocaleString()}</td>
              <td>${s.time}</td>
            </tr>`,
        )
        .join("")}
        </tbody>
      </table>`;

    if (totalPages > 1) {
      html += `
        <div class="lb-pagination">
          <button class="lb-page-btn" id="lbPrev" ${currentPage === 1 ? "disabled" : ""}>←</button>
          <span class="lb-page-info">Page ${currentPage} / ${totalPages}</span>
          <button class="lb-page-btn" id="lbNext" ${currentPage === totalPages ? "disabled" : ""}>→</button>
        </div>`;
    }

    containerEl.innerHTML = html;
    containerEl.querySelector("#lbPrev")?.addEventListener("click", () => {
      currentPage--;
      renderPage();
    });
    containerEl.querySelector("#lbNext")?.addEventListener("click", () => {
      currentPage++;
      renderPage();
    });
  }

  renderPage();
}

/* ------------------------------------------------------------------ */
/*  Shared submit handler                                              */
/* ------------------------------------------------------------------ */

/**
 * Handles the score submission flow shared by both Game Over and Win screens.
 * Disables the button immediately, calls the API, then re-renders the
 * leaderboard with the submitted row highlighted.
 *
 * @param {string}      btnId      - ID of the submit button element.
 * @param {string}      inputId    - ID of the username input element.
 * @param {string}      lbId       - ID of the leaderboard container element.
 */
function handleSubmit(btnId, inputId, lbId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const name = input?.value.trim();

  if (!name) {
    input?.focus();
    return;
  }

  // Disable immediately — prevent double-submit
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Submitting…";
  }
  if (input) input.disabled = true;

  // Fire-and-forget so failures never kill the outer synchronous handler
  (async () => {
    try {
      await submitScore(name, gameState.score, gameState.elapsedMs);
      const b = document.getElementById(btnId);
      if (b) b.textContent = "Submitted!";
    } catch (err) {
      console.error("Score submission failed:", err);
      const b = document.getElementById(btnId);
      const i = document.getElementById(inputId);
      if (b) {
        b.disabled = false;
        b.textContent = "Retry";
      }
      if (i) i.disabled = false;
      return; // skip leaderboard refresh on failure
    }

    renderLeaderboard(document.getElementById(lbId), {
      name,
      score: gameState.score,
      timeMs: gameState.elapsedMs,
    });
  })();
}

/* ------------------------------------------------------------------ */
/*  Pause Screen                                                       */
/* ------------------------------------------------------------------ */

/** @type {number|null} Timestamp when pause started, used to adjust the timer. */
let _pausedAt = null;

/** Shows the pause screen and transitions game mode to PAUSED. */
function showPauseScreen() {
  if (!_DOM) return;
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
  if (e.key !== "Escape") return;
  const mode = gameState.getMode();
  if (mode === "PAUSED") hidePauseScreen();
  else if (mode === "RUNNING") showPauseScreen();
}

/**
 * Initializes pause-screen behaviour: event delegation for buttons and
 * Esc keyboard shortcut. Call once during app startup.
 *
 * @param {Object}   DOM       - Centralized DOM reference object.
 * @param {Function} restartFn - Callback that restarts the current level.
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

/**
 * Shows the Game Over overlay with the final score, elapsed time, and
 * the current leaderboard. No row is highlighted until the player submits.
 */
export function showGameOverScreen() {
  powerupSystem.revertAllPowerUps();
  if (!_DOM?.screens?.gameOver) return;

  document.getElementById("finalScore").textContent = gameState.score;

  const totalSec = Math.floor(gameState.elapsedMs / 1000);
  document.getElementById("finalTime").textContent =
    `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;

  const input = document.getElementById("usernameInput");
  if (input) {
    input.value = "";
    input.disabled = false;
  }

  const btn = document.getElementById("submitScoreBtn");
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Submit Score";
  }

  _DOM.screens.gameOver.classList.remove("hidden");
  renderLeaderboard(document.getElementById("gameOverLeaderboard"), null);
}

/** Hides the Game Over overlay. */
function hideGameOverScreen() {
  _DOM?.screens?.gameOver?.classList.add("hidden");
}

/**
 * Delegated click handler for Game Over screen buttons.
 * Stays synchronous — async work is isolated in handleSubmit's IIFE.
 * @param {MouseEvent} e
 */
function handleGameOverClick(e) {
  switch (e.target.id) {
    case "submitScoreBtn":
      handleSubmit("submitScoreBtn", "usernameInput", "gameOverLeaderboard");
      break;
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
 * Initializes Game Over screen event delegation. Call once during app startup.
 */
export function initGameOverController() {
  document.addEventListener("click", handleGameOverClick);
}

/* ------------------------------------------------------------------ */
/*  Win Screen                                                         */
/* ------------------------------------------------------------------ */

/**
 * Shows the Win overlay with the final score, elapsed time, and the current
 * leaderboard. No row is highlighted until the player submits.
 * Hides the "Next Level" button when on the last level.
 */
export function showWinScreen() {
  powerupSystem.revertAllPowerUps();
  if (!_DOM?.screens?.win) return;

  document.getElementById("winFinalScore").textContent = gameState.score;

  const totalSec = Math.floor(gameState.elapsedMs / 1000);
  document.getElementById("winFinalTime").textContent =
    `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;

  const input = document.getElementById("winUsernameInput");
  if (input) {
    input.value = "";
    input.disabled = false;
  }

  const btn = document.getElementById("winSubmitScoreBtn");
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Submit Score";
  }

  const nextBtn = document.getElementById("nextLevelBtn");
  if (nextBtn) {
    nextBtn.style.display =
      getCurrentLevel() >= Object.keys(LEVELS).length ? "none" : "";
  }

  _DOM.screens.win.classList.remove("hidden");
  renderLeaderboard(document.getElementById("winLeaderboard"), null);
}

/** Hides the Win overlay. */
function hideWinScreen() {
  _DOM?.screens?.win?.classList.add("hidden");
}

/**
 * Delegated click handler for Win screen buttons.
 * Stays synchronous — async work is isolated in handleSubmit's IIFE.
 * @param {MouseEvent} e
 */
function handleWinClick(e) {
  switch (e.target.id) {
    case "winSubmitScoreBtn":
      handleSubmit("winSubmitScoreBtn", "winUsernameInput", "winLeaderboard");
      break;
    case "nextLevelBtn":
      hideWinScreen();
      startLevel(getCurrentLevel() + 1, _DOM);
      break;
    case "winRestartBtn":
      hideWinScreen();
      _restartFn?.();
      break;
    case "winBackToMenuBtn":
      hideWinScreen();
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
