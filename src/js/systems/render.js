import { gameState } from "../core/state.js";

export function render() {
  const ball = document.getElementById("ball");
  const paddle = document.getElementById("paddle");

  ball.style.transform = `translate(${gameState.ball.x}px, ${gameState.ball.y}px)`;
  paddle.style.transform = `translate(${gameState.paddle.x}px, ${gameState.paddle.y}px)`;

  if (gameState.mode === "PAUSED") {
    //pause the game
  } else {
    //not paused
  }
}
