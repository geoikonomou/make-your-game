import { initInput } from "../systems/inputs.js";
import { startLoop, stopLoop } from "./loop.js";
import { stopGameInputListeners } from "../systems/inputs.js";
import { gameState, createGameState } from "./state.js";

let spaceHandler = null;

export function startGame() {
  createGameState();
  initInput();
  startLoop();
}

export function enterGameMode() {
  spaceHandler = function(e) {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Space only launches the ball (starts the game from READY state)
      if (mode !== "RUNNING" && mode !== "PAUSED") {
        startGame();
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
