import { initInput } from "../systems/inputs.js";
import { startLoop } from "./loop.js";
import { stopGameInputListeners } from "../systems/inputs.js";
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
let spaceHandler = null;


export function enterGameMode(DOM = null) {
  spaceHandler = function(e) {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Only start the game if it hasn't been started yet
      if (mode !== "RUNNING" && mode !== "PAUSED") {
        startGame(DOM);
      }
    }
  }
  if (enterGameModeRegistered) return;
  enterGameModeRegistered = true;

  console.log("this is from the game engine", gameState.getMode());
  window.addEventListener("keydown", spaceHandler);
}

export function stopListeners() {
  stopGameInputListeners();
  window.removeEventListener("keydown", spaceHandler);
  enterGameModeRegistered = false;
  inputInitialized = false;
}
