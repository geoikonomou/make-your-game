import { initInput } from "../systems/inputs.js";
import { startLoop } from "./loop.js";
import { gameState, createGameState } from "./state.js";

export function startGame(DOM = null) {
  // initialize state from current level (DOM passed from caller)
  createGameState(DOM);
  gameState.setMode("RUNNING");

  initInput();
  startLoop();
}

export function enterGameMode(DOM = null) {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      startGame(DOM);
    }
  });
}
