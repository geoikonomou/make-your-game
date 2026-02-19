import { LEVELS } from "../config/level-config.js";
import { BRICK_TYPES } from "../config/brick-config.js";
import { Brick } from "../entities/brick.js";
import { Paddle } from "../entities/paddle.js";
import { Ball } from "../entities/ball.js";
import {
  PADDLE_CONFIG,
  DEFAULT_PADDLE_TYPE,
  DEFAULT_PADDLE_BOTTOM_OFFSET,
  PADDLE_LIMITS,
} from "../config/paddle-config.js";
import {
  BALL_CONFIG,
  DEFAULT_BALL_TYPE,
  DEFAULT_BALL_FROM_PADDLE,
} from "../config/ball-config.js";

/**
 * LevelSystem
 * Responsible for:
 * - Loading and validating level data/configuration
 * - Creating brick entities
 * - Creating Paddle and Ball entities
 * - Providing level metadata utilities
 */
export class LevelSystem {
  /**
   * Get level data by level number
   * @param {number} levelNumber - The level number (1-based)
   * @returns {object|null} Level data object or null if not found
   */
  static getLevel(levelNumber) {
    return LEVELS[levelNumber] ?? null;
  }

  /**
   * Get total number of levels
   * @returns {number} Total levels available
   */
  static getTotalLevels() {
    return Object.keys(LEVELS).length;
  }

  /**
   * Validate if a level exists
   * @param {number} levelNumber - The level number to check
   * @returns {boolean} True if level exists
   */
  static isValidLevel(levelNumber) {
    return levelNumber in LEVELS;
  }

  /**
   * Create a Ball entity positioned above the paddle.
   *
   * Ball:
   * - Is horizontally centered on the paddle
   * - Spawns slightly above it
   * - Receives an initial upward velocity with slight random angle variation
   *
   * @param {Paddle} paddle - Paddle instance the ball should spawn from.
   * @param {number} containerH - Height of the game container in pixels.
   * @param {string} [type=DEFAULT_BALL_TYPE] - Ball configuration type key.
   *
   * @returns {Ball} Newly created Ball instance.
   */
  static createBall(paddle, containerH, type = DEFAULT_BALL_TYPE) {
    const cfg = BALL_CONFIG[type] || BALL_CONFIG[DEFAULT_BALL_TYPE];
    const radius = Math.max(3, Math.round(containerH * 0.012));

    // Position ball centered on paddle, slightly above it
    const x = Math.floor(paddle.x + (paddle.width - radius * 2) / 2);
    const y = Math.floor(paddle.y - radius * 2 - DEFAULT_BALL_FROM_PADDLE);

    // base speed (px/sec) and slight random angle for variation
    const baseSpeed = containerH * 0.7 * (cfg.speedMultiplier || 1);
    const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    const speedX = Math.cos(angle) * baseSpeed;
    const speedY = Math.sin(angle) * baseSpeed;

    const ball = new Ball({ x, y, type, radius, speedX, speedY });

    // Store intended base speed so resize can normalize against it cleanly
    ball.baseSpeed = baseSpeed;

    return ball;
  }

  /**
   * Create a Paddle entity centered horizontally near the bottom
   * of the container.
   *
   * Width is responsive based on container size and paddle config.
   *
   * @param {number} containerWidth - Width of the game container in pixels.
   * @param {number} containerHeight - Height of the game container in pixels.
   * @param {string} [type=DEFAULT_PADDLE_TYPE] - Paddle configuration type key.
   *
   * @returns {Paddle} Newly created Paddle instance.
   */
  static createPaddle(
    containerWidth,
    containerHeight,
    type = DEFAULT_PADDLE_TYPE,
  ) {
    const cfg = PADDLE_CONFIG[type] || PADDLE_CONFIG[DEFAULT_PADDLE_TYPE];

    const widthPx = Math.max(
      PADDLE_LIMITS.minWidthPx,
      Math.round(cfg.widthFraction * containerWidth),
    );
    const heightPx = cfg.height;

    const x = Math.floor((containerWidth - widthPx) / 2);

    const bottomOffset = DEFAULT_PADDLE_BOTTOM_OFFSET; // match CSS bottom spacing

    let y = Math.floor(containerHeight - heightPx - bottomOffset);

    // clamp y to container
    y = Math.max(0, Math.min(y, containerHeight - heightPx));

    const paddle = new Paddle({
      x,
      y,
      width: widthPx,
      height: heightPx,
      speed: cfg.speed,
      type,
      sticky: cfg.sticky,
    });

    return paddle;
  }

  /**
   * Create brick entities from level layout
   * @param {number} levelNumber - The level number to load (1-based)
   * @param {object} layout - Layout configuration calculated by BrickLayoutSystem
   * @param {number} layout.width - Width of each brick in pixels
   * @param {number} layout.height - Height of each brick in pixels
   * @param {number} layout.padding - Spacing between bricks in pixels
   * @param {number} layout.offsetLeft - Horizontal offset from left edge
   * @param {number} layout.offsetTop - Vertical offset from top edge
   * @param {number} layout.cols - Number of columns in the brick grid
   * @returns {Brick[]} Array of Brick entities, or empty array if level not found
   */
  static createBricks(levelNumber, layout) {
    const level = this.getLevel(levelNumber);
    if (!level) return [];

    const bricks = [];

    level.layout.forEach((row, r) => {
      row.forEach((type, c) => {
        if (type === 0) return;

        bricks.push(
          new Brick({
            row: r,
            col: c,
            type,
            layout,
          }),
        );
      });
    });

    return bricks;
  }

  /**
   * Count total breakable bricks in a level
   * @param {number} levelNumber - The level number
   * @returns {number} Count of breakable bricks
   */
  static countBreakableBricks(levelNumber) {
    const level = this.getLevel(levelNumber);
    if (!level) return 0;

    let count = 0;

    level.layout.forEach((row) => {
      row.forEach((type) => {
        if (type !== 0 && type !== BRICK_TYPES.UNBREAKABLE) {
          count++;
        }
      });
    });

    return count;
  }

  /**
   * Get the maximum number of columns in a level
   * @param {number} levelNumber - The level number
   * @returns {number} Maximum columns in any row
   */
  static getMaxColumns(levelNumber) {
    const level = this.getLevel(levelNumber);
    if (!level) return 10; // Default fallback

    // Find the longest row
    return Math.max(...level.layout.map((row) => row.length));
  }
}
