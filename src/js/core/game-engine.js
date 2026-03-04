import { initInput } from "../systems/inputs.js";
import { startLoop, stopLoop } from "./loop.js";
import { stopGameInputListeners } from "../systems/inputs.js";
import { gameState, createGameState } from "./state.js";
import { LevelSystem } from "../systems/level-system.js";

let spaceHandler = null;

export function startGame() {
  createGameState();
  initInput();
  startLoop();
}

export function enterGameMode() {
  // Remove any previously attached space handler to avoid duplicate listeners
  if (spaceHandler) {
    window.removeEventListener("keydown", spaceHandler);
  }
  spaceHandler = function (e) {
    if (e.code === "Space") {
      const mode = gameState.getMode();
      if (mode === "READY") {
        // First launch or respawn — start/resume the game
        if (!gameState.timeStarted) {
          // First launch: full init
          startGame();
        } else {
          // Respawn: adjust timer to exclude wait time, then resume
          if (gameState._readyAt && gameState.timeStarted) {
            gameState.timeStarted += performance.now() - gameState._readyAt;
            gameState._readyAt = null;
          }
          gameState.setMode("RUNNING");
        }
      } else if (mode === "RUNNING") {
        if (gameState.paddle.attachedBalls.length > 0) {
          const speedMultiplier = LevelSystem.getGlobalSpeedMultiplier();
          gameState.paddle.releaseBall(
            gameState.container.height,
            speedMultiplier,
          );
        }
      }
    }
  };
  window.addEventListener("keydown", spaceHandler);
}

export function stopListeners() {
  stopGameInputListeners();
  window.removeEventListener("keydown", spaceHandler);
  stopLoop();
}
