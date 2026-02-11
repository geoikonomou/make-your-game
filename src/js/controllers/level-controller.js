import { BrickLayoutSystem } from "../systems/brick-layout-system.js";
import { LevelSystem } from "../systems/level-system.js";

let currentBricks = [];
let currentLevel = 1;

export function startLevel(levelNumber, DOM) {
  currentLevel = levelNumber;

  // Clear old bricks
  DOM.bricksContainer.innerHTML = "";
  currentBricks = [];

  const layout = BrickLayoutSystem.calculate(DOM.container.offsetWidth);
  currentBricks = LevelSystem.createBricks(levelNumber, layout);

  const fragment = document.createDocumentFragment();
  currentBricks.forEach((brick) => fragment.appendChild(brick.element));
  DOM.bricksContainer.appendChild(fragment);

  DOM.levelDisplay.textContent = levelNumber;
  console.log(`Level ${levelNumber} loaded: ${currentBricks.length} bricks`);
}

export function getCurrentBricks() {
  return currentBricks;
}

export function getCurrentLevel() {
  return currentLevel;
}
