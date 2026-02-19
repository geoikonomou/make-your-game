import { gameState } from "../core/state.js";

const keys = {};
let initialized = false;

export function initInput() {
  if (initialized) return;
  initialized = true;

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      // Only toggle pause when game is already running or paused
      if (mode === "RUNNING" || mode === "PAUSED") {
        gameState.setMode(mode === "RUNNING" ? "PAUSED" : "RUNNING");
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
}

export function getInput() {
  return keys;
}
