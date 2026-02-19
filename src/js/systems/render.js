import { gameState } from "../core/state.js";
import powerupSystem from "./powerup-system.js";

/**
 * Renders and updates the current frame of the game.
 *
 * Responsibilities:
 * - Updates paddle position
 * - Updates all ball positions
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
