import { BrickLayoutSystem } from "../systems/brick-layout-system.js";
import { enterGameMode } from "../core/game-engine.js";
import { LevelSystem } from "../systems/level-system.js";
import { gameState } from "../core/state.js";

let currentBricks = [];
let currentLevel = 1;
let currentPaddle = null;
let currentBall = null;

/**
 * Initializes and loads a level.
 *
 * Responsibilities:
 * - Clears previous entities
 * - Generates brick layout
 * - Creates paddle and ball
 * - Mounts everything into the DOM
 * - Enters active game mode
 *
 * @param {number} levelNumber - Level index to load.
 * @param {Object} DOM - Centralized DOM reference object.
 */
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

  // Get max columns from this level
  const cols = LevelSystem.getMaxColumns(levelNumber);

  const layout = BrickLayoutSystem.calculate(DOM.container.clientWidth, cols);
  currentBricks = LevelSystem.createBricks(levelNumber, layout);
  // create paddle and ball based on the same container dimensions
  const containerW = DOM.container.clientWidth;
  const containerH = DOM.container.clientHeight;
  currentPaddle = LevelSystem.createPaddle(containerW, containerH);
  currentBall = LevelSystem.createBall(currentPaddle, containerH);

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

  // Reset mode so Space can start the game again
  gameState.setMode("READY");
  enterGameMode();
}

/**
 * Returns current active brick instances
 *
 * @returns {Array<Object>} Array of brick entities.
 */
export function getCurrentBricks() {
  return currentBricks;
}

/**
 * Returns the currently active paddle entity.
 *
 * @returns {Object|null}
 */
export function getCurrentPaddle() {
  return currentPaddle;
}

/**
 * Returns the currently active ball entity.
 *
 * @returns {Object|null}
 */
export function getCurrentBall() {
  return currentBall;
}

/**
 * Returns the currently loaded level number.
 *
 * @returns {number}
 */
export function getCurrentLevel() {
  return currentLevel;
}

let resizeTimeout;
/**
 * Handles responsive recalculation of brick layout when the window resizes.
 *
 * Debounced to prevent excessive recalculations.
 *
 * @param {Object} DOM - Centralized DOM reference object.
 */
export function handleResize(levelNumber, DOM) {
  if (currentBricks.length === 0 && !currentPaddle) return;

  // console.log(DOM.container);
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // recalculate columns from this level
    const cols = LevelSystem.getMaxColumns(levelNumber);
    const containerW = DOM.container.clientWidth;
    const containerH = DOM.container.clientHeight;

    //recalculate layout for new width
    const layout = BrickLayoutSystem.calculate(DOM.container.clientWidth, cols);
    console.log("this is the container width", DOM.container.offsetWidth);

    // Update all bricks with new layout
    currentBricks.forEach((brick) => {
      brick.layout = layout;
      brick.element.style.width = layout.width + "px";
      brick.element.style.height = layout.height + "px";
      brick.updatePosition();
    });

    // Paddle — reposition and resize
    if (currentPaddle) {
      const cfg = currentPaddle.config;
      const newWidth = Math.max(60, Math.round(cfg.widthFraction * containerW));
      currentPaddle.setWidth(newWidth);
      currentPaddle.setX(Math.floor((containerW - newWidth) / 2));
      currentPaddle.y = Math.floor(containerH - currentPaddle.height - 30);
      currentPaddle.updatePosition();
    }

    // Ball — rescale radius and speed, reposition
    if (currentBall && !currentBall.attachedTo) {
      const newRadius = Math.max(3, Math.round(containerH * 0.012));
      const oldSpeed = currentBall.getSpeed();
      const newBaseSpeed =
        containerH * 0.7 * (currentBall.config.speedMultiplier || 1);

      // preserve direction, apply new speed magnitude
      if (oldSpeed > 0) {
        const ratio = newBaseSpeed / oldSpeed;
        currentBall.speedX *= ratio;
        currentBall.speedY *= ratio;
      }

      currentBall.radius = newRadius;
      currentBall.updateElement();

      // keep ball in bounds after resize
      currentBall.x = Math.min(currentBall.x, containerW - newRadius * 2);
      currentBall.y = Math.min(currentBall.y, containerH - newRadius * 2);
    } else if (currentBall && currentBall.attachedTo) {
      // ball is sitting on paddle — just snap it to new paddle position
      const newRadius = Math.max(3, Math.round(containerH * 0.012));
      currentBall.radius = newRadius;
      currentBall.updateElement();
      currentBall.x =
        currentPaddle.x + (currentPaddle.width - newRadius * 2) / 2;
      currentBall.y = currentPaddle.y - newRadius * 2 - 2;
    }

    // Keep game state container size in sync
    gameState.setContainerSize(containerW, containerH);

    console.log(
      `Resized: Container ${DOM.container.offsetWidth}px, Brick ${layout.width}x${layout.height}px`,
    );
  }, 150);
}
