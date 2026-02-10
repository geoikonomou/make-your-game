import { initInput } from "../systems/inputs.js";
import { startLoop } from "./loop.js";

export function startGame() {

  initInput();
  startLoop();
}

export function enterGameMode() {
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      startGame();
    }
  })
};
