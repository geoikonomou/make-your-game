import { initInput } from "../systems/inputs.js";
import { startLoop } from "./loop.js";
import { gameState, createGameState } from "./state.js";




export function startGame() {
  createGameState();
  gameState.mode = "RUNNING";


  //initGameState();
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
