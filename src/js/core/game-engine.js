import { initInput } from "../systems/inputs.js";
import { startLoop, stopLoop } from "./loop.js";
import { stopGameInputListeners } from "../systems/inputs.js";
import { gameState, createGameState } from "./state.js";

let spaceHandler = null;

export function startGame(DOM = null) {
  createGameState(DOM);
  gameState.setMode("RUNNING");
  initInput();
  startLoop();
}

export function enterGameMode(DOM = null) {
  // Remove any previously attached space handler to avoid duplicate listeners
  if (spaceHandler) {
    window.removeEventListener("keydown", spaceHandler);
  }
  spaceHandler = function(e) {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Only start the game if it hasn't been started yet
      if (mode !== "RUNNING" && mode !== "PAUSED") {
        startGame(DOM);
      }
      //control pause-resume
      if (mode === "RUNNING" || mode === "PAUSED") {
        gameState.setMode(mode === "RUNNING" ? "PAUSED" : "RUNNING");
      }
    }
  }
  window.addEventListener("keydown", spaceHandler);
}

export function stopListeners() {
  stopGameInputListeners();
  window.removeEventListener("keydown", spaceHandler);
  stopLoop();
}
