import { gameState } from "../core/state.js";

const keys = {};
let initialized = false;

let spaceInputHandler = null;
let arrowKeysDownHandler = null;
let arrowKeysUpHandler = null;

export function initInput() {
  if (initialized) return;
  initialized = true;

  spaceInputHandler = function(e) {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Only toggle pause when game is already running or paused
      console.log("this is the first", gameState.getMode());
      if (mode === "RUNNING" || mode === "PAUSED") {
        gameState.setMode(mode === "RUNNING" ? "PAUSED" : "RUNNING");
      }
      console.log("this is the second", gameState.getMode());
    }
  }

  arrowKeysDownHandler = function(e) {
    keys[e.code] = true;
  }

  arrowKeysUpHandler = function(e) {
    keys[e.code] = false;
  }
  window.addEventListener("keydown", spaceInputHandler);

  window.addEventListener("keydown", arrowKeysDownHandler);

  window.addEventListener("keyup", arrowKeysUpHandler);
}
export function stopGameInputListeners() {
  window.removeEventListener("keydown", arrowKeysDownHandler);
  window.removeEventListener("keyup", arrowKeysUpHandler);
  window.removeEventListener("keydown", spaceInputHandler);
  initialized = false;
}

export function getInput() {
  return keys;
}
