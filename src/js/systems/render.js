import { gameState } from "../core/state.js";

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

  if (gameState.getMode() === "PAUSED") {
    // pause overlay or similar
  }
}
