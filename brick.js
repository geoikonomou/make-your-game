/**
 * Brick Class
 * Represents a single brick in the game
 * Uses transform for performance optimization (60 FPS requirement)
 */

class Brick {
  // Brick type constants
  static TYPES = {
    NORMAL: 1, // 1 hit to destroy - Blue
    HARD: 2, // 2 hits to destroy - Green
    UNBREAKABLE: 3, // Cannot be destroyed - Red
  };

  // Brick configuration (will be calculated dynamically)
  static CONFIG = {
    WIDTH: 70,
    HEIGHT: 25,
    PADDING: 5,
    OFFSET_TOP: 80,
    OFFSET_LEFT: 10,
    COLS: 10, // Number of columns in the grid
    CONTAINER_WIDTH: 800, // Will be updated based on actual container
  };

  /**
   * Calculate brick dimensions to fit container
   * @param {number} containerWidth - Width of the game container
   * @param {number} cols - Number of columns
   */
  static calculateDimensions(containerWidth, cols) {
    // Scale factor based on container width (base width: 800px)
    const scaleFactor = Math.min(containerWidth / 800, 1);

    // Scale padding and height with container
    const padding = Math.max(Math.floor(5 * scaleFactor), 2);
    const height = Math.max(Math.floor(25 * scaleFactor), 15);

    const totalPadding = (cols - 1) * padding;
    const horizontalMargin = Math.floor(20 * scaleFactor);
    const availableWidth = containerWidth - 2 * horizontalMargin;
    const brickWidth = Math.floor((availableWidth - totalPadding) / cols);

    Brick.CONFIG.CONTAINER_WIDTH = containerWidth;
    Brick.CONFIG.WIDTH = brickWidth;
    Brick.CONFIG.HEIGHT = height;
    Brick.CONFIG.PADDING = padding;
    Brick.CONFIG.COLS = cols;

    // Calculate horizontal offset to center the grid
    const gridWidth = cols * brickWidth + (cols - 1) * padding;
    Brick.CONFIG.OFFSET_LEFT = Math.floor((containerWidth - gridWidth) / 2);

    // Scale top offset as well
    Brick.CONFIG.OFFSET_TOP = Math.floor(80 * scaleFactor);
  }

  // Brick colors based on type
  static COLORS = {
    1: "#667eea", // Normal - Blue/Purple
    2: "#48bb78", // Hard - Green
    3: "#f56565", // Unbreakable - Red
  };

  constructor(row, col, type) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.hitsRemaining = this.getInitialHits(type);
    this.active = true;
    this.score = this.getScoreValue(type);

    // Create DOM element
    this.element = this.createElement();
    this.updatePosition();
    this.updateAppearance();
  }

  /**
   * Get initial number of hits based on brick type
   */
  getInitialHits(type) {
    switch (type) {
      case Brick.TYPES.NORMAL:
        return 1;
      case Brick.TYPES.HARD:
        return 2;
      case Brick.TYPES.UNBREAKABLE:
        return Infinity;
      default:
        return 1;
    }
  }

  /**
   * Get score value for destroying this brick
   */
  getScoreValue(type) {
    switch (type) {
      case Brick.TYPES.NORMAL:
        return 10;
      case Brick.TYPES.HARD:
        return 20;
      case Brick.TYPES.UNBREAKABLE:
        return 0;
      default:
        return 10;
    }
  }

  /**
   * Create the brick DOM element
   * Uses classes for styling to avoid inline styles
   */
  createElement() {
    const brick = document.createElement("div");
    brick.className = "brick";
    brick.dataset.type = this.type;
    brick.dataset.row = this.row;
    brick.dataset.col = this.col;

    // Set dynamic dimensions
    brick.style.width = Brick.CONFIG.WIDTH + "px";
    brick.style.height = Brick.CONFIG.HEIGHT + "px";

    // Add will-change for better performance on animations
    brick.style.willChange = "transform, opacity";

    return brick;
  }

  /**
   * Update brick position using transform (CRITICAL for 60 FPS)
   * Transform is GPU-accelerated and doesn't trigger layout recalculation
   */
  updatePosition() {
    const x =
      Brick.CONFIG.OFFSET_LEFT +
      this.col * (Brick.CONFIG.WIDTH + Brick.CONFIG.PADDING);
    const y =
      Brick.CONFIG.OFFSET_TOP +
      this.row * (Brick.CONFIG.HEIGHT + Brick.CONFIG.PADDING);

    this.element.style.transform = `translate(${x}px, ${y}px)`;

    // Update dimensions as well (in case of resize)
    this.element.style.width = Brick.CONFIG.WIDTH + "px";
    this.element.style.height = Brick.CONFIG.HEIGHT + "px";
  }

  /**
   * Update brick appearance based on current state
   */
  updateAppearance() {
    // Set base type class
    this.element.className = `brick brick-type-${this.type}`;

    // Add state classes
    if (!this.active) {
      this.element.classList.add("brick-destroyed");
    }

    // For hard bricks, show damage state
    if (this.type === Brick.TYPES.HARD && this.hitsRemaining === 1) {
      this.element.classList.add("brick-damaged");
    }
  }

  /**
   * Handle brick being hit
   * Returns true if brick was destroyed, false otherwise
   */
  hit() {
    // Unbreakable bricks cannot be destroyed
    if (this.type === Brick.TYPES.UNBREAKABLE) {
      this.playHitAnimation();
      return false;
    }

    this.hitsRemaining--;

    if (this.hitsRemaining <= 0) {
      this.destroy();
      return true;
    } else {
      // Brick damaged but not destroyed
      this.updateAppearance();
      this.playHitAnimation();
      return false;
    }
  }

  /**
   * Play hit animation without destroying brick
   */
  playHitAnimation() {
    this.element.classList.add("brick-hit");
    setTimeout(() => {
      this.element.classList.remove("brick-hit");
    }, 200);
  }

  /**
   * Destroy the brick with animation
   * Uses opacity transition for smooth performance
   */
  destroy() {
    this.active = false;
    this.element.classList.add("brick-destroying");

    // Use opacity for fade-out (GPU-accelerated)
    this.element.style.opacity = "0";

    // Remove from DOM after animation completes
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
   * Get brick boundaries for collision detection
   */
  getBounds() {
    const x =
      Brick.CONFIG.OFFSET_LEFT +
      this.col * (Brick.CONFIG.WIDTH + Brick.CONFIG.PADDING);
    const y =
      Brick.CONFIG.OFFSET_TOP +
      this.row * (Brick.CONFIG.HEIGHT + Brick.CONFIG.PADDING);

    return {
      left: x,
      right: x + Brick.CONFIG.WIDTH,
      top: y,
      bottom: y + Brick.CONFIG.HEIGHT,
      centerX: x + Brick.CONFIG.WIDTH / 2,
      centerY: y + Brick.CONFIG.HEIGHT / 2,
    };
  }

  /**
   * Get brick score value
   */
  getScore() {
    return this.score;
  }
}
