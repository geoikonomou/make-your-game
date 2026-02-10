import { GameState } from "../core/state.js";

const keys = {};
export function initInput() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      GameState.mode =
        GameState.mode === "RUNNING" ? "PAUSED" : "RUNNING";
    }
  });
  window.addEventListener("keydown", e => {
    keys[e.code] = true;
    console.log(e.code);
  });

  window.addEventListener("keyup", e => {
    keys[e.code] = false;
  });
}
export function getInput() {
  return keys;
}

