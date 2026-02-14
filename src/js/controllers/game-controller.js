import { getCurrentBricks, getCurrentLevel } from "./level-controller.js";
import {
  startGame,
  enterGameMode as engineEnterGameMode,
} from "../core/game-engine.js";

export function enterGameMode(DOM) {
  // delegate to core engine enterGameMode so key handling and startGame are consistent
  engineEnterGameMode(DOM);
}
