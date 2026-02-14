import { gameState } from "../core/state.js";

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
