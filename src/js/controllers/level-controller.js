import { BrickLayoutSystem } from "../systems/brick-layout-system.js";
import { enterGameMode } from "../core/game-engine.js";
import { LevelSystem } from "../systems/level-system.js";

let currentBricks = [];
let currentLevel = 1;
let currentPaddle = null;
let currentBall = null;

export function startLevel(levelNumber, DOM) {
  currentLevel = levelNumber;

  if (!DOM.container) DOM.container = document.getElementById("gameContainer");

  // Empty the entire game container and re-attach the bricks container element
  DOM.container.innerHTML = "";

  // Reuse the existing bricksContainer reference if provided by main.js; otherwise create it
  if (!DOM.bricksContainer)
    DOM.bricksContainer = document.getElementById("bricksContainer");
  if (!DOM.bricksContainer) {
    DOM.bricksContainer = document.createElement("div");
    DOM.bricksContainer.className = "bricks-container";
    DOM.bricksContainer.id = "bricksContainer";
  }
  // make sure bricks container is in the DOM
  DOM.container.appendChild(DOM.bricksContainer);

  // Clear old bricks and any previous in-memory entities references
  DOM.bricksContainer.innerHTML = "";
  currentBricks = [];
  if (
    currentPaddle &&
    currentPaddle.element &&
    currentPaddle.element.parentNode
  ) {
    currentPaddle.element.remove();
  }
  currentPaddle = null;
  if (currentBall && currentBall.element && currentBall.element.parentNode) {
    currentBall.element.remove();
  }
  currentBall = null;

  const layout = BrickLayoutSystem.calculate(DOM.container.offsetWidth);
  currentBricks = LevelSystem.createBricks(levelNumber, layout);
  // create paddle and ball based on the same container dimensions
  const containerW = DOM.container.offsetWidth;
  const containerH = DOM.container.offsetHeight;
  currentPaddle = LevelSystem.createPaddle(containerW, containerH);
  currentBall = LevelSystem.createBall(currentPaddle);

  const fragment = document.createDocumentFragment();
  currentBricks.forEach((brick) => fragment.appendChild(brick.element));
  DOM.bricksContainer.appendChild(fragment);

  // append paddle & ball directly into the game container (no entities-layer)
  if (currentPaddle && currentPaddle.element)
    DOM.container.appendChild(currentPaddle.element);
  if (currentBall && currentBall.element)
    DOM.container.appendChild(currentBall.element);

  DOM.levelDisplay.textContent = levelNumber;
  console.log(`Level ${levelNumber} loaded: ${currentBricks.length} bricks`);
  enterGameMode();
}

export function getCurrentBricks() {
  return currentBricks;
}

export function getCurrentPaddle() {
  return currentPaddle;
}

export function getCurrentBall() {
  return currentBall;
}

let resizeTimeout;
export function handleResize(DOM) {
  if (currentBricks.length === 0) return;

  console.log(DOM.container);
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Recalculate layout
    const layout = BrickLayoutSystem.calculate(DOM.container.offsetWidth);
    console.log("this is the container width", DOM.container.offsetWidth);

    // Update all bricks with new layout
    currentBricks.forEach((brick) => {
      brick.layout = layout;
      brick.element.style.width = layout.width + "px";
      brick.element.style.height = layout.height + "px";
      brick.updatePosition();
    });

    console.log(
      `Resized: Container ${DOM.container.offsetWidth}px, Brick ${layout.width}x${layout.height}px`,
    );
  }, 150);
}

export function getCurrentLevel() {
  return currentLevel;
}
