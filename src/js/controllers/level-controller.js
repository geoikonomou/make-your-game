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
  //we can create a createBall and createPaddle in the LevelSystem so that the ball and the paddle is generated when we enter the level.Utilizing the Ball class and the Paddle class.
  //ball=LevelSystem.createBall(levelNumber,);
  //just leaving ideas

  const fragment = document.createDocumentFragment();
  currentBricks.forEach((brick) => fragment.appendChild(brick.element));
  DOM.bricksContainer.appendChild(fragment);

  DOM.levelDisplay.textContent = levelNumber;
  console.log(`Level ${levelNumber} loaded: ${currentBricks.length} bricks`);
}

export function getCurrentBricks() {
  return currentBricks;
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
