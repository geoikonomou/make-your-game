import { World, GameState } from "../core/state.js";

let ballEl = null;
let playerEl = null;
let gameEl = null;

export function render() {
  if (!ballEl) {
    ballEl = document.getElementById("ball");
    playerEl = document.getElementById("paddle");
    gameEl = document.getElementById("gameContainer");
  }

  const { ball, player } = World;

  ballEl.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
  playerEl.style.transform = `translate(${player.x}px, ${player.y}px)`;

  if (GameState.mode === "PAUSED") {
    gameEl.classList.add("paused");
  } else {
    gameEl.classList.remove("paused");
  }
}

