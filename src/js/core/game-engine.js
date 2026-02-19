import { initInput } from "../systems/inputs.js";
import { startLoop } from "./loop.js";
import { gameState, createGameState } from "./state.js";

let inputInitialized = false;

export function startGame(DOM = null) {
  // initialize state from current level (DOM passed from caller)
  createGameState(DOM);
  gameState.setMode("RUNNING");

  if (!inputInitialized) {
    initInput();
    inputInitialized = true;
  }
  startLoop();
}

let enterGameModeRegistered = false;

export function enterGameMode(DOM = null) {
  if (enterGameModeRegistered) return;
  enterGameModeRegistered = true;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Only start the game if it hasn't been started yet
      if (mode !== "RUNNING" && mode !== "PAUSED") {
        startGame(DOM);
      }
    }
  });
}
