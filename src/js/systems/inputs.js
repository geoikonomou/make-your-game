import { gameState } from "../core/state.js";

const keys = {};
export function initInput() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      // toggle run/pause
      gameState.setMode(
        gameState.getMode() === "RUNNING" ? "PAUSED" : "RUNNING",
      );
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
