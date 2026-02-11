import { getCurrentBricks, getCurrentLevel } from "./level-controller.js";
import { GameState } from "../core/state.js";
import { startGame } from "../core/game-engine.js";

export function enterGameMode() {
  const gameState = new GameState();
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      startGame();
    }
  });
}
