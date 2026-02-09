import { LEVELS } from "../config/level-config.js";
import { BRICK_TYPES } from "../config/brick-config.js";
import { Brick } from "../entities/brick.js";

/**
 * LevelSystem
 * Responsible for:
 * - Loading level data
 * - Creating brick entities
 * - Level validation
 * - Win condition support
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
}
