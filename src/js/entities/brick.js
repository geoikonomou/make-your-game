import {
  BRICK_TYPES,
  BRICK_HITS,
  BRICK_SCORES,
} from "../config/brick-config.js";

/**
 * Brick Entity
 * Represents a single brick in the game world.
 *
 * Responsibilities:
 * - Maintain its own state (hits, active)
 * - Handle hit & destroy behavior
 * - Render itself to the DOM
 * - Provide collision bounds
 */

export class Brick {
  /**
   * @param {Object} params
   * @param {number} params.row - Row index in the level grid
   * @param {number} params.col - Column index in the level grid
   * @param {number} params.type - Brick type (from BRICK_TYPES)
   * @param {Object} params.layout - Layout data injected by a system
   */
  constructor({ row, col, type, layout }) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.layout = layout;

    this.hitsRemaining = BRICK_HITS[type];
    this.score = BRICK_SCORES[type];
    this.active = true;

    this.element = this.createElement();
    this.updatePosition();
    this.updateAppearance();
  }

  /**
   * Create the DOM element for the brick
   */
  createElement() {
    const brick = document.createElement("div");

    brick.className = `brick brick-type-${this.type}`;
    brick.dataset.type = this.type;
    brick.dataset.row = this.row;
    brick.dataset.col = this.col;

    brick.style.width = this.layout.width + "px";
    brick.style.height = this.layout.height + "px";
    brick.style.willChange = "transform, opacity";

    return brick;
  }

  /**
   * Update brick position using GPU-accelerated transforms
   */
  updatePosition() {
    const { width, height, padding, offsetLeft, offsetTop } = this.layout;

    const x = offsetLeft + this.col * (width + padding);
    const y = offsetTop + this.row * (height + padding);

    // Set the position as both transform AND CSS variable
    // The CSS variable is used by animations to maintain position
    const translateValue = `translate(${x}px, ${y}px)`;
    this.element.style.transform = translateValue;
    this.element.style.setProperty("--brick-position", translateValue);
  }

  /**
   * Update visual state based on hits / activity
   */
  updateAppearance() {
    this.element.className = `brick brick-type-${this.type}`;

    if (!this.active) {
      this.element.classList.add("brick-destroyed");
    }

    if (this.type === BRICK_TYPES.HARD && this.hitsRemaining === 1) {
      this.element.classList.add("brick-damaged");
    }
  }

  /**
   * Handle a hit from the ball
   * @returns {boolean} true if brick was destroyed
   */
  hit() {
    if (this.type === BRICK_TYPES.UNBREAKABLE) {
      this.playHitAnimation();
      return false;
    }

    this.hitsRemaining--;

    if (this.hitsRemaining <= 0) {
      this.destroy();
      return true;
    }

    this.updateAppearance();
    this.playHitAnimation();
    return false;
  }

  /**
   * Play hit animation without destroying the brick
   */
  playHitAnimation() {
    this.element.classList.add("brick-hit");
    setTimeout(() => {
      this.element.classList.remove("brick-hit");
    }, 200);
  }

  /**
   * Destroy brick with fade-out animation
   */
  destroy() {
    this.active = false;
    this.element.classList.add("brick-destroying");

    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.remove();
      }
    }, 300);
  }

  /**
   * Check if brick is still active
   */
  isActive() {
    return this.active;
  }

  /**
   * Get bounding box for collision detection
   */
  getBounds() {
    const { width, height, padding, offsetLeft, offsetTop } = this.layout;

    const x = offsetLeft + this.col * (width + padding);
    const y = offsetTop + this.row * (height + padding);

    return {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2,
    };
  }

  /**
   * Get score awarded for destroying this brick
   */
  getScore() {
    return this.score;
  }
}
