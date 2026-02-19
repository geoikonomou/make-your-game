import { gameState } from "../core/state.js";
import powerupSystem from "./powerup-system.js";

let hudDOM = null;

/**
 * Provide the render system with HUD DOM references.
 * Call once after DOM is ready.
 * @param {Object} DOM - DOM reference object from main.js
 */
export function setRenderDOM(DOM) {
  hudDOM = DOM;
}

/**
 * Renders and updates the current frame of the game.
 *
 * Responsibilities:
 * - Updates paddle position
 * - Updates all ball positions
 * - Updates HUD (score, lives, timer)
 * - Handles paused mode rendering logic
 *
 * Side effects:
 * - Mutates paddle and ball positions via updatePosition()
 *
 * @returns {void}
 */
export function render() {
  const paddle = gameState.getPaddle();
  if (paddle && paddle.updatePosition) paddle.updatePosition();

  const balls = gameState.getBalls();
  for (const b of balls) {
    if (b && b.updatePosition) b.updatePosition();
  }

  // --- HUD updates ---
  if (hudDOM) {
    // Update elapsed time (only while running)
    if (gameState.getMode() === "RUNNING" && gameState.timeStarted) {
      gameState.elapsedMs = performance.now() - gameState.timeStarted;
    }

    // Score
    if (hudDOM.scoreDisplay) {
      hudDOM.scoreDisplay.textContent = gameState.score;
    }

    // High score
    if (hudDOM.highScoreDisplay) {
      hudDOM.highScoreDisplay.textContent = gameState.highScore ?? 0;
    }

    // Timer
    if (hudDOM.timeDisplay) {
      const totalSec = Math.floor(gameState.elapsedMs / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      hudDOM.timeDisplay.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
    }

    // Lives
    if (hudDOM.livesDisplay) {
      const hearts = [];
      for (let i = 0; i < gameState.lives; i++) {
        hearts.push('<span class="life">\u2665</span>');
      }
      hudDOM.livesDisplay.innerHTML = hearts.join("");
    }
    // update DOM transform for powerups (positions are advanced in gameplay update)
    try {
      const active = powerupSystem._getActive ? powerupSystem._getActive() : [];
      for (const p of active) {
        if (p && typeof p.updatePosition === "function") p.updatePosition();
      }
    } catch (e) {
      // don't let render break if powerups fail
      // eslint-disable-next-line no-console
      console.error("powerup render updatePosition error", e);
    }

    if (gameState.getMode() === "PAUSED") {
      // pause overlay or similar
    }
  }
